import React, { useState, useEffect, useCallback } from 'react';
import { Search, Star, Sliders, X, Building, Info, Loader2, ChevronLeft, ChevronRight, ArrowUpDown, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { supabase } from '../supabaseClient';
import CompanyCard from './CompanyCard';
import CompanyJobCard from './CompanyJobCard';

const COMPANIES_PER_PAGE = 3;
const JOBS_PER_PAGE = 2;

const MigrateHero = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data states
    const [companies, setCompanies] = useState([]);
    const [companiesLoading, setCompaniesLoading] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedCompanyData, setSelectedCompanyData] = useState(null);
    const [companyJobs, setCompanyJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobPage, setJobPage] = useState(1);
    const [totalCompanyJobs, setTotalCompanyJobs] = useState(0);

    // Search & Filter states
    const [companySearch, setCompanySearch] = useState('');
    const [debouncedCompanySearch, setDebouncedCompanySearch] = useState('');
    const [companyPage, setCompanyPage] = useState(1);
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [sortBy, setSortBy] = useState('most_jobs');

    // Debounce company search
    useEffect(() => {
        const t = setTimeout(() => setDebouncedCompanySearch(companySearch), 400);
        return () => clearTimeout(t);
    }, [companySearch]);

    // Fetch Companies Logic (Mirrors Homepage but without forced auth check for viewing)
    const fetchCompanies = useCallback(async () => {
        setCompaniesLoading(true);
        try {
            // 1. Get ALL confirmed company names (Paginated + Cached)
            if (!window._confirmedCompaniesCache) {
                let auditData = [];
                const PAGE_COUNT = 30;
                const CONCURRENCY = 5;

                for (let i = 0; i < PAGE_COUNT; i += CONCURRENCY) {
                    const tasks = [];
                    for (let j = 0; j < CONCURRENCY && (i + j) < PAGE_COUNT; j++) {
                        const p = i + j;
                        tasks.push(supabase
                            .from('audit_reviews_sync')
                            .select('company')
                            .eq('tl_confirmation', 'yes')
                            .range(p * 1000, (p + 1) * 1000 - 1)
                        );
                    }
                    const results = await Promise.all(tasks);
                    let shouldBreak = false;
                    results.forEach(res => {
                        if (res.error) throw res.error;
                        if (res.data) auditData.push(...res.data);
                        if (!res.data || res.data.length < 1000) shouldBreak = true;
                    });
                    if (shouldBreak) break;
                }
                window._confirmedCompaniesCache = Array.from(new Set(auditData.map(r => r.company)));
            }

            const confirmedNames = window._confirmedCompaniesCache;

            // 2. Filter companies if searching before fetching jobs to save bandwidth
            const filteredConfirmed = debouncedCompanySearch
                ? confirmedNames.filter(n => n.toLowerCase().includes(debouncedCompanySearch.toLowerCase()))
                : confirmedNames;

            // 3. Fetch jobs count and info
            const BATCH_SIZE = 50;
            let jobData = [];
            for (let i = 0; i < filteredConfirmed.length; i += BATCH_SIZE) {
                const chunk = filteredConfirmed.slice(i, i + BATCH_SIZE);
                let jobPageNum = 0;
                while (true) {
                    let q = supabase
                        .from('job_jobrole_sponsored_sync')
                        .select('company, job_role_name, wage_level, wage_num')
                        .in('company', chunk)
                        .range(jobPageNum * 1000, (jobPageNum + 1) * 1000 - 1);

                    const { data: chunkData, error: jobError } = await q;
                    if (jobError) throw jobError;
                    if (!chunkData || chunkData.length === 0) break;

                    jobData.push(...chunkData);
                    jobPageNum++;
                    if (jobPageNum > 5) break;
                }
            }

            const companyStats = new Map();
            jobData.forEach(j => {
                const name = j.company;
                if (!companyStats.has(name)) {
                    companyStats.set(name, {
                        company: name,
                        jobCount: 0,
                        maxWageNum: 0,
                        wageLevel: 'Lv 1',
                        industries: new Set()
                    });
                }
                const stats = companyStats.get(name);
                stats.jobCount++;

                if ((j.wage_num || 0) > stats.maxWageNum) {
                    stats.maxWageNum = j.wage_num;
                    stats.wageLevel = j.wage_level || 'Lv 1';
                }

                if (j.job_role_name) stats.industries.add(j.job_role_name);
            });

            let arr = Array.from(companyStats.values()).map(c => ({
                ...c,
                industries: Array.from(c.industries).slice(0, 3)
            }));

            // Sorting
            if (sortBy === 'most_jobs') arr.sort((a, b) => b.jobCount - a.jobCount);
            else if (sortBy === 'highest_wage') arr.sort((a, b) => b.maxWageNum - a.maxWageNum);
            else arr.sort((a, b) => a.company.localeCompare(b.company));

            setTotalCompanies(arr.length);
            const from = (companyPage - 1) * COMPANIES_PER_PAGE;
            const pagedArr = arr.slice(from, from + COMPANIES_PER_PAGE);
            setCompanies(pagedArr);

            // Auto-select first company on load if none selected
            if (!selectedCompany && pagedArr.length > 0) {
                setSelectedCompany(pagedArr[0].company);
                setSelectedCompanyData(pagedArr[0]);
            }
        } catch (err) {
            console.error('Error fetching companies:', err);
        } finally {
            setCompaniesLoading(false);
        }
    }, [debouncedCompanySearch, sortBy, companyPage, selectedCompany]);

    // Fetch Jobs for selected company
    const fetchCompanyJobs = useCallback(async () => {
        if (!selectedCompany) return;
        setJobsLoading(true);
        try {
            const from = (jobPage - 1) * JOBS_PER_PAGE;
            const { data, error, count } = await supabase
                .from('job_jobrole_sponsored_sync')
                .select('*', { count: 'exact' })
                .eq('company', selectedCompany)
                .order('date_posted', { ascending: false })
                .range(from, from + JOBS_PER_PAGE - 1);

            if (error) throw error;

            // Map for compatibility with CompanyJobCard
            const mappedData = (data || []).map(j => ({
                ...j,
                job_id: j.id,
                role: j.job_role_name
            }));

            setCompanyJobs(mappedData);
            setTotalCompanyJobs(count || 0);
        } catch (err) {
            console.error('Error fetching jobs:', err);
        } finally {
            setJobsLoading(false);
        }
    }, [selectedCompany, jobPage]);

    useEffect(() => { fetchCompanies(); }, [debouncedCompanySearch, sortBy, companyPage]);
    useEffect(() => { fetchCompanyJobs(); }, [selectedCompany, jobPage]);

    const handleCompanySelect = (co) => {
        setSelectedCompany(co.company);
        setSelectedCompanyData(co);
        setJobPage(1);
    };

    const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??';

    return (
        <section className="relative overflow-hidden text-center">
            {/* Hero Header Area */}
            <div className="relative pt-24 pb-16 px-6 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 bottom-0 z-0">
                    <img src="/hero-bg.png" alt="Hero Background" className="w-full h-full object-cover object-center" />
                    <div className="absolute inset-0 bg-[#24385E]/40"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex justify-center gap-0.5 mb-3">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
                    </div>
                    <p className="text-white text-xs font-bold mb-4 tracking-wide drop-shadow-sm uppercase">Trusted by 30,000+ job seekers</p>
                    <h1 className="text-[28px] md:text-[44px] font-[900] text-white leading-[1.1] tracking-tight mb-6 drop-shadow-lg max-w-2xl mx-auto">
                        Land your dream job in the U.S.
                    </h1>
                </div>
            </div>

            {/* Content Area: Exact App Clone Dashboard */}
            <div className="relative z-20 mt-12 max-w-7xl mx-auto px-6 pb-20">
                <div className="bg-[#f5f5f7] rounded-[32px] md:rounded-[48px] shadow-2xl overflow-hidden border border-white/50">
                    <div className="pt-10 pb-4 px-8 md:px-10 text-left">
                        <h2 className="text-xl md:text-2xl font-black text-[#24385E] mb-1 tracking-tight">Search for your perfect role.</h2>
                        <p className="text-gray-400 font-bold text-xs mb-8 uppercase tracking-widest">Data verified by the U.S. Government.</p>
                    </div>

                    <div style={{ display: 'flex', borderTop: '1px solid #ebebeb', minHeight: '700px' }}>
                        {/* LEFT: Company list (Matches App Left Panel) */}
                        <div style={{ width: '420px', minWidth: '420px', background: '#f5f5f7', padding: '24px 20px', borderRight: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', gap: '0' }}>
                            {/* Search bar clone */}
                            <div style={{ background: '#fff', borderRadius: '60px', border: '1.5px solid #d8d8d8', display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px', height: '52px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', marginBottom: '16px' }}>
                                <Search size={18} color="#aaa" strokeWidth={2.5} />
                                <input
                                    value={companySearch}
                                    onChange={(e) => { setCompanySearch(e.target.value); setCompanyPage(1); }}
                                    placeholder="Search companies"
                                    style={{ flex: 1, border: 'none', outline: 'none', fontSize: '14px', fontWeight: 600, color: '#333', background: 'transparent' }}
                                />
                                <div style={{ height: '32px', padding: '0 14px', background: '#fff', border: '1.5px solid #ebebeb', borderRadius: '40px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#444' }}>
                                    <Sliders size={14} className="text-yellow-500" /> Filters
                                </div>
                            </div>

                            <div style={{ padding: '0 4px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '12px', color: '#888', fontWeight: 500 }}>{totalCompanies.toLocaleString()} companies</span>
                                <button onClick={() => setSortBy(p => p === 'most_jobs' ? 'highest_wage' : 'most_jobs')} style={{ fontSize: '12px', fontWeight: 700, color: '#24385E', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    {sortBy === 'most_jobs' ? 'Most visas ↑' : 'Highest wage ↑'} <ArrowUpDown size={12} />
                                </button>
                            </div>

                            {/* Company list scrollable area */}
                            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '12px', paddingRight: '4px' }} className="custom-scrollbar">
                                {companiesLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Loader2 className="animate-spin text-[#24385E]" /></div>
                                ) : companies.map((co) => (
                                    <CompanyCard
                                        key={co.company}
                                        company={co.company}
                                        jobCount={co.jobCount}
                                        industries={co.industries}
                                        wageLevel={co.wageLevel}
                                        isSelected={selectedCompany === co.company}
                                        onClick={() => handleCompanySelect(co)}
                                    />
                                ))}
                            </div>

                            {/* CTA to Signup instead of Pagination */}
                            <div style={{ marginTop: 'auto', paddingTop: '24px', textAlign: 'center' }}>
                                <Link
                                    to="/signup"
                                    style={{
                                        display: 'block',
                                        padding: '12px',
                                        background: '#fff',
                                        border: '1.5px solid #24385E',
                                        borderRadius: '12px',
                                        color: '#24385E',
                                        fontSize: '13px',
                                        fontWeight: 700,
                                        textDecoration: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#24385E'; e.currentTarget.style.color = '#fff'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#24385E'; }}
                                >
                                    Get access to all companies →
                                </Link>
                            </div>
                        </div>

                        {/* RIGHT: Job detail (Matches App Right Panel) */}
                        <div style={{ flex: 1, background: '#fff', padding: '40px', textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
                            {selectedCompany ? (
                                <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '32px' }}>
                                        <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: '#24385E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 900, color: '#fff' }}>
                                            {getInitials(selectedCompany)}
                                        </div>
                                        <div>
                                            <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#111', margin: '0 0 5px' }}>{selectedCompany}</h3>
                                            <p style={{ fontSize: '14px', color: '#24385E', fontWeight: 600, margin: 0 }}>{selectedCompany.toLowerCase().replace(/\s+/g, '')}.com</p>
                                        </div>
                                    </div>

                                    {/* Company Info row */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px', marginBottom: '32px' }}>
                                        <div>
                                            <p style={{ fontSize: '11px', color: '#aaa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Industries</p>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                {selectedCompanyData?.industries?.map(f => <span key={f} style={{ fontSize: '13px', fontWeight: 700, background: '#fff', border: '1px solid #ebebeb', borderRadius: '10px', padding: '6px 14px' }}>{f}</span>)}
                                            </div>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '11px', color: '#aaa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Visa Sponsorship</p>
                                            <p style={{ fontSize: '15px', fontWeight: 700, color: '#333' }}>{selectedCompanyData?.jobCount}+ roles found</p>
                                        </div>
                                    </div>

                                    {/* Work authorization note from app */}
                                    <div style={{ background: '#f9fafb', border: '1px solid #f1f1f1', borderRadius: '20px', padding: '24px', marginBottom: '32px' }}>
                                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#24385E', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                            <Info size={18} className="text-yellow-500" /> Work authorization note
                                        </h4>
                                        <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.6, fontWeight: 500 }}>
                                            This company historically sponsors work visas. Wage level <b>{selectedCompanyData?.wageLevel}</b> indicates high salary percentiles relative to prevailing wages.
                                        </p>
                                    </div>

                                    <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#111', marginBottom: '20px' }}>Open Jobs at {selectedCompany}</h4>

                                    {/* Job list scrollable */}
                                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }} className="custom-scrollbar">
                                        {jobsLoading ? (
                                            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}><Loader2 className="animate-spin text-[#24385E]" size={32} /></div>
                                        ) : companyJobs.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {companyJobs.map(job => (
                                                    <CompanyJobCard key={job.id} job={job} isLandingPage={true} />
                                                ))}
                                            </div>
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>No job data found for this company view.</div>
                                        )}
                                    </div>

                                    {/* CTA to Signup instead of Job Pagination */}
                                    <div style={{ marginTop: 'auto', paddingTop: '24px', textAlign: 'center' }}>
                                        <Link
                                            to="/signup"
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '14px 32px',
                                                background: '#24385E',
                                                borderRadius: '60px',
                                                color: '#fff',
                                                fontSize: '15px',
                                                fontWeight: 800,
                                                textDecoration: 'none',
                                                boxShadow: '0 4px 12px rgba(36,56,94,0.25)',
                                                transition: 'all 0.2s ease'
                                            }}
                                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(36,56,94,0.35)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(36,56,94,0.25)'; }}
                                        >
                                            Get access to all jobs <ChevronRight size={18} />
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ccc', textAlign: 'center' }}>
                                    <Building size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                                    <p style={{ fontWeight: 700, fontSize: '18px' }}>Select a company</p>
                                    <p style={{ fontSize: '14px' }}>to view open role sponsorships and wage levels</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MigrateHero;
