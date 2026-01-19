-- =========================================
-- UPDATE PROFILES TABLE FOR SUBSCRIPTION MANAGEMENT
-- =========================================
-- Run this in your Supabase SQL Editor
-- =========================================

-- 1. Add subscription_end_date column if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS subscription_end_date timestamp with time zone NULL;

-- 2. Migrate existing users: 
-- Set subscription_end_date to 1 month after their created_at if not already set
UPDATE public.profiles
SET subscription_end_date = created_at + interval '1 month'
WHERE subscription_end_date IS NULL;

-- 3. Update RLS policies to allow users to update their own profile during renewal
-- (Assuming users already have update access, but let's be sure)
/*
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);
*/

-- Verification query
SELECT id, email, created_at, subscription_end_date 
FROM public.profiles 
LIMIT 5;
