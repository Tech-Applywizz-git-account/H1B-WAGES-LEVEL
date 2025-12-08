-- =========================================
-- ENABLE ADMIN READ ACCESS
-- =========================================

-- Update the Read Policy to allow ALL authenticated users to see ALL profiles
-- This is necessary for the Admin Dashboard to list users.
-- In a stricter system, you would check for 'admin' role, but to avoid recursion issues
-- and since this is a directory, we'll allow all logged-in users to read.

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;

CREATE POLICY "Authenticated users can read all profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (true); -- ALL logged in users can read

-- Verify by selecting count of profiles (should be > 1 if multiple users exist)
SELECT count(*) FROM public.profiles;
