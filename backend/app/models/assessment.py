import json
from datetime import datetime
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel


class AssessmentResult(SQLModel, table=True):
    __tablename__ = "assessment_results"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    session_id: UUID = Field(foreign_key="sessions.id", index=True)
    child_id: UUID = Field(foreign_key="children.id", index=True)
    subject: str  # "arabic", "english", "islamic"

    # Scores by skill (JSON object)
    skill_scores: str = Field(default="{}")  # {"pronunciation": 85, "comprehension": 90}
    overall_score: int = Field(default=0)

    # Detailed feedback (JSON arrays)
    strengths: str = Field(default="[]")
    areas_for_improvement: str = Field(default="[]")
    recommendations: str = Field(default="[]")

    # Progress tracking (JSON arrays)
    mastered_skills: str = Field(default="[]")
    struggling_skills: str = Field(default="[]")

    # AI confidence and metadata
    assessment_confidence: float | None = Field(default=None)
    assessment_method: str = Field(default="rule_based")  # "rule_based", "ai_evaluated", "hybrid"

    # Time-based metrics
    response_time: int | None = Field(default=None)  # milliseconds
    time_to_complete: int | None = Field(default=None)  # minutes

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default=None)

    @property
    def skill_scores_dict(self) -> dict:
        return json.loads(self.skill_scores)

    @property
    def strengths_list(self) -> list[str]:
        return json.loads(self.strengths)

    @property
    def areas_for_improvement_list(self) -> list[str]:
        return json.loads(self.areas_for_improvement)

    @property
    def recommendations_list(self) -> list[str]:
        return json.loads(self.recommendations)


class ProgressReport(SQLModel, table=True):
    __tablename__ = "progress_reports"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    child_id: UUID = Field(foreign_key="children.id", index=True)
    guardian_id: UUID = Field(foreign_key="guardians.id", index=True)

    # Report period
    start_date: datetime
    end_date: datetime

    # Overall statistics
    total_sessions: int = Field(default=0)
    total_time_spent: int = Field(default=0)  # minutes
    average_score: float = Field(default=0.0)

    # Subject-wise breakdown (JSON)
    subject_progress: str = Field(default="{}")

    # Achievements and rewards (JSON)
    badges_earned: str = Field(default="[]")
    points_earned: int = Field(default=0)

    # Parent insights (JSON arrays)
    parent_recommendations: str = Field(default="[]")
    celebrate_achievements: str = Field(default="[]")
    concern_areas: str = Field(default="[]")

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default=None)

    @property
    def subject_progress_dict(self) -> dict:
        return json.loads(self.subject_progress)

    @property
    def badges_earned_list(self) -> list[dict]:
        return json.loads(self.badges_earned)

    @property
    def parent_recommendations_list(self) -> list[str]:
        return json.loads(self.parent_recommendations)

    class Config:
        validate_assignment = True
