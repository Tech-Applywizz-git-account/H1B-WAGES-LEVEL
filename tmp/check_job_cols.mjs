import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Check what columns are in job_jobrole_sponsored_sync (salary fields?)
async function checkCols() {
    const { data } = await supabase
        .from('job_jobrole_sponsored_sync')
        .select('*')
        .limit(3);

    if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('\nSample records:');
        data.forEach(d => console.log(JSON.stringify(d, null, 2)));
    }
}

checkCols();
