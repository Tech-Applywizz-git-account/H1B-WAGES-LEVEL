-- =========================================
-- SAVED JOBS TABLE SETUP (NO RLS)
-- =========================================
-- Run this in your Supabase SQL Editor
-- This creates the saved_jobs table WITHOUT RLS policies
-- =========================================

-- =========================================
-- 1. CREATE SAVED_JOBS TABLE
-- =========================================

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

-- Add helpful comments
COMMENT ON TABLE public.saved_jobs IS 'Stores jobs saved by users for later reference';
COMMENT ON COLUMN public.saved_jobs.user_id IS 'Reference to the user who saved the job';
COMMENT ON COLUMN public.saved_jobs.job_id IS 'Reference to the job_id from job_jobrole_all table';
COMMENT ON COLUMN public.saved_jobs.job_data IS 'Snapshot of job data at the time of saving';
COMMENT ON COLUMN public.saved_jobs.notes IS 'Optional user notes about the saved job';

-- =========================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =========================================

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id 
ON public.saved_jobs USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id 
ON public.saved_jobs USING btree (job_id);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_saved_at 
ON public.saved_jobs USING btree (saved_at DESC);

-- =========================================
-- 3. VERIFICATION QUERIES
-- =========================================

-- Check if saved_jobs table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'saved_jobs'
) AS saved_jobs_table_exists;

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'saved_jobs'
AND schemaname = 'public';

-- Count saved jobs (should be 0 initially)
SELECT COUNT(*) AS total_saved_jobs FROM public.saved_jobs;

-- =========================================
-- SETUP COMPLETE!
-- =========================================
-- You can now:
-- 1. Save jobs from the "All Jobs" tab
-- 2. View saved jobs in the "Saved Jobs" tab
-- 3. Unsave jobs anytime
-- =========================================
