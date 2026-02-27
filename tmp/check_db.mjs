import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkTable() {
    const { count, error } = await supabase
        .from('h1b_wage_data')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error checking table:', error.message);
    } else {
        console.log('Count of records in h1b_wage_data:', count);
    }

    const { data: sample, error: sampleError } = await supabase
        .from('h1b_wage_data')
        .select('*')
        .limit(1);

    if (sampleError) {
        console.error('Error fetching sample:', sampleError.message);
    } else {
        console.log('Sample record:', sample);
    }
}

checkTable();
