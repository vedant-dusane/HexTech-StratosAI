"""Pydantic v2 schemas — request validation and response serialization."""
import json
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.models.decision import AgentStatus, DecisionStatus, UrgencyLevel


class AgentRunRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    decision_id: str
    agent_name: str
    agent_type: str
    status: AgentStatus
    output: str | None
    error: str | None
    duration_ms: int
    prompt_tokens: int
    completion_tokens: int
    started_at: datetime | None
    completed_at: datetime | None


class DecisionCreate(BaseModel):
    title:   str          = Field(..., min_length=3, max_length=255)
    context: str          = Field(..., min_length=20, max_length=10_000)
    domain:  str          = Field(default="general", max_length=100)
    urgency: UrgencyLevel = UrgencyLevel.MEDIUM

    @field_validator("context")
    @classmethod
    def context_has_words(cls, v: str) -> str:
        if len(v.split()) < 5:
            raise ValueError("Context must contain at least 5 words")
        return v.strip()


class DecisionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    context: str
    domain: str
    urgency: UrgencyLevel
    status: DecisionStatus
    confidence: float
    recommendation: str | None
    created_at: datetime
    completed_at: datetime | None
    agent_runs: list[AgentRunRead] = []


class DecisionSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: str
    domain: str
    urgency: UrgencyLevel
    status: DecisionStatus
    confidence: float
    created_at: datetime
    completed_at: datetime | None


class DecisionListResponse(BaseModel):
    items: list[DecisionSummary]
    total: int
    page: int
    page_size: int


class StatsResponse(BaseModel):
    total_decisions: int
    completed: int
    analyzing: int
    avg_confidence: float
    total_agent_runs: int
    success_rate: float


class SSEEvent(BaseModel):
    type: str
    data: dict[str, Any]

    def to_sse(self) -> str:
        payload = json.dumps({"type": self.type, "data": self.data})
        return f"data: {payload}\n\n"
