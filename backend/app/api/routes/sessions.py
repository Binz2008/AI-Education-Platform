from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlmodel import Session, select

from app.core.database import get_db_session
from app.core.security import verify_token
from app.models.child import Child
from app.models.guardian import Guardian
from app.models.session import ChatMessage
from app.models.session import Session as LearningSession

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


@router.post("/start")
async def start_session(
    session_data: dict, guardian: Guardian = Depends(get_current_guardian), session: Session = Depends(get_db_session)
):
    """Start a new learning session."""
    child_id = session_data["childId"]
    lesson_id = session_data["lessonId"]
    agent_id = session_data["agentId"]

    # Verify child belongs to guardian
    child = session.get(Child, child_id)
    if not child or child.guardian_id != guardian.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")

    # Create new session
    learning_session = LearningSession(
        child_id=child_id,
        lesson_id=lesson_id,
        subject=session_data.get("subject", "arabic"),
        agent_id=agent_id,
        status="active",
    )

    session.add(learning_session)
    session.commit()
    session.refresh(learning_session)

    return {
        "sessionId": learning_session.id,
        "status": "started",
        "agentId": agent_id,
        "message": "Session started successfully",
    }


@router.post("/{session_id}/message")
async def send_message(
    session_id: UUID,
    message_data: dict,
    guardian: Guardian = Depends(get_current_guardian),
    session: Session = Depends(get_db_session),
):
    """Send message in session."""
    # Get session and verify ownership
    learning_session = session.get(LearningSession, session_id)
    if not learning_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    # Verify child belongs to guardian
    child = session.get(Child, learning_session.child_id)
    if not child or child.guardian_id != guardian.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Create child message
    child_message = ChatMessage(
        session_id=session_id,
        role="child",
        content=message_data["content"],
        content_type=message_data.get("contentType", "text"),
    )

    session.add(child_message)

    # Generate AI response (placeholder for now)
    agent_response = ChatMessage(
        session_id=session_id,
        role="agent",
        content=f"مرحباً! أنا الأستاذ فصيح وسأساعدك في تعلم اللغة العربية. شكراً لك على رسالتك: '{message_data['content']}'",
        content_type="text",
    )

    session.add(agent_response)
    session.commit()

    return {
        "childMessage": {
            "id": child_message.id,
            "content": child_message.content,
            "timestamp": child_message.timestamp.isoformat(),
        },
        "agentResponse": {
            "id": agent_response.id,
            "content": agent_response.content,
            "timestamp": agent_response.timestamp.isoformat(),
        },
    }


@router.get("/{session_id}/messages")
async def get_session_messages(
    session_id: UUID, guardian: Guardian = Depends(get_current_guardian), session: Session = Depends(get_db_session)
):
    """Get all messages from a session."""
    # Verify session ownership
    learning_session = session.get(LearningSession, session_id)
    if not learning_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    child = session.get(Child, learning_session.child_id)
    if not child or child.guardian_id != guardian.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    messages = session.exec(select(ChatMessage).where(ChatMessage.session_id == session_id)).all()

    return {
        "sessionId": session_id,
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "contentType": msg.content_type,
                "timestamp": msg.timestamp.isoformat(),
            }
            for msg in messages
        ],
    }


@router.post("/{session_id}/end")
async def end_session(
    session_id: UUID, guardian: Guardian = Depends(get_current_guardian), session: Session = Depends(get_db_session)
):
    """End a learning session."""
    learning_session = session.get(LearningSession, session_id)
    if not learning_session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    # Verify ownership
    child = session.get(Child, learning_session.child_id)
    if not child or child.guardian_id != guardian.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    # Update session status
    learning_session.status = "completed"
    learning_session.final_score = 85  # Placeholder score
    learning_session.points_earned = 10

    session.add(learning_session)
    session.commit()

    return {
        "sessionId": session_id,
        "status": "completed",
        "finalScore": learning_session.final_score,
        "pointsEarned": learning_session.points_earned,
    }
