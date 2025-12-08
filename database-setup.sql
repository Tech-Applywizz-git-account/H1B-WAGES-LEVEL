-- =========================================
-- SQL SCRIPTS FOR ALL JOBS FEATURE
-- =========================================
-- Run these scripts in your Supabase SQL Editor
-- to set up the database for the All Jobs feature
-- =========================================

-- =========================================
-- 1. CREATE TABLE (if not already created)
-- =========================================
-- Note: Skip this if you've already created the table

CREATE TABLE IF NOT EXISTS public.job_jobrole_all (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  job_id bigint NOT NULL,
  job_role_name text NULL,
  job_role_id bigint NULL,
  source character varying(255) NOT NULL,
  title text NOT NULL,
  company text NOT NULL,
  location text NOT NULL,
  url text NOT NULL,
  description text NOT NULL,
  raw_text text NOT NULL,
  date_posted timestamp with time zone NOT NULL,
  hours_back_posted integer NOT NULL,
  years_exp_required text NULL,
  upload_date timestamp with time zone NOT NULL,
  ingested_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  country text NULL DEFAULT 'United States of America'::text,
  CONSTRAINT job_jobrole_all_pkey PRIMARY KEY (id),
  CONSTRAINT unique_job_id UNIQUE (job_id)
) TABLESPACE pg_default;

-- =========================================
-- 2. CREATE INDEXES (if not already created)
-- =========================================
-- These indexes improve query performance

CREATE INDEX IF NOT EXISTS idx_job_jobrole_all_upload_date 
ON public.job_jobrole_all USING btree (upload_date DESC) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_job_jobrole_all_job_role_name 
ON public.job_jobrole_all USING btree (job_role_name) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_job_jobrole_all_company 
ON public.job_jobrole_all USING btree (company) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_job_jobrole_all_location 
ON public.job_jobrole_all USING btree (location) TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_job_jobrole_all_date_posted 
ON public.job_jobrole_all USING btree (date_posted DESC) TABLESPACE pg_default;

-- =========================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =========================================
-- This ensures data security while allowing proper access

-- Enable RLS on the table
ALTER TABLE public.job_jobrole_all ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 4. CREATE RLS POLICIES
-- =========================================

-- Policy 1: Allow authenticated users to read all jobs
-- This allows logged-in users to view all jobs
DROP POLICY IF EXISTS "Allow authenticated users to read jobs" ON public.job_jobrole_all;
CREATE POLICY "Allow authenticated users to read jobs"
ON public.job_jobrole_all
FOR SELECT
TO authenticated
USING (true);

-- Policy 2 (Optional): Allow public access to jobs
-- Uncomment this if you want to allow unauthenticated users to view jobs
-- DROP POLICY IF EXISTS "Allow public to read jobs" ON public.job_jobrole_all;
-- CREATE POLICY "Allow public to read jobs"
-- ON public.job_jobrole_all
-- FOR SELECT
-- TO anon
-- USING (true);

-- Policy 3: Allow admins to insert jobs
-- This is useful if you want admins to add jobs through the UI
DROP POLICY IF EXISTS "Allow admins to insert jobs" ON public.job_jobrole_all;
CREATE POLICY "Allow admins to insert jobs"
ON public.job_jobrole_all
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 4: Allow admins to update jobs
DROP POLICY IF EXISTS "Allow admins to update jobs" ON public.job_jobrole_all;
CREATE POLICY "Allow admins to update jobs"
ON public.job_jobrole_all
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Policy 5: Allow admins to delete jobs
DROP POLICY IF EXISTS "Allow admins to delete jobs" ON public.job_jobrole_all;
CREATE POLICY "Allow admins to delete jobs"
ON public.job_jobrole_all
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- =========================================
-- 5. ENABLE REAL-TIME REPLICATION
-- =========================================
-- This enables real-time updates when new jobs are inserted

-- Enable real-time for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.job_jobrole_all;

-- =========================================
-- 6. INSERT SAMPLE DATA (Optional - for testing)
-- =========================================
-- Uncomment and run this to add sample jobs for testing

/*
INSERT INTO public.job_jobrole_all (
  job_id,
  job_role_name,
  job_role_id,
  source,
  title,
  company,
  location,
  url,
  description,
  raw_text,
  date_posted,
  hours_back_posted,
  years_exp_required,
  upload_date,
  ingested_at,
  country
) VALUES
(
  100001,
  'Software Engineering',
  1,
  'LinkedIn',
  'Senior React Developer',
  'Tech Corp Inc.',
  'San Francisco, CA',
  'https://example.com/job/1',
  'We are looking for an experienced React developer to join our team. You will be responsible for building user-facing features using React, Redux, and modern JavaScript.',
  'Senior React Developer at Tech Corp Inc. - San Francisco, CA...',
  NOW() - INTERVAL '2 days',
  48,
  '5+ years',
  NOW(),
  NOW(),
  'United States of America'
),
(
  100002,
  'Data Science',
  2,
  'Indeed',
  'Data Scientist',
  'Analytics Solutions LLC',
  'New York, NY',
  'https://example.com/job/2',
  'Join our data science team to build predictive models and drive business insights. Experience with Python, SQL, and machine learning required.',
  'Data Scientist at Analytics Solutions LLC - New York, NY...',
  NOW() - INTERVAL '1 day',
  24,
  '3+ years',
  NOW(),
  NOW(),
  'United States of America'
),
(
  100003,
  'Product Management',
  3,
  'Glassdoor',
  'Product Manager',
  'Innovative Products Co.',
  'Austin, TX',
  'https://example.com/job/3',
  'We are seeking a talented Product Manager to lead our product strategy and roadmap. You will work closely with engineering, design, and business teams.',
  'Product Manager at Innovative Products Co. - Austin, TX...',
  NOW() - INTERVAL '5 days',
  120,
  '4+ years',
  NOW(),
  NOW(),
  'United States of America'
),
(
  100004,
  'DevOps',
  4,
  'LinkedIn',
  'DevOps Engineer',
  'Cloud Systems Inc.',
  'Seattle, WA',
  'https://example.com/job/4',
  'Looking for a DevOps engineer to manage our cloud infrastructure. Experience with AWS, Docker, Kubernetes, and CI/CD pipelines required.',
  'DevOps Engineer at Cloud Systems Inc. - Seattle, WA...',
  NOW() - INTERVAL '3 days',
  72,
  '3+ years',
  NOW(),
  NOW(),
  'United States of America'
),
(
  100005,
  'UX/UI Design',
  5,
  'Indeed',
  'Senior UX Designer',
  'Design Studio LLC',
  'Los Angeles, CA',
  'https://example.com/job/5',
  'We are looking for a creative UX designer to craft beautiful user experiences. You will conduct user research, create wireframes, and design interfaces.',
  'Senior UX Designer at Design Studio LLC - Los Angeles, CA...',
  NOW() - INTERVAL '1 day',
  24,
  '5+ years',
  NOW(),
  NOW(),
  'United States of America'
);
*/

-- =========================================
-- 7. VERIFY SETUP
-- =========================================
-- Run these queries to verify everything is set up correctly

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'job_jobrole_all'
) AS table_exists;

-- Check if indexes exist
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'job_jobrole_all'
AND schemaname = 'public';

-- Check if RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'job_jobrole_all'
AND schemaname = 'public';

-- Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'job_jobrole_all'
AND schemaname = 'public';

-- Count total jobs in the table
SELECT COUNT(*) AS total_jobs FROM public.job_jobrole_all;

-- Show latest 5 jobs
SELECT 
  id,
  title,
  company,
  location,
  date_posted,
  upload_date
FROM public.job_jobrole_all
ORDER BY upload_date DESC
LIMIT 5;

-- =========================================
-- NOTES
-- =========================================
-- 1. Make sure to run scripts 1-5 in order
-- 2. Script 6 is optional and only for testing
-- 3. Script 7 helps verify the setup
-- 4. If you encounter permission errors, make sure you have the necessary privileges
-- =========================================
