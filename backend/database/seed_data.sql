-- AI Education Platform - Initial Seed Data
-- Insert sample data for development and testing

-- Insert AI Teaching Agents
INSERT INTO agents (id, name, description, subject, language, personality_traits, teaching_style, avatar_url, is_active) VALUES
('fasih', 'الأستاذ فصيح', 'معلم اللغة العربية الذكي المتخصص في تعليم الأطفال', 'arabic', 'ar', 
 '{"patient": true, "encouraging": true, "playful": true, "cultural_awareness": true}',
 '{"interactive": true, "story_based": true, "gamified": true, "adaptive": true}',
 '/avatars/fasih.png', true),

('sophia', 'Teacher Sophia', 'AI English teacher specialized in early childhood education', 'english', 'en',
 '{"patient": true, "encouraging": true, "creative": true, "supportive": true}',
 '{"interactive": true, "visual": true, "game_based": true, "progressive": true}',
 '/avatars/sophia.png', true),

('omar', 'الأستاذ عمر', 'معلم التربية الإسلامية للأطفال', 'islamic', 'ar',
 '{"wise": true, "gentle": true, "inspiring": true, "respectful": true}',
 '{"story_telling": true, "moral_guidance": true, "interactive": true, "age_appropriate": true}',
 '/avatars/omar.png', true);

-- Insert Sample Lessons for Arabic Language
INSERT INTO lessons (id, title, description, subject, age_group, difficulty_level, estimated_duration, learning_objectives, content, is_active) VALUES
(uuid_generate_v4(), 'الحروف الأبجدية - الجزء الأول', 'تعلم الحروف العربية من أ إلى ج', 'arabic', '4-6', 1, 20,
 '["تعرف على شكل الحروف", "نطق الحروف بشكل صحيح", "كتابة الحروف الأساسية"]',
 '{"activities": [{"type": "recognition", "content": "أ ب ت"}, {"type": "pronunciation", "audio": true}, {"type": "writing", "interactive": true}]}',
 true),

(uuid_generate_v4(), 'الحروف الأبجدية - الجزء الثاني', 'تعلم الحروف العربية من ث إلى ح', 'arabic', '4-6', 1, 20,
 '["تعرف على شكل الحروف الجديدة", "ربط الحروف بالكلمات", "تكوين كلمات بسيطة"]',
 '{"activities": [{"type": "recognition", "content": "ث ج ح"}, {"type": "word_formation", "words": ["ثوب", "جمل", "حصان"]}, {"type": "matching", "interactive": true}]}',
 true),

(uuid_generate_v4(), 'الكلمات البسيطة', 'تعلم قراءة وكتابة الكلمات البسيطة', 'arabic', '7-9', 2, 25,
 '["قراءة الكلمات المكونة من 3 حروف", "فهم معنى الكلمات", "استخدام الكلمات في جمل"]',
 '{"activities": [{"type": "reading", "words": ["بيت", "قلم", "كتاب"]}, {"type": "comprehension", "questions": true}, {"type": "sentence_building", "interactive": true}]}',
 true),

(uuid_generate_v4(), 'القصص القصيرة', 'قراءة وفهم القصص البسيطة', 'arabic', '7-9', 3, 30,
 '["قراءة القصة بطلاقة", "فهم أحداث القصة", "الإجابة على أسئلة حول القصة"]',
 '{"activities": [{"type": "story_reading", "story": "قصة الأرنب والسلحفاة"}, {"type": "comprehension", "questions": ["من هم أبطال القصة؟", "ما هي الدروس المستفادة؟"]}, {"type": "discussion", "interactive": true}]}',
 true);

-- Insert Sample Lessons for English Language
INSERT INTO lessons (id, title, description, subject, age_group, difficulty_level, estimated_duration, learning_objectives, content, is_active) VALUES
(uuid_generate_v4(), 'ABC Letters - Part 1', 'Learning English alphabet A to F', 'english', '4-6', 1, 20,
 '["Recognize letter shapes", "Pronounce letters correctly", "Write basic letters"]',
 '{"activities": [{"type": "recognition", "content": "A B C D E F"}, {"type": "pronunciation", "audio": true}, {"type": "writing", "interactive": true}]}',
 true),

(uuid_generate_v4(), 'Simple Words', 'Learning to read simple English words', 'english', '7-9', 2, 25,
 '["Read 3-letter words", "Understand word meanings", "Use words in sentences"]',
 '{"activities": [{"type": "reading", "words": ["cat", "dog", "sun"]}, {"type": "comprehension", "questions": true}, {"type": "sentence_building", "interactive": true}]}',
 true),

(uuid_generate_v4(), 'Colors and Numbers', 'Learning colors and numbers in English', 'english', '4-6', 1, 15,
 '["Identify basic colors", "Count from 1 to 10", "Use colors and numbers in sentences"]',
 '{"activities": [{"type": "identification", "content": ["red", "blue", "green", "yellow"]}, {"type": "counting", "range": "1-10"}, {"type": "practice", "interactive": true}]}',
 true);

-- Insert Sample Lessons for Islamic Education
INSERT INTO lessons (id, title, description, subject, age_group, difficulty_level, estimated_duration, learning_objectives, content, is_active) VALUES
(uuid_generate_v4(), 'أركان الإسلام', 'تعلم أركان الإسلام الخمسة', 'islamic', '7-9', 2, 25,
 '["معرفة أركان الإسلام الخمسة", "فهم أهمية كل ركن", "حفظ أركان الإسلام"]',
 '{"activities": [{"type": "learning", "content": "الشهادتان، الصلاة، الزكاة، الصوم، الحج"}, {"type": "explanation", "detailed": true}, {"type": "memorization", "interactive": true}]}',
 true),

(uuid_generate_v4(), 'آداب الطعام', 'تعلم آداب الطعام في الإسلام', 'islamic', '4-6', 1, 15,
 '["معرفة آداب الطعام", "تطبيق الآداب في الحياة اليومية", "فهم الحكمة من الآداب"]',
 '{"activities": [{"type": "learning", "content": "البسملة، الأكل باليمين، الحمد بعد الطعام"}, {"type": "practice", "scenarios": true}, {"type": "discussion", "interactive": true}]}',
 true),

(uuid_generate_v4(), 'قصص الأنبياء - نوح عليه السلام', 'قصة سيدنا نوح والطوفان', 'islamic', '7-9', 2, 30,
 '["معرفة قصة نوح عليه السلام", "فهم الدروس المستفادة", "تطبيق القيم في الحياة"]',
 '{"activities": [{"type": "story_telling", "story": "نوح والسفينة"}, {"type": "comprehension", "questions": ["لماذا أرسل الله الطوفان؟", "ما هي الدروس المستفادة؟"]}, {"type": "values", "discussion": true}]}',
 true);

-- Insert Demo Guardian Account
INSERT INTO guardians (id, email, hashed_password, first_name, last_name, preferred_language, is_email_verified, is_active) VALUES
(uuid_generate_v4(), 'demo@ai-education.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBdXzgVxGm4rKS', 'أحمد', 'محمد', 'ar', true, true);

-- Get the demo guardian ID for child insertion
DO $$
DECLARE
    demo_guardian_id UUID;
    demo_child_id UUID;
    demo_lesson_id UUID;
    demo_session_id UUID;
BEGIN
    -- Get demo guardian ID
    SELECT id INTO demo_guardian_id FROM guardians WHERE email = 'demo@ai-education.com';
    
    -- Insert demo child
    INSERT INTO children (id, guardian_id, first_name, birth_date, age_group, preferred_language, total_points, current_streak, longest_streak)
    VALUES (uuid_generate_v4(), demo_guardian_id, 'سارة', '2018-05-15', '4-6', 'ar', 150, 5, 12)
    RETURNING id INTO demo_child_id;
    
    -- Insert another demo child
    INSERT INTO children (id, guardian_id, first_name, birth_date, age_group, preferred_language, total_points, current_streak, longest_streak, enabled_subjects)
    VALUES (uuid_generate_v4(), demo_guardian_id, 'محمد', '2015-08-20', '7-9', 'ar', 280, 8, 15, '["arabic", "english", "islamic"]');
    
    -- Get a lesson ID for demo session
    SELECT id INTO demo_lesson_id FROM lessons WHERE subject = 'arabic' LIMIT 1;
    
    -- Insert demo session
    INSERT INTO sessions (id, child_id, lesson_id, subject, agent_id, status, score, time_spent, engagement_level, points_earned)
    VALUES (uuid_generate_v4(), demo_child_id, demo_lesson_id, 'arabic', 'fasih', 'completed', 85, 25, 'high', 20)
    RETURNING id INTO demo_session_id;
    
    -- Insert demo chat messages
    INSERT INTO chat_messages (session_id, role, content, content_type) VALUES
    (demo_session_id, 'agent', 'مرحباً سارة! أنا الأستاذ فصيح. هل أنت مستعدة لتعلم الحروف اليوم؟', 'text'),
    (demo_session_id, 'child', 'نعم، أنا مستعدة!', 'text'),
    (demo_session_id, 'agent', 'رائع! دعينا نبدأ بحرف الألف. هل تستطيعين رسم حرف الألف؟', 'text'),
    (demo_session_id, 'child', 'نعم، أستطيع!', 'text'),
    (demo_session_id, 'agent', 'ممتاز! أحسنت يا سارة. الآن دعينا نتعلم كلمة تبدأ بحرف الألف مثل "أسد"', 'text');
    
    -- Insert demo assessment
    INSERT INTO assessments (session_id, child_id, lesson_id, questions, answers, score, max_score, time_taken, strengths, recommendations)
    VALUES (demo_session_id, demo_child_id, demo_lesson_id,
           '{"questions": ["ما هو الحرف الأول في كلمة أسد؟", "اكتب حرف الألف", "اختر الكلمة التي تبدأ بحرف الألف"]}',
           '{"answers": ["أ", "أ", "أسد"]}',
           85, 100, 120,
           '["تعرف على الحروف بسرعة", "خط جميل", "نطق واضح"]',
           '["المزيد من التدريب على الكتابة", "تعلم كلمات جديدة"]');
END $$;

-- Insert sample progress report
DO $$
DECLARE
    demo_guardian_id UUID;
    demo_child_id UUID;
BEGIN
    SELECT id INTO demo_guardian_id FROM guardians WHERE email = 'demo@ai-education.com';
    SELECT id INTO demo_child_id FROM children WHERE guardian_id = demo_guardian_id AND first_name = 'سارة';
    
    INSERT INTO progress_reports (child_id, guardian_id, report_period, start_date, end_date, summary, achievements, recommendations, total_sessions, total_time_minutes, average_score)
    VALUES (demo_child_id, demo_guardian_id, 'weekly', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE,
           'سارة تظهر تقدماً ممتازاً في تعلم الحروف العربية. لديها حماس كبير للتعلم وتتفاعل بشكل إيجابي مع الدروس.',
           '["تعلمت 5 حروف جديدة", "حسنت من خطها", "زادت مفرداتها بـ 10 كلمات جديدة"]',
           '["المزيد من التدريب على الكتابة", "تعلم كلمات أكثر تعقيداً", "البدء في تكوين جمل بسيطة"]',
           12, 240, 82.5);
END $$;
