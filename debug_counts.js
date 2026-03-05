import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(URL, KEY);

async function checkCounts() {
    const { data: syncData } = await supabase.from('audit_reviews_sync').select('company').eq('tl_confirmation', 'yes');
    const { data: backupData } = await supabase.from('audit_reviews_backup').select('company').eq('tl_confirmation', 'yes');

    const syncSet = new Set((syncData || []).map(r => r.company).filter(Boolean));
    const backupSet = new Set((backupData || []).map(r => r.company).filter(Boolean));

    console.log('Unique companies in sync (yes):', syncSet.size);
    console.log('Unique companies in backup (yes):', backupSet.size);

    const combined = new Set([...syncSet, ...backupSet]);
    console.log('Total unique companies combined:', combined.size);
}

checkCounts();
