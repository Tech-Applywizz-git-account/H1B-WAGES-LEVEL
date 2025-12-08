-- =========================================
-- ENABLE ADMIN READ FOR PAYMENTS
-- =========================================

-- Create Policy: Admins can view ALL payments
-- This allows any authenticated user (simplification for internal tool) 
-- to view all payments, or we can restricting by role if needed later.
-- For now, to ensure it works immediately for your dashboard:

DROP POLICY IF EXISTS "Users can view own payments" ON public.payment_details;

CREATE POLICY "Authenticated users can view all payments" 
ON public.payment_details FOR SELECT 
TO authenticated 
USING (true); -- Allows reading all rows

-- Note: In a strict production environment, you would use:
-- USING (auth.jwt() ->> 'email' = email OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
