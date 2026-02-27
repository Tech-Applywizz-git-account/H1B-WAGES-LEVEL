import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkMoreOccs() {
    const { data } = await supabase
        .from('h1b_wage_data')
        .select('Occupation')
        .range(0, 10000); // 10k should have many

    const unique = Array.from(new Set(data.map(d => d.Occupation)));
    console.log(unique);
}

checkMoreOccs();
