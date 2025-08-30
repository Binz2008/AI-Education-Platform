from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.database import get_db_session
from app.models.assessment import AssessmentResult
from app.models.child import Child

router = APIRouter()


@router.get("/child/{child_id}/progress")
async def get_child_progress(child_id: str, session: Session = Depends(get_db_session)):
    """Get progress summary for a child."""
    child = session.get(Child, child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    # Get recent assessments
    recent_assessments = session.exec(
        select(AssessmentResult)
        .where(AssessmentResult.child_id == child_id)
        .order_by(AssessmentResult.created_at.desc())
        .limit(10)
    ).all()

    # Calculate basic stats
    total_sessions = len(recent_assessments)
    avg_score = sum(a.overall_score for a in recent_assessments) / max(total_sessions, 1)

    return {
        "childId": child_id,
        "totalSessions": total_sessions,
        "averageScore": round(avg_score, 1),
        "totalPoints": child.total_points,
        "currentStreak": child.current_streak,
        "lastActivity": child.last_activity,
        "recentAssessments": [
            {
                "id": assessment.id,
                "subject": assessment.subject,
                "overallScore": assessment.overall_score,
                "createdAt": assessment.created_at.isoformat(),
            }
            for assessment in recent_assessments[:5]
        ],
    }


@router.post("/child/{child_id}/assessment")
async def create_assessment(child_id: str, assessment_data: dict, session: Session = Depends(get_db_session)):
    """Create new assessment result for a child."""
    child = session.get(Child, child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    assessment = AssessmentResult(
        session_id=assessment_data["sessionId"],
        child_id=child_id,
        subject=assessment_data["subject"],
        overall_score=assessment_data.get("overallScore", 0),
        skill_scores=assessment_data.get("skillScores", "{}"),
        strengths=assessment_data.get("strengths", "[]"),
        areas_for_improvement=assessment_data.get("areasForImprovement", "[]"),
        recommendations=assessment_data.get("recommendations", "[]"),
    )

    session.add(assessment)
    session.commit()
    session.refresh(assessment)

    return {"assessmentId": assessment.id, "message": "Assessment created successfully"}


@router.get("/child/{child_id}/report")
async def generate_progress_report(child_id: str, days: int = 7, session: Session = Depends(get_db_session)):
    """Generate progress report for guardian."""
    child = session.get(Child, child_id)
    if not child:
        raise HTTPException(status_code=404, detail="Child not found")

    # Calculate report period
    end_date = datetime.now()
    start_date = end_date - timedelta(days=days)

    # Get assessments in period
    assessments = session.exec(
        select(AssessmentResult)
        .where(AssessmentResult.child_id == child_id)
        .where(AssessmentResult.created_at >= start_date)
        .where(AssessmentResult.created_at <= end_date)
    ).all()

    # Group by subject
    subject_stats = {}
    for assessment in assessments:
        subject = assessment.subject
        if subject not in subject_stats:
            subject_stats[subject] = {"sessionsCompleted": 0, "totalScore": 0, "averageScore": 0}

        subject_stats[subject]["sessionsCompleted"] += 1
        subject_stats[subject]["totalScore"] += assessment.overall_score

    # Calculate averages
    for subject, stats in subject_stats.items():
        if stats["sessionsCompleted"] > 0:
            stats["averageScore"] = round(stats["totalScore"] / stats["sessionsCompleted"], 1)

    return {
        "childId": child_id,
        "childName": child.first_name,
        "reportPeriod": {
            "startDate": start_date.date().isoformat(),
            "endDate": end_date.date().isoformat(),
            "days": days,
        },
        "totalSessions": len(assessments),
        "overallAverage": round(sum(a.overall_score for a in assessments) / max(len(assessments), 1), 1),
        "subjectBreakdown": subject_stats,
        "parentRecommendations": [
            "استمر في تشجيع طفلك على التعلم اليومي",
            "احتفل بالإنجازات الصغيرة",
            "خصص وقتاً للمراجعة معاً",
        ],
        "celebrateAchievements": [f"{child.first_name} أظهر تحسناً رائعاً في التعلم", "الالتزام بالوقت المحدد ممتاز"],
    }
