import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { externalSupabase } from '../externalSupabaseClient';
import useAuth from '../hooks/useAuth';
import LogoBox from './LogoBox';
import { fetchJobRoles, filterRoles } from '../utils/rolesSuggestions';
import {
    ChevronLeft, ChevronRight, Search, Loader2, AlertCircle,
    Briefcase, ExternalLink, MapPin, Clock, Star, Bookmark, BookmarkCheck,
    SlidersHorizontal, X
} from 'lucide-react';
import { isFamous } from '../utils/famousCompanies';

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
                borderRadius: isMobile ? '16px' : '22px',
                border: '1.2px solid #f1f5f9',
                padding: isMobile ? '16px' : '24px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                alignItems: isMobile ? 'stretch' : 'center',
                gap: isMobile ? '12px' : '24px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: hovered ? '0 12px 30px rgba(0,0,0,0.06)' : '0 2px 4px rgba(0,0,0,0.01)',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Header Area for Mobile: Logo + Wage Level */}
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
                        <span style={{ fontSize: '18px', fontWeight: 900, color: '#fff', fontStyle: 'italic', lineHeight: 1 }}>Lv {level}</span>
                        <span style={{ fontSize: '7px', fontWeight: 800, color: '#718096', textTransform: 'uppercase', letterSpacing: '0.5px' }}>WAGE</span>
                    </div>
                </div>
            )}

            {/* Left side: Logo (Desktop Only) */}
            {!isMobile && (
                <div style={{ flexShrink: 0 }}>
                    <LogoBox name={job.company} size={64} fontSize={20} />
                </div>
            )}

            {/* Middle: Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 700, color: '#718096' }}>{job.company}</span>
                </div>

                {/* Row 2: Title */}
                <h3 style={{
                    fontSize: isMobile ? '18px' : '21px',
                    fontWeight: 900,
                    margin: '0 0 8px',
                    lineHeight: 1.2,
                    letterSpacing: '-0.3px'
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
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={14} color="#94a3b8" />
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>{job.location || 'United States'}</span>
                    </div>

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

            {/* Right side: Wage level (Desktop) + Action */}
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
                        borderRadius: '16px',
                        padding: '12px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        boxShadow: '0 4px 12px rgba(26, 43, 75, 0.08)',
                        marginBottom: '8px'
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
                        <span style={{ fontSize: '28px', fontWeight: 900, color: '#fff', fontStyle: 'italic', lineHeight: 1, letterSpacing: '0.5px' }}>Lv {level}</span>
                        <span style={{ fontSize: '8px', fontWeight: 800, color: '#718096', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>WAGE LEVEL</span>
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
                            padding: isMobile ? '14px 20px' : '12px 20px',
                            borderRadius: '14px',
                            background: '#FDB913',
                            color: '#111',
                            fontSize: '14px',
                            fontWeight: 900,
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(253, 185, 19, 0.2)',
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
    const { user } = useAuth();
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
        // Fetch from DB
        const names = [];
        let pg = 0;
        const client = externalSupabase || supabase;
        while (true) {
            const { data, error } = await client
                .from('audit_reviews')
                .select('company')
                .eq('tl_confirmation', 'yes')
                .range(pg * 1000, (pg + 1) * 1000 - 1);
            if (error || !data || data.length === 0) break;
            data.forEach(r => r.company && names.push(r.company));
            if (data.length < 1000) break;
            pg++;
        }
        const unique = Array.from(new Set(names));
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
            const to = from + JOBS_PER_PAGE - 1;

            let query = supabase
                .from('job_jobrole_sponsored_sync')
                .select('*', { count: 'exact' })
                .order('wage_num', { ascending: false, nullsFirst: false })
                .order('date_posted', { ascending: false });

            // Search filter: Strict Column-level AND (Each column must have ALL words separately)
            if (search && search.trim()) {
                const words = search.trim().split(/\s+/).filter(w => w.length >= 1);
                if (words.length > 0) {
                    const titleCond = `and(${words.map(w => `title.ilike.%${w}%`).join(',')})`;
                    const roleCond = `and(${words.map(w => `job_role_name.ilike.%${w}%`).join(',')})`;
                    query = query.or(`${titleCond},${roleCond}`);
                }
            }

            // Verified filter: restrict to confirmed companies using .in()
            if (filter === 'verified') {
                const vSet = await getVerifiedSet();
                const verifiedArr = Array.from(vSet);
                if (verifiedArr.length === 0) {
                    setJobs([]);
                    setTotalJobs(0);
                    setLoading(false);
                    return;
                }
                // Supabase .in() with many values: batch to first 333 max (all confirmed companies)
                query = query.in('company', verifiedArr);
            }

            // Wage Level filter
            if (level !== 'all') {
                query = query.eq('wage_level', level);
            }

            query = query.range(from, to);

            const { data, error: fetchErr, count } = await query;
            if (fetchErr) throw fetchErr;

            // Tag _verified flag on each job (uses cache, no extra query)
            let processedJobs = data || [];
            if (filter === 'verified') {
                processedJobs = processedJobs.map(j => ({ ...j, _verified: true }));
            } else {
                // Tag without extra fetch - use cache
                const vSet = verifiedSet;
                processedJobs = processedJobs.map(j => ({
                    ...j,
                    _verified: vSet ? vSet.has(j.company) : false
                }));
            }

            // Priority Sort: (1) Visible Salary First, (2) Apply Link, (3) Freshness
            processedJobs.sort((a, b) => {
                const aHasSal = !!(a.salary && a.salary.trim().length > 0);
                const bHasSal = !!(b.salary && b.salary.trim().length > 0);
                const aHasUrl = !!(a.url || a.apply_url);
                const bHasUrl = !!(b.url || b.apply_url);

                const aScore = (aHasSal ? 100 : 0) + (aHasUrl ? 1 : 0);
                const bScore = (bHasSal ? 100 : 0) + (bHasUrl ? 1 : 0);

                if (aScore !== bScore) return bScore - aScore;

                // Tie-breaker: Newest first
                const dateA = new Date(a.date_posted || 0).getTime();
                const dateB = new Date(b.date_posted || 0).getTime();
                return dateB - dateA;
            });

            // Filter duplicates using URL
            const seen = new Set();
            processedJobs = processedJobs.filter(j => {
                const k = j.url || j.id;
                if (!k || seen.has(k)) return false;
                seen.add(k);
                return true;
            });

            setJobs(processedJobs);
            setTotalJobs(count || 0);
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
        fetchJobs(1, activeFilter, debouncedSearch, levelFilter);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch, activeFilter, levelFilter, verifiedSet]);

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
            <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#24385E', margin: '0 0 4px' }}>All Sponsored Jobs</h2>
                <p style={{ fontSize: '13px', color: '#aaa', margin: 0, fontWeight: 500 }}>
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
                        padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 200ms', border: 'none',
                        background: activeFilter === 'all' ? '#24385E' : '#fff',
                        color: activeFilter === 'all' ? '#fff' : '#475569',
                        boxShadow: activeFilter === 'all' ? '0 4px 12px rgba(36, 56, 94, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
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
                        padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 800,
                        cursor: 'pointer', transition: 'all 200ms', border: 'none',
                        background: activeFilter === 'verified' ? '#f0fdf4' : '#fff',
                        color: activeFilter === 'verified' ? '#16a34a' : '#475569',
                        border: '1.5px solid',
                        borderColor: activeFilter === 'verified' ? '#22c55e' : '#e2e8f0',
                        boxShadow: activeFilter === 'verified' ? '0 4px 12px rgba(34,197,94,0.15)' : 'none',
                        textTransform: 'uppercase', letterSpacing: '0.3px',
                    }}
                >
                    Human Verified
                    <VerifiedSeal size={16} />
                </button>

                {!isMobile && (
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            flexShrink: 0,
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '12px', fontSize: '13px', fontWeight: 700,
                            cursor: 'pointer', transition: 'all 200ms', border: '1.5px solid',
                            background: showFilters ? '#24385E' : '#fff',
                            color: showFilters ? '#fff' : '#475569',
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
                    <p style={{ fontSize: '12px', fontWeight: 800, color: '#24385E', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Filter by Wage Level</p>
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
                                {lv === 'all' ? 'All Salary Levels' : lv}
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
                marginBottom: '24px'
            }}>
                <div style={{
                    flex: 1, position: 'relative'
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        background: (showSuggestions && filteredSuggestions.length > 0) ? '#24385E' : '#fff',
                        border: (showSuggestions && filteredSuggestions.length > 0) ? '1.5px solid rgba(255,255,255,0.1)' : '1.5px solid #e2e8f0',
                        borderRadius: (showSuggestions && filteredSuggestions.length > 0) ? '24px 24px 0 0' : '50px',
                        padding: '0 16px', height: isMobile ? '56px' : '52px',
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
                                fontSize: '15px',
                                color: (showSuggestions && filteredSuggestions.length > 0) ? '#fff' : '#1e293b',
                                background: 'transparent',
                                width: '100%',
                                fontWeight: 500,
                                transition: 'color 0.2s'
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
                                                padding: '12px 20px',
                                                cursor: 'pointer',
                                                fontSize: '15px',
                                                color: '#fff',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '14px',
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
                            padding: '0 20px', borderRadius: '16px', fontSize: '14px', fontWeight: 700,
                            height: isMobile ? '56px' : '52px', cursor: 'pointer', transition: 'all 200ms', border: '1.5px solid',
                            borderColor: showFilters ? '#24385E' : '#e2e8f0',
                            background: showFilters ? '#24385E' : '#fff',
                            color: showFilters ? '#fff' : '#475569',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                            minWidth: isMobile ? '0' : '140px'
                        }}
                    >
                        <SlidersHorizontal size={16} />
                        Filters
                    </button>

                    <button
                        onClick={() => fetchJobs(1, activeFilter, searchTerm, levelFilter)}
                        style={{
                            flex: 1,
                            padding: '0 32px', borderRadius: '16px', background: '#24385E',
                            color: '#fff', fontSize: '14px', fontWeight: 800, border: 'none',
                            height: isMobile ? '56px' : '52px', cursor: 'pointer', transition: 'all 200ms',
                            boxShadow: '0 4px 12px rgba(36, 56, 94, 0.2)',
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
                    Showing jobs from <strong style={{ marginLeft: '4px' }}>human-verified H-1B sponsoring companies</strong>
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
                                                padding: '8px 14px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                                                cursor: 'pointer', minWidth: '38px', textAlign: 'center', transition: 'all 0.2s',
                                                border: '1.5px solid',
                                                borderColor: currentPage === pg ? '#24385E' : '#e2e8f0',
                                                background: currentPage === pg ? '#24385E' : '#fff',
                                                color: currentPage === pg ? '#fff' : '#475569',
                                                boxShadow: currentPage === pg ? '0 4px 10px rgba(36, 56, 94, 0.15)' : 'none'
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
