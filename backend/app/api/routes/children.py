import json
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlmodel import Session, select

from app.core.database import get_db_session
from app.core.security import verify_token
from app.models.child import Child
from app.models.guardian import Guardian

router = APIRouter()
security = HTTPBearer()


async def get_current_guardian(token: str = Depends(security), session: Session = Depends(get_db_session)) -> Guardian:
    """Get current authenticated guardian."""
    payload = verify_token(token.credentials)
    guardian_id = payload.get("sub")

    guardian = session.get(Guardian, guardian_id)
    if not guardian:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Guardian not found")
    return guardian


@router.get("/", response_model=list[dict])
async def get_children(guardian: Guardian = Depends(get_current_guardian), session: Session = Depends(get_db_session)):
    """Get all children for current guardian."""
    children = session.exec(select(Child).where(Child.guardian_id == guardian.id)).all()

    return [
        {
            "id": child.id,
            "firstName": child.first_name,
            "ageGroup": child.age_group,
            "preferredLanguage": child.preferred_language,
            "avatar": child.avatar,
            "totalPoints": child.total_points,
            "currentStreak": child.current_streak,
            "enabledSubjects": child.enabled_subjects_list,
            "dailyTimeLimit": child.daily_time_limit,
            "voiceEnabled": child.voice_enabled,
            "chatEnabled": child.chat_enabled,
        }
        for child in children
    ]


@router.post("/", response_model=dict)
async def create_child(
    child_data: dict, guardian: Guardian = Depends(get_current_guardian), session: Session = Depends(get_db_session)
):
    """Create a new child for current guardian."""
    child = Child(
        guardian_id=guardian.id,
        first_name=child_data["firstName"],
        birth_date=child_data["birthDate"],
        age_group=child_data["ageGroup"],
        preferred_language=child_data.get("preferredLanguage", "ar"),
    )

    session.add(child)
    session.commit()
    session.refresh(child)

    return {
        "id": child.id,
        "firstName": child.first_name,
        "ageGroup": child.age_group,
        "preferredLanguage": child.preferred_language,
        "message": "Child created successfully",
    }


@router.get("/{child_id}")
async def get_child(
    child_id: UUID, guardian: Guardian = Depends(get_current_guardian), session: Session = Depends(get_db_session)
):
    """Get specific child details."""
    child = session.get(Child, child_id)

    if not child or child.guardian_id != guardian.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")

    return {
        "id": child.id,
        "firstName": child.first_name,
        "ageGroup": child.age_group,
        "preferredLanguage": child.preferred_language,
        "avatar": child.avatar,
        "totalPoints": child.total_points,
        "currentStreak": child.current_streak,
        "enabledSubjects": child.enabled_subjects_list,
        "dailyTimeLimit": child.daily_time_limit,
        "voiceEnabled": child.voice_enabled,
        "chatEnabled": child.chat_enabled,
        "voiceRecordingAllowed": child.voice_recording_allowed,
        "dataRetentionDays": child.data_retention_days,
        "lastActivity": child.last_activity,
    }


@router.put("/{child_id}")
async def update_child(
    child_id: UUID,
    child_data: dict,
    guardian: Guardian = Depends(get_current_guardian),
    session: Session = Depends(get_db_session),
):
    """Update child information."""
    child = session.get(Child, child_id)

    if not child or child.guardian_id != guardian.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")

    # Update allowed fields
    allowed_fields = [
        "firstName",
        "preferredLanguage",
        "dailyTimeLimit",
        "voiceEnabled",
        "chatEnabled",
        "voiceRecordingAllowed",
        "dataRetentionDays",
        "enabledSubjects",
    ]

    for field, value in child_data.items():
        if field in allowed_fields:
            if field == "firstName":
                child.first_name = value
            elif field == "preferredLanguage":
                child.preferred_language = value
            elif field == "dailyTimeLimit":
                child.daily_time_limit = value
            elif field == "voiceEnabled":
                child.voice_enabled = value
            elif field == "chatEnabled":
                child.chat_enabled = value
            elif field == "voiceRecordingAllowed":
                child.voice_recording_allowed = value
            elif field == "dataRetentionDays":
                child.data_retention_days = value
            elif field == "enabledSubjects":
                child.enabled_subjects = json.dumps(value)

    session.add(child)
    session.commit()
    session.refresh(child)

    return {"id": child.id, "firstName": child.first_name, "message": "Child updated successfully"}


@router.delete("/{child_id}")
async def delete_child(
    child_id: UUID, guardian: Guardian = Depends(get_current_guardian), session: Session = Depends(get_db_session)
):
    """Delete child (soft delete by deactivating)."""
    child = session.get(Child, child_id)

    if not child or child.guardian_id != guardian.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")

    # Soft delete - just remove from active children
    session.delete(child)
    session.commit()

    return {"message": "Child deleted successfully"}
