
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
    const { data, error } = await supabase
        .from('job_jobrole_sponsored_sync')
        .select('company')
        .ilike('company', '%microsoft%')
        .limit(5);
    console.log('Microsoft results:', data);

    const { data: data2, error: error2 } = await supabase
        .from('job_jobrole_sponsored_sync')
        .select('company')
        .ilike('company', '%google%')
        .limit(5);
    console.log('Google results:', data2);
}

check();
