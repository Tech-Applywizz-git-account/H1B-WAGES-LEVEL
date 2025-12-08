-- =========================================
-- FIX PAYMENT DETAILS PERMISSIONS
-- =========================================

-- 1. Enable RLS on payment_details (good practice)
ALTER TABLE public.payment_details ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own payments" ON public.payment_details;
DROP POLICY IF EXISTS "Users can insert own payments" ON public.payment_details;

-- 3. Create Policy: Users can SEE their own payments
-- Matches records where the email matches the logged-in user's email
CREATE POLICY "Users can view own payments" 
ON public.payment_details FOR SELECT 
TO authenticated 
USING (email = (auth.jwt() ->> 'email'));

-- 4. Create Policy: Users can INSERT their own payments (if needed from frontend)
CREATE POLICY "Users can insert own payments" 
ON public.payment_details FOR INSERT 
TO authenticated 
WITH CHECK (email = (auth.jwt() ->> 'email'));

-- 5. VERIFY DATA
-- Check if there are payment records for your email
SELECT count(*) as "My Payment Records" 
FROM public.payment_details 
WHERE email = 'ganesh@applywizz.com';
