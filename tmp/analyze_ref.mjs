import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function analyzeData() {
    // 1. What do Occupation values look like?
    const { data: occs } = await supabase
        .from('h1b_wage_data')
        .select('Occupation')
        .limit(20);
    console.log('=== Occupation Format ===');
    const uniqueOccs = Array.from(new Set(occs.map(d => d.Occupation)));
    uniqueOccs.forEach(o => console.log('  ', o));

    // 2. What do Area values look like?
    const { data: areas } = await supabase
        .from('h1b_wage_data')
        .select('Area')
        .limit(20);
    console.log('\n=== Area Format ===');
    const uniqueAreas = Array.from(new Set(areas.map(d => d.Area)));
    uniqueAreas.forEach(a => console.log('  ', a));

    // 3. What do State values look like?
    const { data: states } = await supabase
        .from('h1b_wage_data')
        .select('State')
        .limit(20);
    console.log('\n=== State Format ===');
    const uniqueStates = Array.from(new Set(states.map(d => d.State)));
    uniqueStates.forEach(s => console.log('  ', s));

    // 4. A few sample complete records
    const { data: samples } = await supabase
        .from('h1b_wage_data')
        .select('*')
        .ilike('Occupation', '%Software%')
        .ilike('State', '%CALIFORNIA%')
        .limit(10);
    console.log('\n=== Sample Records (Software + California) ===');
    samples?.forEach(r => console.log(JSON.stringify(r)));

    // 5. How many unique occupations are there?
    const { count } = await supabase
        .from('h1b_wage_data')
        .select('*', { count: 'exact', head: true });
    console.log('\n=== Total Records ===', count);
}

analyzeData();
