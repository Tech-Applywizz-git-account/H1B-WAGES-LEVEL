import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { externalSupabase } from '../externalSupabaseClient';
import useAuth from '../hooks/useAuth';
import LogoBox from './LogoBox';
import { fetchJobRoles, filterRoles } from '../utils/rolesSuggestions';
import {
    ChevronLeft, ChevronRight, Search, Loader2, AlertCircle,
    Briefcase, ExternalLink, MapPin, Clock, Star, Bookmark, BookmarkCheck,
    SlidersHorizontal, X, Globe
} from 'lucide-react';
import { isFamous, getCompanyRank, RANKED_COMPANIES } from '../utils/famousCompanies';

const JOBS_PER_PAGE = 15;

// ── Verified seal SVG ──────────────────────────────────────────────────────
const VerifiedSeal = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <path d="M50 4 L57 16 L70 10 L70 24 L84 24 L78 37 L91 44 L81 55 L88 68 L74 69 L70 83 L57 78 L50 90 L43 78 L30 83 L26 69 L12 68 L19 55 L9 44 L22 37 L16 24 L30 24 L30 10 L43 16 Z" fill="#22c55e" />
        <polyline points="33,52 44,63 68,38" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// ── Job Row ────────────────────────────────────────────────────────────────
const JobRow = ({ job, isSaved, onSave }) => {
    const level = parseInt(job.wage_level?.match(/\d/)?.[0] || '2');
    const [hovered, setHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const formatDate = (d) => {
        if (!d) return 'Recently';
        try {
            const dt = new Date(d), now = new Date();
            const days = Math.floor((now - dt) / 864e5);
            if (days === 0) return 'Today';
            if (days === 1) return '1d ago';
            if (days < 7) return `${days}d ago`;
            return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch { return 'Recently'; }
    };

    return (
        <div
            style={{
                background: '#fff',
                borderRadius: isMobile ? '16px' : '20px',
                border: '1.2px solid #f1f5f9',
                padding: isMobile ? '16px' : '18px 24px',
                marginBottom: '12px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '12px' : '20px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: hovered ? '0 10px 25px rgba(0,0,0,0.05)' : '0 1px 3px rgba(0,0,0,0.01)',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Header Area for Mobile: Logo + Wage Trail */}
            {isMobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <LogoBox name={job.company} size={48} fontSize={16} />
                    <div style={{
                        background: '#1a2b4b',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        minWidth: '70px',
                        boxShadow: '0 4px 12px rgba(26, 43, 75, 0.1)'
                    }}>
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '2px' }}>
                            {[1, 2, 3, 4].map(i => (
                                <Star key={i} size={8}
                                    fill={i <= level ? '#FDB913' : 'none'}
                                    color={i <= level ? '#FDB913' : '#3d4d6b'}
                                    strokeWidth={3}
                                />
                            ))}
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 900, color: '#fff', fontStyle: 'italic', lineHeight: 1 }}>Lv {level}</span>
                        <span style={{ fontSize: '7px', fontWeight: 800, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.4px' }}>WAGE</span>
                    </div>
                </div>
            )}

            {/* Left side: Logo (Desktop Only) */}
            {!isMobile && (
                <div style={{ flexShrink: 0 }}>
                    <LogoBox name={job.company} size={56} fontSize={18} />
                </div>
            )}

            {/* Middle: Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 600, color: '#718096' }}>{job.company}</span>
                    {job.lca_filings > 0 && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#f1f5f9',
                            padding: '3px 10px',
                            borderRadius: '8px',
                            fontSize: '11.5px',
                            fontWeight: 800,
                            color: '#24385E'
                        }}>
                            <Globe size={13} strokeWidth={2.5} />
                            {job.lca_filings.toLocaleString()} Filings
                        </div>
                    )}
                </div>

                {/* Row 2: Title */}
                <h3 style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 800,
                    margin: '0 0 6px',
                    lineHeight: 1.25,
                    letterSpacing: '-0.2px'
                }}>
                    <a
                        href={job.url || job.apply_url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#111', textDecoration: 'none', transition: 'color 150ms ease' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#FDB913'}
                        onMouseLeave={e => e.currentTarget.style.color = '#111'}
                        onClick={e => { if (!job.url && !job.apply_url) e.preventDefault(); }}
                    >
                        {job.title || job.job_role_name || 'Job Position'}
                    </a>
                </h3>

                {/* Row 3: Meta Info (Location + Exp) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="#94a3b8" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{job.location || 'United States'}</span>
                    </div>

                    {job.salary && (
                        <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#24385E',
                            background: '#f1f5f9',
                            borderRadius: '8px',
                            padding: '4px 12px',
                            display: 'inline-flex',
                            alignItems: 'center'
                        }}>
                            {job.salary}
                        </span>
                    )}
                </div>

                {/* Row 4: Verified Badge */}
                {job.isVerified && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#f0fdf4',
                        color: '#16a34a',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        border: '1px solid #dcfce7',
                        fontSize: '10px',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px'
                    }}>
                        HUMAN VERIFIED <VerifiedSeal size={13} />
                    </div>
                )}
            </div>

            {/* Right side: Wage trail (Desktop) + Action */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                alignItems: 'center',
                justifyContent: isMobile ? 'flex-end' : 'center',
                gap: isMobile ? '12px' : '16px',
                minWidth: isMobile ? '100%' : '180px',
                marginTop: isMobile ? '4px' : '0',
                borderLeft: isMobile ? 'none' : '1px solid #f1f5f9',
                paddingLeft: isMobile ? '0' : '24px'
            }}>
                {!isMobile && (
                    <div style={{
                        background: '#1a2b4b',
                        borderRadius: '14px',
                        padding: '10px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        boxShadow: '0 4px 12px rgba(26, 43, 75, 0.08)',
                        marginBottom: '4px'
                    }}>
                        <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
                            {[1, 2, 3, 4].map(i => (
                                <Star key={i} size={11}
                                    fill={i <= level ? '#FDB913' : 'none'}
                                    color={i <= level ? '#FDB913' : '#3d4d6b'}
                                    strokeWidth={2.5}
                                />
                            ))}
                        </div>
                        <span style={{ fontSize: '22px', fontWeight: 900, color: '#fff', fontStyle: 'italic', lineHeight: 1, letterSpacing: '0.4px' }}>Lv {level}</span>
                        <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '3px' }}>WAGE LEVEL</span>
                    </div>
                )}

                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'row',
                    gap: '10px',
                    width: '100%',
                    alignItems: 'center'
                }}>
                    <a
                        href={job.url || job.apply_url || '#'}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                            flex: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: isMobile ? '12px 18px' : '10px 18px',
                            borderRadius: '12px',
                            background: '#FDB913',
                            color: '#111',
                            fontSize: '13.5px',
                            fontWeight: 800,
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            boxShadow: '0 3px 10px rgba(253, 185, 19, 0.15)',
                        }}
                    >
                        Apply <ExternalLink size={14} />
                    </a>

                    <button
                        onClick={() => onSave(job)}
                        style={{
                            padding: isMobile ? '14px' : '12px',
                            borderRadius: '14px',
                            background: '#fff',
                            border: '1.5px solid #e2e8f0',
                            color: isSaved ? '#FDB913' : '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            flexShrink: 0
                        }}
                    >
                        {isSaved ? <BookmarkCheck size={18} fill="#FDB913" /> : <Bookmark size={18} />}
                    </button>
                </div>
            </div>
        </div>
    );
};

// SUGGESTED_ROLES is now fetched dynamically from Supabase via rolesSuggestions utility

// ── Main Component ─────────────────────────────────────────────────────────
const AllJobsTab = () => {
    const { user, paymentStatus } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [levelFilter, setLevelFilter] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [savedJobIds, setSavedJobIds] = useState(new Set());
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [allRoles, setAllRoles] = useState([]);
    const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Load job roles from Supabase on mount (cached globally)
    useEffect(() => {
        fetchJobRoles().then(setAllRoles);
    }, []);

    const [verifiedSet, setVerifiedSet] = useState(null); // cache Set of confirmed company names
    const searchTimer = useRef(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // ── Realtime: refresh verified set whenever a new row is inserted in audit_reviews_backup
    useEffect(() => {
        const channel = supabase
            .channel('audit_reviews_backup_changes')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'audit_reviews_backup' },
                (payload) => {
                    // Only refresh if the new row has tl_confirmation = 'yes'
                    if (payload?.new?.tl_confirmation === 'yes') {
                        // Clear caches so next fetch gets fresh data
                        window._confirmedCompaniesCache = null;
                        setVerifiedSet(null); // triggers re-fetch via getVerifiedSet
                    }
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, []);

    const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

    // Debounce search (only for Supabase querying)
    useEffect(() => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);
        return () => clearTimeout(searchTimer.current);
    }, [searchTerm]);

    // Load saved job IDs and pre-load verified set
    useEffect(() => {
        const init = async () => {
            if (user) {
                await new Promise(r => setTimeout(r, 150));
                const { data } = await supabase.from('saved_jobs').select('job_id').eq('user_id', user.id);
                if (data) setSavedJobIds(new Set(data.map(r => String(r.job_id))));
            }
            await getVerifiedSet(); // Pre-load confirmed companies for "isVerified" badges
            setIsInitialLoadDone(true);
        };
        init();
    }, [user]);

    // Load confirmed companies (runs once per session, cached in verifiedSet state)
    const getVerifiedSet = async () => {
        if (verifiedSet) return verifiedSet;
        // Use window cache if available
        if (window._confirmedCompaniesCache) {
            const s = new Set(window._confirmedCompaniesCache);
            setVerifiedSet(s);
            return s;
        }

        const fetchNames = async (tableName) => {
            const names = [];
            let pg = 0;
            while (true) {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('company')
                    .eq('tl_confirmation', 'yes')
                    .range(pg * 1000, (pg + 1) * 1000 - 1);
                if (error || !data || data.length === 0) break;
                data.forEach(r => r.company && names.push(r.company));
                if (data.length < 1000) break;
                pg++;
            }
            return names;
        };

        // Fetch from BOTH local sync and backup tables
        const [syncNames, backupNames] = await Promise.all([
            fetchNames('audit_reviews_sync'),
            fetchNames('audit_reviews_backup')
        ]);

        // Deduplicate across both tables — no duplicate company names
        const unique = Array.from(new Set([...syncNames, ...backupNames])).filter(Boolean);
        window._confirmedCompaniesCache = unique;
        const s = new Set(unique);
        setVerifiedSet(s);
        return s;
    };

    // Main fetch function
    const fetchJobs = async (page, filter, search, level = 'all') => {
        setLoading(true);
        setError(null);
        try {
            const from = (page - 1) * JOBS_PER_PAGE;

            // Phase 1: Fetch TOP Ranked companies explicitly to ensure they are available for sorting
            const topTier = RANKED_COMPANIES.slice(0, 100);
            let rankedQuery = supabase
                .from('job_jobrole_sponsored_sync')
                .select('*')
                .in('company', topTier)
                .limit(200);

            // Phase 2: Fetch Recent sponsored jobs (the standard feed)
            let standardQuery = supabase
                .from('job_jobrole_sponsored_sync')
                .select('*', { count: 'exact' })
                .order('date_posted', { ascending: false })
                .range(from, from + 100);

            // Apply search filters to both queries
            if (search && search.trim()) {
                const words = search.trim().split(/\s+/).filter(w => w.length >= 1);
                const titleCond = `and(${words.map(w => `title.ilike.%${w}%`).join(',')})`;
                const roleCond = `and(${words.map(w => `job_role_name.ilike.%${w}%`).join(',')})`;
                rankedQuery = rankedQuery.or(`${titleCond},${roleCond}`);
                standardQuery = standardQuery.or(`${titleCond},${roleCond}`);
            }
            if (level !== 'all') {
                rankedQuery = rankedQuery.eq('wage_level', level);
                standardQuery = standardQuery.eq('wage_level', level);
            }

            // Phase 3: Fetch Verified roles (from audit_reviews tables)
            let vSync = supabase.from('audit_reviews_sync').select('*').eq('tl_confirmation', 'yes');
            let vBackup = supabase.from('audit_reviews_backup').select('*').eq('tl_confirmation', 'yes');

            if (search && search.trim()) {
                const w = search.trim().split(/\s+/)[0];
                vSync = vSync.ilike('role', `%${w}%`);
                vBackup = vBackup.ilike('role', `%${w}%`);
            }

            const [syncRes, backupRes, rankedRes, standardRes] = await Promise.all([
                vSync.limit(50),
                vBackup.limit(50),
                rankedQuery,
                standardQuery
            ]);

            if (standardRes.error) throw standardRes.error;

            const mapVerified = (r) => ({
                ...r,
                title: r.role,
                url: r.job_link,
                date_posted: r.audit_date,
                job_role_name: r.domain,
                isVerified: true,
                isTeaser: paymentStatus === 'pending',
                job_id: r.job_id // Removed || r.id fallback to allow proper deduplication
            });

            const verifiedJobs = [...(syncRes.data || []), ...(backupRes.data || [])].map(mapVerified);
            const vSet = verifiedSet || await getVerifiedSet();

            // Combine all sponsored jobs (ranked and standard) and mark them as verified if their company is in vSet
            const sponsoredJobs = [
                ...(rankedRes.data || []),
                ...(standardRes.data || [])
            ].map(j => ({
                ...j,
                job_id: j.id, // Ensure sponsored jobs have job_id for consistent deduplication
                isVerified: j.isVerified || vSet.has(j.company) || false
            }));

            // Combine and deduplicate
            let combined = [...verifiedJobs, ...sponsoredJobs];

            // Filter for Human Verified tab
            if (filter === 'verified') {
                combined = combined.filter(j => j.isVerified);
            }

            const seen = new Set();
            let unique = combined.filter(j => {
                // Robust deduplication: Priority to job_id (stringified), fallback to composite URL+Title
                // Normalizing to string ensures that numbers and strings are treated the same
                const k = j.job_id ? String(j.job_id) : `${j.url || ''}_${j.title || ''}`;
                if (!k || k === '_' || seen.has(k)) return false;
                seen.add(k);
                return true;
            });

            // --- THE MASTER SORT: Salary First, then Recency ---
            unique.sort((a, b) => {
                // 1. Salary existence (Strict check for real salary values)
                const hasSal = (s) => s && s.includes('$');
                const aSal = hasSal(a.salary);
                const bSal = hasSal(b.salary);

                if (aSal && !bSal) return -1;
                if (!aSal && bSal) return 1;

                // 2. Recency (Tie-breaker for same salary status)
                const dateA = new Date(a.date_posted || 0).getTime();
                const dateB = new Date(b.date_posted || 0).getTime();
                if (dateB !== dateA) return dateB - dateA;

                // 3. Company Rank (Final tie-breaker)
                const rankA = getCompanyRank(a.company);
                const rankB = getCompanyRank(b.company);
                return rankA - rankB;
            });

            // Pagination from the sorted pool
            const pagedResults = unique.slice(0, JOBS_PER_PAGE);

            // Fetch LCA Filings for these companies to show on cards
            const companyNames = [...new Set(pagedResults.map(j => j.company))].filter(Boolean);
            if (companyNames.length > 0) {
                // Fetch all potential matches by fetching more or using fuzzy match
                // For simplicity and speed, we'll fetch exact matches first,
                // and if some are missing, we'll try a normalized match later or handle it in JS.
                const { data: filingsData } = await supabase
                    .from('h1b_sponsor_finder')
                    .select('Company, "LCA Filings"')
                    .or(companyNames.map(n => `Company.ilike.%${n}%`).join(','));
                if (filingsData) {
                    const normalize = (name) => name?.toLowerCase().replace(/[\.,]/g, ' ').replace(/\b(inc|llc|corp|ltd|co|services|com|systems|technologies)\b/g, ' ').replace(/\s+/g, ' ').trim() || '';

                    const filingMap = {};
                    filingsData.forEach(f => {
                        const norm = normalize(f.Company);
                        filingMap[f.Company.toLowerCase()] = f["LCA Filings"];
                        if (norm && !filingMap[norm]) filingMap[norm] = f["LCA Filings"];
                    });

                    const filingKeys = Object.keys(filingMap);

                    pagedResults.forEach(j => {
                        const jLower = j.company?.toLowerCase() || '';
                        const jNorm = normalize(j.company);

                        // 1. Try exact match
                        let count = filingMap[jLower] || filingMap[jNorm] || 0;

                        // 2. Try partial match if still 0
                        if (count === 0 && jNorm) {
                            const bestKey = filingKeys.find(k => k.includes(jNorm) || jNorm.includes(k));
                            if (bestKey) count = filingMap[bestKey];
                        }

                        const parseCount = (val) => {
                            if (typeof val === 'number') return val;
                            if (!val) return 0;
                            return parseInt(String(val).replace(/,/g, '')) || 0;
                        };

                        j.lca_filings = parseCount(count);
                    });
                }
            }

            setJobs(pagedResults);
            setTotalJobs((standardRes.count || 0) + (filter !== 'verified' ? verifiedJobs.length : 0));
            setCurrentPage(page);
        } catch (err) {
            console.error('AllJobsTab fetchJobs error:', err);
            setError(err.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    // Trigger fetch when search or filter changes
    useEffect(() => {
        if (isInitialLoadDone) {
            fetchJobs(1, activeFilter, debouncedSearch, levelFilter);
        }
    }, [activeFilter, debouncedSearch, levelFilter, isInitialLoadDone]);

    const handlePageChange = (newPage) => {
        fetchJobs(newPage, activeFilter, debouncedSearch, levelFilter);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchTerm(val);
        setCurrentPage(1);

        if (val.trim().length > 0) {
            const filtered = filterRoles(allRoles, val, 8);
            setFilteredSuggestions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSave = async (job) => {
        if (!user) return;
        const jobId = String(job.id || job.job_id || '');
        const isSaved = savedJobIds.has(jobId);
        setSavedJobIds(prev => {
            const s = new Set(prev);
            if (isSaved) s.delete(jobId); else s.add(jobId);
            return s;
        });
        try {
            if (isSaved) {
                await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', jobId);
            } else {
                await supabase.from('saved_jobs').insert([{ user_id: user.id, job_id: jobId, job_data: job }]);
            }
        } catch (err) { console.error('Save error:', err); }
    };

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) pages.push(i);
                pages.push('...', totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1, '...');
                for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    return (
        <div style={{ fontFamily: 'inherit' }}>
            {/* ── Header ── */}
            <div style={{ marginBottom: '14px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#24385E', margin: '0 0 2px' }}>All Sponsored Jobs</h2>
                <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: 0, fontWeight: 500 }}>
                    {loading ? 'Loading...' : `${totalJobs.toLocaleString()} job${totalJobs !== 1 ? 's' : ''} available`}
                </p>
            </div>

            {/* ── Filter Tabs ── */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '12px',
                marginBottom: '16px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }} className="no-scrollbar">
                <button
                    onClick={() => { setActiveFilter('all'); setCurrentPage(1); }}
                    style={{
                        flexShrink: 0,
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 200ms', border: 'none',
                        background: activeFilter === 'all' ? '#24385E' : '#fff',
                        color: activeFilter === 'all' ? '#fff' : '#64748b',
                        boxShadow: activeFilter === 'all' ? '0 4px 10px rgba(36, 56, 94, 0.15)' : '0 1px 2px rgba(0,0,0,0.05)',
                        border: '1.5px solid',
                        borderColor: activeFilter === 'all' ? '#24385E' : '#e2e8f0',
                    }}
                >
                    <Briefcase size={14} />
                    All Jobs
                </button>

                <button
                    onClick={() => { setActiveFilter('verified'); setCurrentPage(1); }}
                    style={{
                        flexShrink: 0,
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: 800,
                        cursor: 'pointer', transition: 'all 200ms', border: 'none',
                        background: activeFilter === 'verified' ? '#f0fdf4' : '#fff',
                        color: activeFilter === 'verified' ? '#16a34a' : '#64748b',
                        border: '1.5px solid',
                        borderColor: activeFilter === 'verified' ? '#22c55e' : '#e2e8f0',
                        boxShadow: activeFilter === 'verified' ? '0 4px 10px rgba(34,197,94,0.1)' : 'none',
                        textTransform: 'uppercase', letterSpacing: '0.4px',
                    }}
                >
                    Human Verified
                    <VerifiedSeal size={15} />
                </button>

                {!isMobile && (
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            flexShrink: 0,
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '8px 16px', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700,
                            cursor: 'pointer', transition: 'all 200ms', border: '1.5px solid',
                            background: showFilters ? '#24385E' : '#fff',
                            color: showFilters ? '#fff' : '#64748b',
                            borderColor: showFilters ? '#24385E' : '#e2e8f0',
                        }}
                    >
                        <SlidersHorizontal size={14} />
                        Filters {levelFilter !== 'all' ? `(${levelFilter})` : ''}
                    </button>
                )}
            </div>

            {/* ── Level Filter Row (Collapsed inside Filter Option) ── */}
            {showFilters && (
                <div style={{
                    marginBottom: '20px', padding: '16px', background: '#fcfcfc',
                    borderRadius: '12px', border: '1.5px solid #efefef',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#24385E', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Wage Trail</p>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }} className="no-scrollbar">
                        {['all', 'Lv 1', 'Lv 2', 'Lv 3', 'Lv 4'].map((lv) => (
                            <button
                                key={lv}
                                onClick={() => { setLevelFilter(lv); setCurrentPage(1); }}
                                style={{
                                    padding: '7px 16px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer',
                                    transition: 'all 200ms ease',
                                    border: '1.5px solid',
                                    borderColor: levelFilter === lv ? '#24385E' : '#ebebeb',
                                    background: levelFilter === lv ? '#24385E' : '#fff',
                                    color: levelFilter === lv ? '#fff' : '#6b7280',
                                    boxShadow: levelFilter === lv ? '0 4px 12px rgba(36, 56, 94, 0.15)' : 'none',
                                }}
                            >
                                {lv === 'all' ? 'All  Levels' : lv}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Search row ── */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: '12px',
                marginBottom: '16px'
            }}>
                <div style={{
                    flex: 1, position: 'relative'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: (showSuggestions && filteredSuggestions.length > 0) ? '#24385E' : '#fff',
                        border: (showSuggestions && filteredSuggestions.length > 0) ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid #e2e8f0',
                        borderRadius: (showSuggestions && filteredSuggestions.length > 0) ? '20px 20px 0 0' : '40px',
                        padding: '0 16px', height: isMobile ? '48px' : '48px',
                        boxShadow: (showSuggestions && filteredSuggestions.length > 0) ? 'none' : '0 1px 3px rgba(0,0,0,0.05)',
                        position: 'relative', zIndex: 2010,
                        transition: 'all 0.2s'
                    }}>
                        <Search size={18} color={(showSuggestions && filteredSuggestions.length > 0) ? '#94a3b8' : '#94a3b8'} style={{ flexShrink: 0 }} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => {
                                if (searchTerm.trim().length > 0) setShowSuggestions(true);
                            }}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            onKeyDown={e => e.key === 'Enter' && fetchJobs(1, activeFilter, searchTerm, levelFilter)}
                            placeholder={isMobile ? "Search roles..." : "Search for roles (e.g. Data Engineer)..."}
                            style={{
                                border: 'none',
                                outline: 'none',
                                fontSize: '14px',
                                color: (showSuggestions && filteredSuggestions.length > 0) ? '#fff' : '#1e293b',
                                background: 'transparent',
                                width: '100%',
                                fontWeight: 500,
                                transition: 'all 0.2s'
                            }}
                        />
                        {searchTerm.length > 0 && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilteredSuggestions([]);
                                    setShowSuggestions(false);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                            >
                                <X size={20} color={(showSuggestions && filteredSuggestions.length > 0) ? '#94a3b8' : '#94a3b8'} />
                            </button>
                        )}
                    </div>

                    {/* Suggestions Dropdown (Google Chrome Style) */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: '#24385E',
                            borderRadius: '24px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            zIndex: 2000,
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)',
                            animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            paddingTop: isMobile ? '56px' : '52px'
                        }}>
                            <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
                                {filteredSuggestions.map((role, idx) => {
                                    const searchLower = searchTerm.toLowerCase();
                                    const roleLower = role.toLowerCase();
                                    const matchIdx = roleLower.indexOf(searchLower);

                                    return (
                                        <div
                                            key={role}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                setSearchTerm(role);
                                                setDebouncedSearch(role); // Instant update on select
                                                setShowSuggestions(false);
                                                fetchJobs(1, activeFilter, role, levelFilter);
                                            }}
                                            style={{
                                                padding: '10px 18px',
                                                cursor: 'pointer',
                                                fontSize: '14px',
                                                color: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                transition: 'all 0.15s ease',
                                                background: 'transparent'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }}
                                        >
                                            <Search size={16} color="#94a3b8" />
                                            <span style={{ fontWeight: 400 }}>
                                                {role}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            flex: 1,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                            padding: '0 16px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                            height: isMobile ? '48px' : '48px', cursor: 'pointer', transition: 'all 200ms', border: '1.5px solid',
                            borderColor: showFilters ? '#24385E' : '#e2e8f0',
                            background: showFilters ? '#24385E' : '#fff',
                            color: showFilters ? '#fff' : '#64748b',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                            minWidth: isMobile ? '0' : '120px'
                        }}
                    >
                        <SlidersHorizontal size={15} />
                        Filters
                    </button>

                    <button
                        onClick={() => fetchJobs(1, activeFilter, searchTerm, levelFilter)}
                        style={{
                            flex: 1,
                            padding: '0 24px', borderRadius: '12px', background: '#24385E',
                            color: '#fff', fontSize: '13px', fontWeight: 800, border: 'none',
                            height: isMobile ? '48px' : '48px', cursor: 'pointer', transition: 'all 200ms',
                            boxShadow: '0 4px 10px rgba(36, 56, 94, 0.15)',
                        }}
                    >
                        Search
                    </button>
                </div>
            </div>

            {/* ── Verified filter banner ── */}
            {activeFilter === 'verified' && !loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', fontSize: '13px', color: '#16a34a', fontWeight: 600, marginBottom: '14px' }}>
                    <VerifiedSeal size={14} />
                    Showing jobs from <strong style={{ marginLeft: '4px' }}>Human-Verified H-1B sponsoring companies</strong>
                </div>
            )}

            {/* ── Loading ── */}
            {loading && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
                    <div style={{ textAlign: 'center' }}>
                        <Loader2 style={{ width: 32, height: 32, color: '#24385E', animation: 'spin 1s linear infinite', margin: '0 auto 10px', display: 'block' }} />
                        <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>Loading jobs…</p>
                    </div>
                </div>
            )}

            {/* ── Error ── */}
            {error && !loading && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                    <AlertCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '1px' }} />
                    <div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#991b1b', margin: '0 0 6px' }}>Error loading jobs</p>
                        <p style={{ fontSize: '12px', color: '#b91c1c', margin: '0 0 10px' }}>{error}</p>
                        <button onClick={() => fetchJobs(currentPage, activeFilter, debouncedSearch, levelFilter)} style={{ padding: '5px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>Retry</button>
                    </div>
                </div>
            )}

            {/* ── Empty ── */}
            {!loading && !error && jobs.length === 0 && (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <Briefcase size={40} color="#e0e0e0" style={{ margin: '0 auto 12px', display: 'block' }} />
                    <p style={{ fontSize: '15px', fontWeight: 600, color: '#555', margin: '0 0 4px' }}>No jobs found</p>
                    <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>{searchTerm ? 'Try a different search term' : 'No jobs available right now'}</p>
                </div>
            )}

            {/* ── Job List ── */}
            {!loading && !error && jobs.length > 0 && (
                <>
                    {jobs.map((job, i) => (
                        <JobRow
                            key={job.id || job.url || i}
                            job={{
                                ...job,
                                isVerified: job._verified || verifiedSet?.has(job.company)
                            }}
                            isSaved={savedJobIds.has(String(job.id || job.job_id || ''))}
                            onSave={handleSave}
                        />
                    ))}

                    {/* ── Pagination ── */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginTop: '24px',
                            paddingTop: '20px',
                            borderTop: '1px solid #f1f5f9',
                            gap: isMobile ? '16px' : '0'
                        }}>
                            <span style={{ fontSize: '13px', color: '#718096', fontWeight: 500 }}>
                                Page {currentPage} of {totalPages.toLocaleString()}
                            </span>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', overflowX: 'auto', maxWidth: '100%', padding: '4px' }} className="no-scrollbar">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1, display: 'flex', alignItems: 'center' }}
                                >
                                    <ChevronLeft size={16} />
                                </button>

                                {getPageNumbers().map((pg, idx) =>
                                    pg === '...' ? (
                                        <span key={`e${idx}`} style={{ padding: '0 4px', color: '#cbd5e0', fontSize: '14px' }}>…</span>
                                    ) : (
                                        <button
                                            key={pg}
                                            onClick={() => handlePageChange(pg)}
                                            style={{
                                                padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                                                cursor: 'pointer', minWidth: '36px', textAlign: 'center', transition: 'all 0.2s',
                                                border: '1.5px solid',
                                                borderColor: currentPage === pg ? '#24385E' : '#e2e8f0',
                                                background: currentPage === pg ? '#24385E' : '#fff',
                                                color: currentPage === pg ? '#fff' : '#64748b'
                                            }}
                                        >
                                            {pg}
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.3 : 1, display: 'flex', alignItems: 'center' }}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default AllJobsTab;
