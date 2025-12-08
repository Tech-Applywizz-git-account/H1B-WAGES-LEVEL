-- =========================================
-- SAVED JOBS TABLE SETUP
-- =========================================
-- Run this script in your Supabase SQL Editor
-- to create the saved_jobs table and related policies
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

-- Add comment to table
COMMENT ON TABLE public.saved_jobs IS 'Stores jobs saved by users for later reference';

-- Add comments to columns
COMMENT ON COLUMN public.saved_jobs.user_id IS 'Reference to the user who saved the job';
COMMENT ON COLUMN public.saved_jobs.job_id IS 'Reference to the job_id from job_jobrole_all table';
COMMENT ON COLUMN public.saved_jobs.job_data IS 'Snapshot of job data at the time of saving';
COMMENT ON COLUMN public.saved_jobs.notes IS 'Optional user notes about the saved job';

-- =========================================
-- 2. CREATE INDEXES
-- =========================================

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id 
ON public.saved_jobs USING btree (user_id);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id 
ON public.saved_jobs USING btree (job_id);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_saved_at 
ON public.saved_jobs USING btree (saved_at DESC);

-- =========================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =========================================

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 4. CREATE RLS POLICIES
-- =========================================

-- Policy 1: Users can view their own saved jobs
DROP POLICY IF EXISTS "Users can view their own saved jobs" ON public.saved_jobs;
CREATE POLICY "Users can view their own saved jobs"
ON public.saved_jobs
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy 2: Users can save jobs (insert)
DROP POLICY IF EXISTS "Users can save jobs" ON public.saved_jobs;
CREATE POLICY "Users can save jobs"
ON public.saved_jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Users can unsave their own jobs (delete)
DROP POLICY IF EXISTS "Users can unsave their own jobs" ON public.saved_jobs;
CREATE POLICY "Users can unsave their own jobs"
ON public.saved_jobs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Policy 4: Users can update their saved job notes
DROP POLICY IF EXISTS "Users can update their saved job notes" ON public.saved_jobs;
CREATE POLICY "Users can update their saved job notes"
ON public.saved_jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =========================================
-- 5. ENABLE REAL-TIME (Optional)
-- =========================================
-- Uncomment if you want real-time updates for saved jobs

-- ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_jobs;

-- =========================================
-- 6. VERIFY SETUP
-- =========================================

-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'saved_jobs'
) AS table_exists;

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'saved_jobs'
AND schemaname = 'public';

-- Check RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'saved_jobs'
AND schemaname = 'public';

-- Check RLS policies
SELECT 
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'saved_jobs'
AND schemaname = 'public';

-- =========================================
-- 7. HELPER FUNCTION (Optional)
-- =========================================
-- Function to get user's saved job IDs for quick lookup

CREATE OR REPLACE FUNCTION public.get_user_saved_job_ids(p_user_id uuid)
RETURNS TABLE(job_id bigint) 
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT saved_jobs.job_id
  FROM public.saved_jobs
  WHERE saved_jobs.user_id = p_user_id;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_saved_job_ids(uuid) TO authenticated;

-- =========================================
-- NOTES
-- =========================================
-- 1. The unique constraint prevents duplicate saves
-- 2. job_data stores a snapshot of the job at save time
-- 3. If a job is deleted from job_jobrole_all, the saved entry remains
-- 4. Users can only see/modify their own saved jobs (RLS policies)
-- =========================================
