from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from .child import Child

class Guardian(SQLModel, table=True):
    __tablename__ = "guardians"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    email: str = Field(unique=True, index=True)
    hashed_password: str
    first_name: str
    last_name: str
    preferred_language: str = Field(default="ar")
    timezone: str = Field(default="Asia/Dubai")
    is_email_verified: bool = Field(default=False)
    is_active: bool = Field(default=True)

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = Field(default=None)
    last_login: datetime | None = Field(default=None)

    # Relationships
    children: list["Child"] = Relationship(back_populates="guardian")

    class Config:
        validate_assignment = True
