-- ============================================================
-- SQL Script to seed test data for "Next session" feature
-- Use in pgAdmin or any PostgreSQL client
-- ============================================================

-- 1️⃣  ENSURE TEST USER EXISTS
INSERT INTO users (name, email, password, created_at, updated_at)
VALUES ('Test User', 'test@example.com', '$2y$12$7X7h1G9qO1Q5N7R3K8M2LO9P8Q1R2S3T4U5V6W7X8Y9Z0A1B2C3', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Get the user_id (usually 1 if this is the only user)
-- SELECT id FROM users WHERE email = 'test@example.com';

-- 2️⃣  ENSURE TEST COUNSELOR EXISTS
-- If counselors table is empty, create a test counselor first:
INSERT INTO counselors (name, email, password, specialization, license_no, experience_years, status, created_at, updated_at)
VALUES (
    'Dr. Sarah Johnson',
    'sarah.counselor@example.com',
    '$2y$12$7X7h1G9qO1Q5N7R3K8M2LO9P8Q1R2S3T4U5V6W7X8Y9Z0A1B2C3',
    'Mental Health Counseling',
    'LIC001',
    5,
    'approved',
    NOW(),
    NOW()
)
ON CONFLICT (email) DO NOTHING;

-- Get the counselor_id (usually 1 if this is the only counselor)
-- SELECT id FROM counselors WHERE email = 'sarah.counselor@example.com';

-- 3️⃣  INSERT TEST APPOINTMENT FOR NEXT SESSION (future date)
-- This assumes:
--   user_id = 1 (Test User)
--   counselor_id = 1 (Dr. Sarah Johnson)
-- Adjust these IDs if different in your database

INSERT INTO appointments (user_id, counselor_id, date_time, type, status, created_at, updated_at)
VALUES (
    1,  -- user_id of "Test User"
    1,  -- counselor_id of "Dr. Sarah Johnson"
    NOW() + INTERVAL '5 days' + INTERVAL '14 hours',  -- 5 days from now at 14:00 (2 PM)
    'video',  -- type: 'chat' or 'video'
    'confirmed',  -- status: 'pending' or 'confirmed'
    NOW(),
    NOW()
);

-- 4️⃣  VERIFY THE INSERTED DATA
SELECT 
    a.id,
    a.user_id,
    u.name AS user_name,
    a.counselor_id,
    c.name AS counselor_name,
    c.specialization,
    a.date_time,
    a.type,
    a.status
FROM appointments a
JOIN users u ON a.user_id = u.id
JOIN counselors c ON a.counselor_id = c.id
WHERE a.user_id = 1
ORDER BY a.date_time DESC
LIMIT 5;

-- ============================================================
-- OPTIONAL: If you need to test with multiple appointments
-- ============================================================

-- Insert another appointment (7 days from now)
INSERT INTO appointments (user_id, counselor_id, date_time, type, status, created_at, updated_at)
VALUES (1, 1, NOW() + INTERVAL '7 days' + INTERVAL '10 hours', 'chat', 'pending', NOW(), NOW());

-- Insert a past appointment (completed)
INSERT INTO appointments (user_id, counselor_id, date_time, type, status, created_at, updated_at)
VALUES (1, 1, NOW() - INTERVAL '2 days', 'video', 'completed', NOW(), NOW());

-- ============================================================
-- TEST API ENDPOINT
-- ============================================================
-- After seeding, test the endpoint:
-- 
-- 1. Get the auth token for "test@example.com" via /api/login
-- 2. Call: GET /api/user/appointments/next
--    Headers: Authorization: Bearer <YOUR_TOKEN>
--
-- Expected Response:
-- {
--   "item": {
--     "id": 1,
--     "user_id": 1,
--     "counselor_id": 1,
--     "date_time": "2025-02-13T14:00:00.000000Z",
--     "type": "video",
--     "status": "confirmed",
--     "counselor": {
--       "id": 1,
--       "name": "Dr. Sarah Johnson",
--       "specialization": "Mental Health Counseling"
--     }
--   }
-- }
-- ============================================================
