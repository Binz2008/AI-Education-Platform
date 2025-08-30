import json
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .session import Session

class Activity(SQLModel, table=True):
    __tablename__ = "activities"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    lesson_id: UUID = Field(foreign_key="lessons.id", index=True)
    activity_id: str  # Internal activity identifier
    type: str  # "reading", "listening", "speaking", "writing", "quiz", "game"
    title: str
    description: str
    content: str  # JSON content
    expected_duration: int  # minutes
    points: int = Field(default=10)
    required_for_completion: bool = Field(default=True)
    order_index: int = Field(default=0)

    # Relationships
    lesson: "Lesson" = Relationship(back_populates="activities")


class Lesson(SQLModel, table=True):
    __tablename__ = "lessons"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    description: str
    subject: str  # "arabic", "english", "islamic"
    age_group: str  # "4-6", "7-9", "10-12"
    difficulty: str  # "beginner", "intermediate", "advanced"

    # Content
    estimated_duration: int  # total minutes
    objectives: str  # JSON array
    keywords: str = Field(default="[]")  # JSON array

    # Prerequisites and progression
    prerequisites: str = Field(default="[]")  # JSON array of lesson IDs
    unlocks: str = Field(default="[]")  # JSON array of lesson IDs

    # Metadata
    is_published: bool = Field(default=False)
    tags: str = Field(default="[]")  # JSON array

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default=None)

    # Relationships
    activities: list[Activity] = Relationship(back_populates="lesson")
    sessions: list["Session"] = Relationship(back_populates="lesson")

    @property
    def objectives_list(self) -> list[str]:
        return json.loads(self.objectives)

    @property
    def keywords_list(self) -> list[str]:
        return json.loads(self.keywords)

    @property
    def prerequisites_list(self) -> list[str]:
        return json.loads(self.prerequisites)

    @property
    def unlocks_list(self) -> list[str]:
        return json.loads(self.unlocks)

    @property
    def tags_list(self) -> list[str]:
        return json.loads(self.tags)

    class Config:
        validate_assignment = True
