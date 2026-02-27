import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    // Test the keywords for "Cloud Engineer" in AZ state
    const { data } = await supabase
        .from('h1b_wage_data')
        .select('"Occupation", "Wage Level", "Yearly", "Hourly", "Area"')
        .ilike('Occupation', '%Software%')
        .ilike('State', '%ARIZONA%')
        .not('Wage Level', 'ilike', '%MEAN%')
        .limit(10);

    console.log('Software + AZ:', data?.map(d => `${d['Wage Level']}: ${d['Occupation']} | ${d['Area']} | ${d['Yearly']}`));

    // Test location "Bridgewater, NJ"
    const { data: nj } = await supabase
        .from('h1b_wage_data')
        .select('"Occupation", "Wage Level", "Yearly", "Area", "State"')
        .ilike('Occupation', '%Software%')
        .ilike('State', '%NEW JERSEY%')
        .not('Wage Level', 'ilike', '%MEAN%')
        .limit(10);

    console.log('\nSoftware + NJ:', nj?.map(d => `${d['Wage Level']}: ${d['Yearly']} | ${d['Area']}`));
}

test();
