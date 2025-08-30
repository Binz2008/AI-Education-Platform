"""Initial database setup migration
Creates all tables and basic structure for AI Education Platform.
"""

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Create initial database schema."""
    # Enable UUID extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Create guardians table
    op.create_table(
        "guardians",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("last_name", sa.String(100), nullable=False),
        sa.Column("preferred_language", sa.String(10), server_default="ar"),
        sa.Column("timezone", sa.String(50), server_default="Asia/Dubai"),
        sa.Column("is_email_verified", sa.Boolean(), server_default="false"),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True)),
        sa.Column("last_login", sa.TIMESTAMP(timezone=True)),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )

    # Create children table
    op.create_table(
        "children",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), nullable=False),
        sa.Column("guardian_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("first_name", sa.String(100), nullable=False),
        sa.Column("birth_date", sa.Date(), nullable=False),
        sa.Column("age_group", sa.String(10), nullable=False),
        sa.Column("preferred_language", sa.String(10), server_default="ar"),
        sa.Column("avatar", sa.String(255)),
        sa.Column("daily_time_limit", sa.Integer(), server_default="30"),
        sa.Column("enabled_subjects", postgresql.JSONB(), server_default='["arabic"]'),
        sa.Column("voice_enabled", sa.Boolean(), server_default="true"),
        sa.Column("chat_enabled", sa.Boolean(), server_default="true"),
        sa.Column("voice_recording_allowed", sa.Boolean(), server_default="false"),
        sa.Column("data_retention_days", sa.Integer(), server_default="30"),
        sa.Column("total_points", sa.Integer(), server_default="0"),
        sa.Column("current_streak", sa.Integer(), server_default="0"),
        sa.Column("longest_streak", sa.Integer(), server_default="0"),
        sa.Column("last_activity", sa.TIMESTAMP(timezone=True)),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True)),
        sa.CheckConstraint("age_group IN ('4-6', '7-9', '10-12')", name="check_age_group"),
        sa.CheckConstraint("daily_time_limit >= 15 AND daily_time_limit <= 120", name="check_time_limit"),
        sa.ForeignKeyConstraint(["guardian_id"], ["guardians.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create lessons table
    op.create_table(
        "lessons",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), nullable=False),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("subject", sa.String(50), nullable=False),
        sa.Column("age_group", sa.String(10), nullable=False),
        sa.Column("difficulty_level", sa.Integer(), server_default="1"),
        sa.Column("estimated_duration", sa.Integer(), server_default="15"),
        sa.Column("learning_objectives", postgresql.JSONB()),
        sa.Column("content", postgresql.JSONB()),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True)),
        sa.CheckConstraint("difficulty_level >= 1 AND difficulty_level <= 5", name="check_difficulty"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create sessions table
    op.create_table(
        "sessions",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), nullable=False),
        sa.Column("child_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("subject", sa.String(50), nullable=False),
        sa.Column("agent_id", sa.String(100), nullable=False),
        sa.Column("status", sa.String(20), server_default="active"),
        sa.Column("start_time", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("end_time", sa.TIMESTAMP(timezone=True)),
        sa.Column("activities_completed", postgresql.JSONB(), server_default="[]"),
        sa.Column("current_activity", sa.String(255)),
        sa.Column("score", sa.Integer(), server_default="0"),
        sa.Column("time_spent", sa.Integer(), server_default="0"),
        sa.Column("engagement_level", sa.String(10)),
        sa.Column("hints_used", sa.Integer(), server_default="0"),
        sa.Column("final_score", sa.Integer()),
        sa.Column("points_earned", sa.Integer(), server_default="0"),
        sa.Column("badges_earned", postgresql.JSONB(), server_default="[]"),
        sa.Column("device_info", postgresql.JSONB(), server_default="{}"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True)),
        sa.CheckConstraint("status IN ('active', 'paused', 'completed', 'abandoned')", name="check_status"),
        sa.CheckConstraint(
            "engagement_level IN ('low', 'medium', 'high') OR engagement_level IS NULL", name="check_engagement"
        ),
        sa.ForeignKeyConstraint(["child_id"], ["children.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create chat_messages table
    op.create_table(
        "chat_messages",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), nullable=False),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("role", sa.String(10), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("content_type", sa.String(10), server_default="text"),
        sa.Column("audio_url", sa.String(255)),
        sa.Column("timestamp", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.Column("message_metadata", postgresql.JSONB(), server_default="{}"),
        sa.Column("is_flagged", sa.Boolean(), server_default="false"),
        sa.Column("flagged_reason", sa.String(255)),
        sa.CheckConstraint("role IN ('child', 'agent')", name="check_role"),
        sa.CheckConstraint("content_type IN ('text', 'audio')", name="check_content_type"),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create assessments table
    op.create_table(
        "assessments",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), nullable=False),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("child_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("lesson_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("questions", postgresql.JSONB(), nullable=False),
        sa.Column("answers", postgresql.JSONB(), nullable=False),
        sa.Column("score", sa.Integer(), nullable=False),
        sa.Column("max_score", sa.Integer(), nullable=False),
        sa.Column("time_taken", sa.Integer()),
        sa.Column("strengths", postgresql.JSONB()),
        sa.Column("weaknesses", postgresql.JSONB()),
        sa.Column("recommendations", postgresql.JSONB()),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["session_id"], ["sessions.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["child_id"], ["children.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create progress_reports table
    op.create_table(
        "progress_reports",
        sa.Column("id", postgresql.UUID(as_uuid=True), server_default=sa.text("uuid_generate_v4()"), nullable=False),
        sa.Column("child_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("guardian_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("report_period", sa.String(20), nullable=False),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("summary", sa.Text()),
        sa.Column("achievements", postgresql.JSONB()),
        sa.Column("recommendations", postgresql.JSONB()),
        sa.Column("detailed_progress", postgresql.JSONB()),
        sa.Column("total_sessions", sa.Integer(), server_default="0"),
        sa.Column("total_time_minutes", sa.Integer(), server_default="0"),
        sa.Column("average_score", sa.Numeric(5, 2)),
        sa.Column("subjects_covered", postgresql.JSONB()),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.ForeignKeyConstraint(["child_id"], ["children.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["guardian_id"], ["guardians.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create agents table
    op.create_table(
        "agents",
        sa.Column("id", sa.String(100), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text()),
        sa.Column("subject", sa.String(50), nullable=False),
        sa.Column("language", sa.String(10), nullable=False),
        sa.Column("personality_traits", postgresql.JSONB()),
        sa.Column("teaching_style", postgresql.JSONB()),
        sa.Column("avatar_url", sa.String(255)),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP")),
        sa.PrimaryKeyConstraint("id"),
    )

    # Create indexes
    op.create_index("idx_children_guardian_id", "children", ["guardian_id"])
    op.create_index("idx_sessions_child_id", "sessions", ["child_id"])
    op.create_index("idx_sessions_lesson_id", "sessions", ["lesson_id"])
    op.create_index("idx_sessions_status", "sessions", ["status"])
    op.create_index("idx_sessions_created_at", "sessions", ["created_at"])
    op.create_index("idx_chat_messages_session_id", "chat_messages", ["session_id"])
    op.create_index("idx_chat_messages_timestamp", "chat_messages", ["timestamp"])
    op.create_index("idx_assessments_child_id", "assessments", ["child_id"])
    op.create_index("idx_assessments_session_id", "assessments", ["session_id"])
    op.create_index("idx_progress_reports_child_id", "progress_reports", ["child_id"])
    op.create_index("idx_lessons_subject", "lessons", ["subject"])
    op.create_index("idx_lessons_age_group", "lessons", ["age_group"])

    # Create update triggers
    op.execute("""
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    """)

    op.execute(
        "CREATE TRIGGER update_guardians_updated_at BEFORE UPDATE ON guardians FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"
    )
    op.execute(
        "CREATE TRIGGER update_children_updated_at BEFORE UPDATE ON children FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"
    )
    op.execute(
        "CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"
    )
    op.execute(
        "CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"
    )


def downgrade():
    """Drop all tables and extensions."""
    # Drop triggers first
    op.execute("DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;")
    op.execute("DROP TRIGGER IF EXISTS update_lessons_updated_at ON lessons;")
    op.execute("DROP TRIGGER IF EXISTS update_children_updated_at ON children;")
    op.execute("DROP TRIGGER IF EXISTS update_guardians_updated_at ON guardians;")
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column();")

    # Drop indexes
    op.drop_index("idx_lessons_age_group")
    op.drop_index("idx_lessons_subject")
    op.drop_index("idx_progress_reports_child_id")
    op.drop_index("idx_assessments_session_id")
    op.drop_index("idx_assessments_child_id")
    op.drop_index("idx_chat_messages_timestamp")
    op.drop_index("idx_chat_messages_session_id")
    op.drop_index("idx_sessions_created_at")
    op.drop_index("idx_sessions_status")
    op.drop_index("idx_sessions_lesson_id")
    op.drop_index("idx_sessions_child_id")
    op.drop_index("idx_children_guardian_id")

    # Drop tables in reverse order
    op.drop_table("agents")
    op.drop_table("progress_reports")
    op.drop_table("assessments")
    op.drop_table("chat_messages")
    op.drop_table("sessions")
    op.drop_table("lessons")
    op.drop_table("children")
    op.drop_table("guardians")

    # Drop extension
    op.execute('DROP EXTENSION IF EXISTS "uuid-ossp";')
