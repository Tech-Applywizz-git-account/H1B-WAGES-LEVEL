# H1B Wage Level - Signup & Payment Flow

## Overview

This implementation includes a complete signup and payment flow with the following features:

### ✅ Features Implemented

1. **Enhanced Signup Form** (`src/pages/Signup.jsx`)
   - First Name
   - Last Name
   - Email
   - Mobile Number with Country Code (US, UK, India)
   - Promo Code (Optional)
   - "Proceed to Payment" button

2. **PayPal Payment Integration**
   - Create PayPal order via edge function
   - PayPal Checkout buttons
   - Payment capture and processing

3. **Database Storage**
   - Store user details in `profiles` table
   - Store payment details in `payment_details` table
   - Link tables via email

4. **User Authentication**
   - Auto-create user in `auth.users` table
   - Password format: `{firstName}@123`

5. **Email Notifications**
   - Beautiful HTML email template
   - Transaction details
   - Login credentials
   - Login button linking to login page

6. **Success Page**
   - Transaction details display
   - Payment confirmation
   - Login redirect button

## 🗂️ File Structure

```
frontend/
├── src/
│   └── pages/
│       └── Signup.jsx                          # Main signup component
├── supabase/
│   ├── functions/
│   │   ├── create-paypal-order/
│   │   │   └── index.ts                        # Creates PayPal order
│   │   ├── capture-paypal-order/
│   │   │   └── index.ts                        # Captures payment & processes
│   │   └── send-email/
│   │       └── index.ts                        # Sends welcome email
│   ├── migrations/
│   │   └── 001_create_tables.sql               # Database schema
│   └── SETUP_GUIDE.md                          # Detailed setup guide
├── .env.example                                # Environment variables template
└── README_SIGNUP_FLOW.md                       # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd "c:\Users\G.Ganesh\OneDrive\Desktop\H1B Wage Level\h1b-wage-level\frontend"
npm install @supabase/supabase-js
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

### 3. Create Database Tables

Run the SQL migration in your Supabase SQL Editor:
```bash
# Copy content from supabase/migrations/001_create_tables.sql
# Paste and run in Supabase SQL Editor
```

### 4. Deploy Edge Functions

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set PAYPAL_CLIENT_ID=your_client_id
supabase secrets set PAYPAL_CLIENT_SECRET=your_client_secret
supabase secrets set PAYPAL_MODE=sandbox
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set FROM_EMAIL=noreply@yourdomain.com
supabase secrets set APP_URL=https://yourdomain.com

# Deploy functions
supabase functions deploy
```

### 5. Run the Application

```bash
npm run dev
```

## 📊 Database Schema

### profiles table
- `id` (UUID, Primary Key)
- `email` (TEXT, Unique, NOT NULL)
- `first_name` (TEXT, NOT NULL)
- `last_name` (TEXT, NOT NULL)
- `mobile_number` (TEXT, NOT NULL)
- `country_code` (TEXT, NOT NULL)
- `promo_code` (TEXT)
- `transaction_id` (TEXT)
- `order_id` (TEXT)
- `time_of_payment` (TIMESTAMPTZ)
- `metadata` (JSONB)
- `payment_status` (TEXT, DEFAULT 'pending')
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### payment_details table
- `id` (UUID, Primary Key)
- `email` (TEXT, NOT NULL)
- `transaction_id` (TEXT, NOT NULL)
- `order_id` (TEXT, NOT NULL)
- `time_of_payment` (TIMESTAMPTZ, NOT NULL)
- `amount` (DECIMAL, NOT NULL)
- `currency` (TEXT, NOT NULL)
- `status` (TEXT, NOT NULL)
- `metadata` (JSONB)
- `created_at` (TIMESTAMPTZ)

## 🔄 Flow Diagram

```
1. User fills form → Submit
   ↓
2. Store in profiles table (payment_status: 'pending')
   ↓
3. Show PayPal buttons
   ↓
4. Create PayPal order (create-paypal-order function)
   ↓
5. User completes payment
   ↓
6. Capture payment (capture-paypal-order function)
   ├─ Store in payment_details table
   ├─ Update profiles table with transaction info
   ├─ Create auth.users entry
   └─ Send email (send-email function)
   ↓
7. Show success page with transaction details
   ↓
8. User clicks "Login" button → Redirect to /login
```

## 🔐 Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Service role authentication for edge functions
- ✅ PayPal credentials stored server-side only
- ✅ CORS protection on edge functions
- ✅ Email validation and sanitization

## 📧 Email Template

The welcome email includes:
- Professional HTML design with gradient header
- Transaction details table
- Login credentials (email + auto-generated password)
- Security note about checking spam/junk folders
- "Click Here to Login" button
- Responsive design

## 🧪 Testing

### Test with PayPal Sandbox

1. Create a PayPal Sandbox account
2. Use sandbox credentials in environment variables
3. Use test credit cards from PayPal Developer Dashboard
4. Test the complete flow

### Test Email Delivery

1. Set up Resend account (free tier available)
2. Verify your domain or use test domain
3. Check email delivery in Resend dashboard
4. Test spam folder notification

## 🐛 Troubleshooting

### Common Issues

1. **PayPal buttons not showing**
   - Check console for errors
   - Verify `VITE_PAYPAL_CLIENT_ID` is set correctly
   - Ensure you're on step 2

2. **Edge function errors**
   - Check function logs: `supabase functions logs [function-name]`
   - Verify all secrets are set
   - Check CORS headers

3. **Email not sending**
   - Verify Resend API key
   - Check domain verification
   - Look at Resend dashboard logs

4. **Database errors**
   - Ensure tables are created
   - Check RLS policies
   - Verify table schemas match

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PayPal Developer Docs](https://developer.paypal.com/docs/api/overview/)
- [Resend Documentation](https://resend.com/docs)

## 🎯 Next Steps

1. ✅ Set up PayPal developer account
2. ✅ Set up Resend account for emails
3. ✅ Create database tables
4. ✅ Deploy edge functions
5. ✅ Test the complete flow
6. ✅ Switch to production mode when ready

## 💡 Production Checklist

Before going live:
- [ ] Switch PayPal to live mode (`PAYPAL_MODE=live`)
- [ ] Use production PayPal credentials
- [ ] Verify email domain in Resend
- [ ] Enable production email sending
- [ ] Test with real payment (small amount)
- [ ] Set up error monitoring
- [ ] Configure proper CORS origins
- [ ] Review and test RLS policies
- [ ] Set up backup and recovery
- [ ] Document user support process

## 🤝 Support

For questions or issues, refer to:
- `supabase/SETUP_GUIDE.md` for detailed setup instructions
- Edge function code comments for implementation details
- Official documentation for each service

---

**Created**: December 2025
**Version**: 1.0.0
**Author**: H1B Wage Level Team
