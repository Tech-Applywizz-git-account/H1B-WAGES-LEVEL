import fs from 'fs';
import csv from 'csv-parser';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

// 1. Configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // MUST use Service Role Key for bulk inserts

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Error: Missing Supabase URL or Service Role Key in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TABLE_NAME = 'job_jobrole_sponsored_sync';
const BATCH_SIZE = 500; // Optimal batch size for Supabase

// 2. Main Import Function
async function startImport(filePath) {
    if (!filePath) {
        console.error('❌ Error: Please provide the path to your CSV file.');
        console.log('Usage: node scripts/bulk-import-jobs.mjs "C:/path/to/your/file.csv"');
        return;
    }

    console.log(`🚀 Starting bulk import from: ${filePath}`);
    console.log(`📡 Target Table: ${TABLE_NAME}`);

    let batch = [];
    let rowCount = 0;
    let totalInserted = 0;

    const stream = fs.createReadStream(filePath)
        .pipe(csv());

    for await (const row of stream) {
        rowCount++;

        // Map CSV columns if necessary. 
        // If your CSV headers exactly match the DB columns, you can just push 'row'
        // Otherwise, rename them here:
        const mappedRow = {
            title: row.title,
            company: row.company,
            location: row.location,
            url: row.url,
            description: row.description,
            date_posted: row.date_posted || null,
            years_exp_required: row.years_exp_required,
            upload_date: row.upload_date || null,
            job_role_name: row.job_role_name,
            sponsored_job: row.sponsored_job,
            country: row.country || 'United States of America',
            jobId: row.jobId || row.id,
            assigned_to: row.assigned_to,
            salary: row.salary
            // Note: wage_num and wage_level will be empty until synced or manually set
        };

        batch.push(mappedRow);

        if (batch.length >= BATCH_SIZE) {
            await insertBatch(batch);
            totalInserted += batch.length;
            console.log(`⏳ Progress: ${totalInserted} rows inserted...`);
            batch = [];
        }
    }

    // Insert remaining rows
    if (batch.length > 0) {
        await insertBatch(batch);
        totalInserted += batch.length;
    }

    console.log('\n✅ IMPORT COMPLETE!');
    console.log(`📊 Total rows processed: ${rowCount}`);
    console.log(`✨ Total rows inserted successfully: ${totalInserted}`);
}

async function insertBatch(batch) {
    try {
        const { error } = await supabase
            .from(TABLE_NAME)
            .insert(batch);

        if (error) {
            console.error('❌ Batch Insert Error:', error.message);
            // Optionally log the full error or specific rows
        }
    } catch (err) {
        console.error('❌ Unexpected Error during batch insert:', err);
    }
}

// 3. Execution
const filePath = process.argv[2];
startImport(filePath);
