-- Enhanced Database Indexes for AI Education Platform
-- Additional optimized indexes for better query performance

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_sessions_child_status_date ON sessions(child_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_lesson_status ON sessions(lesson_id, status);
CREATE INDEX IF NOT EXISTS idx_children_guardian_active ON children(guardian_id, last_activity);

-- Indexes for dashboard queries
CREATE INDEX IF NOT EXISTS idx_children_points_streak ON children(total_points DESC, current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_score_time ON sessions(final_score DESC, time_spent);
CREATE INDEX IF NOT EXISTS idx_progress_reports_period_date ON progress_reports(child_id, report_period, end_date DESC);

-- Indexes for chat and messaging
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_role ON chat_messages(session_id, role, timestamp);
CREATE INDEX IF NOT EXISTS idx_chat_messages_flagged ON chat_messages(is_flagged, timestamp) WHERE is_flagged = true;

-- Indexes for assessment queries
CREATE INDEX IF NOT EXISTS idx_assessments_child_score ON assessments(child_id, score DESC, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assessments_lesson_avg_score ON assessments(lesson_id, score);

-- Indexes for authentication and security
CREATE INDEX IF NOT EXISTS idx_guardians_email_active ON guardians(email, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_guardians_last_login ON guardians(last_login DESC) WHERE last_login IS NOT NULL;

-- Indexes for content filtering
CREATE INDEX IF NOT EXISTS idx_lessons_subject_age_difficulty ON lessons(subject, age_group, difficulty_level) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_agents_subject_language ON agents(subject, language) WHERE is_active = true;

-- Indexes for time-based queries (monitoring and analytics)
CREATE INDEX IF NOT EXISTS idx_sessions_start_time_hour ON sessions(date_trunc('hour', start_time));
CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp_hour ON chat_messages(date_trunc('hour', timestamp));

-- Partial indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_sessions_active ON sessions(child_id, start_time) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_children_recent_activity ON children(guardian_id, last_activity) WHERE last_activity > CURRENT_DATE - INTERVAL '30 days';

-- JSONB indexes for better JSON query performance
CREATE INDEX IF NOT EXISTS idx_children_enabled_subjects_gin ON children USING GIN (enabled_subjects);
CREATE INDEX IF NOT EXISTS idx_lessons_content_gin ON lessons USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_sessions_activities_gin ON sessions USING GIN (activities_completed);
CREATE INDEX IF NOT EXISTS idx_assessments_answers_gin ON assessments USING GIN (answers);

-- Text search indexes
CREATE INDEX IF NOT EXISTS idx_lessons_title_text ON lessons USING GIN (to_tsvector('arabic', title));
CREATE INDEX IF NOT EXISTS idx_lessons_description_text ON lessons USING GIN (to_tsvector('arabic', description));

-- Indexes for data retention and cleanup
CREATE INDEX IF NOT EXISTS idx_chat_messages_cleanup ON chat_messages(timestamp) WHERE timestamp < CURRENT_DATE - INTERVAL '30 days';
CREATE INDEX IF NOT EXISTS idx_sessions_old ON sessions(created_at) WHERE created_at < CURRENT_DATE - INTERVAL '90 days';

-- Performance monitoring indexes
CREATE INDEX IF NOT EXISTS idx_sessions_duration_analysis ON sessions(time_spent, engagement_level) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_children_engagement_tracking ON children(current_streak, total_points, last_activity);

-- Unique constraints for data integrity
CREATE UNIQUE INDEX IF NOT EXISTS idx_progress_reports_unique ON progress_reports(child_id, report_period, start_date, end_date);

-- Covering indexes for frequently accessed columns
CREATE INDEX IF NOT EXISTS idx_sessions_dashboard_cover ON sessions(child_id, status, created_at) 
    INCLUDE (lesson_id, final_score, time_spent, points_earned);

CREATE INDEX IF NOT EXISTS idx_children_summary_cover ON children(guardian_id, last_activity) 
    INCLUDE (first_name, total_points, current_streak, age_group);

-- Statistics update for query planner optimization
ANALYZE guardians;
ANALYZE children;
ANALYZE sessions;
ANALYZE chat_messages;
ANALYZE assessments;
ANALYZE progress_reports;
ANALYZE lessons;
ANALYZE agents;
