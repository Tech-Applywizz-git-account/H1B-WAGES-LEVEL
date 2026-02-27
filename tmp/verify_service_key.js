import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing with URL:', supabaseUrl);
console.log('Key length:', serviceKey?.length);

const supabase = createClient(supabaseUrl, serviceKey);

async function test() {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) {
            console.error('❌ Service Key check failed:', error.message);
        } else {
            console.log('✅ Service Key is valid! Found users:', data?.users?.length);
        }
    } catch (err) {
        console.error('💥 Exception:', err.message);
    }
}

test();
