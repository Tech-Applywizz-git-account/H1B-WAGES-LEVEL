import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkBio() {
    const { data } = await supabase
        .from('h1b_wage_data')
        .select('Occupation')
        .ilike('Occupation', '%Bioinformatics%')
        .limit(5);

    console.log(data.map(d => d.Occupation));
}

checkBio();
