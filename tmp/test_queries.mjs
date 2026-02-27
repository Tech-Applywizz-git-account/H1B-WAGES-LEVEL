import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testQuery() {
    console.log('--- Testing Occupation Only ---');
    const { data: data1, error: error1 } = await supabase
        .from('h1b_wage_data')
        .select('"Wage Level", "Occupation"')
        .ilike('Occupation', '%Software Engineer%')
        .limit(5);

    if (error1) console.error('Error 1:', error1.message);
    else console.log('Matches for Software Engineer:', data1);

    console.log('\n--- Testing State Format ---');
    const { data: data2 } = await supabase
        .from('h1b_wage_data')
        .select('State')
        .limit(10);
    console.log('Sample States in DB:', data2?.map(d => d.State));

    console.log('\n--- Testing Level Format ---');
    const { data: data3 } = await supabase
        .from('h1b_wage_data')
        .select('"Wage Level"')
        .limit(10);
    console.log('Sample Wage Levels in DB:', data3?.map(d => d['Wage Level']));
}

testQuery();
