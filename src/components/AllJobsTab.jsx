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
    const level = job.wage_level ? parseInt(job.wage_level.match(/\d/)?.[0]) : null;
    const [hovered, setHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
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
                borderRadius: isMobile ? '16px' : '16px',
                border: '1.5px solid #ebebeb',
                padding: isMobile ? '16px' : '20px 24px',
                marginBottom: '12px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '12px' : '20px',
                transition: 'all 0.2s ease',
                boxShadow: hovered ? '0 6px 20px rgba(0,0,0,0.07)' : '0 1px 3px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Header Area for Mobile: Logo + Stat Cards */}
            {isMobile && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                    <LogoBox name={job.company} size={48} fontSize={16} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {/* Wage Card */}
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
                            <span style={{ fontSize: '15px', fontWeight: 900, color: '#fff', fontStyle: 'italic', lineHeight: 1 }}>{level ? `Lv ${level}` : 'N/A'}</span>
                            <span style={{ fontSize: '7px', fontWeight: 800, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.4px' }}>WAGE</span>
                        </div>

                        {/* Filings Card */}
                        {job.lca_filings > 0 && (
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
                                <Globe size={8} color="#718096" strokeWidth={3} style={{ marginBottom: '4px' }} />
                                <span style={{ fontSize: '15px', fontWeight: 900, color: '#fff', fontStyle: 'italic', lineHeight: 1 }}>{job.lca_filings.toLocaleString()}</span>
                                <span style={{ fontSize: '7px', fontWeight: 800, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.4px' }}>FILINGS</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Left side: Logo (Desktop Only) */}
            {!isMobile && (
                <div style={{ flexShrink: 0 }}>
                    <LogoBox name={job.company} size={60} fontSize={18} />
                </div>
            )}

            {/* Middle: Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 600, color: '#718096' }}>{job.company}</span>
                </div>

                {/* Row 2: Title */}
                <h3 style={{
                    fontSize: isMobile ? '16px' : '17px',
                    fontWeight: 800,
                    margin: '0 0 8px',
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
                        {job.title || 'Job Opening'}
                    </a>
                </h3>

                {/* Row 3: Meta Info (Location + Salary inline) */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} color="#94a3b8" />
                        <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>{job.location || 'United States'}</span>
                    </div>

                    {job.salary && (
                        <span style={{
                            fontSize: '11.5px',
                            fontWeight: 700,
                            color: '#24385E',
                            background: '#eef2f8',
                            borderRadius: '6px',
                            padding: '3px 10px',
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
                gap: isMobile ? '12px' : '12px',
                minWidth: isMobile ? '100%' : '260px',
                marginTop: isMobile ? '4px' : '0',
                borderLeft: isMobile ? 'none' : '1px solid #f1f5f9',
                paddingLeft: isMobile ? '0' : '20px'
            }}>
                {!isMobile && (
                    <div style={{ display: 'flex', gap: '10px', width: '100%', marginBottom: '8px' }}>
                        {/* Wage Level Card */}
                        <div style={{
                            background: '#1a2b4b',
                            borderRadius: '14px',
                            padding: '10px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            flex: 1,
                            boxShadow: '0 4px 12px rgba(26, 43, 75, 0.08)',
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
                            <span style={{ fontSize: '22px', fontWeight: 900, color: '#fff', fontStyle: 'italic', lineHeight: 1, letterSpacing: '0.4px' }}>{level ? `Lv ${level}` : 'N/A'}</span>
                            <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '3px' }}>WAGE LEVEL</span>
                        </div>

                        {/* Filings Card */}
                        {job.lca_filings > 0 && (
                            <div style={{
                                background: '#1a2b4b',
                                borderRadius: '14px',
                                padding: '10px 14px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                flex: 1,
                                boxShadow: '0 4px 12px rgba(26, 43, 75, 0.08)',
                            }}>
                                <Globe size={11} color="#718096" strokeWidth={2.5} style={{ marginBottom: '5px' }} />
                                <span style={{ fontSize: '22px', fontWeight: 900, color: '#fff', fontStyle: 'italic', lineHeight: 1, letterSpacing: '0.4px' }}>
                                    {job.lca_filings.toLocaleString()}
                                </span>
                                <span style={{ fontSize: '7.5px', fontWeight: 800, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.8px', marginTop: '3px' }}>LCA FILINGS</span>
                            </div>
                        )}
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
    const [levelFilter, setLevelFilter] = useState([]); // Array like ['Lv 1', 'Lv 2']
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
                // Fetch a larger window to ensure enough variety for the 2-per-company cycle
                .range(from, from + 500); 

            // Apply search filters to both queries
            if (search && search.trim()) {
                const words = search.trim().split(/\s+/).filter(w => w.length >= 1);
                const titleCond = `and(${words.map(w => `title.ilike.%${w}%`).join(',')})`;
                const roleCond = `and(${words.map(w => `job_role_name.ilike.%${w}%`).join(',')})`;
                rankedQuery = rankedQuery.or(`${titleCond},${roleCond}`);
                standardQuery = standardQuery.or(`${titleCond},${roleCond}`);
            }
            if (level && level.length > 0) {
                const expanded = level.flatMap(l => {
                    const n = l.match(/\d/)?.[0];
                    if (!n) return [l];
                    const roman = { '1': 'I', '2': 'II', '3': 'III', '4': 'IV' }[n];
                    return [l, `Level ${n}`, `Level ${roman}`, n, `Lv ${n}`, `Lv${n}`];
                });
                rankedQuery = rankedQuery.in('wage_level', expanded);
                standardQuery = standardQuery.in('wage_level', expanded);
            }

            // Phase 3: Fetch Verified roles (from audit_reviews tables)
            let vSync = supabase.from('audit_reviews_sync').select('*', { count: 'exact' }).eq('tl_confirmation', 'yes');
            let vBackup = supabase.from('audit_reviews_backup').select('*', { count: 'exact' }).eq('tl_confirmation', 'yes');

            if (search && search.trim()) {
                const words = search.trim().split(/\s+/).filter(w => w.length >= 1);
                if (words.length > 0) {
                    const roleCond = `and(${words.map(w => `role.ilike.%${w}%`).join(',')})`;
                    const domainCond = `and(${words.map(w => `domain.ilike.%${w}%`).join(',')})`;
                    vSync = vSync.or(`${roleCond},${domainCond}`);
                    vBackup = vBackup.or(`${roleCond},${domainCond}`);
                }
            }

            let syncRes, backupRes, rankedRes, standardRes;
            let actualVerifiedCount = 0;

            if (filter === 'verified') {
                [syncRes, backupRes, rankedRes, standardRes] = await Promise.all([
                    vSync.order('audit_date', { ascending: false }).limit(2500), 
                    vBackup.order('audit_date', { ascending: false }).limit(2500),
                    rankedQuery.limit(1000), 
                    standardQuery.limit(1000)
                ]);
                actualVerifiedCount = (syncRes.count || 0) + (backupRes.count || 0);
            } else {
                [syncRes, backupRes, rankedRes, standardRes] = await Promise.all([
                    vSync.limit(2500),
                    vBackup.limit(2500),
                    rankedQuery.limit(1000),
                    standardQuery.limit(2500)
                ]);
            }

            if (standardRes?.error) throw standardRes.error;

            const mapVerified = (r) => ({
                ...r,
                title: null, // Verified tables don't have a 'title' column; avoid using 'role' as title
                role: r.role,
                url: r.job_link,
                date_posted: r.audit_date,
                job_role_name: r.domain,
                isVerified: true,
                isTeaser: paymentStatus === 'pending',
                job_id: r.job_id // Removed || r.id fallback to allow proper deduplication
            });

            const verifiedJobs = [...(syncRes.data || []), ...(backupRes.data || [])].map(mapVerified);
            const vSet = verifiedSet || await getVerifiedSet();

            // ── Normalization Helpers ────────────────────────────────────────────────
            const _normR = (s) => String(s || '').toLowerCase()
                .replace(/[-–—]/g, ' ').replace(/\s+/g, ' ').trim();

            const _urlKey = (u) => {
                if (!u) return '';
                // Aggressively normalize URLs to catch duplicates even with slightly different formats
                let s = String(u).toLowerCase().trim();
                try {
                  const urlObj = new URL(s.startsWith('http') ? s : `https://${s}`);
                  return (urlObj.hostname + urlObj.pathname).replace(/^www\./, '').replace(/\/$/, '');
                } catch {
                  return s.split('?')[0].split('#')[0].replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
                }
            };

            // Job key for deduplication: STRICT Logical Identity (Company + Title + Location)
            const _jobKey = (j) => {
                const co = String(j.company || '').toLowerCase().trim();
                const ti = _normR(j.title || j.role || j.job_role_name || '');
                const lo = _normR(j.location || 'us');
                return `${co}||${ti}||${lo}`;
            };

            const _roleKey = (j) => {
                const co = String(j.company || '').toLowerCase().trim();
                const ro = _normR(j.job_role_name || j.role || '');
                return `${co}||${ro}`;
            };

            // ── Phase 4: DEEP FETCH sponsored metadata for ALL verified links ────────
            const vUrls = [...new Set(verifiedJobs.map(v => v.url))].filter(Boolean);
            let deepSponsored = [];
            if (vUrls.length > 0) {
                // Fetch in batches to guarantee we get the 'title' column for all verified cards
                for (let i = 0; i < vUrls.length; i += 100) {
                    const chunk = vUrls.slice(i, i + 100);
                    const { data: dData } = await supabase
                        .from('job_jobrole_sponsored_sync')
                        .select('*')
                        .in('url', chunk);
                    if (dData) deepSponsored.push(...dData);
                }
            }

            const sponsoredJobs = [
                ...(rankedRes.data || []),
                ...(standardRes.data || []),
                ...deepSponsored
            ].map(j => ({
                ...j,
                title: j.title, 
                job_id: j.id, 
                isVerified: j.isVerified || vSet.has(j.company) || false
            }));

            // ── Phase 5: Map deep-fetched titles BACK to verified records ────────────
            const deepMetadata = new Map();
            deepSponsored.forEach(s => {
                const uk = _urlKey(s.url);
                if (uk && !deepMetadata.has(uk)) deepMetadata.set(uk, s);
            });

            verifiedJobs.forEach(v => {
                const uk = _urlKey(v.url);
                const meta = deepMetadata.get(uk);
                if (meta) {
                    v.title = meta.title;
                    v.job_id = meta.id; 
                }
            });

            // Combine and merge deduplicated jobs using Logical Identity (Company + Title + Location)
            const uniqueMap = new Map();

            // 1. Process sponsored jobs (they have level/salary data)
            sponsoredJobs.forEach(j => {
                const jk = _jobKey(j);
                uniqueMap.set(jk, j);
            });

            // 2. Merge verified jobs (they have human-verified status)
            verifiedJobs.forEach(v => {
                const jk = _jobKey(v);
                const existing = uniqueMap.get(jk);
                if (existing) {
                    uniqueMap.set(jk, {
                        ...existing,
                        ...v, 
                        isVerified: true,
                        // Preserve richer sponsored data
                        wage_level: existing.wage_level || v.wage_level,
                        salary:     existing.salary     || v.salary,
                        title:      existing.title, // STRICT: Must come from 'title' column
                        job_id:     existing.job_id     || v.job_id,
                        url:        existing.url        || v.url || v.job_link
                    });
                } else {
                    uniqueMap.set(jk, v);
                }
            });

            let unique = Array.from(uniqueMap.values());

            // --- STRICT LEVEL FILTER (Post-merge) ---
            if (level && level.length > 0) {
                const allowedDigits = new Set(level.map(l => l.match(/\d/)?.[0]).filter(Boolean));
                unique = unique.filter(j => {
                    const jobLvlMatch = String(j.wage_level || '').match(/\d/);
                    let jobLvl = jobLvlMatch ? jobLvlMatch[0] : null;
                    if (!jobLvl) {
                       const s = String(j.wage_level || '').toUpperCase();
                       if (s.includes('IV')) jobLvl = '4';
                       else if (s.includes('III')) jobLvl = '3';
                       else if (s.includes('II')) jobLvl = '2';
                       else if (s.includes('I')) jobLvl = '1';
                    }
                    return jobLvl && allowedDigits.has(jobLvl);
                });
            }

            // Filter for Human Verified tab
            if (filter === 'verified') {
                unique = unique.filter(j => j.isVerified);
            }
            
            // ── Priority Interleaved Sorting (Page-Aligned Cycle) ──────────────────
            // 1. Group by Company
            const groups = new Map();
            unique.forEach(j => {
                const co = j.company || 'Unknown';
                if (!groups.has(co)) groups.set(co, []);
                groups.get(co).push(j);
            });

            // 2. Sort within each company pool (Recency/Salary Priority)
            groups.forEach(list => {
                list.sort((a,b) => {
                    const hasSal = (s) => s && s.includes('$');
                    if (hasSal(a.salary) && !hasSal(b.salary)) return -1;
                    if (!hasSal(a.salary) && hasSal(b.salary)) return 1;
                    return new Date(b.date_posted || 0) - new Date(a.date_posted || 0);
                });
            });

            // 3. Build Global Interleaved List for the fetched window
            const sortedCos = Array.from(groups.keys()).sort((a, b) => {
                const rA = getCompanyRank(a);
                const rB = getCompanyRank(b);
                if (rA !== rB) return rA - rB;
                return a.localeCompare(b);
            });

            let interleavedList = [];
            // Build the interleaved list for the whole window (500 items)
            for (let c = 0; c < 100; c++) { 
                let addedInCycle = 0;
                for (const co of sortedCos) {
                    const list = groups.get(co);
                    // Use c*2 to keep the 2-per-company pattern consistent
                    const chunk = list.slice(c * 2, (c * 2) + 2);
                    if (chunk.length > 0) {
                        interleavedList.push(...chunk);
                        addedInCycle++;
                    }
                }
                if (addedInCycle === 0) break;
            }

            unique = interleavedList;

            // Accurate total for pagination metadata (based on DATABASE counts)
            let actualTotal = unique.length;
            if (filter === 'all' && standardRes?.count) {
                actualTotal = standardRes.count;
            } else if (filter === 'verified') {
                actualTotal = actualVerifiedCount || 4971; // Use DB count or specified verified count
            }

            // Pagination slice: since we fetched a window tailored to 'from', 
            // the first items in our unique interleaved list are the ones for this page.
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
            setTotalJobs(actualTotal);
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
                        padding: isMobile ? '8px 14px' : '8px 16px', borderRadius: '10px',
                        fontSize: isMobile ? '12px' : '12.5px', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 200ms',
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
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: isMobile ? '8px 14px' : '8px 16px', borderRadius: '10px',
                        fontSize: isMobile ? '11px' : '12px', fontWeight: 800,
                        cursor: 'pointer', transition: 'all 200ms',
                        background: activeFilter === 'verified' ? '#f0fdf4' : '#fff',
                        color: activeFilter === 'verified' ? '#16a34a' : '#64748b',
                        border: '1.5px solid',
                        borderColor: activeFilter === 'verified' ? '#22c55e' : '#e2e8f0',
                        boxShadow: activeFilter === 'verified' ? '0 4px 10px rgba(34,197,94,0.1)' : 'none',
                        textTransform: 'uppercase', letterSpacing: '0.4px',
                    }}
                >
                    Human Verified
                    <VerifiedSeal size={13} />
                </button>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        flexShrink: 0,
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: isMobile ? '8px 12px' : '8px 16px', borderRadius: '10px',
                        fontSize: isMobile ? '12px' : '12.5px', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 200ms', border: '1.5px solid',
                        background: showFilters ? '#24385E' : '#fff',
                        color: showFilters ? '#fff' : '#64748b',
                        borderColor: showFilters ? '#24385E' : '#e2e8f0',
                    }}
                >
                    <SlidersHorizontal size={14} />
                    {!isMobile && `Filters ${levelFilter.length > 0 ? `(${levelFilter.length})` : ''}`}
                    {isMobile && levelFilter.length > 0 && <span style={{ fontSize: '10px', background: '#FDB913', color: '#111', borderRadius: '4px', padding: '1px 5px' }}>{levelFilter.length}</span>}
                </button>
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
                        <button
                            onClick={() => { setLevelFilter([]); setCurrentPage(1); }}
                            style={{
                                padding: '7px 16px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 800,
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                transition: 'all 200ms ease',
                                border: '1.5px solid',
                                borderColor: levelFilter.length === 0 ? '#24385E' : '#ebebeb',
                                background: levelFilter.length === 0 ? '#24385E' : '#fff',
                                color: levelFilter.length === 0 ? '#fff' : '#6b7280',
                                boxShadow: levelFilter.length === 0 ? '0 4px 12px rgba(36, 56, 94, 0.15)' : 'none',
                            }}
                        >
                            All Levels
                        </button>
                        {['Lv 1', 'Lv 2', 'Lv 3', 'Lv 4'].map((lv) => {
                            const active = levelFilter.includes(lv);
                            return (
                                <button
                                    key={lv}
                                    onClick={() => {
                                        setLevelFilter(prev =>
                                            active ? prev.filter(x => x !== lv) : [...prev, lv]
                                        );
                                        setCurrentPage(1);
                                    }}
                                    style={{
                                        padding: '7px 16px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: 800,
                                        whiteSpace: 'nowrap',
                                        cursor: 'pointer',
                                        transition: 'all 200ms ease',
                                        border: '1.5px solid',
                                        borderColor: active ? '#24385E' : '#ebebeb',
                                        background: active ? '#24385E' : '#fff',
                                        color: active ? '#fff' : '#6b7280',
                                        boxShadow: active ? '0 4px 12px rgba(36, 56, 94, 0.15)' : 'none',
                                    }}
                                >
                                    {lv}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Search row ── */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ position: 'relative' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        background: (showSuggestions && filteredSuggestions.length > 0) ? '#24385E' : '#f8f9fb',
                        border: (showSuggestions && filteredSuggestions.length > 0) ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid #dde1e7',
                        borderRadius: (showSuggestions && filteredSuggestions.length > 0) ? '20px 20px 0 0' : '14px',
                        padding: '0 8px 0 18px', height: '54px',
                        boxShadow: (showSuggestions && filteredSuggestions.length > 0) ? 'none' : '0 1px 4px rgba(0,0,0,0.04)',
                        position: 'relative', zIndex: 2010,
                        transition: 'all 0.2s'
                    }}>
                        <Search size={18} color="#94a3b8" style={{ flexShrink: 0 }} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onFocus={() => {
                                if (searchTerm.trim().length > 0) setShowSuggestions(true);
                            }}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                            onKeyDown={e => e.key === 'Enter' && fetchJobs(1, activeFilter, searchTerm, levelFilter)}
                            placeholder="Search for roles (e.g. Data Engineer)..."
                            style={{
                                border: 'none',
                                outline: 'none',
                                fontSize: '14.5px',
                                color: (showSuggestions && filteredSuggestions.length > 0) ? '#fff' : '#1e293b',
                                background: 'transparent',
                                flex: 1,
                                minWidth: 0,
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
                                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px', flexShrink: 0 }}
                            >
                                <X size={16} color="#94a3b8" />
                            </button>
                        )}
                        {/* Small inline Search button */}
                        <button
                            onClick={() => fetchJobs(1, activeFilter, searchTerm, levelFilter)}
                            style={{
                                flexShrink: 0,
                                height: '40px',
                                padding: '0 20px',
                                borderRadius: '10px',
                                background: '#24385E',
                                color: '#fff',
                                fontSize: '13.5px',
                                fontWeight: 700,
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 200ms',
                                boxShadow: '0 2px 8px rgba(36, 56, 94, 0.3)',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '7px',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = '#1a2b4b'}
                            onMouseLeave={e => e.currentTarget.style.background = '#24385E'}
                        >
                            <Search size={14} />
                            Search
                        </button>
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: '#24385E',
                            borderRadius: '20px',
                            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                            zIndex: 2000,
                            overflow: 'hidden',
                            border: '1px solid rgba(255,255,255,0.1)',
                            animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            paddingTop: '58px'
                        }}>
                            <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.1)' }}>
                                {filteredSuggestions.map((role) => (
                                    <div
                                        key={role}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setSearchTerm(role);
                                            setDebouncedSearch(role);
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
                                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                    >
                                        <Search size={16} color="#94a3b8" />
                                        <span style={{ fontWeight: 400 }}>{role}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
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
                            key={`${job.id || job.url || 'job'}_${i}`}
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
