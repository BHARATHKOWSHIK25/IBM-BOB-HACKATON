"""API router — all endpoints."""
from __future__ import annotations
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, asc
from sqlalchemy.orm import selectinload

from ..database import get_db
from ..schemas import (
    VerifyRequest, AnalysisResponse, AuditEventOut, PolicyOut,
    PolicyUpdate, OverrideRequest, DashboardStats,
)
from ..models import (
    DependencyRequest, PackageAnalysis, Decision, AuditEvent, PolicyConfig
)
from ..services.verification import verify_dependency, get_dashboard_stats

router = APIRouter()


# ── Dependency verification ────────────────────────────────────────────────────

@router.post("/dependencies/verify", response_model=AnalysisResponse, tags=["Verification"])
async def verify(req: VerifyRequest, db: AsyncSession = Depends(get_db)):
    """
    Pre-installation security gate.
    Analyzes the requested package before any installation occurs.
    """
    return await verify_dependency(req, db)


@router.get("/dependencies/{request_id}", tags=["Verification"])
async def get_dependency_result(request_id: int, db: AsyncSession = Depends(get_db)):
    """Retrieve a previous verification result."""
    result = await db.execute(
        select(DependencyRequest)
        .options(selectinload(DependencyRequest.analysis))
        .where(DependencyRequest.id == request_id)
    )
    dep = result.scalar_one_or_none()
    if not dep:
        raise HTTPException(status_code=404, detail="Dependency request not found")
    return dep


# ── Decision override ─────────────────────────────────────────────────────────

@router.post("/decisions/override", tags=["Decisions"])
async def override_decision(req: OverrideRequest, db: AsyncSession = Depends(get_db)):
    """Human override of a system decision. Creates an audit trail."""
    result = await db.execute(
        select(Decision).where(Decision.id == req.decision_id)
    )
    decision = result.scalar_one_or_none()
    if not decision:
        raise HTTPException(status_code=404, detail="Decision not found")

    old_decision = decision.decision
    decision.decision = req.new_decision.value.upper()
    decision.user = req.user
    decision.override_reason = req.reason
    decision.is_override = True
    decision.timestamp = datetime.utcnow()

    # Audit the override
    result2 = await db.execute(
        select(PackageAnalysis).where(PackageAnalysis.id == decision.analysis_id)
        .options(selectinload(PackageAnalysis.request))
    )
    analysis = result2.scalar_one_or_none()
    package_name = analysis.request.package_name if analysis and analysis.request else "unknown"

    audit = AuditEvent(
        event_type="OVERRIDE",
        package_name=package_name,
        ecosystem=analysis.request.ecosystem if analysis and analysis.request else "unknown",
        risk_level=analysis.overall_risk if analysis else None,
        decision=req.new_decision.value.upper(),
        user=req.user,
        details={
            "previous_decision": old_decision,
            "override_reason": req.reason,
            "decision_id": req.decision_id,
        },
    )
    db.add(audit)
    await db.commit()
    return {"status": "ok", "message": f"Decision overridden: {old_decision} → {decision.decision}"}


# ── Dashboard ──────────────────────────────────────────────────────────────────

@router.get("/dashboard", tags=["Dashboard"])
async def dashboard(db: AsyncSession = Depends(get_db)):
    """Security dashboard statistics."""
    return await get_dashboard_stats(db)


# ── Audit events ───────────────────────────────────────────────────────────────

@router.get("/events", response_model=List[AuditEventOut], tags=["Events"])
async def get_events(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    risk: Optional[str] = None,
    decision: Optional[str] = None,
    ecosystem: Optional[str] = None,
    package: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Security event audit log with filtering."""
    q = select(AuditEvent).order_by(desc(AuditEvent.timestamp))
    if risk:
        q = q.where(AuditEvent.risk_level == risk.upper())
    if decision:
        q = q.where(AuditEvent.decision == decision.upper())
    if ecosystem:
        q = q.where(AuditEvent.ecosystem == ecosystem.lower())
    if package:
        q = q.where(AuditEvent.package_name.ilike(f"%{package}%"))
    q = q.offset(offset).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


# ── Policies ───────────────────────────────────────────────────────────────────

@router.get("/policies", response_model=List[PolicyOut], tags=["Policies"])
async def get_policies(db: AsyncSession = Depends(get_db)):
    """Get current policy configuration."""
    result = await db.execute(select(PolicyConfig).order_by(asc(PolicyConfig.key)))
    return result.scalars().all()


@router.put("/policies", tags=["Policies"])
async def update_policy(update: PolicyUpdate, db: AsyncSession = Depends(get_db)):
    """Update a policy value."""
    result = await db.execute(
        select(PolicyConfig).where(PolicyConfig.key == update.key)
    )
    policy = result.scalar_one_or_none()
    if not policy:
        policy = PolicyConfig(
            key=update.key,
            value=update.value,
            description=f"Policy: {update.key}",
        )
        db.add(policy)
    else:
        policy.value = update.value
        policy.updated_at = datetime.utcnow()
    await db.commit()
    return {"status": "ok", "key": update.key, "value": update.value}


# ── Demo scenarios ─────────────────────────────────────────────────────────────

@router.get("/demo/scenarios", tags=["Demo"])
async def list_scenarios():
    """List available demo scenarios."""
    from ..demo.scenarios.presets import list_demo_scenarios
    return list_demo_scenarios()


@router.post("/demo/scenario", tags=["Demo"])
async def run_demo_scenario(body: dict, db: AsyncSession = Depends(get_db)):
    """
    Run a pre-configured demo scenario.
    Returns realistic pre-computed results — clearly labeled as demo data.
    """
    scenario_id = body.get("scenario_id")
    if not scenario_id:
        raise HTTPException(status_code=400, detail="scenario_id required")

    from ..demo.scenarios.presets import get_demo_scenario, DEMO_SCENARIOS
    scenario = get_demo_scenario(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Unknown scenario: {scenario_id}")

    # Persist as a demo request
    req_data = scenario["request"]
    dep_req = DependencyRequest(
        package_name=req_data["package"],
        ecosystem=req_data["ecosystem"],
        requested_version=req_data.get("version", "latest"),
        ai_reason=req_data.get("reason"),
        source=req_data.get("source", "AI_AGENT"),
    )
    db.add(dep_req)
    await db.flush()

    audit = AuditEvent(
        event_type="DEMO_SCENARIO",
        package_name=req_data["package"],
        ecosystem=req_data["ecosystem"],
        risk_level=scenario["overall_risk"],
        decision=scenario["decision"],
        user="demo",
        details={"scenario_id": scenario_id, "is_demo": True},
    )
    db.add(audit)
    await db.commit()

    # Build response from pre-computed data
    return {
        **scenario,
        "is_demo": True,
        "request_id": dep_req.id,
        "timestamp": datetime.utcnow().isoformat(),
        "demo_label": "[DEMO DATA — Simulated for demonstration purposes]",
    }


# ── Health ─────────────────────────────────────────────────────────────────────

@router.get("/health", tags=["System"])
async def health(db: AsyncSession = Depends(get_db)):
    """Health check endpoint. Returns 200 when the service is ready."""
    from sqlalchemy import text
    try:
        await db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "degraded"
    return {
        "status": "healthy" if db_status == "ok" else "degraded",
        "service": "DepPhantom",
        "version": "1.0.0",
        "database": db_status,
    }


@router.get("/stats/summary", tags=["Dashboard"])
async def stats_summary(db: AsyncSession = Depends(get_db)):
    """Quick summary stats for dashboard widgets."""
    from ..services.verification import get_dashboard_stats
    return await get_dashboard_stats(db)
