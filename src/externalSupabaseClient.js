import { createClient } from '@supabase/supabase-js';

// External Database Configuration (audit_reviews + job_jobrole_sponsored)
// This connects to the database that contains:
// - audit_reviews table (audit/review data)
// - job_jobrole_sponsored table (sponsored job listings)
const EXTERNAL_SUPABASE_URL = import.meta.env?.VITE_EXTERNAL_SUPABASE_URL || process.env.VITE_EXTERNAL_SUPABASE_URL || '';
const EXTERNAL_SUPABASE_ANON_KEY = import.meta.env?.VITE_EXTERNAL_SUPABASE_ANON_KEY || process.env.VITE_EXTERNAL_SUPABASE_ANON_KEY || '';

if (!EXTERNAL_SUPABASE_URL || !EXTERNAL_SUPABASE_ANON_KEY) {
    console.warn('⚠️ External Supabase credentials not configured. Set VITE_EXTERNAL_SUPABASE_URL and VITE_EXTERNAL_SUPABASE_ANON_KEY in .env');
}

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
