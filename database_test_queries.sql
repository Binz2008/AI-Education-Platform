-- AI Education Platform - Test Queries
-- Instructions: Select the query text you want to run, then execute it

-- 1. Check all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. View guardians table structure
\d guardians;

-- 3. View children table structure  
\d children;

-- 4. View sessions table structure
\d sessions;

-- 5. Insert sample guardian
INSERT INTO guardians (email, hashed_password, first_name, last_name, preferred_language)
VALUES ('test@example.com', 'hashed_password_here', 'أحمد', 'محمد', 'ar');

-- 6. Insert sample child
INSERT INTO children (guardian_id, first_name, birth_date, age_group, preferred_language)
VALUES (
    (SELECT id FROM guardians WHERE email = 'test@example.com'),
    'سارة', 
    '2018-05-15', 
    '4-6', 
    'ar'
);

-- 7. View all guardians
SELECT id, email, first_name, last_name, preferred_language, created_at
FROM guardians;

-- 8. View all children with guardian info
SELECT 
    c.id,
    c.first_name as child_name,
    c.age_group,
    c.preferred_language,
    g.first_name as guardian_name,
    g.email as guardian_email
FROM children c
JOIN guardians g ON c.guardian_id = g.id;

-- 9. Check database statistics
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    most_common_vals
FROM pg_stats 
WHERE schemaname = 'public';

-- 10. View table sizes
SELECT 
    schemaname,
    tablename,
    attname,
    avg_width,
    n_distinct
FROM pg_stats 
WHERE schemaname = 'public'
ORDER BY tablename;
