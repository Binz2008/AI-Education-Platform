from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.core.database import get_db_session
from app.models.lesson import Lesson

router = APIRouter()


@router.get("/", response_model=list[dict])
async def get_lessons(subject: str = None, age_group: str = None, session: Session = Depends(get_db_session)):
    """Get available lessons, optionally filtered by subject and age group."""
    query = select(Lesson).where(Lesson.is_published)

    if subject:
        query = query.where(Lesson.subject == subject)
    if age_group:
        query = query.where(Lesson.age_group == age_group)

    lessons = session.exec(query).all()

    return [
        {
            "id": lesson.id,
            "title": lesson.title,
            "description": lesson.description,
            "subject": lesson.subject,
            "ageGroup": lesson.age_group,
            "difficulty": lesson.difficulty,
            "estimatedDuration": lesson.estimated_duration,
            "objectives": lesson.objectives_list,
            "keywords": lesson.keywords_list,
        }
        for lesson in lessons
    ]


@router.get("/{lesson_id}")
async def get_lesson_details(lesson_id: str, session: Session = Depends(get_db_session)):
    """Get detailed lesson information including activities."""
    lesson = session.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    return {
        "id": lesson.id,
        "title": lesson.title,
        "description": lesson.description,
        "subject": lesson.subject,
        "ageGroup": lesson.age_group,
        "difficulty": lesson.difficulty,
        "estimatedDuration": lesson.estimated_duration,
        "objectives": lesson.objectives_list,
        "keywords": lesson.keywords_list,
        "activities": [
            {
                "id": activity.activity_id,
                "type": activity.type,
                "title": activity.title,
                "description": activity.description,
                "expectedDuration": activity.expected_duration,
                "points": activity.points,
                "required": activity.required_for_completion,
            }
            for activity in lesson.activities
        ],
    }


@router.post("/seed")
async def seed_sample_lessons(session: Session = Depends(get_db_session)):
    """Create sample lessons for testing."""
    # Sample Arabic lesson
    arabic_lesson = Lesson(
        title="تعلم الحروف الأساسية",
        description="درس تفاعلي لتعلم الحروف العربية الأساسية",
        subject="arabic",
        age_group="4-6",
        difficulty="beginner",
        estimated_duration=15,
        objectives='["تعلم 5 حروف أساسية", "النطق الصحيح", "التمييز البصري"]',
        keywords='["حروف", "ألف", "باء", "تاء", "ثاء", "جيم"]',
        is_published=True,
    )

    # Sample English lesson
    english_lesson = Lesson(
        title="Colors and Numbers",
        description="Learn basic colors and numbers 1-10",
        subject="english",
        age_group="4-6",
        difficulty="beginner",
        estimated_duration=20,
        objectives='["Learn 5 basic colors", "Count 1-10", "Simple pronunciation"]',
        keywords='["red", "blue", "green", "one", "two", "three"]',
        is_published=True,
    )

    # Sample Islamic lesson
    islamic_lesson = Lesson(
        title="الصدق والأمانة",
        description="تعلم قيمة الصدق والأمانة في الإسلام",
        subject="islamic",
        age_group="4-6",
        difficulty="beginner",
        estimated_duration=10,
        objectives='["فهم معنى الصدق", "أمثلة من السيرة", "التطبيق العملي"]',
        keywords='["صدق", "أمانة", "خلق", "قيم"]',
        is_published=True,
    )

    session.add_all([arabic_lesson, english_lesson, islamic_lesson])
    session.commit()

    return {"message": "Sample lessons created successfully", "count": 3}
