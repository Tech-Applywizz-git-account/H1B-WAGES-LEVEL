
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
  const { data: d1 } = await supabase.from('job_jobrole_sponsored_sync').select('company, wage_level, wage_num').ilike('company', '%Strategic Staffing Solutions%').limit(20);
  console.log('SPONSORED:', JSON.stringify(d1, null, 2));

  const { data: d2 } = await supabase.from('audit_reviews_sync').select('company, salary, remarks').ilike('company', '%Strategic Staffing Solutions%').limit(20);
  // console.log('SYNC:', JSON.stringify(d2, null, 2));

  const { data: d3 } = await supabase.from('audit_reviews_backup').select('company, salary, remarks').ilike('company', '%Strategic Staffing Solutions%').limit(20);
  console.log('BACKUP:', JSON.stringify(d3, null, 2));
})();
