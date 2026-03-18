// supabase/functions/sync-audit-backup/index.ts
// ─────────────────────────────────────────────
// Supabase Edge Function — syncs new rows from source audit_reviews_backup
// to the target audit_reviews_backup WITHOUT deleting any existing data.
//
// Deployment:
//   supabase functions deploy sync-audit-backup
//
// Schedule (cron — every 30 minutes):
//   In Supabase Dashboard → Edge Functions → sync-audit-backup → Schedule
//   Cron expression: */30 * * * *
//
// OR call via Database Webhook on the SOURCE database:
//   Supabase Source DB → Database → Webhooks → New Webhook
//   Table: audit_reviews_backup, Event: INSERT
//   URL: https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/sync-audit-backup
//   Headers: Authorization: Bearer <SUPABASE_ANON_KEY>

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        // ── Source DB (external — where new data is inserted) ──────────────────
        const SOURCE_URL = Deno.env.get('EXTERNAL_SUPABASE_URL') ?? '';
        const SOURCE_KEY = Deno.env.get('EXTERNAL_SUPABASE_SERVICE_KEY') ?? Deno.env.get('EXTERNAL_SUPABASE_ANON_KEY') ?? '';

        // ── Target DB (main app database) ──────────────────────────────────────
        const TARGET_URL = Deno.env.get('SUPABASE_URL') ?? '';
        const TARGET_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

        if (!SOURCE_URL || !SOURCE_KEY || !TARGET_URL || !TARGET_KEY) {
            return new Response(JSON.stringify({ error: 'Missing env vars', needed: ['EXTERNAL_SUPABASE_URL', 'EXTERNAL_SUPABASE_SERVICE_KEY (or ANON_KEY)', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] }), {
                status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const source = createClient(SOURCE_URL, SOURCE_KEY, { auth: { persistSession: false } });
        const target = createClient(TARGET_URL, TARGET_KEY, { auth: { persistSession: false } });

        // ── Step 1: Read all IDs and job_ids in TARGET (Double Lock!) ─────────
        let existingIds: Set<string> = new Set();
        let existingJobIds: Set<string> = new Set();
        let targetPage = 0;
        const PAGE_SIZE = 1000;

        while (true) {
            const { data: existing, error: existErr } = await target
                .from('audit_reviews_backup')
                .select('id, job_id')
                .order('id', { ascending: true }) // Crucial for stable pagination!
                .range(targetPage * PAGE_SIZE, (targetPage + 1) * PAGE_SIZE - 1);

            if (existErr) throw new Error(`Target read failed: ${existErr.message}`);
            if (!existing || existing.length === 0) break;

            existing.forEach(r => {
                existingIds.add(r.id);
                if (r.job_id) existingJobIds.add(stringNormalization(r.job_id));
            });
            if (existing.length < PAGE_SIZE) break;
            targetPage++;
        }

        function stringNormalization(s: string) {
            return String(s || '').trim().toLowerCase();
        }

        console.log(`[sync] Target has ${existingIds.size} existing IDs and ${existingJobIds.size} unique Job IDs`);

        // ── Step 2: Read all records from SOURCE ───────────────────────────────
        let sourceRecords: any[] = [];
        let sourcePage = 0;

        while (true) {
            const { data, error } = await source
                .from('audit_reviews_backup')
                .select('id, job_id, company, role, domain, job_link, decision, remarks, observant_name, audit_date, created_at, tl_confirmation, tl_name, admin_confirmation, admin_name, audit_link_review, salary')
                .order('id', { ascending: true }) // Fixed: order by UUID for guaranteed stability
                .range(sourcePage * PAGE_SIZE, (sourcePage + 1) * PAGE_SIZE - 1);

            if (error) throw new Error(`Source read failed: ${error.message}`);
            if (!data || data.length === 0) break;

            sourceRecords = [...sourceRecords, ...data];
            if (data.length < PAGE_SIZE) break;
            sourcePage++;
        }

        console.log(`[sync] Source has ${sourceRecords.length} total records`);

        // ── Step 3: Filter (Double-Lock Check) ─────────────────────────────────
        const newRecords = sourceRecords.filter(r => 
            !existingIds.has(r.id) && 
            !existingJobIds.has(stringNormalization(r.job_id))
        );

        if (newRecords.length === 0) {
            return new Response(JSON.stringify({ success: true, inserted: 0, message: 'Already up to date' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        console.log(`[sync] Found ${newRecords.length} new records (not in Target). Inserting...`);

        // ── Step 4: INSERT ────────────────────────────────────────────────────
        const BATCH = 100;
        let totalInserted = 0;
        const errors: string[] = [];

        for (let i = 0; i < newRecords.length; i += BATCH) {
            const batch = newRecords.slice(i, i + BATCH).map(r => ({
                id: r.id,
                job_id: r.job_id,
                company: r.company,
                role: r.role,
                domain: r.domain,
                job_link: r.job_link,
                decision: r.decision,
                remarks: r.remarks,
                observant_name: r.observant_name,
                audit_date: r.audit_date,
                created_at: r.created_at ?? new Date().toISOString(),
                tl_confirmation: r.tl_confirmation ?? 'Pending',
                tl_name: r.tl_name ?? null,
                admin_confirmation: r.admin_confirmation ?? 'Pending',
                admin_name: r.admin_name ?? null,
                audit_link_review: r.audit_link_review ?? null,
                salary: r.salary ?? null,
            }));

            const { error: insertErr } = await target
                .from('audit_reviews_backup')
                .insert(batch);

            if (insertErr) {
                errors.push(`batch ${Math.floor(i / BATCH) + 1}: ${insertErr.message}`);
                console.error(`[sync] Insert error:`, insertErr.message);
            } else {
                totalInserted += batch.length;
            }
        }

        const result = {
            success: errors.length === 0,
            inserted: totalInserted,
            sourceCount: sourceRecords.length,
            targetCount: existingIds.size + totalInserted,
            errors: errors.length > 0 ? errors : undefined,
        };

        console.log('[sync] Complete:', result);

        return new Response(JSON.stringify(result), {
            status: errors.length > 0 ? 207 : 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('[sync] Fatal error:', err);
        return new Response(JSON.stringify({ success: false, error: err.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
