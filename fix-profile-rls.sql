-- =========================================
-- FIX RLS & ADMIN PROFILE (FINAL V3)
-- =========================================

-- 1. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. RESET POLICIES
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Create correct policies
CREATE POLICY "Users can read own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- 3. PROPER UPSERT (Handles Email Conflict)
INSERT INTO public.profiles (
  id, 
  email, 
  first_name, 
  last_name, 
  mobile_number, 
  country_code, 
  role, 
  payment_status
)
VALUES (
  'bcc5e6ef-7af9-4d20-b70f-91f3bbb12ee3', -- Your User ID
  'ganesh@applywizz.com',                  -- Email
  'Admin',                                 -- first_name
  'User',                                  -- last_name
  '0000000000',                            -- mobile_number
  '91',                                    -- country_code
  'admin',                                 -- Set as ADMIN
  'completed'                              -- Mark payment as completed
)
ON CONFLICT (email) DO UPDATE -- Handle conflict on EMAIL
SET 
  role = 'admin',
  id = 'bcc5e6ef-7af9-4d20-b70f-91f3bbb12ee3', -- Ensure ID matches Auth ID
  first_name = COALESCE(profiles.first_name, EXCLUDED.first_name);

-- 4. VERIFY
SELECT * FROM public.profiles WHERE email = 'ganesh@applywizz.com';
