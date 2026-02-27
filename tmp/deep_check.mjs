import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function deepCheck() {
    console.log('--- Wage Level Distribution in Reference Table (h1b_wage_data) ---');

    const levels = ['I', 'II', 'III', 'IV', 'MEAN (H-2B)'];
    const results = {};

    for (const lvl of levels) {
        const { count, error } = await supabase
            .from('h1b_wage_data')
            .select('*', { count: 'exact', head: true })
            .eq('Wage Level', lvl);

        if (!error) results[lvl] = count;
    }

    console.log(results);

    console.log('\n--- Checking Current Jobs Table ---');
    const jobsLevels = ['Lv 1', 'Lv 2', 'Lv 3', 'Lv 4'];
    const jobResults = {};

    for (const lvl of jobsLevels) {
        const { count, error } = await supabase
            .from('job_jobrole_sponsored_sync')
            .select('*', { count: 'exact', head: true })
            .eq('wage_level', lvl);

        if (!error) jobResults[lvl] = count;
    }
    console.log(jobResults);
}

deepCheck();
