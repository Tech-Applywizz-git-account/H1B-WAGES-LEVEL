import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log('Checking audit_reviews_sync...');
    const { data: auditData, error: auditError, count: auditCount } = await supabase
        .from('audit_reviews_sync')
        .select('company', { count: 'exact' })
        .eq('tl_confirmation', 'yes')
        .limit(10);

    if (auditError) {
        console.error('Audit error:', auditError);
    } else {
        console.log(`Audit count: ${auditCount}`);
        console.log('Sample companies:', auditData.map(d => d.company));
    }

    if (auditData && auditData.length > 0) {
        const companies = auditData.map(d => d.company);
        console.log('\nChecking job_jobrole_sponsored_sync for these companies...');
        const { data: jobData, error: jobError, count: jobCount } = await supabase
            .from('job_jobrole_sponsored_sync')
            .select('company, job_role_name', { count: 'exact' })
            .in('company', companies)
            .limit(10);

        if (jobError) {
            console.error('Job error:', jobError);
        } else {
            console.log(`Job count for these companies: ${jobCount}`);
            console.log('Sample jobs:', jobData);
        }
    }
}

checkData();
