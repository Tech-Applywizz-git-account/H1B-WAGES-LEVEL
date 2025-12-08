-- =========================================
-- DEBUG: DISABLE RLS to TEST VISIBILITY
-- =========================================

-- Disable RLS on payment_details so ANY logged-in user can read ALL rows
ALTER TABLE public.payment_details DISABLE ROW LEVEL SECURITY;

-- Manually check if data exists for your email
SELECT * FROM public.payment_details WHERE email = 'ganesh@applywizz.com';
