import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function diagnose() {
    // 1. How many have salary?
    const { data: withSalary } = await supabase
        .from('job_jobrole_sponsored_sync')
        .select('salary')
        .not('salary', 'is', null)
        .neq('salary', '')
        .limit(5);

    console.log('Sample salaries:', withSalary?.map(d => d.salary));

    // 2. Sample job titles
    const { data: samples } = await supabase
        .from('job_jobrole_sponsored_sync')
        .select('title, job_role_name, location, salary, wage_level')
        .eq('wage_level', 'Lv 2')
        .limit(20);

    console.log('\nSample Lv 2 jobs:');
    samples?.forEach(j => console.log(`  "${j.title}" @ "${j.location}" | salary: ${j.salary}`));
}

diagnose();
