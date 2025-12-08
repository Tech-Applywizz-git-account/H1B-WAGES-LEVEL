-- =========================================
-- UPDATE PROFILES TABLE WITH ADDITIONAL FIELDS
-- =========================================
-- Run this in your Supabase SQL Editor
-- This adds professional and social fields to the profiles table
-- =========================================

-- Add new columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS full_name text NULL,
ADD COLUMN IF NOT EXISTS phone text NULL,
ADD COLUMN IF NOT EXISTS location text NULL,
ADD COLUMN IF NOT EXISTS job_title text NULL,
ADD COLUMN IF NOT EXISTS years_of_experience text NULL,
ADD COLUMN IF NOT EXISTS skills text NULL,
ADD COLUMN IF NOT EXISTS linkedin_url text NULL,
ADD COLUMN IF NOT EXISTS github_url text NULL,
ADD COLUMN IF NOT EXISTS portfolio_url text NULL,
ADD COLUMN IF NOT EXISTS bio text NULL,
ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone DEFAULT now();

-- Add comments to new columns
COMMENT ON COLUMN public.profiles.full_name IS 'User full name';
COMMENT ON COLUMN public.profiles.phone IS 'Contact phone number';
COMMENT ON COLUMN public.profiles.location IS 'City, State or Country';
COMMENT ON COLUMN public.profiles.job_title IS 'Current or desired job title';
COMMENT ON COLUMN public.profiles.years_of_experience IS 'Years of professional experience';
COMMENT ON COLUMN public.profiles.skills IS 'Comma-separated list of skills';
COMMENT ON COLUMN public.profiles.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN public.profiles.github_url IS 'GitHub profile URL';
COMMENT ON COLUMN public.profiles.portfolio_url IS 'Personal portfolio website URL';
COMMENT ON COLUMN public.profiles.bio IS 'Professional biography';
COMMENT ON COLUMN public.profiles.updated_at IS 'Last profile update timestamp';

-- Create index on location for job matching
CREATE INDEX IF NOT EXISTS idx_profiles_location 
ON public.profiles USING btree (location);

-- Create index on job_title for job matching
CREATE INDEX IF NOT EXISTS idx_profiles_job_title 
ON public.profiles USING btree (job_title);

-- Verification query
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'profiles'
ORDER BY ordinal_position;

-- =========================================
-- SETUP COMPLETE!
-- =========================================
-- Your profiles table now has all necessary fields for:
-- - Personal information (name, phone, location)
-- - Professional details (job title, experience, skills, bio)
-- - Social links (LinkedIn, GitHub, Portfolio)
-- =========================================
