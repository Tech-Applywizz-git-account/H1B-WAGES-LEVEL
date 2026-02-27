import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTitles() {
    const { data } = await supabase
        .from('job_jobrole_sponsored_sync')
        .select('title')
        .limit(50);

    console.log(data.map(d => d.title));
}

checkTitles();
