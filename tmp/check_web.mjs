import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function checkWeb() {
    const { data } = await supabase
        .from('h1b_wage_data')
        .select('Occupation')
        .ilike('Occupation', '%Web%')
        .limit(10);

    console.log(data.map(d => d.Occupation));
}

checkWeb();
