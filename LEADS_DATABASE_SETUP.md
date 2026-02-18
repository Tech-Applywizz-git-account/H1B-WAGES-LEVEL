# Resume Help Form - Leads Database Integration

## Overview
When users click "Get Help with Resume" and submit the form, their information is automatically saved to a separate Supabase database in the `leads` table with the source automatically set to "h1b-wage-level".

## Setup Instructions

### 1. **Get Your Leads Database Credentials**
   - Go to your Supabase leads database project
   - Navigate to **Settings** → **API**
   - Copy the following:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **Project API Key** → **anon/public** key

### 2. **Add Credentials to Environment Variables**
   - Open the `.env` file in the root directory
   - Replace the placeholders with your actual credentials:
     ```env
     VITE_LEADS_SUPABASE_URL=https://your-project.supabase.co
     VITE_LEADS_SUPABASE_ANON_KEY=your-anon-key-here
     ```

### 3. **Create the Leads Table in Supabase**
   Run this SQL in your Supabase SQL editor:
   
   ```sql
   CREATE TABLE leads (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       first_name TEXT NOT NULL,
       last_name TEXT NOT NULL,
       email TEXT NOT NULL,
       phone TEXT NOT NULL,
       country TEXT NOT NULL,
       source TEXT DEFAULT 'h1b-wage-level',
       created_at TIMESTAMPTZ DEFAULT NOW()
   );

   -- Add index for faster queries
   CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
   CREATE INDEX idx_leads_source ON leads(source);
   CREATE INDEX idx_leads_email ON leads(email);

   -- Enable Row Level Security (RLS)
   ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

   -- Allow anonymous inserts (anyone can submit the form)
   CREATE POLICY "Allow anonymous inserts" ON leads
       FOR INSERT
       TO anon
       WITH CHECK (true);

   -- Only authenticated users can read leads
   CREATE POLICY "Authenticated users can read" ON leads
       FOR SELECT
       TO authenticated
       USING (true);
   ```

### 4. **Restart Development Server**
   After adding the credentials, restart your dev server:
   ```bash
   npm run dev
   ```

## How It Works

### Data Flow:
1. User clicks "Get Help with Resume" button on any job card
2. Modal opens with form fields:
   - First Name
   - Last Name
   - Email Address
   - Mobile Number (with country code selector)
   - Country
3. User fills form and clicks "Submit"
4. Data is inserted into the **leads** database with:
   - All form fields
   - `source` automatically set to **"h1b-wage-level"**
   - `created_at` timestamp
5. Success message shown to user
6. Form resets and modal closes

### Files Involved:
- **`src/leadsSupabaseClient.js`** - Separate Supabase client for leads database
- **`src/components/JobCard.jsx`** - Form component with submission logic
- **`.env`** - Environment variables for credentials

### Database Schema:
```
leads table:
├── id (UUID, Primary Key)
├── first_name (TEXT)
├── last_name (TEXT)
├── email (TEXT)
├── phone (TEXT)
├── country (TEXT)
├── source (TEXT, defaults to "h1b-wage-level")
└── created_at (TIMESTAMPTZ)
```

## Security Features
- ✅ Uses Row Level Security (RLS)
- ✅ Anonymous users can only INSERT (submit forms)
- ✅ Only authenticated users can read leads
- ✅ Credentials stored in environment variables (never in code)
- ✅ Automatic timestamp tracking

## Troubleshooting

### Issue: Form submits but data doesn't appear in database
**Solution:** Check your RLS policies. Make sure the insert policy allows `anon` role.

### Issue: "Error submitting lead" message
**Solution:** 
1. Verify your credentials in `.env` are correct
2. Check that the `leads` table exists in your Supabase database
3. Ensure RLS policies are set up correctly

### Issue: Changes not reflecting
**Solution:** Restart the development server after modifying `.env` file

## Next Steps
After setup, you can:
- View all leads in your Supabase dashboard
- Create additional policies for specific users/roles
- Add email notifications when new leads arrive
- Export leads data for CRM integration
