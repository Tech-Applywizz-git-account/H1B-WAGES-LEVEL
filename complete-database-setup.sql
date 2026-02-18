-- =========================================
-- COMPLETE DATABASE SETUP FOR H1B Wage Level
-- =========================================
-- Run this entire script in your Supabase SQL Editor
-- This will create all necessary tables, indexes, and security policies
-- =========================================

-- =========================================
-- PART 1: CREATE JOB_JOBROLE_ALL TABLE
-- =========================================
-- This table stores all job listings

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

-- Add comments
COMMENT ON TABLE public.job_jobrole_all IS 'Stores all job listings aggregated from various sources';

-- =========================================
-- PART 2: CREATE INDEXES FOR JOB_JOBROLE_ALL
-- =========================================

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
-- PART 3: ENABLE RLS ON JOB_JOBROLE_ALL
-- =========================================

ALTER TABLE public.job_jobrole_all ENABLE ROW LEVEL SECURITY;

-- =========================================
-- PART 4: CREATE RLS POLICIES FOR JOB_JOBROLE_ALL
-- =========================================

-- Policy: Allow authenticated users to read all jobs
DROP POLICY IF EXISTS "Allow authenticated users to read jobs" ON public.job_jobrole_all;
CREATE POLICY "Allow authenticated users to read jobs"
ON public.job_jobrole_all
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow public access to jobs (OPTIONAL - uncomment if needed)
-- DROP POLICY IF EXISTS "Allow public to read jobs" ON public.job_jobrole_all;
-- CREATE POLICY "Allow public to read jobs"
-- ON public.job_jobrole_all
-- FOR SELECT
-- TO anon
-- USING (true);

-- Policy: Allow admins to insert jobs
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

-- Policy: Allow admins to update jobs
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

-- Policy: Allow admins to delete jobs
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
-- PART 5: ENABLE REAL-TIME FOR JOB_JOBROLE_ALL
-- =========================================

ALTER PUBLICATION supabase_realtime ADD TABLE public.job_jobrole_all;

-- =========================================
-- PART 6: CREATE SAVED_JOBS TABLE
-- =========================================
-- This table stores jobs saved by users

CREATE TABLE IF NOT EXISTS public.saved_jobs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id bigint NOT NULL,
  job_data jsonb NOT NULL,
  saved_at timestamp with time zone DEFAULT now(),
  notes text NULL,
  CONSTRAINT saved_jobs_pkey PRIMARY KEY (id),
  CONSTRAINT unique_user_job UNIQUE (user_id, job_id)
);

-- Add comments
COMMENT ON TABLE public.saved_jobs IS 'Stores jobs saved by users for later reference';
COMMENT ON COLUMN public.saved_jobs.user_id IS 'Reference to the user who saved the job';
COMMENT ON COLUMN public.saved_jobs.job_id IS 'Reference to the job_id from job_jobrole_all table';
COMMENT ON COLUMN public.saved_jobs.job_data IS 'Snapshot of job data at the time of saving';
COMMENT ON COLUMN public.saved_jobs.notes IS 'Optional user notes about the saved job';

-- =========================================
-- PART 7: CREATE INDEXES FOR SAVED_JOBS
-- =========================================

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id 
ON public.saved_jobs USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id 
ON public.saved_jobs USING btree (job_id);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_saved_at 
ON public.saved_jobs USING btree (saved_at DESC);

-- =========================================
-- PART 8: ENABLE RLS ON SAVED_JOBS
-- =========================================

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- =========================================
-- PART 9: CREATE RLS POLICIES FOR SAVED_JOBS
-- =========================================

-- Policy: Users can view their own saved jobs
DROP POLICY IF EXISTS "Users can view their own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can view their own saved jobs"
ON public.saved_jobs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can save jobs (insert)
DROP POLICY IF EXISTS "Users can save jobs" ON public.saved_jobs;
CREATE POLICY "Users can save jobs"
ON public.saved_jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can unsave their own jobs (delete)
DROP POLICY IF EXISTS "Users can unsave their own jobs" ON public.saved_jobs;
CREATE POLICY "Users can unsave their own jobs"
ON public.saved_jobs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can update their saved job notes
DROP POLICY IF EXISTS "Users can update their saved job notes" ON public.saved_jobs;
CREATE POLICY "Users can update their saved job notes"
ON public.saved_jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =========================================
-- PART 10: ENABLE REAL-TIME FOR SAVED_JOBS (OPTIONAL)
-- =========================================
-- Uncomment if you want real-time updates for saved jobs

-- ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_jobs;

-- =========================================
-- PART 11: INSERT SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =========================================
-- Uncomment to add sample jobs for testing

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
  'Google LLC',
  'San Francisco, CA',
  'https://example.com/job/1',
  'We are looking for an experienced React developer to join our team. You will be responsible for building user-facing features using React, Redux, and modern JavaScript. Must have strong experience with component-based architecture and state management.',
  'Senior React Developer at Google LLC - San Francisco, CA. Full-time position...',
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
  'Microsoft',
  'Seattle, WA',
  'https://example.com/job/2',
  'Join our data science team to build predictive models and drive business insights. Experience with Python, SQL, and machine learning required. You will work with large datasets and present findings to stakeholders.',
  'Data Scientist at Microsoft - Seattle, WA. Full-time position...',
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
  'Amazon',
  'Austin, TX',
  'https://example.com/job/3',
  'We are seeking a talented Product Manager to lead our product strategy and roadmap. You will work closely with engineering, design, and business teams to deliver innovative solutions.',
  'Product Manager at Amazon - Austin, TX. Full-time position...',
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
  'Meta',
  'Menlo Park, CA',
  'https://example.com/job/4',
  'Looking for a DevOps engineer to manage our cloud infrastructure. Experience with AWS, Docker, Kubernetes, and CI/CD pipelines required. You will ensure high availability and scalability of our systems.',
  'DevOps Engineer at Meta - Menlo Park, CA. Full-time position...',
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
  'Apple',
  'Cupertino, CA',
  'https://example.com/job/5',
  'We are looking for a creative UX designer to craft beautiful user experiences. You will conduct user research, create wireframes, and design interfaces for our next-generation products.',
  'Senior UX Designer at Apple - Cupertino, CA. Full-time position...',
  NOW() - INTERVAL '1 day',
  24,
  '5+ years',
  NOW(),
  NOW(),
  'United States of America'
),
(
  100006,
  'Software Engineering',
  1,
  'Glassdoor',
  'Full Stack Developer',
  'Netflix',
  'Los Gatos, CA',
  'https://example.com/job/6',
  'Join our team as a Full Stack Developer. Work with React, Node.js, and modern web technologies to build streaming experiences for millions of users worldwide.',
  'Full Stack Developer at Netflix - Los Gatos, CA. Full-time position...',
  NOW() - INTERVAL '4 days',
  96,
  '4+ years',
  NOW(),
  NOW(),
  'United States of America'
);
*/

-- =========================================
-- PART 12: VERIFICATION QUERIES
-- =========================================
-- Run these to verify everything is set up correctly

-- Check if job_jobrole_all table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'job_jobrole_all'
) AS job_table_exists;

-- Check if saved_jobs table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'saved_jobs'
) AS saved_jobs_table_exists;

-- Check indexes on job_jobrole_all
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'job_jobrole_all'
AND schemaname = 'public';

-- Check indexes on saved_jobs
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'saved_jobs'
AND schemaname = 'public';

-- Check RLS is enabled on job_jobrole_all
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'job_jobrole_all'
AND schemaname = 'public';

-- Check RLS is enabled on saved_jobs
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'saved_jobs'
AND schemaname = 'public';

-- Check RLS policies on job_jobrole_all
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'job_jobrole_all'
AND schemaname = 'public';

-- Check RLS policies on saved_jobs
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'saved_jobs'
AND schemaname = 'public';

-- Count total jobs (will be 0 if no sample data inserted)
SELECT COUNT(*) AS total_jobs FROM public.job_jobrole_all;

-- Count total saved jobs (will be 0)
SELECT COUNT(*) AS total_saved_jobs FROM public.saved_jobs;

-- =========================================
-- SETUP COMPLETE!
-- =========================================
-- Your database is now ready to use with:
-- 1. job_jobrole_all table for all job listings
-- 2. saved_jobs table for user-saved jobs
-- 3. Proper indexes for performance
-- 4. Row Level Security for data protection
-- 5. Real-time subscriptions enabled
--
-- Next steps:
-- 1. Verify tables exist using queries above
-- 2. Optionally insert sample data (uncomment Part 11)
-- 3. Start using your application!
-- =========================================
