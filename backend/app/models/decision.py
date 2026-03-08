"""SQLAlchemy ORM models for StratosAI."""
import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _uuid() -> str:
    return str(uuid.uuid4())


class DecisionStatus(str, enum.Enum):
    PENDING   = "pending"
    QUEUED    = "queued"
    ANALYZING = "analyzing"
    COMPLETE  = "complete"
    FAILED    = "failed"


class AgentStatus(str, enum.Enum):
    IDLE    = "idle"
    RUNNING = "running"
    DONE    = "done"
    ERROR   = "error"


class UrgencyLevel(str, enum.Enum):
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"


class Decision(Base):
    __tablename__ = "decisions"

    id:             Mapped[str]             = mapped_column(String(36), primary_key=True, default=_uuid)
    title:          Mapped[str]             = mapped_column(String(255), nullable=False)
    context:        Mapped[str]             = mapped_column(Text, nullable=False)
    domain:         Mapped[str]             = mapped_column(String(100), default="general")
    urgency:        Mapped[UrgencyLevel]    = mapped_column(Enum(UrgencyLevel), default=UrgencyLevel.MEDIUM)
    status:         Mapped[DecisionStatus]  = mapped_column(Enum(DecisionStatus), default=DecisionStatus.PENDING, index=True)
    confidence:     Mapped[float]           = mapped_column(Float, default=0.0)
    recommendation: Mapped[str | None]      = mapped_column(Text)
    created_at:     Mapped[datetime]        = mapped_column(DateTime(timezone=True), server_default=func.now(), index=True)
    completed_at:   Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    agent_runs:    Mapped[list["AgentRun"]]    = relationship(back_populates="decision", cascade="all, delete-orphan")
    activity_logs: Mapped[list["ActivityLog"]] = relationship(back_populates="decision", cascade="all, delete-orphan")


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id:                Mapped[str]             = mapped_column(String(36), primary_key=True, default=_uuid)
    decision_id:       Mapped[str]             = mapped_column(String(36), ForeignKey("decisions.id", ondelete="CASCADE"), index=True)
    agent_name:        Mapped[str]             = mapped_column(String(100), nullable=False)
    agent_type:        Mapped[str]             = mapped_column(String(100), nullable=False)
    status:            Mapped[AgentStatus]     = mapped_column(Enum(AgentStatus), default=AgentStatus.IDLE)
    output:            Mapped[str | None]      = mapped_column(Text)
    error:             Mapped[str | None]      = mapped_column(Text)
    duration_ms:       Mapped[int]             = mapped_column(Integer, default=0)
    prompt_tokens:     Mapped[int]             = mapped_column(Integer, default=0)
    completion_tokens: Mapped[int]             = mapped_column(Integer, default=0)
    started_at:        Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at:      Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    decision: Mapped["Decision"] = relationship(back_populates="agent_runs")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id:          Mapped[int]      = mapped_column(Integer, primary_key=True, autoincrement=True)
    decision_id: Mapped[str]      = mapped_column(String(36), ForeignKey("decisions.id", ondelete="CASCADE"), index=True)
    level:       Mapped[str]      = mapped_column(String(20), default="info")
    message:     Mapped[str]      = mapped_column(Text, nullable=False)
    agent_name:  Mapped[str|None] = mapped_column(String(100))
    created_at:  Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    decision: Mapped["Decision"] = relationship(back_populates="activity_logs")
