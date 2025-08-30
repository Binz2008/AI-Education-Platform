"""Session models for the AI Education Platform."""
import json
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .child import Child
    from .lesson import Lesson

# TODO[BE]: Add validation for session duration limits
# TODO[DB]: Implement session cleanup for expired sessions
# SECURITY[AUTH]: Add session token validation


class ChatMessage(SQLModel, table=True):
    """Chat message model for session conversations."""

    __tablename__ = "chat_messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="sessions.id", index=True)
    role: str  # "child", "agent"
    content: str
    content_type: str = Field(default="text")  # "text", "audio"
    audio_url: str | None = Field(default=None)
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    message_metadata: str = Field(default="{}")  # JSON metadata

    # Content safety
    is_flagged: bool = Field(default=False)
    flagged_reason: str | None = Field(default=None)

    # Relationships
    session: "Session" = Relationship(back_populates="messages")


class Session(SQLModel, table=True):
    """Learning session model for tracking child-lesson interactions."""

    __tablename__ = "sessions"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    child_id: UUID = Field(foreign_key="children.id", index=True)
    lesson_id: UUID = Field(foreign_key="lessons.id", index=True)
    subject: str  # "arabic", "english", "islamic"
    agent_id: str

    # Session state
    status: str = Field(default="active")  # "active", "paused", "completed", "abandoned"
    start_time: datetime = Field(default_factory=datetime.utcnow)
    end_time: datetime | None = Field(default=None)

    # Progress tracking
    activities_completed: str = Field(default="[]")  # JSON array
    current_activity: str | None = Field(default=None)
    score: int = Field(default=0)
    time_spent: int = Field(default=0)  # minutes
    engagement_level: str | None = Field(default=None)  # "low", "medium", "high"
    hints_used: int = Field(default=0)

    # Assessment
    final_score: int | None = Field(default=None)
    points_earned: int = Field(default=0)
    badges_earned: str = Field(default="[]")  # JSON array

    # Metadata
    device_info: str = Field(default="{}")  # JSON

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default=None)

    # Relationships
    child: "Child" = Relationship(back_populates="sessions")
    lesson: "Lesson" = Relationship(back_populates="sessions")
    messages: list[ChatMessage] = Relationship(back_populates="session")

    @property
    def activities_completed_list(self) -> list[str]:
        """Parse activities_completed JSON field into a list."""
        return json.loads(self.activities_completed)

    @property
    def badges_earned_list(self) -> list[str]:
        """Parse badges_earned JSON field into a list."""
        return json.loads(self.badges_earned)

    class Config:
        """SQLModel configuration."""

        validate_assignment = True
