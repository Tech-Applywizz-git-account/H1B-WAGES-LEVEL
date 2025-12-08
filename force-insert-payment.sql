-- =========================================
-- FORCE INSERT PAYMENT RECORD
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
  'ganesh@applywizz.com',      -- Your exact email
  'PAY-MANUAL-001',            -- Transaction ID
  'ORDER-MANUAL-001',          -- Order ID
  NOW(),                       -- Current Time
  30.00,                       -- Amount
  'USD',                       -- Currency
  'COMPLETED',                 -- Status
  '{"notes": "Manual insertion"}'::jsonb
);

-- VERIFY IMMEDIATELY
SELECT * FROM public.payment_details WHERE email = 'ganesh@applywizz.com';
