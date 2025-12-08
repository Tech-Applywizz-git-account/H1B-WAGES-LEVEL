-- =========================================
-- INSERT TEST PAYMENT RECORD
-- =========================================

INSERT INTO public.payment_details (
  email,
  transaction_id,
  order_id,
  time_of_payment,
  amount,
  currency,
  status,
  metadata
)
VALUES (
  'ganesh@applywizz.com',      -- Your email
  'PAYID-TEST-30USD',          -- Mock Transaction ID
  'ORDER-2025-MANUAL-01',      -- Mock Order ID
  NOW(),                       -- Current time
  30.00,                       -- Amount: $30.00
  'USD',                       -- Currency
  'COMPLETED',                 -- Status
  '{"notes": "Manual insertion for testing"}'::jsonb
);

-- Verify insertion
SELECT * FROM public.payment_details WHERE email = 'ganesh@applywizz.com';
