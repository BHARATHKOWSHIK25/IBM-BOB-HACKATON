"""Main verification service — orchestrates all analyzers."""
from __future__ import annotations
import asyncio
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from ..schemas import (
    VerifyRequest, AnalysisResponse, RegistryResult, TyposquatResult,
    MetadataResult, ScriptRiskResult, DependencyRiskResult, IntentResult,
    SignalResult, RiskLevel, DecisionEnum,
)
from ..models import DependencyRequest, PackageAnalysis, Decision, AuditEvent
from ..analyzers.registry.checker import check_registry
from ..analyzers.typosquatting.detector import detect_typosquatting
from ..analyzers.metadata.analyzer import analyze_metadata
from ..analyzers.scripts.analyzer import analyze_scripts
from ..analyzers.dependencies.analyzer import analyze_dependencies
from ..analyzers.intent.analyzer import analyze_intent
from ..risk.engine import calculate_risk, get_decision


async def verify_dependency(
    req: VerifyRequest, db: AsyncSession
) -> AnalysisResponse:
    """Full verification pipeline for a dependency request."""

    # 1. Persist request
    dep_req = DependencyRequest(
        package_name=req.package,
        ecosystem=req.ecosystem.value,
        requested_version=req.version,
        ai_reason=req.reason,
        source=req.source.value,
    )
    db.add(dep_req)
    await db.flush()

    # 2. Run all analyzers concurrently
    registry_task = asyncio.create_task(
        check_registry(req.package, req.ecosystem.value, req.version)
    )
    script_task = asyncio.create_task(
        analyze_scripts(req.package, req.ecosystem.value)
    )
    dep_task = asyncio.create_task(
        analyze_dependencies(req.package, req.ecosystem.value)
    )

    registry: RegistryResult = await registry_task
    script_risk: ScriptRiskResult = await script_task
    dep_risk: DependencyRiskResult = await dep_task

    # 3. Synchronous analyzers
    typosquat: TyposquatResult = detect_typosquatting(req.package, req.ecosystem.value)
    metadata: MetadataResult = analyze_metadata(registry)
    intent: IntentResult = analyze_intent(
        req.package, req.ecosystem.value, req.reason, registry.description
    )

    # 4. Risk engine
    overall_risk, confidence, reasons, explanation = calculate_risk(
        registry, typosquat, metadata, script_risk, dep_risk, intent,
        source=req.source.value,
    )

    # 5. Decision
    decision_str = get_decision(overall_risk, req.source.value)

    # 6. Build pipeline steps
    pipeline_steps = [
        SignalResult(
            name="Registry Check",
            status="OK" if registry.exists else "DANGER",
            value=registry.exists,
            description="Package found in registry." if registry.exists
                        else "Package NOT found in registry.",
        ),
        SignalResult(
            name="Name Analysis",
            status="WARNING" if typosquat.similarity_score > 0.7 else "OK",
            value=f"{typosquat.similarity_score*100:.0f}%" if typosquat.similarity_score > 0 else "0%",
            description="Package name analyzed.",
        ),
        SignalResult(
            name="Typosquatting",
            status="DANGER" if typosquat.is_suspicious else "OK",
            value=typosquat.closest_match,
            description=(
                f"Resembles '{typosquat.closest_match}' ({typosquat.similarity_score*100:.0f}%)"
                if typosquat.is_suspicious else "No typosquatting detected."
            ),
        ),
        SignalResult(
            name="Publisher Analysis",
            status="WARNING" if not registry.publisher else "OK",
            value=registry.publisher,
            description=f"Publisher: {registry.publisher}" if registry.publisher else "No publisher info.",
        ),
        SignalResult(
            name="Package Metadata",
            status="DANGER" if metadata.is_new else "OK",
            value=f"{metadata.package_age_days} days" if metadata.package_age_days is not None else "N/A",
            description=(
                f"Package age: {metadata.package_age_days} days."
                if metadata.package_age_days is not None else "Age unknown."
            ),
        ),
        SignalResult(
            name="Install Script",
            status=("DANGER" if script_risk.risk_level in ("CRITICAL", "HIGH")
                    else "WARNING" if script_risk.risk_level == "MEDIUM"
                    else "OK" if script_risk.risk_level == "LOW" else "UNKNOWN"),
            value=script_risk.risk_level,
            description=(
                f"Script risk: {script_risk.risk_level}. "
                + (script_risk.findings[0] if script_risk.findings else "")
            ),
        ),
        SignalResult(
            name="Intent Analysis",
            status=("DANGER" if intent.match_level == "MISMATCH"
                    else "WARNING" if intent.match_level == "PARTIAL"
                    else "OK" if intent.match_level == "MATCH" else "UNKNOWN"),
            value=intent.match_level,
            description=intent.explanation[:120] if intent.explanation else "",
        ),
        SignalResult(
            name="Dependency Graph",
            status=("DANGER" if dep_risk.risk_level == "HIGH"
                    else "WARNING" if dep_risk.risk_level == "MEDIUM"
                    else "OK"),
            value=dep_risk.risk_level,
            description=(
                f"Dependency risk: {dep_risk.risk_level}. "
                + (f"Suspicious: {', '.join(dep_risk.suspicious_deps[:2])}"
                   if dep_risk.suspicious_deps else "No suspicious dependencies.")
            ),
        ),
    ]

    # 7. Persist analysis
    analysis = PackageAnalysis(
        dependency_request_id=dep_req.id,
        exists=registry.exists,
        package_age_days=metadata.package_age_days,
        publisher=registry.publisher,
        version_count=metadata.version_count,
        download_count=registry.download_count,
        similarity_score=typosquat.similarity_score if typosquat.is_suspicious else None,
        closest_package=typosquat.closest_match,
        install_script_risk=script_risk.risk_level,
        dependency_risk=dep_risk.risk_level,
        intent_match=intent.match_level,
        overall_risk=overall_risk,
        confidence=confidence,
        raw_signals={
            "registry_exists": registry.exists,
            "typosquat_score": typosquat.similarity_score,
            "typosquat_match": typosquat.closest_match,
            "script_risk": script_risk.risk_level,
            "dep_risk": dep_risk.risk_level,
            "intent": intent.match_level,
            "reasons": reasons,
        },
        explanation=explanation,
    )
    db.add(analysis)
    await db.flush()

    decision_obj = Decision(
        analysis_id=analysis.id,
        decision=decision_str,
        user="system",
        is_override=False,
    )
    db.add(decision_obj)

    # 8. Audit event
    audit = AuditEvent(
        event_type="VERIFICATION",
        package_name=req.package,
        ecosystem=req.ecosystem.value,
        risk_level=overall_risk,
        decision=decision_str,
        user=req.source.value,
        details={
            "reasons": reasons[:5],
            "confidence": confidence,
            "version": req.version,
        },
    )
    db.add(audit)
    await db.commit()
    await db.refresh(dep_req)
    await db.refresh(analysis)

    return AnalysisResponse(
        request_id=dep_req.id,
        analysis_id=analysis.id,
        package=req.package,
        ecosystem=req.ecosystem.value,
        version=req.version,
        source=req.source.value,
        registry=registry,
        typosquat=typosquat,
        metadata=metadata,
        script_risk=script_risk,
        dependency_risk=dep_risk,
        intent=intent,
        overall_risk=RiskLevel(overall_risk.upper()),
        confidence=confidence,
        decision=DecisionEnum(decision_str.upper()),
        reasons=reasons,
        explanation=explanation,
        pipeline_steps=pipeline_steps,
        timestamp=datetime.now(timezone.utc),
    )


async def get_dashboard_stats(db: AsyncSession) -> dict:
    total = await db.scalar(select(func.count(DependencyRequest.id)))
    blocked = await db.scalar(
        select(func.count(Decision.id)).where(Decision.decision == "BLOCK")
    )
    review = await db.scalar(
        select(func.count(Decision.id)).where(Decision.decision == "REVIEW")
    )
    high_risk = await db.scalar(
        select(func.count(PackageAnalysis.id)).where(
            PackageAnalysis.overall_risk.in_(["HIGH", "CRITICAL"])
        )
    )
    hallucinations = await db.scalar(
        select(func.count(DependencyRequest.id)).where(
            DependencyRequest.source == "AI_AGENT"
        )
    )

    from sqlalchemy import desc
    result = await db.execute(
        select(AuditEvent).order_by(desc(AuditEvent.timestamp)).limit(10)
    )
    recent_events = result.scalars().all()

    return {
        "protected_installations": total or 0,
        "blocked_dependencies": blocked or 0,
        "review_required": review or 0,
        "high_risk_packages": high_risk or 0,
        "ai_hallucinations_detected": hallucinations or 0,
        "recent_events": [
            {
                "id": e.id,
                "package_name": e.package_name,
                "ecosystem": e.ecosystem,
                "risk_level": e.risk_level,
                "decision": e.decision,
                "timestamp": e.timestamp.isoformat(),
                "event_type": e.event_type,
            }
            for e in recent_events
        ],
    }
