import json
from datetime import date, datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .guardian import Guardian
    from .session import Session


class Child(SQLModel, table=True):
    __tablename__ = "children"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    guardian_id: UUID = Field(foreign_key="guardians.id", index=True)
    first_name: str
    birth_date: date
    age_group: str  # "4-6", "7-9", "10-12"
    preferred_language: str = Field(default="ar")
    avatar: str | None = Field(default=None)

    # Parental controls
    daily_time_limit: int = Field(default=30)  # minutes
    enabled_subjects: str = Field(default='["arabic"]')  # JSON array
    voice_enabled: bool = Field(default=True)
    chat_enabled: bool = Field(default=True)

    # Privacy settings
    voice_recording_allowed: bool = Field(default=False)
    data_retention_days: int = Field(default=30)

    # Progress tracking
    total_points: int = Field(default=0)
    current_streak: int = Field(default=0)
    longest_streak: int = Field(default=0)
    last_activity: datetime | None = Field(default=None)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default=None)

    # Relationships
    guardian: "Guardian" = Relationship(back_populates="children")
    sessions: list["Session"] = Relationship(back_populates="child")

    @property
    def enabled_subjects_list(self) -> list[str]:
        return json.loads(self.enabled_subjects)

    @enabled_subjects_list.setter
    def enabled_subjects_list(self, subjects: list[str]):
        self.enabled_subjects = json.dumps(subjects)

    class Config:
        validate_assignment = True
