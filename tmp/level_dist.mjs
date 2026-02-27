import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkDistribution() {
    const { data, error } = await supabase
        .from('h1b_wage_data')
        .select('"Wage Level"')
        .limit(1000);

    if (error) {
        console.error(error);
        return;
    }

    const counts = {};
    data.forEach(d => {
        const l = d['Wage Level'];
        counts[l] = (counts[l] || 0) + 1;
    });

    console.log('Wage Level Distribution (First 100):', counts);
}

checkDistribution();
