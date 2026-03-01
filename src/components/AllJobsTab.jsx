import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { externalSupabase } from '../externalSupabaseClient';
import useAuth from '../hooks/useAuth';
import LogoBox from './LogoBox';
import {
    ChevronLeft, ChevronRight, Search, Loader2, AlertCircle,
    Briefcase, ExternalLink, MapPin, Clock, Star, Bookmark, BookmarkCheck,
    SlidersHorizontal, X
} from 'lucide-react';

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
                borderRadius: '24px',
                border: '1px solid #f0f0f0',
                padding: isMobile ? '20px' : '24px',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: '20px',
                transition: 'all 0.3s ease',
                boxShadow: hovered ? '0 12px 24px rgba(0,0,0,0.06)' : '0 2px 4px rgba(0,0,0,0.02)',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Left side: Logo + Info */}
            <div style={{ display: 'flex', gap: '20px', flex: 1, minWidth: 0 }}>
                <LogoBox name={job.company} size={isMobile ? 50 : 64} fontSize={18} />

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#666' }}>{job.company}</span>
                        <span style={{ fontSize: '12px', color: '#ccc' }}>•</span>
                        <span style={{ fontSize: '12px', color: '#888' }}>{formatDate(job.date_posted)}</span>
                    </div>

                    <h3 style={{
                        fontSize: isMobile ? '18px' : '22px',
                        fontWeight: 900,
                        color: '#111',
                        margin: '0 0 12px',
                        lineHeight: 1.2
                    }}>
                        {job.title || job.job_role_name || 'Job Position'}
                    </h3>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                            <MapPin size={14} color="#FDB913" />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{job.location || 'United States'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '6px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                            <Briefcase size={14} color="#FDB913" />
                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>{job.years_experience || '3-5 years'}</span>
                        </div>
                    </div>

                    {job._verified && (
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#f0fdf4', color: '#16a34a', padding: '6px 12px', borderRadius: '10px', border: '1.5px solid #bbf7d0', fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            HUMAN VERIFIED <VerifiedSeal size={12} />
                        </div>
                    )}
                </div>
            </div>

            {/* Right side: Wage level + Action */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                alignItems: isMobile ? 'center' : 'flex-end',
                justifyContent: 'space-between',
                gap: '12px',
                minWidth: isMobile ? '0' : '160px'
            }}>
                <div style={{
                    background: '#24385E',
                    borderRadius: '20px',
                    padding: '12px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: isMobile ? 'auto' : '100%',
                    minWidth: '120px',
                    boxShadow: '0 8px 24px rgba(36, 56, 94, 0.12)'
                }}>
                    <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <Star key={i} size={11}
                                fill={i <= level ? '#FDB913' : 'none'}
                                color={i <= level ? '#FDB913' : '#4a5e7a'}
                                strokeWidth={2}
                            />
                        ))}
                    </div>
                    <span style={{ fontSize: '28px', fontWeight: 900, color: '#fff', fontStyle: 'italic', lineHeight: 1 }}>Lv {level}</span>
                    <span style={{ fontSize: '8px', fontWeight: 800, color: '#7a9bbf', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>WAGE LEVEL</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', width: isMobile ? 'auto' : '100%' }}>
                    <button
                        onClick={() => onSave(job)}
                        style={{
                            padding: '12px',
                            borderRadius: '16px',
                            border: '1.5px solid #efefef',
                            background: isSaved ? '#fff7ed' : '#fff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            boxShadow: isSaved ? '0 4px 12px rgba(245, 158, 11, 0.1)' : 'none'
                        }}
                    >
                        {isSaved ? <BookmarkCheck size={20} color="#f59e0b" /> : <Bookmark size={20} color="#ccc" />}
                    </button>
                    <a
                        href={job.url || job.apply_url || '#'}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                            flex: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '14px 24px',
                            borderRadius: '16px',
                            background: '#FDB913',
                            color: '#24385E',
                            fontSize: '14px',
                            fontWeight: 900,
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            boxShadow: '0 4px 12px rgba(253, 185, 19, 0.2)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e5a607'}
                        onMouseLeave={e => e.currentTarget.style.background = '#FDB913'}
                    >
                        Apply Now <ExternalLink size={16} />
                    </a>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ─────────────────────────────────────────────────────────
const AllJobsTab = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'verified'
    const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'Lv 1' | 'Lv 2' | 'Lv 3' | 'Lv 4'
    const [showFilters, setShowFilters] = useState(false);
    const [savedJobIds, setSavedJobIds] = useState(new Set());

    const verifiedSet = useRef(null); // cache Set of confirmed company names
    const searchTimer = useRef(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

    // Debounce search
    useEffect(() => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => setDebouncedSearch(searchTerm), 400);
        return () => clearTimeout(searchTimer.current);
    }, [searchTerm]);

    // Load saved job IDs
    useEffect(() => {
        if (!user) return;
        const fetchIds = async () => {
            await new Promise(r => setTimeout(r, 150)); // Stagger to avoid 525
            const { data } = await supabase.from('saved_jobs').select('job_id').eq('user_id', user.id);
            if (data) setSavedJobIds(new Set(data.map(r => String(r.job_id))));
        };
        fetchIds();
    }, [user]);

    // Load confirmed companies (runs once per session, cached in verifiedSet.current)
    const getVerifiedSet = async () => {
        if (verifiedSet.current) return verifiedSet.current;
        // Use window cache if available
        if (window._confirmedCompaniesCache) {
            verifiedSet.current = new Set(window._confirmedCompaniesCache);
            return verifiedSet.current;
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
        verifiedSet.current = new Set(unique);
        return verifiedSet.current;
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
                .order('date_posted', { ascending: false });

            // Search filter: Use strict multi-word matching to ensure roles like "Staff" don't match "Data"
            if (search && search.trim()) {
                const words = search.trim().split(/\s+/).filter(w => w.length > 1);
                if (words.length > 0) {
                    // Requirement: Title must have ALL words OR Role Name must have ALL words
                    const titleAnd = `and(${words.map(w => `title.ilike.%${w}%`).join(',')})`;
                    const roleAnd = `and(${words.map(w => `job_role_name.ilike.%${w}%`).join(',')})`;
                    query = query.or(`${titleAnd},${roleAnd}`);
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
                const vSet = verifiedSet.current;
                processedJobs = processedJobs.map(j => ({
                    ...j,
                    _verified: vSet ? vSet.has(j.company) : false
                }));
            }

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
    }, [debouncedSearch, activeFilter, levelFilter]);

    const handlePageChange = (newPage) => {
        fetchJobs(newPage, activeFilter, debouncedSearch, levelFilter);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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

            {/* ── Filter Tabs + Search row ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
                {/* All Jobs tab */}
                <button
                    onClick={() => { setActiveFilter('all'); setCurrentPage(1); }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 150ms', border: 'none',
                        background: activeFilter === 'all' ? '#24385E' : '#f5f5f5',
                        color: activeFilter === 'all' ? '#fff' : '#555',
                        outline: activeFilter === 'all' ? 'none' : '1.5px solid #ebebeb',
                    }}
                >
                    <Briefcase size={14} />
                    All Jobs
                </button>

                {/* Human Verified tab */}
                <button
                    onClick={() => { setActiveFilter('verified'); setCurrentPage(1); }}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 800,
                        cursor: 'pointer', transition: 'all 150ms', border: 'none',
                        background: activeFilter === 'verified' ? '#f0fdf4' : '#f5f5f5',
                        color: activeFilter === 'verified' ? '#16a34a' : '#555',
                        outline: activeFilter === 'verified' ? '1.5px solid #22c55e' : '1.5px solid #ebebeb',
                        boxShadow: activeFilter === 'verified' ? '0 2px 8px rgba(34,197,94,0.18)' : 'none',
                        textTransform: 'uppercase', letterSpacing: '0.3px',
                    }}
                >
                    Human Verified
                    <VerifiedSeal size={17} />
                </button>

                {/* Filters Toggle Button */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        display: 'inline-flex', alignItems: 'center', gap: '8px',
                        padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700,
                        cursor: 'pointer', transition: 'all 150ms', border: 'none',
                        background: showFilters ? '#24385E' : '#f5f5f5',
                        color: showFilters ? '#fff' : '#555',
                        outline: showFilters ? 'none' : '1.5px solid #ebebeb',
                    }}
                >
                    <SlidersHorizontal size={14} />
                    Filters {levelFilter !== 'all' ? `(${levelFilter})` : ''}
                </button>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                <div style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
                    background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '60px',
                    padding: '0 20px', height: '52px', maxWidth: '500px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                    <Search size={18} color="#999" style={{ flexShrink: 0 }} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        onKeyDown={e => e.key === 'Enter' && fetchJobs(1, activeFilter, searchTerm, levelFilter)}
                        placeholder="Search for roles (e.g. Data Engineer)..."
                        style={{ border: 'none', outline: 'none', fontSize: '15px', color: '#111', background: 'transparent', width: '100%', fontWeight: 500 }}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
                            <X size={16} color="#aaa" />
                        </button>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '0 20px', borderRadius: '60px', fontSize: '14px', fontWeight: 600,
                            height: '52px', cursor: 'pointer', transition: 'all 200ms', border: '1.5px solid',
                            borderColor: showFilters ? '#24385E' : '#e5e7eb',
                            background: showFilters ? '#24385E' : '#fff',
                            color: showFilters ? '#fff' : '#555',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                        }}
                    >
                        <SlidersHorizontal size={16} color={showFilters ? '#fff' : '#777'} />
                        Filters
                    </button>

                    <button
                        onClick={() => fetchJobs(1, activeFilter, searchTerm, levelFilter)}
                        style={{
                            padding: '0 32px', borderRadius: '60px', background: '#24385E',
                            color: '#fff', fontSize: '14px', fontWeight: 800, border: 'none',
                            height: '52px', cursor: 'pointer', transition: 'all 200ms',
                            boxShadow: '0 4px 12px rgba(36, 56, 94, 0.25)'
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
                            job={job}
                            isSaved={savedJobIds.has(String(job.id || job.job_id || ''))}
                            onSave={handleSave}
                        />
                    ))}

                    {/* ── Pagination ── */}
                    {totalPages > 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                            <span style={{ fontSize: '12px', color: '#aaa' }}>
                                Page {currentPage} of {totalPages.toLocaleString()} · {totalJobs.toLocaleString()} jobs total
                            </span>
                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.3 : 1, display: 'flex', alignItems: 'center' }}
                                >
                                    <ChevronLeft size={14} />
                                </button>

                                {getPageNumbers().map((pg, idx) =>
                                    pg === '...' ? (
                                        <span key={`e${idx}`} style={{ padding: '0 4px', color: '#aaa', fontSize: '13px' }}>…</span>
                                    ) : (
                                        <button
                                            key={pg}
                                            onClick={() => handlePageChange(pg)}
                                            style={{
                                                padding: '5px 10px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
                                                cursor: 'pointer', minWidth: '34px', textAlign: 'center',
                                                border: currentPage === pg ? '1.5px solid #24385E' : '1px solid #e0e0e0',
                                                background: currentPage === pg ? '#24385E' : '#fff',
                                                color: currentPage === pg ? '#fff' : '#555',
                                            }}
                                        >
                                            {pg}
                                        </button>
                                    )
                                )}

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.3 : 1, display: 'flex', alignItems: 'center' }}
                                >
                                    <ChevronRight size={14} />
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
