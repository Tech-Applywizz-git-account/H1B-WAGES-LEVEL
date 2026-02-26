/**
 * Data Sync Service
 * -----------------
 * Fetches data from the external Supabase database (audit_reviews, job_jobrole_sponsored)
 * and caches it locally in the main Supabase database.
 * 
 * This service can be:
 * 1. Called on app load (with 24h cache check)
 * 2. Triggered manually by admin
 * 3. Run as a scheduled Supabase Edge Function (recommended for production)
 */

import { supabase } from './supabaseClient.js';
import { externalSupabase } from './externalSupabaseClient.js';

const SYNC_CACHE_KEY = 'lastSyncTimestamp';
const SYNC_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
const IS_SYNC_ENABLED = true; // Enabled for incremental sync as requested

/**
 * Check if sync is needed (hasn't run in the last 24 hours)
 */
export const isSyncNeeded = () => {
    try {
        const lastSync = localStorage.getItem(SYNC_CACHE_KEY);
        if (!lastSync) return true;

        const elapsed = Date.now() - parseInt(lastSync, 10);
        return elapsed > SYNC_INTERVAL_MS;
    } catch {
        return true;
    }
};

/**
 * Update the last sync timestamp
 */
const markSyncComplete = () => {
    localStorage.setItem(SYNC_CACHE_KEY, Date.now().toString());
};

/**
 * Helper to fetch all records from a table in the MAIN database using pagination.
 * Necessary because regular .select() is limited to 1000 items.
 */
const fetchAllExistingFromMain = async (table, selectStr) => {
    let allData = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from(table)
            .select(selectStr)
            .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;

        if (data && data.length > 0) {
            allData = [...allData, ...data];
            page++;
            hasMore = data.length === pageSize;
        } else {
            hasMore = false;
        }
    }
    return allData;
};

/**
 * Sync audit_reviews from external DB to local audit_reviews_sync table
 */
export const syncAuditReviews = async () => {
    if (!IS_SYNC_ENABLED) {
        console.log('⏭️ Sync is currently disabled.');
        return { success: true, recordsSynced: 0, message: 'Sync disabled' };
    }
    console.log('🔄 Starting audit_reviews sync...');

    try {
        // Fetch all audit reviews from external DB
        let allData = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
            const { data, error } = await externalSupabase
                .from('audit_reviews')
                .select('*')
                .range(page * pageSize, (page + 1) * pageSize - 1)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                allData = [...allData, ...data];
                page++;
                hasMore = data.length === pageSize;
            } else {
                hasMore = false;
            }
        }

        if (allData.length === 0) {
            console.log('ℹ️ No audit reviews found in external DB');
            return { success: true, recordsSynced: 0 };
        }

        // --- INCREMENTAL SYNC LOGIC ---
        // Dedup by `id` (primary key from external DB).
        // Uses pagination to fetch ALL existing IDs (avoids 1000 limit issue).
        const existingRecords = await fetchAllExistingFromMain('audit_reviews_sync', 'id');
        const existingIds = new Set((existingRecords || []).map(r => r.id));

        // Filter out records whose id already exists in our DB
        const newData = allData.filter(record => !existingIds.has(record.id));

        if (newData.length === 0) {
            console.log('ℹ️ No new audit reviews to sync');
            return { success: true, recordsSynced: 0 };
        }

        console.log(`🆕 Found ${newData.length} new audit reviews to insert`);

        // Insert in batches of 500
        // Using upsert with ignoreDuplicates as a safety net to prevent 409 crashes
        const batchSize = 500;
        let totalInserted = 0;

        for (let i = 0; i < newData.length; i += batchSize) {
            const batch = newData.slice(i, i + batchSize).map(record => ({
                ...record,
                synced_at: new Date().toISOString()
            }));

            const { error: insertError } = await supabase
                .from('audit_reviews_sync')
                .insert(batch);

            if (insertError) {
                console.error(`❌ Error inserting audit reviews batch ${i / batchSize + 1}:`, insertError);
            } else {
                totalInserted += batch.length;
            }
        }

        console.log(`✅ Synced ${totalInserted} audit reviews`);
        return { success: true, recordsSynced: totalInserted };

    } catch (error) {
        console.error('❌ Audit reviews sync failed:', error);
        return { success: false, error: error.message, recordsSynced: 0 };
    }
};

/**
 * Sync job_jobrole_sponsored from external DB to local job_jobrole_sponsored_sync table
 */
export const syncSponsoredJobs = async () => {
    if (!IS_SYNC_ENABLED) {
        console.log('⏭️ Sync is currently disabled.');
        return { success: true, recordsSynced: 0, message: 'Sync disabled' };
    }
    console.log('🔄 Starting job_jobrole_sponsored sync...');

    try {
        // Fetch all sponsored jobs from external DB
        let allData = [];
        let page = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
            const { data, error } = await externalSupabase
                .from('job_jobrole_sponsored')
                .select('*')
                .range(page * pageSize, (page + 1) * pageSize - 1)
                .order('date_posted', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                allData = [...allData, ...data];
                page++;
                hasMore = data.length === pageSize;
            } else {
                hasMore = false;
            }
        }

        if (allData.length === 0) {
            console.log('ℹ️ No sponsored jobs found in external DB');
            return { success: true, recordsSynced: 0 };
        }

        // --- INCREMENTAL SYNC LOGIC ---
        // Fetch ALL existing (url + job_role_name) combos using pagination
        const existingRecords = await fetchAllExistingFromMain('job_jobrole_sponsored_sync', 'url, job_role_name');
        const existingKeys = new Set(
            (existingRecords || []).map(r => `${r.url}|||${r.job_role_name}`)
        );

        // Filter out records where (url + job_role_name) already exists
        const newData = allData.filter(record =>
            !existingKeys.has(`${record.url}|||${record.job_role_name}`)
        );

        if (newData.length === 0) {
            console.log('ℹ️ No new sponsored jobs to sync');
            return { success: true, recordsSynced: 0 };
        }

        console.log(`🆕 Found ${newData.length} new sponsored jobs to insert`);

        // Helper to fix invalid "null" strings in timestamps
        const fixTimestamp = (ts) => (ts === 'null' || !ts) ? null : ts;

        // Insert in smaller batches to handle parallel wage lookups
        const batchSize = 100;
        let totalInserted = 0;

        for (let i = 0; i < newData.length; i += batchSize) {
            const batchRaw = newData.slice(i, i + batchSize);

            // PRE-CALCULATE wage level for global sorting
            const batch = await Promise.all(batchRaw.map(async (record) => {
                try {
                    const results = await getWageLevel(record.title || record.job_role_name, record.location);
                    const wageLevelStr = (results && results.length > 0) ? results[0]['Wage Level'] : 'Lv 2';
                    const wageNum = parseInt(wageLevelStr.match(/\d/)?.[0] || '2');
                    return {
                        ...record,
                        date_posted: fixTimestamp(record.date_posted),
                        upload_date: fixTimestamp(record.upload_date),
                        wage_level: wageLevelStr,
                        wage_num: wageNum,
                        synced_at: new Date().toISOString()
                    };
                } catch (err) {
                    return {
                        ...record,
                        date_posted: fixTimestamp(record.date_posted),
                        upload_date: fixTimestamp(record.upload_date),
                        wage_level: 'Lv 2',
                        wage_num: 2,
                        synced_at: new Date().toISOString()
                    };
                }
            }));

            const { error: insertError } = await supabase
                .from('job_jobrole_sponsored_sync')
                .insert(batch);

            if (insertError) {
                console.error(`❌ Error inserting sponsored jobs batch ${i / batchSize + 1}:`, insertError);
            } else {
                totalInserted += batch.length;
            }
        }

        console.log(`✅ Synced ${totalInserted} sponsored jobs`);
        return { success: true, recordsSynced: totalInserted };

    } catch (error) {
        console.error('❌ Sponsored jobs sync failed:', error);
        return { success: false, error: error.message, recordsSynced: 0 };
    }
};

/**
 * Log sync operation
 */
const logSync = async (tableName, syncType, recordsSynced, status, errorMessage = null) => {
    try {
        await supabase.from('sync_log').insert([{
            table_name: tableName,
            sync_type: syncType,
            records_synced: recordsSynced,
            status: status,
            error_message: errorMessage,
            completed_at: new Date().toISOString()
        }]);
    } catch (err) {
        console.warn('Could not log sync operation:', err);
    }
};

/**
 * Run full sync (audit_reviews + sponsored_jobs)
 * Called on app load or manually by admin
 */
export const runFullSync = async (force = false) => {
    if (!IS_SYNC_ENABLED) {
        console.log('⏭️ Sync is currently disabled.');
        return { success: true, message: 'Sync disabled' };
    }
    if (!force && !isSyncNeeded()) {
        console.log('⏭️ Sync not needed (last sync was < 24h ago)');
        return { skipped: true };
    }

    console.log('🚀 Starting full data sync from external database...');
    const results = {};

    // Sync audit reviews
    const auditResult = await syncAuditReviews();
    results.auditReviews = auditResult;
    await logSync(
        'audit_reviews_sync',
        'full',
        auditResult.recordsSynced,
        auditResult.success ? 'success' : 'error',
        auditResult.error || null
    );

    // Sync sponsored jobs
    const sponsoredResult = await syncSponsoredJobs();
    results.sponsoredJobs = sponsoredResult;
    await logSync(
        'job_jobrole_sponsored_sync',
        'full',
        sponsoredResult.recordsSynced,
        sponsoredResult.success ? 'success' : 'error',
        sponsoredResult.error || null
    );

    markSyncComplete();

    console.log('✅ Full sync completed:', results);
    return results;
};

const STATE_MAPPING = {
    'AL': 'ALABAMA', 'AK': 'ALASKA', 'AZ': 'ARIZONA', 'AR': 'ARKANSAS', 'CA': 'CALIFORNIA',
    'CO': 'COLORADO', 'CT': 'CONNECTICUT', 'DE': 'DELAWARE', 'FL': 'FLORIDA', 'GA': 'GEORGIA',
    'HI': 'HAWAII', 'ID': 'IDAHO', 'IL': 'ILLINOIS', 'IN': 'INDIANA', 'IA': 'IOWA',
    'KS': 'KANSAS', 'KY': 'KENTUCKY', 'LA': 'LOUISIANA', 'ME': 'MAINE', 'MD': 'MARYLAND',
    'MA': 'MASSACHUSETTS', 'MI': 'MICHIGAN', 'MN': 'MINNESOTA', 'MS': 'MISSISSIPPI', 'MO': 'MISSOURI',
    'MT': 'MONTANA', 'NE': 'NEBRASKA', 'NV': 'NEVADA', 'NH': 'NEW HAMPSHIRE', 'NJ': 'NEW JERSEY',
    'NM': 'NEW MEXICO', 'NY': 'NEW YORK', 'NC': 'NORTH CAROLINA', 'ND': 'NORTH DAKOTA', 'OH': 'OHIO',
    'OK': 'OKLAHOMA', 'OR': 'OREGON', 'PA': 'PENNSYLVANIA', 'RI': 'RHODE ISLAND', 'SC': 'SOUTH CAROLINA',
    'SD': 'SOUTH DAKOTA', 'TN': 'TENNESSEE', 'TX': 'TEXAS', 'UT': 'UTAH', 'VT': 'VERMONT',
    'VA': 'VIRGINIA', 'WA': 'WASHINGTON', 'WV': 'WEST VIRGINIA', 'WI': 'WISCONSIN', 'WY': 'WYOMING'
};

// Simple memory cache for wage levels
const wageCache = new Map();

/**
 * Fetch H1B wage level for a given occupation and area
 * Used by JobCard to show wage level info
 */
export const getWageLevel = async (occupation, locationStr = null) => {
    const cacheKey = `${occupation}|${locationStr}`;
    if (wageCache.has(cacheKey)) return wageCache.get(cacheKey);

    try {
        if (!occupation) return [];

        let city = null;
        let stateFull = null;

        if (locationStr) {
            const parts = locationStr.split(',').map(p => p.trim());
            if (parts.length >= 2) {
                const stateAbbr = parts[1].toUpperCase().slice(0, 2);
                stateFull = STATE_MAPPING[stateAbbr] || parts[1];
                city = parts[0];
            } else {
                city = parts[0];
            }
        }

        // Clean occupation: remove common prefixes and suffixes
        const keywords = occupation
            .toLowerCase()
            .replace(/senior|junior|lead|staff|principal|sr\.|jr\.|ii|iii|iv|v/gi, '')
            .replace(/[^a-z\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2);

        if (keywords.length === 0) return [];

        // Special mapping: Engineer <-> Developer
        let searchKeywords = [...keywords];
        if (keywords.includes('engineer') && !keywords.includes('developer')) {
            // Replace engineer with developer for more aggressive matching in Strategy 1/2
            const engineerIdx = searchKeywords.indexOf('engineer');
            if (engineerIdx !== -1) searchKeywords[engineerIdx] = 'developer';
        }

        // Take top 2 most important keywords, prioritizing "software" or "data" if present
        let primaryKeywords = searchKeywords.slice(0, 2);
        if (searchKeywords.includes('software') && primaryKeywords[0] !== 'software') {
            primaryKeywords = ['software', ...searchKeywords.filter(k => k !== 'software').slice(0, 1)];
        }

        /**
         * Search Strategy:
         * 1. Exact-ish matches in specific location
         * 2. First primary keyword in specific location
         * 3. Exact-ish match in State
         * 4. Broad keyword match (Anywhere)
         */

        const runQuery = async (kws, area = null, state = null) => {
            let q = supabase
                .from('h1b_wage_data')
                .select('"Wage Level", "Hourly", "Yearly", "Occupation", "Area", "State"');

            // Apply keyword filters (AND join)
            kws.forEach(kw => {
                q = q.ilike('Occupation', `%${kw}%`);
            });

            if (state) q = q.ilike('State', `%${state}%`);
            if (area) q = q.ilike('Area', `%${area}%`);

            const { data, error } = await q.limit(3);
            return error ? [] : (data || []);
        };

        let results = [];

        // 1. Try Primary Keywords + City + State
        if (stateFull && city) {
            results = await runQuery(primaryKeywords, city, stateFull);
        }

        // 2. Try Primary Keywords + State
        if (results.length === 0 && stateFull) {
            results = await runQuery(primaryKeywords, null, stateFull);
        }

        // 3. Try First Keyword + State
        if (results.length === 0 && stateFull) {
            results = await runQuery([primaryKeywords[0]], null, stateFull);
        }

        // 4. Try Broad Match (Primary keywords only)
        if (results.length === 0) {
            results = await runQuery(primaryKeywords);
        }

        // 5. Absolute Fallback: First Keyword
        if (results.length === 0) {
            results = await runQuery([primaryKeywords[0]]);
        }

        // Post-process to standardize Level
        const mapLevel = (l) => {
            if (!l) return 'Lv 2';
            const val = l.toString().trim().toUpperCase();

            // Handle "MEAN" which often appears in H2B or special records
            if (val.includes('MEAN')) return 'Lv 2'; // Mean is usually interpreted as Level 2 equivalent

            if (val.includes('IV') || val === '4') return 'Lv 4';
            if (val.includes('III') || val === '3') return 'Lv 3';
            if (val.includes('II') || val === '2') return 'Lv 2';
            if (val.includes('I') || val === '1') return 'Lv 1';

            // Final fallback: if it's a number, use it, otherwise Lv 2
            const num = val.match(/\d/);
            return num ? `Lv ${num[0]}` : 'Lv 2';
        };

        const cleanSalary = (s) => {
            if (!s) return null;
            // Remove everything except digits
            return s.toString().replace(/[^0-9]/g, '');
        };

        const finalResults = (results || []).map(item => ({
            ...item,
            'Wage Level': mapLevel(item['Wage Level']),
            'Yearly': cleanSalary(item['Yearly']),
            'Hourly': cleanSalary(item['Hourly'])
        })).sort((a, b) => {
            // Sort by level number descending (Lv 4 before Lv 3, etc.)
            const levelA = parseInt(a['Wage Level'].match(/\d/)?.[0] || '0');
            const levelB = parseInt(b['Wage Level'].match(/\d/)?.[0] || '0');
            return levelB - levelA;
        });

        wageCache.set(cacheKey, finalResults);
        return finalResults;
    } catch (error) {
        console.error('Error fetching wage level:', error);
        return [];
    }
};

/**
 * Fetch wage level data with pagination (for admin/dashboard views)
 */
export const fetchWageData = async (page = 1, pageSize = 50, filters = {}) => {
    try {
        let query = supabase
            .from('h1b_wage_data')
            .select('*', { count: 'exact' });

        if (filters.occupation) {
            query = query.ilike('Occupation', `%${filters.occupation}%`);
        }
        if (filters.state) {
            query = query.ilike('State', `%${filters.state}%`);
        }
        if (filters.area) {
            query = query.ilike('Area', `%${filters.area}%`);
        }
        if (filters.wageLevel) {
            query = query.eq('Wage Level', filters.wageLevel);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to).order('Occupation', { ascending: true });

        const { data, error, count } = await query;

        if (error) throw error;
        return { data: data || [], total: count || 0, page, pageSize };
    } catch (error) {
        console.error('Error fetching wage data:', error);
        return { data: [], total: 0, page, pageSize };
    }
};

/**
 * Fetch synced audit reviews (from local cache)
 */
export const fetchAuditReviews = async (page = 1, pageSize = 50, filters = {}) => {
    try {
        let query = supabase
            .from('audit_reviews_sync')
            .select('*', { count: 'exact' });

        if (filters.company) {
            query = query.ilike('company', `%${filters.company}%`);
        }
        if (filters.decision) {
            query = query.eq('decision', filters.decision);
        }
        if (filters.jobId) {
            query = query.eq('job_id', filters.jobId);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to).order('audit_date', { ascending: false });

        const { data, error, count } = await query;

        if (error) throw error;
        return { data: data || [], total: count || 0, page, pageSize };
    } catch (error) {
        console.error('Error fetching audit reviews:', error);
        return { data: [], total: 0, page, pageSize };
    }
};

/**
 * Fetch synced sponsored jobs (from local cache)
 */
export const fetchSponsoredJobs = async (page = 1, pageSize = 50, filters = {}) => {
    try {
        let query = supabase
            .from('job_jobrole_sponsored_sync')
            .select('*', { count: 'exact' });

        if (filters.company) {
            query = query.ilike('company', `%${filters.company}%`);
        }
        if (filters.jobRole) {
            query = query.ilike('job_role_name', `%${filters.jobRole}%`);
        }
        if (filters.location) {
            query = query.ilike('location', `%${filters.location}%`);
        }
        if (filters.sponsored) {
            query = query.eq('sponsored_job', filters.sponsored);
        }

        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to).order('date_posted', { ascending: false });

        const { data, error, count } = await query;

        if (error) throw error;
        return { data: data || [], total: count || 0, page, pageSize };
    } catch (error) {
        console.error('Error fetching sponsored jobs:', error);
        return { data: [], total: 0, page, pageSize };
    }
};

/**
 * Get the last sync status for all tables
 */
export const getLastSyncStatus = async () => {
    try {
        const { data, error } = await supabase
            .from('sync_log')
            .select('*')
            .order('started_at', { ascending: false })
            .limit(10);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching sync status:', error);
        return [];
    }
};
