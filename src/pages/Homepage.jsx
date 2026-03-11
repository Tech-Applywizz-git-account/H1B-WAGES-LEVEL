import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { externalSupabase } from '../externalSupabaseClient';
import useAuth from '../hooks/useAuth';
import {
  Loader2, Search, Briefcase, Heart, CheckSquare, Settings,
  ChevronLeft, ChevronRight, ArrowUpDown, Eye, Star,
  MessageSquare, Gift, Archive, Building2, X, Users, Mail,
  ExternalLink, SlidersHorizontal, HelpCircle, Lock, LogOut, CreditCard,
  Menu, Zap, Sparkles, Shield, Globe
} from 'lucide-react';

import { getCompanyLogo } from '../utils/logoHelper';
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
import PaymentDetailsTab from '../components/PaymentDetailsTab';
import LogoBox from '../components/LogoBox';
import AllJobsTab from '../components/AllJobsTab';
import H1BSponsorFinder from '../components/H1BSponsorFinder';
import { fetchJobRoles, filterRoles } from '../utils/rolesSuggestions';
import { isFamous } from '../utils/famousCompanies';

// Roles fetched dynamically from Supabase via rolesSuggestions utility


// ─── Teaser Dashboard (unpaid users) ─────────────────────────────────────────

// ─── Teaser Dashboard (unpaid users) ─────────────────────────────────────────
const TeaserDashboard = ({ user, signOut, navigate, isMobile }) => {
  const [teaserCompanies, setTeaserCompanies] = useState([]);
  const [selectedTeaserCompany, setSelectedTeaserCompany] = useState(null);
  const [teaserJobs, setTeaserJobs] = useState([]);
  const [teaserLoading, setTeaserLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveCol, setMobileActiveCol] = useState('left'); // 'left' or 'right'

  const TARGET_NAMES = ['Google', 'Microsoft', 'Meta', 'Amazon', 'Apple'];

  const S = {
    page: { display: 'flex', height: '100vh', overflow: 'hidden', background: '#f5f5f7', fontFamily: "'Inter', sans-serif" },
    sidebar: {
      width: isMobile ? (mobileMenuOpen ? '280px' : '0') : '260px',
      minWidth: isMobile ? (mobileMenuOpen ? '280px' : '0') : '260px',
      background: '#ffffff',
      borderRight: '1px solid #e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: isMobile ? 'fixed' : 'relative',
      zIndex: 9999,
      height: '100vh',
      left: 0,
      top: 0,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      boxShadow: isMobile && mobileMenuOpen ? '0 0 40px rgba(0,0,0,0.1)' : 'none'
    },
    sidebarLogo: { padding: '24px 24px 20px', minWidth: '260px' },
    sidebarNav: { flex: 1, padding: '0 12px', overflowY: 'auto', minWidth: '260px' },
    navItem: (active) => ({
      width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px', borderRadius: '12px', fontSize: '14px', fontWeight: active ? 600 : 400,
      color: active ? '#24385E' : '#666', background: active ? 'rgba(36,56,94,0.07)' : 'transparent',
      border: 'none', cursor: 'pointer', transition: 'all 180ms ease', marginBottom: '4px',
      textAlign: 'left',
    }),
    sidebarBottom: { padding: '12px 12px 20px', borderTop: '1px solid #efefef', minWidth: '260px' },
    userRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 12px 0' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' },
    topBar: {
      background: '#fff',
      borderBottom: '1px solid #e8e8e8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'space-between' : 'center',
      gap: '12px',
      padding: isMobile ? '0 16px' : '11px 24px',
      height: isMobile ? '60px' : 'auto',
      flexShrink: 0
    },
    content: { flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' },
    leftCol: {
      width: isMobile ? '100%' : '460px',
      minWidth: isMobile ? '0' : '460px',
      background: '#f5f5f7',
      display: (isMobile && mobileActiveCol === 'right') ? 'none' : 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0
    },
    searchWrap: { padding: isMobile ? '16px 12px' : '20px 20px 12px' },
    searchRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    searchPill: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1.5px solid #d8d8d8', borderRadius: '60px', padding: '0 16px', height: isMobile ? '46px' : '52px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: isMobile ? '14px' : '15px', color: '#333', background: 'transparent', minWidth: 0 },
    countRow: { padding: '0 20px 8px', textAlign: 'center', fontSize: '13px', color: '#888' },
    companyList: { flex: 1, overflowY: 'auto', padding: isMobile ? '0 10px 24px' : '0 16px 24px', scrollbarWidth: 'none' },
    rightCol: {
      flex: 1,
      background: '#fff',
      display: (isMobile && mobileActiveCol === 'left') ? 'none' : 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    rightScroll: { flex: 1, overflowY: 'auto', padding: isMobile ? '20px' : '32px 40px', scrollbarWidth: 'none' },
  };

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('job_jobrole_sponsored_sync')
          .select('*')
          .in('company', TARGET_NAMES)
          .order('wage_num', { ascending: false });

        if (error) throw error;
        if (!data) return;

        const grouped = {};
        TARGET_NAMES.forEach(name => {
          const companyData = data.filter(j => j.company === name);
          if (companyData.length > 0) {
            grouped[name] = {
              company: name,
              jobs: companyData.slice(0, 3).map(j => ({ ...j, isTeaser: true })),
              jobCount: companyData.length,
              wageLevel: companyData[0].wage_level || 'Lv 2'
            };
          }
        });

        const list = Object.values(grouped);
        setTeaserCompanies(list);
        if (list.length > 0) {
          setSelectedTeaserCompany(list[0]);
          setTeaserJobs(list[0].jobs);
        }
      } catch (err) {
        console.error('Teaser fetch error:', err);
      } finally {
        setTeaserLoading(false);
      }
    })();
  }, []);

  const handleSelect = (c) => {
    setSelectedTeaserCompany(c);
    setTeaserJobs(c.jobs);
    if (isMobile) setMobileActiveCol('right');
  };

  return (
    <div style={S.page}>
      {isMobile && mobileMenuOpen && (
        <div onClick={() => setMobileMenuOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }} />
      )}

      {/* Sidebar */}
      <aside style={S.sidebar}>
        <div style={S.sidebarLogo}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', background: '#24385E', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(12deg)' }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: '10px' }}>H1-B</span>
                </div>
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: '#EAB308', borderRadius: '50%', border: '2px solid #fff' }}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#24385E' }}>Wage</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#EAB308' }}>Trail</span>
              </div>
            </div>
            {isMobile && (
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: 'transparent', border: 'none', color: '#666' }}>
                <X size={24} />
              </button>
            )}
          </div>
        </div>

        <nav style={S.sidebarNav}>
          <button style={S.navItem(true)} onClick={() => { if (isMobile) setMobileMenuOpen(false); }}>
            <Building2 size={18} strokeWidth={2.2} />
            <span>Dashboard</span>
          </button>
          <button style={S.navItem(false)} onClick={() => { navigate('/pricing'); if (isMobile) setMobileMenuOpen(false); }}>
            <Gift size={18} strokeWidth={1.6} />
            <span>Pricing Plans</span>
          </button>
        </nav>

        <div style={S.sidebarBottom}>
          <button style={{ ...S.navItem(false), color: '#ef4444' }} onClick={signOut}>
            <LogOut size={18} strokeWidth={1.6} />
            <span>Logout</span>
          </button>
          <div style={S.userRow}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: '#24385E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 700, color: '#fff', flexShrink: 0 }}>
              {(user?.email?.[0] || 'U').toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email?.split('@')[0] || 'User'}</p>
              <p style={{ fontSize: '11px', color: '#999', margin: 0 }}>Preview Participant</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div style={S.main}>
        <header style={S.topBar}>
          {isMobile && (
            <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginLeft: '-8px' }}>
              <Menu size={24} color="#24385E" />
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="#24385E" />
            <span style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 700, color: '#1a1a1a' }}>Limited Preview — Unlock Full Access</span>
          </div>
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#24385E' }} />
              <div style={{ width: '36px', height: '3px', background: '#24385E', borderRadius: '3px' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#24385E' }} />
              <div style={{ width: '36px', height: '3px', background: '#ddd', borderRadius: '3px' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ddd' }} />
            </div>
          )}
        </header>

        <div style={S.content}>
          <div style={S.leftCol}>
            <div style={S.searchWrap}>
              <div style={S.searchRow}>
                <div style={S.searchPill}>
                  <Search size={18} color="#94a3b8" />
                  <input style={S.searchInput} type="text" placeholder="Search companies (Unlock full search)" disabled />
                </div>
              </div>
            </div>
            <div style={S.countRow}>Showing <strong style={{ color: '#333' }}>Featured</strong> Human verified companies</div>

            <div style={S.companyList}>
              {teaserLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                  <Loader2 className="w-6 h-6 text-[#24385E] animate-spin" />
                </div>
              ) : teaserCompanies.map((c, i) => (
                <CompanyCard
                  key={c.company + i}
                  company={c.company}
                  isMobile={isMobile}
                  isVerified={true}
                  wageLevel={c.wageLevel}
                  isSelected={selectedTeaserCompany?.company === c.company}
                  onClick={() => handleSelect(c)}
                />
              ))}

              <div style={{ marginTop: 24, padding: '24px', background: '#fff', borderRadius: 20, border: '1.5px dashed #d8d8d8', textAlign: 'center' }}>
                <Lock size={24} color="#94a3b8" style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>1,000+ More Companies</p>
                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 16 }}>Complete your plan to unlock the full database of sponsoring companies.</p>
                <button onClick={() => navigate('/pricing')} style={{ width: '100%', padding: '10px', background: '#24385E', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>Unlock All Companies</button>
              </div>
            </div>
          </div>

          <div style={S.rightCol}>
            <div style={S.rightScroll}>
              {selectedTeaserCompany ? (
                <>
                  {isMobile && (
                    <button onClick={() => setMobileActiveCol('left')} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', padding: '0 0 16px', color: '#24385E', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                      <ChevronLeft size={18} /> Back to list
                    </button>
                  )}

                  <div style={{ background: '#FFF7ED', border: '1.5px solid #FFEDD5', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
                    <p style={{ color: '#9A3412', fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>🔒 UNLOCK ALL JOBS</p>
                    <p style={{ color: '#C2410C', fontSize: '12px', fontWeight: 500, marginBottom: '16px' }}>Get access to direct apply links and salary data for {selectedTeaserCompany.company}.</p>
                    <button onClick={() => navigate('/pricing')} style={{ background: '#FDB913', color: '#111', fontWeight: 800, padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', width: '100%' }}>Get Full Access →</button>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                    <LogoBox name={selectedTeaserCompany.company} size={isMobile ? 50 : 64} fontSize={isMobile ? 16 : 18} />
                    <div>
                      <h2 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 800, color: '#24385E', margin: 0 }}>{selectedTeaserCompany.company}</h2>
                      <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: isMobile ? 13 : 14 }}>{selectedTeaserCompany.jobCount}+ Visa Opportunities Found</p>
                    </div>
                  </div>

                  <div style={{ marginBottom: 32 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 800, color: '#1a1a1a', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 16 }}>Available Roles</h4>
                    {teaserJobs.map((job, idx) => (
                      <CompanyJobCard
                        key={`${job.id || job.url || 'teaser'}_${idx}`}
                        job={{ ...job, isVerified: true }}
                        isMobile={isMobile}
                        isLandingPage={true}
                      />
                    ))}
                  </div>

                  <div style={{
                    padding: isMobile ? '24px' : '40px', background: 'linear-gradient(135deg, #24385E 0%, #1a2b4b 100%)',
                    borderRadius: 24, textAlign: 'center', color: '#fff', boxShadow: '0 12px 32px rgba(36,56,94,0.2)'
                  }}>
                    <Sparkles size={32} color="#FDB913" style={{ margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, marginBottom: 12 }}>Go Premium</h3>
                    <p style={{ color: '#94a3b8', marginBottom: 24, fontSize: isMobile ? 14 : 15, maxWidth: 400, margin: '0 auto 24px' }}>
                      Access direct application links, historical wage data, and exclusive sponsorship insights.
                    </p>
                    <button onClick={() => navigate('/pricing')} style={{ padding: '14px 40px', background: '#FDB913', color: '#24385E', border: 'none', borderRadius: 12, fontWeight: 900, cursor: 'pointer', fontSize: 15 }}>Upgrade Now →</button>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Building2 size={48} color="#e2e8f0" style={{ marginBottom: 16 }} />
                    <p style={{ color: '#64748b' }}>Select a company to view roles</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


const JOBS_PER_PAGE = 15;
const COMPANIES_PER_PAGE = 25;

const Homepage = () => {
  const { user, loading: authLoading, subscriptionExpired, signOut, paymentStatus, paymentLoading, refresh: refreshAuth, isAdmin: isAdminFromCtx, role } = useAuth();
  // Safety net: also check localStorage in case context hasn't hydrated yet
  const isAdmin = isAdminFromCtx || role === 'admin' || localStorage.getItem('userRole') === 'admin';
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileActiveCol, setMobileActiveCol] = useState('left'); // 'left' or 'right'

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

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
  const [jobLevelFilter, setJobLevelFilter] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [allProcessedCompanies, setAllProcessedCompanies] = useState(window._allProcessedCompanies || []);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(!!window._allProcessedCompanies);
  const [levelFilter, setLevelFilter] = useState([]); // Array like ['Lv 1', 'Lv 2']
  const [showCompanyFilters, setShowCompanyFilters] = useState(false);
  const [showJobFilters, setShowJobFilters] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allRoles, setAllRoles] = useState([]);
  const [jobFilteredSuggestions, setJobFilteredSuggestions] = useState([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [filingCounts, setFilingCounts] = useState({});
  const activeCompanyRef = useRef(null);

  // Sync ref with state
  useEffect(() => {
    activeCompanyRef.current = selectedCompany;
  }, [selectedCompany]);

  // Global name normalizer for consistent lookups (matches line 1465 usage)
  const normalizeName = (name) => {
    if (!name) return '';
    return name.toLowerCase()
      .replace(/[\.,]/g, ' ')
      .replace(/\b(inc|llc|corp|ltd|co|services|com|systems|technologies)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Fetch filing counts for the current page of companies
  useEffect(() => {
    const names = companies.map(c => c.company).filter(Boolean);
    if (names.length === 0) return;

    const fetchFilings = async () => {
      try {
        const { data } = await supabase
          .from('h1b_sponsor_finder')
          .select('Company, "LCA Filings"')
          .or(names.map(n => `Company.ilike.%${n}%`).join(','));

        if (data) {
          const map = {};
          data.forEach(f => {
            const norm = normalizeName(f.Company);
            map[f.Company.toLowerCase()] = f["LCA Filings"];
            if (norm && !map[norm]) map[norm] = f["LCA Filings"];
          });
          setFilingCounts(prev => ({ ...prev, ...map }));
        }
      } catch (err) { console.error("Error fetching filing counts:", err); }
    };
    fetchFilings();
  }, [companies]);


  // Fetch job roles from Supabase on mount (globally cached)
  useEffect(() => { fetchJobRoles().then(setAllRoles); }, []);

  const handleCompanySearchChange = (e) => {
    const val = e.target.value;
    setCompanySearch(val);
    setCompanyPage(1);
    if (val.trim().length > 0) {
      const filtered = filterRoles(allRoles, val, 8);
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleJobSearchChange = (e) => {
    const val = e.target.value;
    setJobSearch(val);
    setJobPage(1);
    if (val.trim().length > 0) {
      const filtered = filterRoles(allRoles, val, 8);
      setJobFilteredSuggestions(filtered);
      setShowJobSuggestions(filtered.length > 0);
    } else {
      setJobFilteredSuggestions([]);
      setShowJobSuggestions(false);
    }
  };

  const handleSuggestionClick = (role) => {
    setCompanySearch(role);
    setDebouncedCompanySearch(role); // Instant update on select
    setShowSuggestions(false);
    setCompanyPage(1);
  };

  const handleJobSuggestionClick = (role) => {
    setJobSearch(role);
    setDebouncedJobSearch(role); // Instant update on select
    setShowJobSuggestions(false);
    setJobPage(1);
    fetchCompanyJobs(1, role, jobLevelFilter); // Explicit call to avoid a 'nothing' moment
  };

  useEffect(() => { const t = setTimeout(() => setDebouncedCompanySearch(companySearch), 400); return () => clearTimeout(t); }, [companySearch]);
  useEffect(() => { const t = setTimeout(() => setDebouncedJobSearch(jobSearch), 400); return () => clearTimeout(t); }, [jobSearch]);

  const fetchCompanies = useCallback(async () => {
    if (!user || subscriptionExpired || paymentLoading || (paymentStatus === 'pending' && !isAdmin)) return;

    // ── 1. In-memory cache hit (fastest — no re-render needed) ──────────────
    if (isInitialLoadDone && allProcessedCompanies.length > 0) {
      let arr = [...allProcessedCompanies];
      if (debouncedCompanySearch && debouncedCompanySearch.trim()) {
        const words = debouncedCompanySearch.toLowerCase().trim().split(/\s+/).filter(w => w.length >= 1);
        arr = arr.filter(n => {
          const name = n.company.toLowerCase();
          const words = debouncedCompanySearch.toLowerCase().trim().split(/\s+/).filter(w => w.length >= 1);
          // Rule: (Title contains ALL words) OR (At least one Role contains ALL words)
          const nameMatches = words.every(w => name.includes(w));
          const roleMatches = (n.industries || []).some(role => {
            const r = role.toLowerCase();
            return words.every(w => r.includes(w));
          });
          return nameMatches || roleMatches;
        });
      }
      if (levelFilter && levelFilter.length > 0) {
        arr = arr.filter(n => levelFilter.includes(n.wageLevel));
      }
      // Consolidated filter logic above replaces the redundant blocks here
      // Primary sort: Famous first. Secondary sort: Selected criteria.
      arr.sort((a, b) => {
        const aFamous = isFamous(a.company);
        const bFamous = isFamous(b.company);
        if (aFamous && !bFamous) return -1;
        if (!aFamous && bFamous) return 1;

        if (sortBy === 'most_jobs') return b.jobCount - a.jobCount;
        if (sortBy === 'highest_wage') return b.maxWageNum - a.maxWageNum;
        return a.company.localeCompare(b.company);
      });
      setTotalCompanies(arr.length);
      const from = (companyPage - 1) * COMPANIES_PER_PAGE;
      const paginated = arr.slice(from, from + COMPANIES_PER_PAGE);
      setCompanies(paginated);
      if (!isMobile && !selectedCompany && paginated.length > 0) { setSelectedCompany(paginated[0].company); setSelectedCompanyData(paginated[0]); }
      return;
    }

    // ── 2. sessionStorage cache hit (survives navigation, avoids full re-fetch) ──
    try {
      const cached = sessionStorage.getItem('_companiesCache_v8');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.length > 0) {
          window._allProcessedCompanies = parsed;
          setAllProcessedCompanies(parsed);
          setIsInitialLoadDone(true);
          let arr = [...parsed];
          if (debouncedCompanySearch && debouncedCompanySearch.trim()) {
            const words = debouncedCompanySearch.toLowerCase().trim().split(/\s+/).filter(w => w.length >= 1);
            arr = arr.filter(n => {
              const name = n.company.toLowerCase();
              const nameMatches = words.every(w => name.includes(w));
              const roleMatches = (n.industries || []).some(role => {
                const r = role.toLowerCase();
                return words.every(w => r.includes(w));
              });
              return nameMatches || roleMatches;
            });
          }
          if (levelFilter && levelFilter.length > 0) {
            arr = arr.filter(n => levelFilter.includes(n.wageLevel));
          }
          // Priority Sort: Famous First
          arr.sort((a, b) => {
            const aFamous = isFamous(a.company);
            const bFamous = isFamous(b.company);
            if (aFamous && !bFamous) return -1;
            if (!aFamous && bFamous) return 1;
            if (sortBy === 'most_jobs') return b.jobCount - a.jobCount;
            if (sortBy === 'highest_wage') return b.maxWageNum - a.maxWageNum;
            return a.company.localeCompare(b.company);
          });
          setTotalCompanies(arr.length);
          const paginated = arr.slice(0, COMPANIES_PER_PAGE);
          setCompanies(paginated);
          if (!isMobile && !selectedCompany && paginated.length > 0) { setSelectedCompany(paginated[0].company); setSelectedCompanyData(paginated[0]); }
          return;
        }
      }
    } catch (e) { /* sessionStorage may be unavailable */ }

    if (paymentStatus !== 'paid' && paymentStatus !== 'active') return;

    setCompaniesLoading(true);
    try {
      // ── 3. FAST FIRST PAGE: Show initial companies quickly (single query, no pagination loops) ──

      const fetchAllConfirmed = async (tableName) => {
        const records = [];
        let pg = 0;
        while (true) {
          const { data, error } = await supabase
            .from(tableName)
            .select('company, role, domain, salary, remarks')
            .eq('tl_confirmation', 'yes')
            .range(pg * 1000, (pg + 1) * 1000 - 1);
          if (error || !data || data.length === 0) break;
          data.forEach(r => r.company && records.push(r));
          if (data.length < 1000) break;
          pg++;
        }
        return records;
      };

      const [syncResults, backupResults, jobsRes] = await Promise.all([
        fetchAllConfirmed('audit_reviews_sync'),
        fetchAllConfirmed('audit_reviews_backup'),
        supabase.from('job_jobrole_sponsored_sync').select('company, job_role_name, wage_level, wage_num').limit(5000)
      ]);

      const allVerified = [...syncResults, ...backupResults];
      const confirmedNames = Array.from(new Set(allVerified.map(r => r.company))).filter(Boolean);

      let jobData = jobsRes.data || [];

      // If jobs table has more than 5000, fetch remaining pages in background
      if (jobData.length === 5000) {
        // Show first-page results immediately using the data we have, then fill in more
        buildAndSetCompanies(confirmedNames, jobData, allVerified, true);

        // Background: fetch remaining pages without blocking UI
        let p = 1;
        const delay = (ms) => new Promise(res => setTimeout(res, ms));
        while (p <= 20) { // Cap at 100k jobs (20 * 5000) to be safe
          await delay(300); // Small cooldown
          const { data: moreJobs } = await supabase
            .from('job_jobrole_sponsored_sync')
            .select('company, job_role_name, wage_level, wage_num')
            .range(p * 5000, (p + 1) * 5000 - 1);
          if (!moreJobs || moreJobs.length === 0) break;
          jobData = jobData.concat(moreJobs);
          if (moreJobs.length < 5000) break;
          p++;
        }
      }

      buildAndSetCompanies(confirmedNames, jobData, allVerified, false);

    } catch (err) {
      if (!err.message?.includes('fetch') && window.navigator.onLine) {
        console.error("fetchCompanies Error:", err);
      }
    } finally {
      setCompaniesLoading(false);
    }

    function buildAndSetCompanies(confirmedNames, jobData, allVerified = [], preliminary) {
      const companyStats = new Map();
      confirmedNames.forEach(name => companyStats.set(name, { company: name, jobCount: 0, maxWageNum: 0, wageLevel: 'Lv 1', industries: new Set() }));

      // Count, collect industries, AND track max wage level from ALL verified roles
      allVerified.forEach(v => {
        if (companyStats.has(v.company)) {
          const s = companyStats.get(v.company);
          s.jobCount++;
          if (v.role) s.industries.add(v.role);
          if (v.domain) s.industries.add(v.domain);

          // Extract wage level from verified record and update max if higher.
          // Since audit tables don't have a dedicated wage_level column, we check salary/remarks.
          const rawLevel = String(v.wage_level || v.salary_level || v.salary || v.remarks || '').toUpperCase();
          let wageNum = 0;
          
          // 1. Explicit labels
          const explicitMatch = rawLevel.match(/LV\s*(\d)/) || rawLevel.match(/LEVEL\s*(\d)/);
          if (explicitMatch) {
            wageNum = parseInt(explicitMatch[1]);
          } else if (rawLevel.includes('IV') || rawLevel.match(/\bLEVEL 4\b/)) wageNum = 4;
          else if (rawLevel.includes('III') || rawLevel.match(/\bLEVEL 3\b/)) wageNum = 3;
          else if (rawLevel.includes('II') || rawLevel.match(/\bLEVEL 2\b/)) wageNum = 2;
          else if (rawLevel.match(/\bLEVEL 1\b/) || rawLevel.match(/\bI\b/)) wageNum = 1;

          // 2. Title-based heuristic fallback (matches getWageLevel logic)
          if (wageNum === 0 && v.role) {
            const rt = v.role.toLowerCase();
            if (rt.match(/\blead\b|\bstaff\b|\bprincipal\b|\bdirector\b|\bvp\b|\bhead\b|\bchief\b/)) wageNum = 4;
            else if (rt.match(/\bsenior\b|\bsr[\s.]\b/)) wageNum = 3;
            else if (rt.match(/\bjunior\b|\bjr[\s.]\b|\bentry\b|\bintern\b|\bgraduate\b/)) wageNum = 1;
            else if (rt.match(/\b(ii|2)\b/)) wageNum = 2;
            else if (rt.match(/\b(iii|3)\b/)) wageNum = 3;
            else if (rt.match(/\b(iv|4)\b/)) wageNum = 4;
            else wageNum = 2; // Baseline for typical roles
          }

          if (wageNum > s.maxWageNum) {
            s.maxWageNum = wageNum;
            s.wageLevel = `Lv ${wageNum}`;
          }
        }
      });

      jobData.forEach(j => {
        if (companyStats.has(j.company)) {
          const s = companyStats.get(j.company);
          s.jobCount++;
          // For sponsored jobs, default to 2 if missing (matching heuristic above)
          const currentWage = parseInt(j.wage_num || j.wage_level?.match(/\d/)?.[0] || '2');
          if (currentWage > s.maxWageNum) {
            s.maxWageNum = currentWage;
            s.wageLevel = `Lv ${currentWage}`;
          }
          if (j.job_role_name) {
            // Split comma-separated role names for cleaner tags
            const roles = j.job_role_name.split(',').map(r => r.trim()).filter(Boolean);
            roles.forEach(r => s.industries.add(r));
          }
        }
      });

      let finalArr = Array.from(companyStats.values());

      if (debouncedCompanySearch && debouncedCompanySearch.trim()) {
        const words = debouncedCompanySearch.toLowerCase().trim().split(/\s+/).filter(w => w.length >= 1);
        finalArr.forEach(c => {
          const industriesArr = Array.from(c.industries);
          industriesArr.sort((a, b) => {
            const aLower = a.toLowerCase();
            const bLower = b.toLowerCase();
            const aMatch = words.every(w => aLower.includes(w));
            const bMatch = words.every(w => bLower.includes(w));
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
          });
          c.industries = industriesArr; // Keep full list for strict filtering
        });
      } else {
        finalArr.forEach(c => {
          c.industries = Array.from(c.industries); // Keep full list
        });
      }

      // Final sorting with Famous Priority
      finalArr.sort((a, b) => {
        const aFamous = isFamous(a.company);
        const bFamous = isFamous(b.company);
        if (aFamous && !bFamous) return -1;
        if (!aFamous && bFamous) return 1;

        if (sortBy === 'most_jobs') return b.jobCount - a.jobCount;
        if (sortBy === 'highest_wage') return b.maxWageNum - a.maxWageNum;
        return a.company.localeCompare(b.company);
      });

      window._allProcessedCompanies = finalArr;
      setAllProcessedCompanies(finalArr);
      if (!preliminary) {
        setIsInitialLoadDone(true);
        try { sessionStorage.setItem('_companiesCache_v8', JSON.stringify(finalArr)); } catch (e) { }
      }

      let viewArr = finalArr;
      if (debouncedCompanySearch && debouncedCompanySearch.trim()) {
        const words = debouncedCompanySearch.toLowerCase().trim().split(/\s+/).filter(w => w.length >= 1);
        viewArr = viewArr.filter(n => {
          const name = n.company.toLowerCase();
          const nameMatches = words.every(w => name.includes(w));
          const roleMatches = (n.industries || []).some(role => {
            const r = role.toLowerCase();
            return words.every(w => r.includes(w));
          });
          return nameMatches || roleMatches;
        });
      }
      if (levelFilter && levelFilter.length > 0) {
        viewArr = viewArr.filter(n => levelFilter.includes(n.wageLevel));
      }
      setTotalCompanies(viewArr.length);
      const from = (companyPage - 1) * COMPANIES_PER_PAGE;
      const paginated = viewArr.slice(from, from + COMPANIES_PER_PAGE);
      setCompanies(paginated);
      if (!isMobile && !selectedCompany && paginated.length > 0) { setSelectedCompany(paginated[0].company); setSelectedCompanyData(paginated[0]); }
    }
  }, [user, subscriptionExpired, paymentStatus, paymentLoading, debouncedCompanySearch, sortBy, companyPage, isInitialLoadDone, allProcessedCompanies, selectedCompany, levelFilter]);

  const fetchCompanyJobs = useCallback(async (pageOverride, searchOverride, levelOverride) => {
    if (!user || !selectedCompany || (paymentStatus !== 'paid' && paymentStatus !== 'pending' && paymentStatus !== 'active') || subscriptionExpired) return;

    const page = pageOverride || jobPage;
    // Use the specific right-panel job search IF it exists, otherwise use the main left-panel company filter
    const search = (searchOverride !== undefined) ? searchOverride : jobSearch;
    const level = levelOverride || jobLevelFilter;

    // --- Cache check (bump version to invalidate any stale pre-fix cache) ---
    if (!window._companyJobsCache) window._companyJobsCache = new Map();
    const cacheKey = `v2|${selectedCompany}|${page}|${search}|${level}`;
    const cached = window._companyJobsCache.get(cacheKey);
    if (cached) {
      setCompanyJobs(cached.jobs);
      setTotalCompanyJobs(cached.total);
      return;
    }

    setJobsLoading(true);
    setCompanyJobs([]); // Immediate clear to prevent stale flash
    try {
      const from = (page - 1) * JOBS_PER_PAGE;
      const to = from + JOBS_PER_PAGE - 1;

      // 1. Sponsored jobs query
      let q1 = supabase.from('job_jobrole_sponsored_sync').select('*', { count: 'exact' }).eq('company', selectedCompany);
      if (search && search.trim()) {
        const words = search.trim().split(/\s+/).filter(w => w.length >= 1);
        if (words.length > 0) {
          const titleCond = `and(${words.map(w => `title.ilike.%${w}%`).join(',')})`;
          const roleCond = `and(${words.map(w => `job_role_name.ilike.%${w}%`).join(',')})`;
          q1 = q1.or(`${titleCond},${roleCond}`);
        }
      }
      if (level && level.length > 0) {
        const expanded = level.flatMap(l => {
          const n = l.match(/\d/)?.[0];
          if (!n) return [l];
          const roman = { '1': 'I', '2': 'II', '3': 'III', '4': 'IV' }[n];
          return [l, `Level ${n}`, `Level ${roman}`, n, `Lv ${n}`, `Lv${n}`];
        });
        q1 = q1.in('wage_level', expanded);
      }

      // 2. Audit reviews sync (human verified)
      let q2 = supabase.from('audit_reviews_sync').select('*').eq('company', selectedCompany).eq('tl_confirmation', 'yes');
      if (search && search.trim()) {
        const words = search.trim().split(/\s+/).filter(w => w.length >= 1);
        if (words.length > 0) {
          const roleCond = `and(${words.map(w => `role.ilike.%${w}%`).join(',')})`;
          const domainCond = `and(${words.map(w => `domain.ilike.%${w}%`).join(',')})`;
          q2 = q2.or(`${roleCond},${domainCond}`);
        }
      }

      // 3. Audit reviews backup (human verified)
      let q3 = supabase.from('audit_reviews_backup').select('*').eq('company', selectedCompany).eq('tl_confirmation', 'yes');
      if (search && search.trim()) {
        const words = search.trim().split(/\s+/).filter(w => w.length >= 1);
        if (words.length > 0) {
          const roleCond = `and(${words.map(w => `role.ilike.%${w}%`).join(',')})`;
          const domainCond = `and(${words.map(w => `domain.ilike.%${w}%`).join(',')})`;
          q3 = q3.or(`${roleCond},${domainCond}`);
        }
      }

      const [resSponsored, resSync, resBackup] = await Promise.all([
        q1.order('wage_num', { ascending: false, nullsFirst: false }).order('date_posted', { ascending: false }),
        q2.order('audit_date', { ascending: false }),
        q3.order('audit_date', { ascending: false })
      ]);

      // ── Normalize helper ──────────────────────────────────────────────────────
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
      // We no longer use URL as a key differentiator because duplicate listings often use different tracking URLs
      const _jobKey = (j) => {
        const co = String(j.company || selectedCompany || '').toLowerCase().trim();
        const ti = _normR(j.title || j.role || j.job_role_name || '');
        const lo = _normR(j.location || 'us');
        return `${co}||${ti}||${lo}`;
      };

      // Role key for verification lookup: Company + Domain/Role
      const _roleKey = (j) => {
        const co = String(j.company || selectedCompany || '').toLowerCase().trim();
        const ro = _normR(j.job_role_name || j.role || '');
        return `${co}||${ro}`;
      };

      // ── Pass 1: Flatten + dedup verified jobs (sync + backup) ────────────────
      const allVerifiedRaw = [
        ...(resSync.data || []),
        ...(resBackup.data || [])
      ].map(r => ({
        ...r,
        title:        null, // Verified tables don't have a 'title' column, so we start with null
        url:          r.job_link,
        date_posted:  r.audit_date,
        job_role_name: r.domain,
        isVerified:   true,
        isTeaser:     paymentStatus === 'pending',
        job_id:       r.job_id || r.id,
      }));

      // Dedup verified jobs by role key — sync and backup share the same records
      const verifiedByRole = new Map(); // roleKey → job
      allVerifiedRaw.forEach(v => {
        const rk = _roleKey(v);
        const existing = verifiedByRole.get(rk);
        if (!existing) {
          verifiedByRole.set(rk, v);
        } else {
          // Merge: keep richest salary/wage data
          verifiedByRole.set(rk, {
            ...existing, ...v,
            salary:     existing.salary     || v.salary,
            wage_level: existing.wage_level || v.wage_level,
            url:        existing.url        || v.url,
            isVerified: true,
          });
        }
      });
      const verifiedJobs = Array.from(verifiedByRole.values());

      // ── Pass 1.5: DEEP FETCH sponsored metadata for ALL verified links ────────
      // This ensures we have the 'title' column for 100% of verified data
      const deepUrls = [...new Set(verifiedJobs.map(v => v.url))].filter(Boolean);
      let deepSponsored = [];
      if (deepUrls.length > 0) {
        // Fetch in chunks of 100 to avoid URL length limits if any
        for (let i = 0; i < deepUrls.length; i += 100) {
          const chunk = deepUrls.slice(i, i + 100);
          const { data: dData } = await supabase
            .from('job_jobrole_sponsored_sync')
            .select('*')
            .in('url', chunk);
          if (dData) deepSponsored.push(...dData);
        }
      }

      const sponsoredJobs = [
        ...(resSponsored.data || []),
        ...deepSponsored
      ].map(j => ({
        ...j,
        job_id: j.id,
        title:  j.title, // Take the raw title column
        role:   j.job_role_name,
        isTeaser: paymentStatus === 'pending',
      }));

      // ── Pass 2: Map deep-fetched titles BACK to verified records ────────────
      // This is the critical step: verified jobs must "know" their title before deduplication
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
          v.id = meta.id; // Link to the real record id
        }
      });

      // ── Pass 3: Combine jobs into unique map ────────────────────────────────
      // Use logical Job Identity (Company + Title + Location) as the primary key
      // to eliminate duplicates that have different tracking URLs but same content.
      const finalMap = new Map();

      // 1. Process sponsored jobs
      sponsoredJobs.forEach(j => {
        const jk = _jobKey(j);
        const existing = finalMap.get(jk);
        // If we have a duplicate link in the pool, keep the one with better metadata (salary/level)
        if (!existing || (!existing.salary && j.salary)) {
          finalMap.set(jk, {
            ...j,
            isVerified: verifiedByRole.has(_roleKey(j))
          });
        }
      });

      // 2. Process verified jobs (merge or add)
      verifiedJobs.forEach(v => {
        const jk = _jobKey(v);
        const existing = finalMap.get(jk);
        if (!existing) {
          finalMap.set(jk, v);
        } else {
          // Merge verified status and richer data into the sponsored entry
          finalMap.set(jk, {
            ...existing,
            ...v,
            isVerified: true,
            salary:     existing.salary     || v.salary,
            wage_level: existing.wage_level || v.wage_level,
            url:        existing.url        || v.url,
            // Strictly prefer the sponsored title, then role from audit, then domain
            title:      existing.title, 
            job_id:     existing.job_id     || v.job_id,
          });
        }
      });

      let unique = Array.from(finalMap.values());


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

      const total = paymentStatus === 'pending' ? Math.min(2, unique.length) : unique.length;

      // Final Priority Sort: (1) Salary First, (2) Verified, (3) Newest
      unique.sort((a, b) => {
        const hasSal = (s) => s && s.includes('$');
        const aHasSal = hasSal(a.salary);
        const bHasSal = hasSal(b.salary);
        if (aHasSal && !bHasSal) return -1;
        if (!aHasSal && bHasSal) return 1;

        if (a.isVerified && !b.isVerified) return -1;
        if (!a.isVerified && b.isVerified) return 1;

        const dateA = new Date(a.date_posted || 0).getTime();
        const dateB = new Date(b.date_posted || 0).getTime();
        return dateB - dateA;
      });

      // Fetch filing count for this company to show on cards
      let lcaCount = 0;
      const { data: sData } = await supabase
        .from('h1b_sponsor_finder')
        .select('"LCA Filings"')
        .ilike('Company', `%${selectedCompany}%`)
        .limit(1);

      if (sData && sData[0]) {
        const val = sData[0]["LCA Filings"];
        lcaCount = typeof val === 'number' ? val : parseInt(String(val || 0).replace(/,/g, '')) || 0;
      }

      const jobsWithFilings = unique.map(j => ({ ...j, lca_filings: lcaCount }));

      // Pagination after sorting
      const pagedUnique = jobsWithFilings.slice(from, to + 1);
      
      // Update cache even if stale (so it's available if user clicks back)
      window._companyJobsCache.set(cacheKey, { jobs: pagedUnique, total });

      // STALE CHECK: Ensure we only update state if this company is still the selected one
      if (activeCompanyRef.current !== selectedCompany) return;

      setCompanyJobs(pagedUnique);
      setTotalCompanyJobs(total);
    } catch (err) {
      console.error("fetchCompanyJobs Error:", err);
    } finally {
      if (activeCompanyRef.current === selectedCompany) {
        setJobsLoading(false);
      }
    }
  }, [user, selectedCompany, subscriptionExpired, debouncedJobSearch, debouncedCompanySearch, jobSearch, jobPage, jobLevelFilter, paymentStatus]);



  useEffect(() => {
    const isPaid = paymentStatus === 'paid' || paymentStatus === 'active';
    if (user && activeView === 'all_companies' && isPaid) {
      fetchCompanies();
    }
  }, [fetchCompanies, activeView, user, paymentStatus]);

  // Fetch company jobs when company changes (single trigger, cache prevents re-fetch)
  useEffect(() => {
    if (user && selectedCompany && activeView === 'all_companies') {
      fetchCompanyJobs();
      if (isMobile) setMobileActiveCol('right');
    }
  }, [fetchCompanyJobs, user, selectedCompany, activeView, isMobile]);
  useEffect(() => { if (user) { fetchSavedJobIds(); fetchAppliedJobIds(); } }, [user]);

  // ── Realtime: when new tl_confirmation='yes' rows are synced into audit_reviews_backup,
  //             clear company caches and re-fetch so verified badges update automatically
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('hp_audit_backup_insert')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_reviews_backup' },
        (payload) => {
          if (payload?.new?.tl_confirmation === 'yes') {
            // Clear all company caches so next fetchCompanies gets fresh confirmed list
            window._allProcessedCompanies = null;
            window._confirmedCompaniesCache = null;
            window._companyJobsCache = null; // Clear jobs cache as well
            try { sessionStorage.removeItem('_companiesCache_v8'); } catch (_) { }
            setIsInitialLoadDone(false);
            setAllProcessedCompanies([]);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);


  const fetchSavedJobIds = async () => {
    if (!user) return;
    try {
      await new Promise(r => setTimeout(r, 100)); // Stagger load to prevent 525
      const { data, error } = await supabase.from('saved_jobs').select('job_id').eq('user_id', user.id);
      if (error) throw error;
      if (data) setSavedJobIds(new Set(data.map(i => String(i.job_id))));
    } catch (err) {
      if (!err.message?.includes('fetch') && window.navigator.onLine) {
        console.error("fetchSavedJobIds Error:", err);
      }
    }
  };
  const fetchAppliedJobIds = async () => {
    if (!user) return;
    try {
      await new Promise(r => setTimeout(r, 200)); // Stagger load to prevent 525
      const { data, error } = await supabase.from('applied_jobs').select('job_id').eq('user_id', user.id);
      if (error) throw error;
      if (data) setAppliedJobIds(new Set(data.map(i => String(i.job_id))));
    } catch (err) {
      if (!err.message?.includes('fetch') && window.navigator.onLine) {
        console.error("fetchAppliedJobIds Error:", err);
      }
    }
  };

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
  const handleCompanySelect = (c) => {
    setCompanyJobs([]); // Clear immediately
    setSelectedCompany(c.company);
    setSelectedCompanyData(c);
    setJobPage(1);
    setJobSearch('');
    setJobLevelFilter([]); // Correctly reset as empty array
    if (isMobile) setMobileActiveCol('right');
  };

  if (authLoading || paymentLoading) return <div className="h-screen w-screen flex items-center justify-center bg-[#f5f5f7]"><Loader2 className="w-8 h-8 text-[#24385E] animate-spin" /></div>;
  if (!user) return <div className="bg-white"><Navbar /><HeroSection /><Testimonials /><FAQ /><Footer /></div>;

  // ── Payment gate: show teaser if not paid (admins always bypass) ──
  const isPaid = paymentStatus === 'paid' || paymentStatus === 'active' || paymentStatus === 'completed' || isAdmin;
  if (!isPaid) return <TeaserDashboard user={user} signOut={handleLogout} navigate={navigate} isMobile={isMobile} />;

  const navItems = [
    { id: 'all_companies', label: 'All Companies\nthat Sponsor', icon: Building2 },
    { id: 'all_jobs', label: 'All Jobs', icon: Briefcase },
    { id: 'h1b_finder', label: 'H-1B Visa Sponsor Finder', icon: Globe },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
  ];

  /* ─────────────────────────────────────── */
  /*  INLINE STYLES MATCHING SCREENSHOT 1   */
  /* ─────────────────────────────────────── */
  const S = {
    page: { display: 'flex', height: '100vh', overflow: 'hidden', background: '#f5f5f7', fontFamily: "'Inter', sans-serif" },
    sidebar: {
      width: isMobile ? (mobileMenuOpen ? '280px' : '0') : '260px',
      minWidth: isMobile ? (mobileMenuOpen ? '280px' : '0') : '260px',
      background: '#ffffff',
      borderRight: '1px solid #e8e8e8',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: isMobile ? 'fixed' : 'relative',
      zIndex: 9999,  // Must be above search pill (2010) and suggestions (2000)
      height: '100vh',
      left: 0,
      top: 0,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      boxShadow: isMobile && mobileMenuOpen ? '0 0 40px rgba(0,0,0,0.1)' : 'none'
    },
    sidebarLogo: { padding: '24px 24px 20px', minWidth: '260px' },
    sidebarNav: { flex: 1, padding: '0 12px', overflowY: 'auto', minWidth: '260px' },
    navItem: (active) => ({
      width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
      padding: '10px 14px', borderRadius: '12px', fontSize: '14px', fontWeight: active ? 600 : 400,
      color: active ? '#24385E' : '#666', background: active ? 'rgba(36,56,94,0.07)' : 'transparent',
      border: 'none', cursor: 'pointer', transition: 'all 180ms ease', marginBottom: '4px',
      textAlign: 'left',
    }),
    sidebarBottom: { padding: '12px 12px 20px', borderTop: '1px solid #efefef', minWidth: '260px' },
    userRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 12px 0' },
    main: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' },
    topBar: {
      background: '#fff',
      borderBottom: '1px solid #e8e8e8',
      display: 'flex',
      alignItems: 'center',
      justifyContent: isMobile ? 'space-between' : 'center',
      gap: '12px',
      padding: isMobile ? '0 16px' : '11px 24px',
      height: isMobile ? '60px' : 'auto',
      flexShrink: 0
    },
    content: { flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' },
    leftCol: {
      width: isMobile ? '100%' : '460px',
      minWidth: isMobile ? '0' : '460px',
      background: '#f5f5f7',
      display: (isMobile && mobileActiveCol === 'right') ? 'none' : 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0
    },
    searchWrap: { padding: isMobile ? '16px 12px' : '20px 20px 12px' },
    searchRow: { display: 'flex', alignItems: 'center', gap: '10px' },
    searchPill: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#fff', border: '1.5px solid #d8d8d8', borderRadius: '60px', padding: '0 16px', height: isMobile ? '46px' : '52px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' },
    searchInput: { flex: 1, border: 'none', outline: 'none', fontSize: isMobile ? '14px' : '15px', color: '#333', background: 'transparent', minWidth: 0 },
    filterBtn: { display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', border: '1.5px solid #d8d8d8', borderRadius: '60px', padding: isMobile ? '0 14px' : '0 18px', height: isMobile ? '46px' : '52px', fontSize: '14px', fontWeight: 500, color: '#555', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', whiteSpace: 'nowrap', flexShrink: 0 },
    countRow: { padding: '0 20px 8px', textAlign: 'center', fontSize: '13px', color: '#888' },
    companyList: { flex: 1, overflowY: 'auto', padding: isMobile ? '0 10px 24px' : '0 16px 24px', scrollbarWidth: 'none' },
    rightCol: {
      flex: 1,
      background: '#fff',
      display: (isMobile && mobileActiveCol === 'left') ? 'none' : 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    rightScroll: { flex: 1, overflowY: 'auto', padding: isMobile ? '20px' : '32px 40px', scrollbarWidth: 'none' },
    coLogo: { width: isMobile ? '48px' : '56px', height: isMobile ? '48px' : '56px', borderRadius: '16px', background: '#24385E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: isMobile ? '16px' : '18px', fontWeight: 900, color: '#fff', flexShrink: 0 },
    jobSearchPill: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: '#f9f9f9', border: '1.5px solid #e0e0e0', borderRadius: '60px', padding: '0 16px', height: isMobile ? '46px' : '50px' },
    jobSearchInput: { flex: 1, border: 'none', outline: 'none', fontSize: '14px', color: '#333', background: 'transparent', minWidth: 0 },
    searchBtn: { height: isMobile ? '46px' : '50px', padding: isMobile ? '0 20px' : '0 28px', background: '#24385E', color: '#fff', border: 'none', borderRadius: '60px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 6px rgba(36,56,94,0.3)' }
  };

  return (
    <div style={S.page}>

      {/* Sidebar Overlay for Mobile */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9998 }}
        />
      )}

      {/* ═══════════════ SIDEBAR ═══════════════ */}
      <aside style={S.sidebar}>
        {/* Logo */}
        <div style={S.sidebarLogo}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '42px', height: '42px', background: '#24385E', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(12deg)' }}>
                  <span style={{ color: '#fff', fontWeight: 900, fontSize: '10px' }}>H1-B</span>
                </div>
                <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '14px', height: '14px', background: '#EAB308', borderRadius: '50%', border: '2px solid #fff' }}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#24385E' }}>Wage</span>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#EAB308' }}>Trail</span>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={() => setMobileMenuOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#666' }}
              >
                <X size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav style={S.sidebarNav}>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = activeView === item.id;
            const isMultiLine = item.label.includes('\n');
            return (
              <button key={item.id} style={S.navItem(active)} onClick={() => { setActiveView(item.id); if (isMobile) setMobileMenuOpen(false); }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#333'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666'; } }}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.6} />
                {isMultiLine
                  ? <span style={{ lineHeight: '1.35' }}>{item.label.split('\n').map((line, i) => i === 0 ? line : <><br key={i} />{line}</>)}</span>
                  : <span>{item.label}</span>
                }
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={S.sidebarBottom}>
          <button style={S.navItem(activeView === 'settings')} onClick={() => { setActiveView('settings'); if (isMobile) setMobileMenuOpen(false); }}
            onMouseEnter={e => { if (activeView !== 'settings') { e.currentTarget.style.background = '#f5f5f5'; } }}
            onMouseLeave={e => { if (activeView !== 'settings') { e.currentTarget.style.background = 'transparent'; } }}
          >
            <Settings size={18} strokeWidth={1.6} /><span>Settings</span>
          </button>

          {/* Admin Panel — only visible when role === 'admin' */}
          {isAdmin && (
            <button
              style={{
                ...S.navItem(false),
                color: '#24385E',
                background: 'rgba(36,56,94,0.08)',
                border: '1px solid rgba(36,56,94,0.15)',
                marginTop: '4px',
              }}
              onClick={() => { navigate('/admin'); if (isMobile) setMobileMenuOpen(false); }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(36,56,94,0.14)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(36,56,94,0.08)'}
            >
              <Shield size={18} strokeWidth={1.8} />
              <span style={{ fontWeight: 700 }}>Admin Panel</span>
              <span style={{
                marginLeft: 'auto', fontSize: '9px', fontWeight: 800,
                background: '#24385E', color: '#fff',
                padding: '2px 6px', borderRadius: '20px', letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}>Admin</span>
            </button>
          )}

          <button
            style={{ ...S.navItem(false), color: '#ef4444' }}
            onClick={handleLogout}
            onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <LogOut size={18} strokeWidth={1.6} />
            <span>Logout</span>
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
        <div style={S.topBar}>
          {isMobile && (
            <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginLeft: '-8px' }}>
              <Menu size={24} color="#24385E" />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {activeView === 'all_companies' ? <Building2 size={20} color="#24385E" /> : <Briefcase size={20} color="#24385E" />}
            <span style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {activeView === 'all_companies' ? 'Search open roles by company' : 'Verified Sponsored Jobs'}
            </span>
          </div>

          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: '12px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#24385E' }} />
              <div style={{ width: '36px', height: '3px', background: '#24385E', borderRadius: '3px' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#24385E' }} />
              <div style={{ width: '36px', height: '3px', background: '#ddd', borderRadius: '3px' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ddd' }} />
            </div>
          )}
          {isMobile && <div style={{ width: '32px' }} />}
        </div>

        <div style={S.content}>

          {/* ━━━━━━ BILLING VIEW ━━━━━━ */}
          {activeView === 'billing' && (
            <div style={{ flex: 1, height: '100%', overflowY: 'auto', background: '#fff', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              <PaymentDetailsTab />
            </div>
          )}

          {/* ━━━━━━ H-1B FINDER VIEW ━━━━━━ */}
          {activeView === 'h1b_finder' && (
            <div style={{ flex: 1, height: '100%', overflowY: 'auto', background: '#fff', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              <H1BSponsorFinder isMobile={isMobile} />
            </div>
          )}

          {/* ━━━━━━ ALL COMPANIES VIEW ━━━━━━ */}
          {activeView === 'all_companies' && (
            <>
              {/* LEFT COLUMN */}
              <div style={S.leftCol}>

                <div style={S.searchWrap}>
                  <div style={S.searchRow}>
                    <div style={{ position: 'relative', flex: 1, display: 'flex' }}>
                      <div style={{
                        ...S.searchPill,
                        background: showSuggestions && filteredSuggestions.length > 0 ? '#24385E' : '#fff',
                        borderRadius: showSuggestions && filteredSuggestions.length > 0 ? '24px 24px 0 0' : '16px',
                        borderBottom: showSuggestions && filteredSuggestions.length > 0 ? '1px solid rgba(255,255,255,0.1)' : '1px solid #e5e7eb',
                        transition: 'all 0.2s',
                        zIndex: 2010
                      }}>
                        <Search size={18} color={showSuggestions && filteredSuggestions.length > 0 ? '#94a3b8' : '#999'} style={{ flexShrink: 0 }} />
                        <input
                          style={{
                            ...S.searchInput,
                            color: showSuggestions && filteredSuggestions.length > 0 ? '#fff' : '#1a1a1a',
                            transition: 'color 0.2s'
                          }}
                          type="text"
                          value={companySearch}
                          onChange={handleCompanySearchChange}
                          onFocus={() => { if (companySearch.length > 0) setShowSuggestions(true); }}
                          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                          placeholder="Search companies"
                        />
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
                          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                          zIndex: 2000,
                          overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.1)',
                          animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                          paddingTop: '52px'
                        }}>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '4px' }}>
                            {filteredSuggestions.map((role, idx) => (
                              <div
                                key={role}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  handleSuggestionClick(role);
                                }}
                                style={{
                                  padding: '12px 20px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
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
                                <Search size={14} color="#94a3b8" />
                                <span style={{ fontWeight: 400 }}>{role}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {!isMobile && (
                      <button
                        style={{ ...S.filterBtn, background: showCompanyFilters ? '#24385E' : '#fff', color: showCompanyFilters ? '#fff' : '#555' }}
                        onClick={() => setShowCompanyFilters(!showCompanyFilters)}
                      >
                        <SlidersHorizontal size={15} color={showCompanyFilters ? '#fff' : '#777'} />
                        Filters {levelFilter.length > 0 ? `(${levelFilter.length})` : ''}
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Level Filter Buttons (Inside Toggle) ── */}
                {showCompanyFilters && (
                  <div style={{ padding: '0 20px 12px', background: '#fff', borderBottom: '1px solid #efefef', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: '4px' }} className="no-scrollbar">
                      <button
                        onClick={() => { setLevelFilter([]); setCompanyPage(1); }}
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
                              setLevelFilter(prev => active ? prev.filter(x => x !== lv) : [...prev, lv]);
                              setCompanyPage(1);
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

                {/* ── Count + Sort ── */}
                <div style={S.countRow}>
                  Showing <strong style={{ color: '#333' }}>{totalCompanies.toLocaleString()}</strong> Human verified companies
                </div>
                <div style={{ padding: isMobile ? '0 12px 10px' : '0 20px 12px' }}>
                  <button onClick={() => { setSortBy(p => p === 'most_jobs' ? 'highest_wage' : p === 'highest_wage' ? 'name' : 'most_jobs'); setCompanyPage(1); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: '#333', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
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
                      isMobile={isMobile}
                      isVerified={true}
                      lca_filings={filingCounts[c.company.toLowerCase()] || filingCounts[normalizeName(c.company)] || 0}
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
                <div style={S.rightScroll} className="rightScroll-content">
                  {selectedCompany ? (
                    <>
                      {isMobile && (
                        <button onClick={() => setMobileActiveCol('left')} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', padding: '0 0 16px', color: '#24385E', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                          <ChevronLeft size={18} /> Back to list
                        </button>
                      )}

                      {paymentStatus === 'pending' && (
                        <div style={{ background: '#FFF7ED', border: '1.5px solid #FFEDD5', borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
                          <p style={{ color: '#9A3412', fontWeight: 800, fontSize: '14px', marginBottom: '8px' }}>🔒 UNLOCK ALL JOBS</p>
                          <p style={{ color: '#C2410C', fontSize: '12px', fontWeight: 500, marginBottom: '16px' }}>Get access to direct apply links and salary data.</p>
                          <button
                            onClick={() => navigate('/pricing')}
                            style={{ background: '#FDB913', color: '#111', fontWeight: 800, padding: '10px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', width: '100%' }}
                          >
                            Get Full Access →
                          </button>
                        </div>
                      )}

                      {/* ── Company header ── */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <LogoBox name={selectedCompany} size={isMobile ? 48 : 56} fontSize={isMobile ? 16 : 18} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <h2 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: '#111', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedCompany}</h2>
                              {(filingCounts[selectedCompany.toLowerCase()] || filingCounts[normalizeName(selectedCompany)]) > 0 && (
                                <div style={{
                                  display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '3px 10px',
                                  borderRadius: '8px', fontSize: '11px', fontWeight: 800, color: '#24385E', flexShrink: 0
                                }}>
                                  <Globe size={11.5} strokeWidth={2.5} />
                                  {(filingCounts[selectedCompany.toLowerCase()] || filingCounts[normalizeName(selectedCompany)]).toLocaleString()} Filings
                                </div>
                              )}
                            </div>
                            <p style={{ fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ExternalLink size={12} color="#999" />
                              <a
                                href={`https://${selectedCompanyData?.domain || `${selectedCompany.toLowerCase().replace(/\s+/g, '')}.com`}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: '#24385E', textDecoration: 'none', fontWeight: 700 }}
                                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                              >
                                {selectedCompanyData?.domain || `${selectedCompany.toLowerCase().replace(/\s+/g, '')}.com`}
                              </a>
                            </p>
                          </div>
                        </div>
                        {!isMobile && (
                          <button onClick={() => { setSelectedCompany(null); setSelectedCompanyData(null); }}
                            style={{ padding: '6px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                            <X size={18} color="#aaa" />
                          </button>
                        )}
                      </div>

                      {/* ── Sponsored count ──
                      <p style={{ fontSize: '14px', color: '#222', fontWeight: 600, margin: '0 0 14px' }}>
                        {selectedCompanyData?.jobCount || totalCompanyJobs}+ H-1B visas sponsored
                      </p> */}

                      {/* ── Wage badges ── */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                        {['Lv 1', 'Lv 2', 'Lv 3', 'Lv 4'].map((lbl, i) => {
                          const lvl = parseInt(selectedCompanyData?.wageLevel?.match(/\d/)?.[0] || '2');
                          return (
                            <span key={lbl} style={{
                              fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px',
                              background: i + 1 <= lvl ? '#24385E' : '#fff',
                              color: i + 1 <= lvl ? '#fff' : '#bbb',
                              border: i + 1 <= lvl ? '1px solid #24385E' : '1px solid #e0e0e0',
                            }}>{lbl}</span>
                          );
                        })}
                      </div>

                      {/* ── Level Filters Toggle moved inside Filter Option ── */}
                      {showJobFilters && (
                        <div style={{ padding: '0 0 16px', display: 'flex', gap: '6px', overflowX: 'auto', scrollbarWidth: 'none' }} className="no-scrollbar">
                          <button
                            onClick={() => { setJobLevelFilter([]); setJobPage(1); }}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '12px',
                              fontSize: '10px',
                              fontWeight: 800,
                              whiteSpace: 'nowrap',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              border: jobLevelFilter.length === 0 ? '1.5px solid #24385E' : '1.5px solid #e5e7eb',
                              background: jobLevelFilter.length === 0 ? '#24385E' : '#fff',
                              color: jobLevelFilter.length === 0 ? '#fff' : '#6b7280',
                            }}
                          >
                            All Levels
                          </button>
                          {['Lv 1', 'Lv 2', 'Lv 3', 'Lv 4'].map((lv) => {
                            const active = jobLevelFilter.includes(lv);
                            return (
                              <button
                                key={lv}
                                onClick={() => { setJobLevelFilter(prev => active ? prev.filter(x => x !== lv) : [...prev, lv]); setJobPage(1); }}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '12px',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  border: active ? '1.5px solid #24385E' : '1.5px solid #e5e7eb',
                                  background: active ? '#24385E' : '#fff',
                                  color: active ? '#fff' : '#6b7280',
                                }}
                              >
                                {lv}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* ── Job search bar with live suggestions ── */}
                      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '10px', marginBottom: '16px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <div style={{
                            ...S.jobSearchPill,
                            background: (showJobSuggestions && jobFilteredSuggestions.length > 0) ? '#24385E' : '#fff',
                            borderRadius: (showJobSuggestions && jobFilteredSuggestions.length > 0) ? '16px 16px 0 0' : (S.jobSearchPill.borderRadius || '50px'),
                            borderBottom: (showJobSuggestions && jobFilteredSuggestions.length > 0) ? '1px solid rgba(255,255,255,0.1)' : undefined,
                            position: 'relative',
                            zIndex: 2010,
                            transition: 'all 0.2s'
                          }}>
                            <Search size={16} color={(showJobSuggestions && jobFilteredSuggestions.length > 0) ? '#94a3b8' : '#bbb'} style={{ flexShrink: 0 }} />
                            <input
                              style={{
                                ...S.jobSearchInput,
                                color: (showJobSuggestions && jobFilteredSuggestions.length > 0) ? '#fff' : '#1e293b',
                                transition: 'color 0.2s',
                                background: 'transparent'
                              }}
                              type="text"
                              value={jobSearch}
                              onChange={handleJobSearchChange}
                              onFocus={() => { if (jobSearch.trim().length > 0) setShowJobSuggestions(true); }}
                              onBlur={() => setTimeout(() => setShowJobSuggestions(false), 200)}
                              placeholder={`Search jobs at ${selectedCompany}`}
                            />
                            {jobSearch.length > 0 && (
                              <button onClick={() => { setJobSearch(''); setJobFilteredSuggestions([]); setShowJobSuggestions(false); }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                                <X size={16} color="#94a3b8" />
                              </button>
                            )}
                          </div>

                          {/* Job suggestions dropdown */}
                          {showJobSuggestions && jobFilteredSuggestions.length > 0 && (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              backgroundColor: '#24385E',
                              borderRadius: '16px',
                              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
                              zIndex: 2000,
                              overflow: 'hidden',
                              border: '1px solid rgba(255,255,255,0.1)',
                              paddingTop: '50px'
                            }}>
                              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                {jobFilteredSuggestions.map((role) => (
                                  <div
                                    key={role}
                                    onMouseDown={(e) => {
                                      e.preventDefault();
                                      handleJobSuggestionClick(role);
                                    }}
                                    style={{
                                      padding: '11px 18px',
                                      cursor: 'pointer',
                                      fontSize: '13px',
                                      color: '#fff',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '12px',
                                      background: 'transparent',
                                      transition: 'background 0.15s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                  >
                                    <Search size={13} color="#94a3b8" />
                                    <span style={{ fontWeight: 400 }}>{role}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => setShowJobFilters(!showJobFilters)}
                            style={{
                              ...S.filterBtn, height: isMobile ? '46px' : '50px',
                              background: showJobFilters ? '#24385E' : '#fff',
                              color: showJobFilters ? '#fff' : '#555'
                            }}
                          >
                            <SlidersHorizontal size={14} color={showJobFilters ? '#fff' : '#777'} />
                            Filters
                          </button>
                          <button style={S.searchBtn} onClick={() => fetchCompanyJobs(1, jobSearch, jobLevelFilter)}>
                            Search
                          </button>
                        </div>
                      </div>

                      {/* ── Job list ── */}
                      {jobsLoading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px 0' }}>
                          <Loader2 className="w-6 h-6 text-[#24385E] animate-spin" />
                        </div>
                      ) : companyJobs.length > 0 ? (
                        <>
                          {companyJobs.map((job, i) => (
                            <CompanyJobCard
                              key={`${job.url || job.id || job.job_id || 'job'}_${i}`}
                              job={{ ...job, isVerified: true }}
                              isMobile={isMobile}
                              isSaved={savedJobIds.has(String(job.id || job.job_id || job.audit_id))}
                              onSave={handleSaveJob} />
                          ))}

                          {/* ── JOB PAGINATION ── */}
                          {totalCompanyJobs > JOBS_PER_PAGE && (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '24px', paddingBottom: '32px' }}>
                              <button
                                onClick={async () => {
                                  const next = Math.max(1, jobPage - 1);
                                  if (next === jobPage) return;
                                  setJobPage(next);
                                  await new Promise(r => setTimeout(r, 100)); // Stagger load
                                  document.querySelector('.rightScroll-content')?.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={jobPage === 1}
                                style={{
                                  padding: '6px 8px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff',
                                  cursor: 'pointer', opacity: jobPage === 1 ? 0.3 : 1, transition: 'all 0.2s'
                                }}>
                                <ChevronLeft size={16} color="#24385E" />
                              </button>

                              <span style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>
                                {jobPage} / {Math.ceil(totalCompanyJobs / JOBS_PER_PAGE)}
                              </span>

                              <button
                                onClick={async () => {
                                  const next = jobPage + 1;
                                  if (next > Math.ceil(totalCompanyJobs / JOBS_PER_PAGE)) return;
                                  setJobPage(next);
                                  await new Promise(r => setTimeout(r, 100)); // Stagger load
                                  document.querySelector('.rightScroll-content')?.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                disabled={jobPage * JOBS_PER_PAGE >= totalCompanyJobs}
                                style={{
                                  padding: '6px 8px', borderRadius: '8px', border: '1px solid #e0e0e0', background: '#fff',
                                  cursor: 'pointer', opacity: jobPage * JOBS_PER_PAGE >= totalCompanyJobs ? 0.3 : 1, transition: 'all 0.2s'
                                }}>
                                <ChevronRight size={16} color="#24385E" />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                          <p style={{ fontSize: '13px', color: '#aaa' }}>No open roles found at the moment.</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Building2 size={48} color="#e0e0e0" style={{ margin: '0 auto 12px' }} />
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#666', margin: '0 0 6px' }}>Select a Company</h3>
                        <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>View sponsoring companies on the left.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeView === 'all_jobs' && (
            <div style={{ flex: 1, height: '100%', overflowY: 'auto', background: '#fff', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ padding: isMobile ? '16px 12px 32px' : '32px 40px' }}>
                <AllJobsTab />
              </div>
            </div>
          )}

          {/* Settings / Saved / Applied Views */}
          {activeView === 'saved' && <div style={{ flex: 1, height: '100%', overflowY: 'auto', background: '#fff', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}><div style={{ padding: isMobile ? '20px 16px' : '40px', maxWidth: '900px', margin: '0 auto' }}><SavedJobsTab /></div></div>}
          {activeView === 'applied' && <div style={{ flex: 1, height: '100%', overflowY: 'auto', background: '#fff', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}><div style={{ padding: isMobile ? '20px 16px' : '40px', maxWidth: '900px', margin: '0 auto' }}><AppliedJobsTab /></div></div>}
          {activeView === 'settings' && <div style={{ flex: 1, height: '100%', overflowY: 'auto', background: '#fff', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}><div style={{ padding: isMobile ? '20px 16px' : '40px', maxWidth: '800px', margin: '0 auto' }}><ProfileTab /></div></div>}

        </div>
      </div>
    </div>
  );
};

export default Homepage;
