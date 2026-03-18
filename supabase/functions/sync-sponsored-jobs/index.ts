// supabase/functions/sync-sponsored-jobs/index.ts
// ─────────────────────────────────────────────
// Syncs sponsored jobs from external DB to local job_jobrole_sponsored_sync table.
// Scheduled/Called via Supabase Edge Function infrastructure.
//
// Deployment:
//   supabase functions deploy sync-sponsored-jobs
//
// Schedule (cron — every hour):
//   In Supabase Dashboard → Edge Functions → sync-sponsored-jobs → Schedule
//   Cron expression: 0 * * * *

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

    try {
        const SOURCE_URL = Deno.env.get('EXTERNAL_SUPABASE_URL') || '';
        const SOURCE_KEY = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY') || Deno.env.get('EXTERNAL_SUPABASE_ANON_KEY') || '';
        const TARGET_URL = Deno.env.get('SUPABASE_URL') || '';
        const TARGET_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

        if (!SOURCE_URL || !SOURCE_KEY || !TARGET_URL || !TARGET_KEY) {
            return new Response(JSON.stringify({ error: 'Missing environment variables' }), { status: 500, headers: corsHeaders });
        }

        const source = createClient(SOURCE_URL, SOURCE_KEY, { auth: { persistSession: false } });
        const target = createClient(TARGET_URL, TARGET_KEY, { auth: { persistSession: false } });

        // ── 1. Fetch Existing IDs from Target (Safe Deduplication) ──────────────
        console.log('[sync] Building deduplication set based on record IDs...');
        let existingIds: Set<string> = new Set();
        let targetPage = 0;
        const PAGE_SIZE = 1000;

        while (true) {
            const { data, error } = await target
                .from('job_jobrole_sponsored_sync')
                .select('id')
                .range(targetPage * PAGE_SIZE, (targetPage + 1) * PAGE_SIZE - 1);

            if (error) throw error;
            if (!data || data.length === 0) break;

            data.forEach(r => existingIds.add(r.id));
            if (data.length < PAGE_SIZE) break;
            targetPage++;
        }
        console.log(`[sync] Target has ${existingIds.size} existing record IDs`);

        // ── 2. Process Source in Pages (Streamed) ──────────────────────────────
        console.log('[sync] Starting sequential sync using record IDs...');
        let sourcePage = 0;
        let totalInserted = 0;
        const errors: string[] = [];

        while (true) {
            const { data: sourceBatch, error } = await source
                .from('job_jobrole_sponsored')
                .select('*')
                .order('id', { ascending: true }) // Stable ID-based pagination
                .range(sourcePage * PAGE_SIZE, (sourcePage + 1) * PAGE_SIZE - 1);

            if (error) throw error;
            if (!sourceBatch || sourceBatch.length === 0) break;

            // Filter batch based on unique IDs
            const newData = sourceBatch.filter(r => !existingIds.has(r.id));

            if (newData.length > 0) {
                console.log(`[sync] Page ${sourcePage}: Found ${newData.length} new records. Inserting...`);
                const toInsert = newData.map(r => ({
                    id:               r.id,
                    title:            r.title || null,
                    company:          r.company || null,
                    location:         r.location || null,
                    url:              r.url || null,
                    description:      r.description || null,
                    date_posted:      (r.date_posted === 'null' || !r.date_posted) ? null : r.date_posted,
                    years_exp_required: r.years_exp_required || null,
                    upload_date:      (r.upload_date === 'null' || !r.upload_date) ? null : r.upload_date,
                    job_role_name:    r.job_role_name || null,
                    sponsored_job:    r.sponsored_job || null,
                    country:          r.country || null,
                    jobId:            r.jobId || null,
                    assigned_to:      r.assigned_to || null,
                    salary:           r.salary || null,
                    wage_level:       'Lv 2',
                    wage_num:         2,
                    synced_at:        new Date().toISOString()
                }));

                const { error: insertErr } = await target
                    .from('job_jobrole_sponsored_sync')
                    .insert(toInsert);

                if (insertErr) {
                    console.error(`[sync] Insert error page ${sourcePage}:`, insertErr.message);
                    errors.push(`Page ${sourcePage}: ${insertErr.message}`);
                } else {
                    totalInserted += toInsert.length;
                    // Keep the set updated just in case source contains internal duplicates
                    toInsert.forEach(i => existingIds.add(i.id));
                }
            }

            if (sourceBatch.length < PAGE_SIZE) break;
            sourcePage++;

            // Give the function a tiny break to keep memory lean
            if (sourcePage % 5 === 0) {
                await new Promise(r => setTimeout(r, 50));
            }
        }

        const result = {
            success: true,
            inserted: totalInserted,
            sourcePageProcessed: sourcePage + 1,
            finalTargetCount: existingIds.size,
            errors: errors.length > 0 ? errors : undefined,
        };

        console.log('[sync] Sync Complete:', result);
        return new Response(JSON.stringify(result), { headers: corsHeaders });

        console.log('[sync] Complete:', result);
        return new Response(JSON.stringify(result), { headers: corsHeaders });

    } catch (err: any) {
        console.error('[sync] Fatal error:', err);
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
});
