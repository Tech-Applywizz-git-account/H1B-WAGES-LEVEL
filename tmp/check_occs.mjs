import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkOccs() {
    const { data } = await supabase
        .from('h1b_wage_data')
        .select('Occupation')
        .range(0, 500);

    const unique = Array.from(new Set(data.map(d => d.Occupation)));
    console.log(unique);
}

checkOccs();
