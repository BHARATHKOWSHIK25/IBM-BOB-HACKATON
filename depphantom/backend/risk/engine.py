"""Risk engine — aggregates all analyzer signals into a final risk score and decision."""
from __future__ import annotations
from typing import List, Tuple
from ..schemas import (
    RegistryResult, TyposquatResult, MetadataResult,
    ScriptRiskResult, DependencyRiskResult, IntentResult,
    RiskLevel, DecisionEnum, SignalResult,
)
from ..config import get_settings

settings = get_settings()

# Risk level ordering
_RISK_ORDER = {
    RiskLevel.unknown: 0,
    RiskLevel.low: 1,
    RiskLevel.medium: 2,
    RiskLevel.high: 3,
    RiskLevel.critical: 4,
}

_RISK_STR_ORDER = {
    "UNKNOWN": 0, "LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4,
}


def _max_risk(*levels: str) -> str:
    return max(levels, key=lambda l: _RISK_STR_ORDER.get(l, 0))


def calculate_risk(
    registry: RegistryResult,
    typosquat: TyposquatResult,
    metadata: MetadataResult,
    script_risk: ScriptRiskResult,
    dep_risk: DependencyRiskResult,
    intent: IntentResult,
    source: str = "AI_AGENT",
) -> Tuple[str, float, List[str], str]:
    """
    Returns (overall_risk, confidence, reasons, explanation).
    """
    score = 0.0
    reasons: List[str] = []
    signals_fired: List[str] = []

    # ── Registry existence ────────────────────────────────────────────────────
    if not registry.exists:
        score += 35.0
        reasons.append("Package does not exist in the registry.")
        signals_fired.append("NOT_FOUND")
        if source == "AI_AGENT":
            score += 15.0
            reasons.append("Package was requested by an AI agent and does not exist — likely hallucinated.")
            signals_fired.append("AI_HALLUCINATION")
    else:
        # Package exists — partial credit
        score -= 5.0

    # ── Typosquatting ────────────────────────────────────────────────────────
    if typosquat.is_suspicious:
        sim = typosquat.similarity_score
        if sim >= 0.95:
            score += 40.0
            reasons.append(
                f"Package name is {sim*100:.0f}% similar to trusted package "
                f"'{typosquat.closest_match}' — near-identical typosquatting detected."
            )
        elif sim >= 0.90:
            score += 30.0
            reasons.append(
                f"Package name is {sim*100:.0f}% similar to trusted package "
                f"'{typosquat.closest_match}'."
            )
        elif sim >= settings.typosquatting_similarity_threshold:
            score += 20.0
            reasons.append(
                f"Package name is {sim*100:.0f}% similar to trusted package "
                f"'{typosquat.closest_match}' — possible impersonation."
            )
        signals_fired.append("TYPOSQUATTING")

    # ── Package age ──────────────────────────────────────────────────────────
    if metadata.is_new:
        age = metadata.package_age_days or 0
        if age < 1:
            score += 25.0
            reasons.append("Package was registered less than 24 hours ago.")
        elif age < 7:
            score += 20.0
            reasons.append(f"Package was registered only {age} days ago.")
        else:
            score += 10.0
            reasons.append(f"Package is relatively new ({age} days old).")
        signals_fired.append("NEW_PACKAGE")

    if metadata.version_count <= 1 and registry.exists:
        score += 5.0
        reasons.append("Package has very limited release history.")

    # ── Download / adoption ──────────────────────────────────────────────────
    if registry.download_count is not None and registry.download_count < settings.low_download_threshold:
        score += 5.0
        reasons.append(f"Package has very low adoption ({registry.download_count} recent downloads).")

    # ── Installation script risk ──────────────────────────────────────────────
    script_map = {"CRITICAL": 50.0, "HIGH": 35.0, "MEDIUM": 15.0, "LOW": 0.0, "UNKNOWN": 3.0}
    if script_risk.risk_level in script_map:
        sc = script_map[script_risk.risk_level]
        score += sc
        if sc > 0 and script_risk.findings:
            reasons.append(
                f"Installation script analysis: {script_risk.risk_level}. "
                f"Issues: {'; '.join(script_risk.findings[:3])}."
            )
        signals_fired.append(f"SCRIPT_{script_risk.risk_level}")

    # ── Dependency risk ───────────────────────────────────────────────────────
    dep_map = {"HIGH": 20.0, "MEDIUM": 10.0, "LOW": 0.0, "UNKNOWN": 0.0}
    dep_score = dep_map.get(dep_risk.risk_level, 0.0)
    score += dep_score
    if dep_score > 0 and dep_risk.suspicious_deps:
        reasons.append(
            f"Suspicious transitive dependencies found: {', '.join(dep_risk.suspicious_deps[:3])}."
        )
        signals_fired.append("SUSPICIOUS_DEPS")

    # ── Intent mismatch ───────────────────────────────────────────────────────
    intent_map = {"MISMATCH": 30.0, "PARTIAL": 10.0, "MATCH": 0.0, "UNKNOWN": 0.0}
    intent_score = intent_map.get(intent.match_level, 0.0)
    score += intent_score
    if intent.match_level == "MISMATCH":
        reasons.append("Package purpose does not match AI-stated intent.")
        signals_fired.append("INTENT_MISMATCH")
    elif intent.match_level == "PARTIAL":
        reasons.append("Package may not be the correct package for the stated AI intent.")

    # ── AI source penalty ─────────────────────────────────────────────────────
    if source == "AI_AGENT" and score > 10:
        score *= 1.1  # 10% multiplier for AI-sourced requests

    # Clamp to 0–100
    score = min(max(score, 0.0), 100.0)

    # ── Determine risk level ──────────────────────────────────────────────────
    if score >= 75:
        overall_risk = "CRITICAL"
    elif score >= 50:
        overall_risk = "HIGH"
    elif score >= 25:
        overall_risk = "MEDIUM"
    else:
        overall_risk = "LOW"

    # ── Confidence ────────────────────────────────────────────────────────────
    # More signals = higher confidence
    num_signals = len(signals_fired)
    base_confidence = min(0.5 + num_signals * 0.08, 0.98)
    if not registry.exists:
        base_confidence = min(base_confidence + 0.15, 0.99)
    confidence = round(base_confidence, 2)

    # ── Explanation ───────────────────────────────────────────────────────────
    if overall_risk in ("CRITICAL", "HIGH"):
        pkg_ref = registry.registry_url or "this package"
        explanation = (
            f"DepPhantom classified '{pkg_ref}' as "
            f"{overall_risk} risk (score: {score:.0f}/100). "
            f"Primary concerns: {'; '.join(reasons[:3])}."
        )
    elif overall_risk == "MEDIUM":
        explanation = (
            f"Package shows moderate risk signals (score: {score:.0f}/100). "
            f"Human review recommended. Concerns: {'; '.join(reasons[:2])}."
        )
    else:
        explanation = (
            f"Package appears low-risk (score: {score:.0f}/100). "
            f"No critical signals detected. Installation may proceed with standard monitoring."
        )

    return overall_risk, confidence, reasons, explanation


def get_decision(overall_risk: str, source: str = "AI_AGENT") -> str:
    policy = {
        "LOW": "ALLOW",
        "MEDIUM": "REVIEW",
        "HIGH": "BLOCK",
        "CRITICAL": "BLOCK",
        "UNKNOWN": "REVIEW",
    }
    return policy.get(overall_risk, "REVIEW")
