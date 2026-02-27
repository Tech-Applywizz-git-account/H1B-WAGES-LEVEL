import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

function getSOCKeyword(titleStr) {
    if (!titleStr) return null;
    const t = titleStr.toLowerCase();
    if (t.match(/data\s*scien/)) return 'Data Scientists';
    if (t.match(/machine\s*learn|deep\s*learn|artificial\s*intel|nlp|llm|ml\s*engin/)) return 'Software Developers';
    if (t.match(/software|frontend|back.?end|full.?stack|web\s*dev|mobile\s*dev|ios|android|react|angular|vue|java|python|node|dotnet|\.net|c#|golang|scala|ruby|php/)) return 'Software Developers';
    if (t.match(/cloud|devops|sre|platform\s*engin|infrastructure|kubernetes|docker|terraform|aws|gcp|azure/)) return 'Software Developers';
    if (t.match(/data\s*engin|etl|pipeline|spark|kafka|hadoop|databricks|airflow/)) return 'Software Developers';
    if (t.match(/data\s*analy|business\s*intel|bi\s*dev|tableau|power\s*bi|looker/)) return 'Computer Occupations';
    if (t.match(/network\s*engin|network\s*admin|cisco|firewall|vpn/)) return 'Network';
    if (t.match(/security|cyber|infosec|penetration/)) return 'Security';
    if (t.match(/database|dba|sql\s*dev/)) return 'Database';
    if (t.match(/product\s*manager|project\s*manager|program\s*manager|scrum/)) return 'Computer Occupations';
    if (t.match(/system\s*analy|business\s*analy|functional\s*analy/)) return 'Systems Analysts';
    if (t.match(/qa|quality\s*assur|test\s*engin|sdet|automation\s*test/)) return 'Software Developers';
    if (t.match(/mechanical\s*engin/)) return 'Mechanical Engineers';
    if (t.match(/electrical\s*engin/)) return 'Electrical Engineers';
    if (t.match(/civil\s*engin/)) return 'Civil Engineers';
    if (t.match(/chemical\s*engin/)) return 'Chemical Engineers';
    if (t.match(/accountant|accounting|cpa/)) return 'Accountants';
    if (t.match(/financial\s*analy|finance|investment/)) return 'Financial';
    if (t.match(/nurse|nursing|rn\b/)) return 'Registered Nurses';
    if (t.match(/physician|doctor|md\b/)) return 'Physicians';
    if (t.match(/pharmacist/)) return 'Pharmacists';
    if (t.match(/supply\s*chain/)) return 'Supply Chain';
    if (t.match(/marketing/)) return 'Marketing';
    if (t.match(/researcher|research\s*scien|postdoc/)) return 'Research';
    if (t.match(/engin/)) return 'Software Developers';
    return null;
}

async function debug() {
    const { data: jobs } = await supabase
        .from('job_jobrole_sponsored_sync')
        .select('id, title, job_role_name, location, salary, wage_level')
        .eq('wage_level', 'Lv 2')
        .limit(20);

    let noMatch = 0;
    let withMatch = 0;

    for (const job of jobs) {
        const title = job.title || job.job_role_name;
        const soc = getSOCKeyword(title);

        if (!soc) {
            noMatch++;
            console.log(`NO MATCH: "${title}"`);
        } else {
            withMatch++;
            // Now check if the DB query finds results
            const { data, error } = await supabase
                .from('h1b_wage_data')
                .select('"Wage Level"')
                .ilike('Occupation', `%${soc}%`)
                .not('Wage Level', 'ilike', '%MEAN%')
                .limit(5);

            console.log(`MATCH: "${title}" => SOC: "${soc}" => DB results: ${data?.length || 0} (error: ${error?.message || 'none'})`);
            if (data && data.length > 0) {
                console.log(`  Levels: ${data.map(d => d['Wage Level']).join(', ')}`);
            }
        }
    }

    console.log(`\nSummary: ${withMatch} matched SOC, ${noMatch} no SOC match`);
}

debug();
