from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer
from sqlmodel import Session, func, select

from app.core.database import get_db_session
from app.core.security import verify_token
from app.models.child import Child
from app.models.guardian import Guardian
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


@router.get("/overview")
async def get_dashboard_overview(
    guardian: Guardian = Depends(get_current_guardian), session: Session = Depends(get_db_session)
):
    """Get dashboard overview with key metrics."""
    # Get all children for this guardian
    children = session.exec(select(Child).where(Child.guardian_id == guardian.id)).all()

    if not children:
        return {"totalChildren": 0, "totalSessions": 0, "totalPoints": 0, "averageEngagement": 0, "children": []}

    child_ids = [child.id for child in children]

    # Get session statistics
    total_sessions = (
        session.exec(select(func.count(LearningSession.id)).where(LearningSession.child_id.in_(child_ids))).first() or 0
    )

    completed_sessions = (
        session.exec(
            select(func.count(LearningSession.id)).where(
                LearningSession.child_id.in_(child_ids), LearningSession.status == "completed"
            )
        ).first()
        or 0
    )

    # Calculate total points across all children
    total_points = sum(child.total_points for child in children)

    # Get recent sessions for engagement calculation
    recent_sessions = session.exec(
        select(LearningSession).where(
            LearningSession.child_id.in_(child_ids), LearningSession.created_at >= datetime.utcnow() - timedelta(days=7)
        )
    ).all()

    # Calculate average engagement
    engagement_scores = [s.engagement_level for s in recent_sessions if s.engagement_level]
    engagement_map = {"low": 1, "medium": 2, "high": 3}
    avg_engagement = 0
    if engagement_scores:
        numeric_scores = [engagement_map.get(score, 0) for score in engagement_scores]
        avg_engagement = sum(numeric_scores) / len(numeric_scores)

    # Get children summary
    children_summary = []
    for child in children:
        child_sessions = (
            session.exec(select(func.count(LearningSession.id)).where(LearningSession.child_id == child.id)).first()
            or 0
        )

        children_summary.append(
            {
                "id": child.id,
                "firstName": child.first_name,
                "ageGroup": child.age_group,
                "totalPoints": child.total_points,
                "currentStreak": child.current_streak,
                "totalSessions": child_sessions,
                "lastActivity": child.last_activity.isoformat() if child.last_activity else None,
                "avatar": child.avatar,
            }
        )

    return {
        "totalChildren": len(children),
        "totalSessions": total_sessions,
        "completedSessions": completed_sessions,
        "totalPoints": total_points,
        "averageEngagement": round(avg_engagement, 2),
        "children": children_summary,
    }


@router.get("/analytics")
async def get_dashboard_analytics(
    guardian: Guardian = Depends(get_current_guardian), session: Session = Depends(get_db_session), days: int = 30
):
    """Get detailed analytics for dashboard."""
    children = session.exec(select(Child).where(Child.guardian_id == guardian.id)).all()

    if not children:
        return {"sessionTrends": [], "subjectBreakdown": {}, "engagementTrends": [], "pointsEarned": []}

    child_ids = [child.id for child in children]
    start_date = datetime.utcnow() - timedelta(days=days)

    # Get sessions within date range
    sessions = session.exec(
        select(LearningSession).where(LearningSession.child_id.in_(child_ids), LearningSession.created_at >= start_date)
    ).all()

    # Session trends by day
    session_trends = {}
    for s in sessions:
        date_key = s.created_at.date().isoformat()
        session_trends[date_key] = session_trends.get(date_key, 0) + 1

    # Subject breakdown
    subject_breakdown = {}
    for s in sessions:
        subject_breakdown[s.subject] = subject_breakdown.get(s.subject, 0) + 1

    # Engagement trends
    engagement_trends = {}
    for s in sessions:
        if s.engagement_level:
            date_key = s.created_at.date().isoformat()
            if date_key not in engagement_trends:
                engagement_trends[date_key] = []
            engagement_trends[date_key].append(s.engagement_level)

    # Calculate average engagement per day
    engagement_averages = {}
    engagement_map = {"low": 1, "medium": 2, "high": 3}
    for date, levels in engagement_trends.items():
        numeric_levels = [engagement_map.get(level, 0) for level in levels]
        engagement_averages[date] = sum(numeric_levels) / len(numeric_levels)

    # Points earned over time
    points_earned = {}
    for s in sessions:
        date_key = s.created_at.date().isoformat()
        points_earned[date_key] = points_earned.get(date_key, 0) + s.points_earned

    return {
        "sessionTrends": [{"date": date, "sessions": count} for date, count in sorted(session_trends.items())],
        "subjectBreakdown": subject_breakdown,
        "engagementTrends": [
            {"date": date, "engagement": round(avg, 2)} for date, avg in sorted(engagement_averages.items())
        ],
        "pointsEarned": [{"date": date, "points": points} for date, points in sorted(points_earned.items())],
    }


@router.get("/child/{child_id}/progress")
async def get_child_progress(
    child_id: UUID, guardian: Guardian = Depends(get_current_guardian), session: Session = Depends(get_db_session)
):
    """Get detailed progress for a specific child."""
    # Verify child belongs to guardian
    child = session.get(Child, child_id)
    if not child or child.guardian_id != guardian.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")

    # Get child's sessions
    child_sessions = session.exec(
        select(LearningSession).where(LearningSession.child_id == child_id).order_by(LearningSession.created_at.desc())
    ).all()

    # Calculate progress metrics
    total_sessions = len(child_sessions)
    completed_sessions = len([s for s in child_sessions if s.status == "completed"])
    total_time_spent = sum(s.time_spent for s in child_sessions)

    # Subject progress
    subject_progress = {}
    for s in child_sessions:
        if s.subject not in subject_progress:
            subject_progress[s.subject] = {"sessions": 0, "totalScore": 0, "averageScore": 0, "timeSpent": 0}

        subject_progress[s.subject]["sessions"] += 1
        subject_progress[s.subject]["totalScore"] += s.final_score or 0
        subject_progress[s.subject]["timeSpent"] += s.time_spent

    # Calculate averages
    for subject_data in subject_progress.values():
        if subject_data["sessions"] > 0:
            subject_data["averageScore"] = subject_data["totalScore"] / subject_data["sessions"]

    # Recent activity
    recent_sessions = child_sessions[:10]  # Last 10 sessions
    recent_activity = [
        {
            "id": s.id,
            "subject": s.subject,
            "status": s.status,
            "score": s.final_score,
            "pointsEarned": s.points_earned,
            "timeSpent": s.time_spent,
            "date": s.created_at.isoformat(),
            "engagementLevel": s.engagement_level,
        }
        for s in recent_sessions
    ]

    return {
        "childInfo": {
            "id": child.id,
            "firstName": child.first_name,
            "ageGroup": child.age_group,
            "totalPoints": child.total_points,
            "currentStreak": child.current_streak,
            "longestStreak": child.longest_streak,
        },
        "progressSummary": {
            "totalSessions": total_sessions,
            "completedSessions": completed_sessions,
            "completionRate": round(completed_sessions / total_sessions * 100, 1) if total_sessions > 0 else 0,
            "totalTimeSpent": total_time_spent,
        },
        "subjectProgress": subject_progress,
        "recentActivity": recent_activity,
    }


@router.get("/notifications")
async def get_notifications(
    guardian: Guardian = Depends(get_current_guardian), session: Session = Depends(get_db_session)
):
    """Get notifications for guardian dashboard."""
    children = session.exec(select(Child).where(Child.guardian_id == guardian.id)).all()

    notifications = []

    for child in children:
        # Check for inactive children (no activity in 3 days)
        if child.last_activity:
            days_inactive = (datetime.utcnow() - child.last_activity).days
            if days_inactive >= 3:
                notifications.append(
                    {
                        "type": "warning",
                        "title": f"{child.first_name} hasn't been active",
                        "message": f"No activity for {days_inactive} days",
                        "childId": child.id,
                        "timestamp": datetime.utcnow().isoformat(),
                    }
                )

        # Check for streak achievements
        if child.current_streak >= 7:
            notifications.append(
                {
                    "type": "success",
                    "title": f"{child.first_name} is on a streak!",
                    "message": f"{child.current_streak} days learning streak",
                    "childId": child.id,
                    "timestamp": datetime.utcnow().isoformat(),
                }
            )

    return {"notifications": notifications}
