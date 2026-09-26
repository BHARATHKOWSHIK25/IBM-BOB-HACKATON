"""Pydantic schemas for request/response serialization."""
from __future__ import annotations
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict, field_validator
from enum import Enum


class EcosystemEnum(str, Enum):
    pypi = "pypi"
    npm = "npm"


class SourceEnum(str, Enum):
    ai_agent = "AI_AGENT"
    manual = "MANUAL"
    ci_cd = "CI_CD"


class RiskLevel(str, Enum):
    low = "LOW"
    medium = "MEDIUM"
    high = "HIGH"
    critical = "CRITICAL"
    unknown = "UNKNOWN"


class DecisionEnum(str, Enum):
    allow = "ALLOW"
    review = "REVIEW"
    block = "BLOCK"


# ── Request schemas ───────────────────────────────────────────────────────────

class VerifyRequest(BaseModel):
    package: str
    ecosystem: EcosystemEnum
    version: Optional[str] = "latest"
    reason: Optional[str] = None
    source: SourceEnum = SourceEnum.ai_agent

    @field_validator("package")
    @classmethod
    def package_name_valid(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Package name cannot be empty")
        if len(v) > 256:
            raise ValueError("Package name too long")
        return v


class OverrideRequest(BaseModel):
    decision_id: int
    new_decision: DecisionEnum
    user: str = "developer"
    reason: str


# ── Signal / component schemas ────────────────────────────────────────────────

class SignalResult(BaseModel):
    name: str
    status: str          # OK / WARNING / DANGER / UNKNOWN
    value: Optional[Any] = None
    description: str


class RegistryResult(BaseModel):
    exists: bool
    registry_url: Optional[str] = None
    latest_version: Optional[str] = None
    all_versions: List[str] = []
    published_at: Optional[datetime] = None
    publisher: Optional[str] = None
    maintainers: List[str] = []
    description: Optional[str] = None
    homepage: Optional[str] = None
    license: Optional[str] = None
    download_count: Optional[int] = None
    is_demo: bool = False


class TyposquatResult(BaseModel):
    closest_match: Optional[str] = None
    similarity_score: float = 0.0
    is_suspicious: bool = False
    all_matches: List[Dict[str, Any]] = []


class MetadataResult(BaseModel):
    package_age_days: Optional[int] = None
    version_count: int = 0
    is_new: bool = False
    is_abandoned: bool = False
    signals: List[SignalResult] = []


class ScriptRiskResult(BaseModel):
    risk_level: str = "UNKNOWN"
    findings: List[str] = []
    signals: List[SignalResult] = []


class DependencyRiskResult(BaseModel):
    risk_level: str = "UNKNOWN"
    suspicious_deps: List[str] = []
    signals: List[SignalResult] = []


class IntentResult(BaseModel):
    match_level: str = "UNKNOWN"   # MATCH / PARTIAL / MISMATCH / UNKNOWN
    explanation: str = ""
    signals: List[SignalResult] = []


# ── Full analysis response ────────────────────────────────────────────────────

class AnalysisResponse(BaseModel):
    request_id: int
    analysis_id: Optional[int] = None
    package: str
    ecosystem: str
    version: Optional[str]
    source: str

    # Component results
    registry: RegistryResult
    typosquat: TyposquatResult
    metadata: MetadataResult
    script_risk: ScriptRiskResult
    dependency_risk: DependencyRiskResult
    intent: IntentResult

    # Final verdict
    overall_risk: RiskLevel
    confidence: float
    decision: DecisionEnum
    reasons: List[str]
    explanation: str

    # Pipeline steps
    pipeline_steps: List[SignalResult] = []

    timestamp: datetime

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)



# ── Dashboard ────────────────────────────────────────────────────────────────

class DashboardStats(BaseModel):
    protected_installations: int
    blocked_dependencies: int
    review_required: int
    high_risk_packages: int
    ai_hallucinations_detected: int
    recent_events: List[Dict[str, Any]]


# ── Audit / Events ────────────────────────────────────────────────────────────

class AuditEventOut(BaseModel):
    id: int
    event_type: str
    package_name: str
    ecosystem: str
    risk_level: Optional[str]
    decision: Optional[str]
    user: str
    timestamp: datetime
    details: Optional[Dict[str, Any]]

    model_config = ConfigDict(from_attributes=True)



# ── Policies ─────────────────────────────────────────────────────────────────

class PolicyOut(BaseModel):
    key: str
    value: str
    description: Optional[str]
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)



class PolicyUpdate(BaseModel):
    key: str
    value: str
