import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

// Test the exact logic in getWageLevel for a sample job
async function testLookup() {
    // Sample jobs from the table
    const { data: jobs } = await supabase
        .from('job_jobrole_sponsored_sync')
        .select('title, job_role_name, location, wage_level')
        .limit(10);

    console.log('\n=== Sample Jobs ===');
    for (const job of jobs) {
        const occupation = job.title || job.job_role_name;
        console.log(`\nJob: "${occupation}" @ ${job.location}`);

        // Simulate keyword extraction
        const keywords = occupation
            .toLowerCase()
            .replace(/senior|junior|lead|staff|principal|sr\.|jr\.|ii|iii|iv|v/gi, '')
            .replace(/[^a-z\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);

        const priorityWords = ['developer', 'engineer', 'manager', 'analyst', 'science', 'scientist', 'administrator', 'director', 'specialist', 'web'];
        const mainKeyword = keywords.find(k => priorityWords.includes(k)) || keywords[0];
        const primaryKeywords = keywords.slice(0, 2);

        console.log('  Keywords:', keywords);
        console.log('  Main keyword:', mainKeyword);
        console.log('  Primary keywords:', primaryKeywords);

        // Try direct DB query
        if (mainKeyword) {
            const { data: results, error } = await supabase
                .from('h1b_wage_data')
                .select('"Wage Level", "Occupation"')
                .ilike('Occupation', `%${mainKeyword}%`)
                .limit(5);

            if (error) {
                console.log('  DB Error:', error.message);
            } else {
                console.log('  DB Results:', results?.length > 0 ? results.map(r => `${r['Wage Level']}: ${r['Occupation']}`).join(', ') : 'NONE');
            }
        }
    }
}

testLookup();
