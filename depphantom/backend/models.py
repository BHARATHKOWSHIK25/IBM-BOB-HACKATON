"""SQLAlchemy ORM models for DepPhantom."""
from __future__ import annotations
from datetime import datetime
from typing import Optional
from sqlalchemy import (
    String, Integer, Float, Boolean, DateTime, Text, ForeignKey, JSON
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .database import Base


class DependencyRequest(Base):
    __tablename__ = "dependency_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    package_name: Mapped[str] = mapped_column(String(256), nullable=False, index=True)
    ecosystem: Mapped[str] = mapped_column(String(32), nullable=False)
    requested_version: Mapped[Optional[str]] = mapped_column(String(64))
    ai_reason: Mapped[Optional[str]] = mapped_column(Text)
    source: Mapped[str] = mapped_column(String(64), default="MANUAL")
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    analysis: Mapped[Optional["PackageAnalysis"]] = relationship(
        back_populates="request", uselist=False, cascade="all, delete-orphan"
    )


class PackageAnalysis(Base):
    __tablename__ = "package_analyses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dependency_request_id: Mapped[int] = mapped_column(
        ForeignKey("dependency_requests.id"), nullable=False
    )
    exists: Mapped[bool] = mapped_column(Boolean, default=False)
    package_age_days: Mapped[Optional[int]] = mapped_column(Integer)
    publisher: Mapped[Optional[str]] = mapped_column(String(256))
    version_count: Mapped[Optional[int]] = mapped_column(Integer)
    download_count: Mapped[Optional[int]] = mapped_column(Integer)
    similarity_score: Mapped[Optional[float]] = mapped_column(Float)
    closest_package: Mapped[Optional[str]] = mapped_column(String(256))
    install_script_risk: Mapped[str] = mapped_column(String(16), default="UNKNOWN")
    dependency_risk: Mapped[str] = mapped_column(String(16), default="UNKNOWN")
    intent_match: Mapped[str] = mapped_column(String(16), default="UNKNOWN")
    overall_risk: Mapped[str] = mapped_column(String(16), default="UNKNOWN")
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    raw_signals: Mapped[Optional[dict]] = mapped_column(JSON)
    explanation: Mapped[Optional[str]] = mapped_column(Text)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    request: Mapped["DependencyRequest"] = relationship(back_populates="analysis")
    decision: Mapped[Optional["Decision"]] = relationship(
        back_populates="analysis", uselist=False, cascade="all, delete-orphan"
    )


class Decision(Base):
    __tablename__ = "decisions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    analysis_id: Mapped[int] = mapped_column(
        ForeignKey("package_analyses.id"), nullable=False
    )
    decision: Mapped[str] = mapped_column(String(16), nullable=False)  # ALLOW/REVIEW/BLOCK
    user: Mapped[str] = mapped_column(String(128), default="system")
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    override_reason: Mapped[Optional[str]] = mapped_column(Text)
    is_override: Mapped[bool] = mapped_column(Boolean, default=False)

    analysis: Mapped["PackageAnalysis"] = relationship(back_populates="decision")


class AuditEvent(Base):
    __tablename__ = "audit_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    event_type: Mapped[str] = mapped_column(String(64), nullable=False)
    package_name: Mapped[str] = mapped_column(String(256))
    ecosystem: Mapped[str] = mapped_column(String(32))
    risk_level: Mapped[Optional[str]] = mapped_column(String(16))
    decision: Mapped[Optional[str]] = mapped_column(String(16))
    user: Mapped[str] = mapped_column(String(128), default="system")
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    details: Mapped[Optional[dict]] = mapped_column(JSON)


class PolicyConfig(Base):
    __tablename__ = "policy_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    key: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    value: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
