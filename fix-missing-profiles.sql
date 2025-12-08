-- =========================================
-- FIX MISSING PROFILE ISSUE
-- =========================================
-- This script fixes the "Cannot coerce to single JSON object" error
-- It creates missing profile records for users
-- =========================================

-- Step 1: Check if profile exists for the user
SELECT 
  u.id,
  u.email,
  u.created_at as "User Created",
  p.id as "Profile Exists",
  p.role as "Current Role"
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.id = 'bcc5e6ef-7af9-4d20-b70f-91f3bbb12ee3';

-- Step 2: Create missing profile (if it doesn't exist)
-- Replace the email and role as needed
INSERT INTO public.profiles (id, email, role, has_paid, created_at)
SELECT 
  u.id,
  u.email,
  'user' as role,  -- Change to 'admin' if this user should have admin access
  false as has_paid,
  NOW() as created_at
FROM auth.users u
WHERE u.id = 'bcc5e6ef-7af9-4d20-b70f-91f3bbb12ee3'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  );

-- Step 3: Verify the profile was created
SELECT 
  id,
  email,
  role,
  has_paid,
  created_at
FROM public.profiles
WHERE id = 'bcc5e6ef-7af9-4d20-b70f-91f3bbb12ee3';

-- =========================================
-- CREATE PROFILES FOR ALL USERS (BULK FIX)
-- =========================================
-- This creates profiles for ALL users who don't have one
-- Run this if multiple users are affected

INSERT INTO public.profiles (id, email, role, has_paid, created_at)
SELECT 
  u.id,
  u.email,
  'user' as role,
  false as has_paid,
  NOW() as created_at
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p WHERE p.id = u.id
);

-- Verify all users now have profiles
SELECT 
  COUNT(*) as "Total Auth Users",
  (SELECT COUNT(*) FROM public.profiles) as "Total Profiles",
  (SELECT COUNT(*) FROM auth.users u WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = u.id
  )) as "Missing Profiles"
FROM auth.users;

-- =========================================
-- OPTIONAL: SET THIS USER AS ADMIN
-- =========================================
-- Uncomment and run if this user should be an admin

-- UPDATE public.profiles
-- SET role = 'admin'
-- WHERE id = 'bcc5e6ef-7af9-4d20-b70f-91f3bbb12ee3';

-- =========================================
-- CREATE TRIGGER TO AUTO-CREATE PROFILES
-- =========================================
-- This ensures every new user automatically gets a profile

-- Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, has_paid, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    false,
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- VERIFICATION QUERIES
-- =========================================

-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check all users and their profiles
SELECT 
  u.id,
  u.email,
  u.created_at as "User Created",
  CASE 
    WHEN p.id IS NULL THEN '❌ Missing'
    ELSE '✅ Exists'
  END as "Profile Status",
  p.role,
  p.has_paid
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- =========================================
-- DONE!
-- =========================================
-- After running this script:
-- 1. Your current user will have a profile
-- 2. All existing users will have profiles
-- 3. Future users will automatically get profiles
-- 4. The error should be gone!
-- =========================================
