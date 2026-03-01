import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking columns of job_jobrole_sponsored_sync...');
    // Fetch one row to see columns
    const { data, error } = await supabase
        .from('job_jobrole_sponsored_sync')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Columns:', Object.keys(data[0] || {}));
    }

    console.log('\nTesting query with order by date_posted...');
    const start = Date.now();
    const { data: data2, error: error2 } = await supabase
        .from('job_jobrole_sponsored_sync')
        .select('company, job_role_name, wage_level, wage_num')
        .order('date_posted', { ascending: false })
        .limit(100);

    if (error2) {
        console.error('Order error:', error2);
    } else {
        console.log(`Query took ${Date.now() - start}ms, returned ${data2.length} rows`);
    }
}

checkSchema();
