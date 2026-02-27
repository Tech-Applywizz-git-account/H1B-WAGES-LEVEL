import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';
import {
  Loader2, Search, Briefcase, Heart, CheckSquare, Settings,
  ChevronLeft, ChevronRight, ArrowUpDown, Eye,
  MessageSquare, Gift, Archive, Building2, X, Users, Mail,
  ExternalLink, SlidersHorizontal, HelpCircle
} from 'lucide-react';

import CompanyCard from '../components/CompanyCard';
import CompanyJobCard from '../components/CompanyJobCard';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import ProfileTab from '../components/ProfileTab';
import SavedJobsTab from '../components/SavedJobsTab';
import AppliedJobsTab from '../components/AppliedJobsTab';

const JOBS_PER_PAGE = 15;
const COMPANIES_PER_PAGE = 25;

const Homepage = () => {
  const { user, loading: authLoading, subscriptionExpired, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('all_companies');
  const [companies, setCompanies] = useState([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companySearch, setCompanySearch] = useState('');
  const [debouncedCompanySearch, setDebouncedCompanySearch] = useState('');
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [companyPage, setCompanyPage] = useState(1);
  const [sortBy, setSortBy] = useState('most_jobs');
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedCompanyData, setSelectedCompanyData] = useState(null);
  const [companyJobs, setCompanyJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [totalCompanyJobs, setTotalCompanyJobs] = useState(0);
  const [jobPage, setJobPage] = useState(1);
  const [jobSearch, setJobSearch] = useState('');
  const [debouncedJobSearch, setDebouncedJobSearch] = useState('');
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  useEffect(() => { const t = setTimeout(() => setDebouncedCompanySearch(companySearch), 400); return () => clearTimeout(t); }, [companySearch]);
  useEffect(() => { const t = setTimeout(() => setDebouncedJobSearch(jobSearch), 400); return () => clearTimeout(t); }, [jobSearch]);

  const fetchCompanies = useCallback(async () => {
    if (!user || subscriptionExpired) return;
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
        let jobP = 0;
        while (true) {
          let q = supabase
            .from('job_jobrole_sponsored_sync')
            .select('company, job_role_name, wage_level, wage_num')
            .in('company', chunk)
            .range(jobP * 1000, (jobP + 1) * 1000 - 1);

          const { data: chunkData, error: jobError } = await q;
          if (jobError) throw jobError;
          if (!chunkData || chunkData.length === 0) break;

          jobData.push(...chunkData);
          jobP++;
          if (jobP > 5) break;
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

        // Track highest wage level
        if ((j.wage_num || 0) > stats.maxWageNum) {
          stats.maxWageNum = j.wage_num;
          stats.wageLevel = j.wage_level || 'Lv 1';
        }

        if (j.job_role_name) stats.industries.add(j.job_role_name);
      });

      let arr = Array.from(companyStats.values()).map(c => ({
        ...c,
        industries: Array.from(c.industries).slice(0, 4)
      }));

      if (sortBy === 'most_jobs') arr.sort((a, b) => b.jobCount - a.jobCount);
      else if (sortBy === 'highest_wage') arr.sort((a, b) => b.maxWageNum - a.maxWageNum);
      else arr.sort((a, b) => a.company.localeCompare(b.company));

      setTotalCompanies(arr.length);
      const from = (companyPage - 1) * COMPANIES_PER_PAGE;
      setCompanies(arr.slice(from, from + COMPANIES_PER_PAGE));
      if (!selectedCompany && arr.length > 0) { setSelectedCompany(arr[0].company); setSelectedCompanyData(arr[0]); }
    } catch (err) { console.error(err); }
    finally { setCompaniesLoading(false); }
  }, [user, subscriptionExpired, debouncedCompanySearch, sortBy, companyPage, selectedCompany]);

  const fetchCompanyJobs = useCallback(async () => {
    if (!user || !selectedCompany || subscriptionExpired) return;
    setJobsLoading(true);
    try {
      const from = (jobPage - 1) * JOBS_PER_PAGE;
      let q = supabase.from('job_jobrole_sponsored_sync').select('*', { count: 'exact' }).eq('company', selectedCompany);
      if (debouncedJobSearch) q = q.or(`title.ilike.%${debouncedJobSearch}%,job_role_name.ilike.%${debouncedJobSearch}%,location.ilike.%${debouncedJobSearch}%`);
      const { data, error, count } = await q.order('wage_num', { ascending: false }).order('date_posted', { ascending: false }).range(from, from + JOBS_PER_PAGE - 1);
      if (error) throw error;

      const seen = new Set();
      const unique = (data || []).map(j => ({
        ...j,
        job_id: j.id, // For compatibility
        role: j.job_role_name // For compatibility
      })).filter(j => {
        const k = j.url || j.id;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      setCompanyJobs(unique);
      setTotalCompanyJobs(count || 0);
    } catch (err) { console.error(err); }
    finally { setJobsLoading(false); }
  }, [user, selectedCompany, subscriptionExpired, debouncedJobSearch, jobPage]);

  useEffect(() => { if (user && activeView === 'all_companies') fetchCompanies(); }, [fetchCompanies, activeView]);
  useEffect(() => { if (user && selectedCompany && activeView === 'all_companies') { setJobPage(1); fetchCompanyJobs(); } }, [selectedCompany]);
  useEffect(() => { if (user && selectedCompany && activeView === 'all_companies') fetchCompanyJobs(); }, [fetchCompanyJobs]);
  useEffect(() => { if (user) { fetchSavedJobIds(); fetchAppliedJobIds(); } }, [user]);

  const fetchSavedJobIds = async () => { if (!user) return; const { data } = await supabase.from('saved_jobs').select('job_id').eq('user_id', user.id); if (data) setSavedJobIds(new Set(data.map(i => String(i.job_id)))); };
  const fetchAppliedJobIds = async () => { if (!user) return; const { data } = await supabase.from('applied_jobs').select('job_id').eq('user_id', user.id); if (data) setAppliedJobIds(new Set(data.map(i => String(i.job_id)))); };

  const handleSaveJob = async (job) => {
    if (!user || subscriptionExpired) return;
    const jobId = job.job_id || job.id || job.audit_id;
    try {
      if (savedJobIds.has(String(jobId))) {
        await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', jobId);
        setSavedJobIds(prev => { const s = new Set(prev); s.delete(String(jobId)); return s; });
      } else {
        await supabase.from('saved_jobs').insert([{ user_id: user.id, job_id: jobId, job_data: job }]);
        setSavedJobIds(prev => { const s = new Set(prev); s.add(String(jobId)); return s; });
      }
    } catch (err) { console.error(err); }
  };

  const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??';
  const handleCompanySelect = (c) => { setSelectedCompany(c.company); setSelectedCompanyData(c); setJobPage(1); setJobSearch(''); };

  if (authLoading) return <div className="h-screen w-screen flex items-center justify-center bg-[#f5f5f7]"><Loader2 className="w-8 h-8 text-[#24385E] animate-spin" /></div>;
  if (!user) return <div className="bg-white"><Navbar /><HeroSection /><Testimonials /><FAQ /><Footer /></div>;

  const navItems = [
    { id: 'all_jobs', label: 'All jobs', icon: Briefcase },
    { id: 'viewed', label: 'Viewed', icon: Eye },
    { id: 'saved', label: 'Saved', icon: Heart },
    { id: 'applied', label: 'Applied', icon: CheckSquare },
    { id: 'interviewing', label: 'Interviewing', icon: MessageSquare },
    { id: 'offer', label: 'Offer', icon: Gift },
    { id: 'archive', label: 'Archive', icon: Archive },
  ];

  /* ─────────────────────────────────────── */
  /*  INLINE STYLES MATCHING SCREENSHOT 1   */
  /* ─────────────────────────────────────── */
  const S = {
    // Page shell
    page: { display: 'flex', height: '100vh', overflow: 'hidden', background: '#f5f5f7', fontFamily: "'Inter', sans-serif" },

    // Sidebar
    sidebar: { width: '260px', minWidth: '260px', background: '#ffffff', borderRight: '1px solid #e8e8e8', display: 'flex', flexDirection: 'column', flexShrink: 0 },
    sidebarLogo: { padding: '24px 24px 20px' },
    sidebarNav: { flex: 1, padding: '0 12px', overflowY: 'auto' },
    navItem: (active) => ({
      width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px', borderRadius: '12px', fontSize: '14px', fontWeight: active ? 600 : 400,
      color: active ? '#24385E' : '#666', background: active ? 'rgba(36,56,94,0.07)' : 'transparent',
      border: 'none', cursor: 'pointer', transition: 'all 180ms ease', marginBottom: '4px',
      textAlign: 'left',
    }),
    sidebarBottom: { padding: '12px 12px 20px', borderTop: '1px solid #efefef' },
    userRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 12px 0' },

    // Main
    main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' },

    // Top bar
    topBar: { background: '#fff', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '11px 24px', flexShrink: 0 },

    // Content row
    content: { flex: 1, display: 'flex', overflow: 'hidden' },

    // Left column
    leftCol: { width: '460px', minWidth: '460px', background: '#f5f5f7', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 },

    // Search pill
    searchWrap: { padding: '20px 20px 12px' },
    searchRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    searchPill: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1.5px solid #d8d8d8', borderRadius: '60px', padding: '0 16px', height: '52px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '15px', color: '#333', background: 'transparent', minWidth: 0 },
    filterBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1.5px solid #d8d8d8', borderRadius: '60px', padding: '0 18px', height: '52px', fontSize: '14px', fontWeight: 500, color: '#555', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', whiteSpace: 'nowrap', flexShrink: 0 },

    // Count / sort
    countRow: { padding: '0 20px 8px', textAlign: 'center', fontSize: '13px', color: '#888' },

    // Company list
    companyList: { flex: 1, overflowY: 'auto', padding: '0 16px 24px', scrollbarWidth: 'none' },

    // Right column
    rightCol: { flex: 1, background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    rightScroll: { flex: 1, overflowY: 'auto', padding: '32px 40px', scrollbarWidth: 'none' },

    // Company header in right panel
    coLogo: { width: '56px', height: '56px', borderRadius: '16px', background: '#24385E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 900, color: '#fff', flexShrink: 0 },

    // Job search inside right panel
    jobSearchPill: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#f9f9f9', border: '1.5px solid #e0e0e0', borderRadius: '60px', padding: '0 16px', height: '50px' },
    jobSearchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#333', background: 'transparent', minWidth: 0 },
    searchBtn: { height: '50px', padding: '0 28px', background: '#24385E', color: '#fff', border: 'none', borderRadius: '60px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 6px rgba(36,56,94,0.3)' },
  };

  return (
    <div style={S.page}>

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside style={S.sidebar}>
        {/* Logo */}
        <div style={S.sidebarLogo}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '42px', height: '42px', background: '#24385E', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(12deg)', transition: 'transform 0.2s' }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: '10px', tracking: 'tighter' }}>H1-B</span>
              </div>
              <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: '#EAB308', borderRadius: '50%', border: '2px solid #fff' }}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#24385E', letterSpacing: '-0.5px' }}>Wage</span>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#EAB308', letterSpacing: '-0.5px' }}>Level</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={S.sidebarNav}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button key={item.id} style={S.navItem(active)} onClick={() => setActiveView(item.id)}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#333'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666'; } }}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.6} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div style={{ height: '1px', background: '#efefef', margin: '8px 0 8px' }} />

          <button style={S.navItem(activeView === 'all_companies')} onClick={() => setActiveView('all_companies')}
            onMouseEnter={e => { if (activeView !== 'all_companies') { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#333'; } }}
            onMouseLeave={e => { if (activeView !== 'all_companies') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666'; } }}
          >
            <Building2 size={18} strokeWidth={activeView === 'all_companies' ? 2.2 : 1.6} />
            <span style={{ lineHeight: '1.35' }}>All Companies<br />that Sponsor</span>
          </button>
        </nav>

        {/* Bottom */}
        <div style={S.sidebarBottom}>
          <button style={S.navItem(activeView === 'settings')} onClick={() => setActiveView('settings')}
            onMouseEnter={e => { if (activeView !== 'settings') { e.currentTarget.style.background = '#f5f5f5'; } }}
            onMouseLeave={e => { if (activeView !== 'settings') { e.currentTarget.style.background = 'transparent'; } }}
          >
            <Settings size={18} strokeWidth={1.6} /><span>Settings</span>
          </button>

          <div style={S.userRow}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#24385E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {(user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email?.split('@')[0] || 'User'}</p>
              <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>software engineer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ═══════════════ MAIN ═══════════════ */}
      <div style={S.main}>

        {/* Top bar */}
        {activeView === 'all_companies' && (
          <div style={S.topBar}>
            <Building2 size={20} color="#24385E" />
            <span style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>Search for open roles within that company</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#24385E' }} />
              <div style={{ width: '36px', height: '3px', background: '#24385E', borderRadius: '3px' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#24385E' }} />
              <div style={{ width: '36px', height: '3px', background: '#ddd', borderRadius: '3px' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ddd' }} />
            </div>
          </div>
        )}

        <div style={S.content}>

          {/* ━━━━━━ ALL COMPANIES VIEW ━━━━━━ */}
          {activeView === 'all_companies' && (
            <>
              {/* LEFT COLUMN */}
              <div style={S.leftCol}>

                {/* ── Search bar ── */}
                <div style={S.searchWrap}>
                  <div style={S.searchRow}>
                    <div style={S.searchPill}>
                      <Search size={18} color="#999" style={{ flexShrink: 0 }} />
                      <input
                        style={S.searchInput}
                        type="text"
                        value={companySearch}
                        onChange={(e) => { setCompanySearch(e.target.value); setCompanyPage(1); }}
                        placeholder="Search companies"
                      />
                      <HelpCircle size={17} color="#ccc" style={{ flexShrink: 0 }} />
                    </div>
                    <button style={S.filterBtn}>
                      <SlidersHorizontal size={15} color="#777" />
                      Filters
                    </button>
                  </div>
                </div>

                {/* ── Count + Sort ── */}
                <div style={S.countRow}>
                  Showing <strong style={{ color: '#333' }}>{totalCompanies.toLocaleString()}</strong> of <strong style={{ color: '#333' }}>{totalCompanies.toLocaleString()}</strong> companies
                </div>
                <div style={{ padding: '0 20px 12px' }}>
                  <button onClick={() => { setSortBy(p => p === 'most_jobs' ? 'highest_wage' : p === 'highest_wage' ? 'name' : 'most_jobs'); setCompanyPage(1); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, color: '#333', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {sortBy === 'most_jobs' ? 'Most visas' : sortBy === 'highest_wage' ? 'Highest wage' : 'By name'} <ArrowUpDown size={13} />
                  </button>
                </div>

                {/* ── Company list ── */}
                <div style={S.companyList}>
                  {companiesLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                      <Loader2 className="w-6 h-6 text-[#24385E] animate-spin" />
                    </div>
                  ) : companies.length > 0 ? companies.map((c, i) => (
                    <CompanyCard key={c.company + i} company={c.company} jobCount={c.jobCount}
                      wageLevel={c.wageLevel} industries={c.industries}
                      isSelected={selectedCompany === c.company} onClick={() => handleCompanySelect(c)} />
                  )) : (
                    <p style={{ textAlign: 'center', color: '#aaa', fontSize: '14px', paddingTop: '80px' }}>No companies found</p>
                  )}
                  {totalCompanies > COMPANIES_PER_PAGE && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '8px' }}>
                      <button onClick={() => setCompanyPage(p => Math.max(1, p - 1))} disabled={companyPage === 1}
                        style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', opacity: companyPage === 1 ? 0.3 : 1 }}>
                        <ChevronLeft size={14} />
                      </button>
                      <span style={{ fontSize: '12px', color: '#666', fontWeight: 500 }}>{companyPage} / {Math.ceil(totalCompanies / COMPANIES_PER_PAGE)}</span>
                      <button onClick={() => setCompanyPage(p => p + 1)} disabled={companyPage * COMPANIES_PER_PAGE >= totalCompanies}
                        style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', cursor: 'pointer', opacity: companyPage * COMPANIES_PER_PAGE >= totalCompanies ? 0.3 : 1 }}>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div style={S.rightCol}>
                <div style={S.rightScroll}>
                  {selectedCompany ? (
                    <>
                      {/* ── Company header ── */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={S.coLogo}>{getInitials(selectedCompany)}</div>
                          <div>
                            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: '0 0 4px' }}>{selectedCompany}</h2>
                            <p style={{ fontSize: '13px', color: '#999', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ExternalLink size={12} />{selectedCompany.toLowerCase().replace(/\s+/g, '')}.com
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <button style={{ fontSize: '12px', color: '#aaa', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            Report company
                          </button>
                          <button onClick={() => { setSelectedCompany(null); setSelectedCompanyData(null); }}
                            style={{ padding: '6px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            <X size={18} color="#aaa" />
                          </button>
                        </div>
                      </div>

                      {/* ── Industries ── */}
                      {selectedCompanyData?.industries?.length > 0 && (
                        <div style={{ marginBottom: '16px' }}>
                          <p style={{ fontSize: '11px', color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: 600, margin: '0 0 10px' }}>Company Industries:</p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {selectedCompanyData.industries.map((ind, i) => (
                              <span key={i} style={{ fontSize: '13px', color: '#444', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '5px 14px', background: '#fff' }}>{ind}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── Meta row ── */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '12px', fontSize: '13px', color: '#666' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> 10000+ employees</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Mail size={14} /> Visa inquiries: <span style={{ color: '#24385E', fontWeight: 500 }}>hiring@{selectedCompany.toLowerCase().replace(/\s+/g, '')}.com</span>
                        </span>
                      </div>

                      {/* ── Sponsored count ── */}
                      <p style={{ fontSize: '15px', color: '#222', fontWeight: 500, margin: '0 0 14px' }}>
                        {selectedCompanyData?.jobCount || totalCompanyJobs}+ total visas sponsored in the last year
                      </p>

                      {/* ── Wage badges ── */}
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                        {['Lv 1', 'Lv 2', 'Lv 3', 'Lv 4'].map((lbl, i) => {
                          const lvl = parseInt(selectedCompanyData?.wageLevel?.match(/\d/)?.[0] || '2');
                          return (
                            <span key={lbl} style={{
                              fontSize: '12px', fontWeight: 700, padding: '5px 14px', borderRadius: '8px',
                              background: i + 1 <= lvl ? '#24385E' : '#fff',
                              color: i + 1 <= lvl ? '#fff' : '#bbb',
                              border: i + 1 <= lvl ? '1px solid #24385E' : '1px solid #e0e0e0',
                            }}>{lbl}</span>
                          );
                        })}
                      </div>

                      {/* ── Work auth note ── */}
                      <div style={{ background: '#f9f9f9', border: '1px solid #ebebeb', borderRadius: '12px', padding: '16px 20px', marginBottom: '32px' }}>
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#24385E', margin: '0 0 6px' }}>Work authorization note</p>
                        <p style={{ fontSize: '12px', color: '#888', margin: 0, lineHeight: 1.6 }}>
                          This company has historically sponsored work visas. Wage levels indicate the pay tier relative to prevailing wages — Lv 4 is the highest.
                        </p>
                      </div>

                      {/* ── Open Jobs heading ── */}
                      <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111', margin: '0 0 16px' }}>Open Jobs at {selectedCompany}</h3>

                      {/* ── Job search bar ── */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <div style={S.jobSearchPill}>
                          <Search size={17} color="#bbb" style={{ flexShrink: 0 }} />
                          <input style={S.jobSearchInput} type="text" value={jobSearch}
                            onChange={(e) => { setJobSearch(e.target.value); setJobPage(1); }}
                            placeholder={`Search jobs at ${selectedCompany}`} />
                        </div>
                        <button style={S.searchBtn}
                          onMouseEnter={e => e.currentTarget.style.background = '#1a2b4a'}
                          onMouseLeave={e => e.currentTarget.style.background = '#24385E'}>
                          Search
                        </button>
                      </div>

                      {/* ── Job count ── */}
                      <p style={{ fontSize: '13px', color: '#888', margin: '0 0 16px' }}>
                        Showing <strong style={{ color: '#333' }}>{totalCompanyJobs.toLocaleString()}</strong> of <strong style={{ color: '#333' }}>{totalCompanyJobs.toLocaleString()}</strong> jobs
                      </p>

                      {/* ── Job list ── */}
                      {jobsLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
                          <Loader2 className="w-6 h-6 text-[#24385E] animate-spin" />
                        </div>
                      ) : companyJobs.length > 0 ? (
                        <>
                          {companyJobs.map((job, i) => (
                            <CompanyJobCard key={job.url || job.id || i} job={job}
                              isSaved={savedJobIds.has(String(job.id || job.job_id || job.audit_id))}
                              onSave={handleSaveJob} />
                          ))}
                          {totalCompanyJobs > JOBS_PER_PAGE && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', paddingBottom: '24px' }}>
                              <span style={{ fontSize: '12px', color: '#aaa' }}>Page {jobPage} of {Math.ceil(totalCompanyJobs / JOBS_PER_PAGE)}</span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setJobPage(p => Math.max(1, p - 1))} disabled={jobPage === 1}
                                  style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', fontSize: '12px', cursor: 'pointer', opacity: jobPage === 1 ? 0.3 : 1 }}>← Prev</button>
                                <button onClick={() => setJobPage(p => p + 1)} disabled={jobPage * JOBS_PER_PAGE >= totalCompanyJobs}
                                  style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff', fontSize: '12px', cursor: 'pointer', opacity: jobPage * JOBS_PER_PAGE >= totalCompanyJobs ? 0.3 : 1 }}>Next →</button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '64px 0' }}>
                          <Search size={32} color="#ddd" style={{ margin: '0 auto 12px', display: 'block' }} />
                          <p style={{ fontSize: '14px', color: '#666', fontWeight: 600, margin: '0 0 4px' }}>No jobs found</p>
                          <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>Try a different search term</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <div style={{ textAlign: 'center' }}>
                        <Building2 size={48} color="#e0e0e0" style={{ margin: '0 auto 12px' }} />
                        <p style={{ fontSize: '16px', fontWeight: 600, color: '#666', margin: '0 0 6px' }}>Select a Company</p>
                        <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>Choose from the left to see open positions.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeView === 'all_jobs' && (
            <div style={{ flex: 1, padding: '40px', background: '#fff' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111', marginBottom: '12px' }}>All Sponsored Jobs</h2>
              <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '20px' }}>Browse by company using "All Companies that Sponsor" in the sidebar.</p>
              <button onClick={() => setActiveView('all_companies')} style={{ padding: '10px 20px', background: '#24385E', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Browse Companies →</button>
            </div>
          )}
          {activeView === 'saved' && <div style={{ flex: 1, overflowY: 'auto', background: '#fff', scrollbarWidth: 'none' }}><div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}><SavedJobsTab /></div></div>}
          {activeView === 'applied' && <div style={{ flex: 1, overflowY: 'auto', background: '#fff', scrollbarWidth: 'none' }}><div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto' }}><AppliedJobsTab /></div></div>}

          {activeView === 'settings' && (
            <div style={{ flex: 1, overflowY: 'auto', background: '#fff', scrollbarWidth: 'none' }}>
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ padding: '40px 40px 24px', borderBottom: '1px solid #efefef', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: '0 0 4px' }}>{user?.email?.split('@')[0] || 'User'}</h1>
                    <p style={{ fontSize: '14px', color: '#aaa', margin: 0 }}>software engineer</p>
                  </div>
                  <div style={{ width: '60px', height: '60px', background: '#24385E', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800, color: '#fff' }}>
                    {(user?.email?.[0] || 'U').toUpperCase()}
                  </div>
                </div>
                <div style={{ padding: '24px 40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', borderBottom: '1px solid #efefef' }}>
                  {[{ t: 'Jobs Saved', c: savedJobIds.size, a: () => setActiveView('saved') }, { t: 'Jobs Applied', c: appliedJobIds.size, a: () => setActiveView('applied') }, { t: 'Companies', c: totalCompanies, a: () => setActiveView('all_companies') }].map((s, i) => (
                    <div key={i} onClick={s.a} style={{ border: '1px solid #efefef', borderRadius: '16px', padding: '20px', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 6px' }}>{s.t}</p>
                      <p style={{ fontSize: '28px', fontWeight: 800, color: '#111', margin: 0 }}>{s.c}</p>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '24px 40px' }}><ProfileTab /></div>
              </div>
            </div>
          )}

          {['viewed', 'interviewing', 'offer', 'archive'].includes(activeView) && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
              <div style={{ textAlign: 'center' }}>
                <Briefcase size={40} color="#e0e0e0" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: '16px', fontWeight: 600, color: '#555', margin: '0 0 4px', textTransform: 'capitalize' }}>{activeView} Jobs</p>
                <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>Coming soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
