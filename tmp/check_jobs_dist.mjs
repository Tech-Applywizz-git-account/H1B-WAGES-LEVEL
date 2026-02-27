import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkJobs() {
    const { data, error } = await supabase
        .from('job_jobrole_sponsored_sync')
        .select('wage_level')
        .limit(100);

    if (error) {
        console.error(error);
        return;
    }

    const counts = {};
    data.forEach(d => {
        const l = d.wage_level;
        counts[l] = (counts[l] || 0) + 1;
    });

    console.log('Current wage level distribution in JOBS table:', counts);
}

checkJobs();
