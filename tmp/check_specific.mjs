import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkSpecific() {
    const { data } = await supabase
        .from('job_jobrole_sponsored_sync')
        .select('title, wage_level')
        .ilike('title', '%Web Developer III%')
        .limit(5);

    console.log(data);
}

checkSpecific();
