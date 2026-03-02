import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { externalSupabase } from '../externalSupabaseClient';
import useAuth from '../hooks/useAuth';
import {
  Loader2, Search, Briefcase, Heart, CheckSquare, Settings,
  ChevronLeft, ChevronRight, ArrowUpDown, Eye,
  MessageSquare, Gift, Archive, Building2, X, Users, Mail,
  ExternalLink, SlidersHorizontal, HelpCircle, Lock, LogOut, CreditCard,
  Menu, Zap, Sparkles
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

  const TARGET_NAMES = ['Google', 'Microsoft'];
  const LOGOS = {
    'Google': 'https://www.gstatic.com/images/branding/product/2x/googleg_96dp.png',
    'Microsoft': 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'
  };

  const getLogo = (name) => LOGOS[name] || null;
  const getInitials = (n) => {
    if (!n) return '??';
    const words = n.split(' ');
    if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
    return n.substring(0, 2).toUpperCase();
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
              name,
              logo: getLogo(name),
              jobs: companyData.slice(0, 2).map(j => ({ ...j, isTeaser: true, logo: getLogo(name) })),
              count: companyData.length,
              level: companyData[0].wage_level || 'Lv 2'
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
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#f8fafc', fontFamily: "'Inter', sans-serif", position: 'relative' }}>

      {/* Sidebar Overlay for Mobile */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: isMobile ? (mobileMenuOpen ? '280px' : '0') : '260px',
        minWidth: isMobile ? (mobileMenuOpen ? '280px' : '0') : '260px',
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'relative',
        zIndex: 100,
        height: '100vh',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '24px', minWidth: '260px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => navigate('/')}>
              <div style={{ width: 40, height: 40, background: '#24385E', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 12 }}>H1-B</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#24385E' }}>Wage</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#FDB913' }}>Level</span>
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

        <nav style={{ flex: 1, padding: '0 12px', minWidth: '260px' }}>
          {[
            { label: 'Dashboard', icon: Building2, active: true },
            { label: 'Pricing Plans', icon: Gift, onClick: () => navigate('/pricing') },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <button key={i}
                onClick={item.onClick}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 16px', borderRadius: 10, fontSize: 14,
                  fontWeight: item.active ? 600 : 500,
                  color: item.active ? '#24385E' : '#64748b',
                  background: item.active ? '#f1f5f9' : 'transparent',
                  border: 'none', cursor: 'pointer', marginBottom: 4, textAlign: 'left',
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', minWidth: '260px' }}>
          <button onClick={signOut} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px', borderRadius: 8, fontSize: 14, color: '#ef4444',
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}>
            <LogOut size={16} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: isMobile ? '0 16px' : '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMobile ? 'space-between' : 'space-between',
          height: isMobile ? '60px' : 'auto',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {isMobile && (
              <button onClick={() => setMobileMenuOpen(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginLeft: '-8px' }}>
                <Menu size={24} color="#24385E" />
              </button>
            )}
            <Building2 size={20} color="#24385E" />
            <span style={{ fontWeight: 600, fontSize: isMobile ? '14px' : '16px' }}>Limited Preview</span>
          </div>
          <button onClick={() => navigate('/pricing')} style={{
            background: '#FDB913', color: '#24385E', border: 'none',
            padding: isMobile ? '8px 12px' : '8px 20px', borderRadius: 8, fontWeight: 700, fontSize: isMobile ? '12px' : '13px', cursor: 'pointer'
          }}>
            Unlock Full Access
          </button>
        </header>

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
          {/* Company List */}
          <div style={{
            width: isMobile ? '100%' : '380px',
            background: '#f8fafc',
            borderRight: isMobile ? 'none' : '1px solid #e2e8f0',
            overflowY: 'auto',
            padding: '16px',
            display: (isMobile && mobileActiveCol === 'right') ? 'none' : 'block'
          }}>
            <h3 style={{ fontSize: 12, fontWeight: 700, color: '#64748b', marginBottom: 16, textTransform: 'uppercase' }}>Featured Companies</h3>
            {teaserLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Loader2 className="animate-spin" color="#24385E" /></div>
            ) : (
              <>
                {teaserCompanies.map(c => (
                  <div key={c.name}
                    onClick={() => handleSelect(c)}
                    style={{
                      background: '#fff', padding: '16px', borderRadius: 12, marginBottom: 12,
                      border: selectedTeaserCompany?.name === c.name ? '2px solid #24385E' : '1px solid #e2e8f0',
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <LogoBox name={c.name} size={40} fontSize={12} />
                      <div>
                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{c.name}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{c.count} Job Roles</div>
                      </div>
                    </div>
                  </div>
                ))}

                <div style={{ marginTop: 20, padding: '24px', background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Ready to apply?</p>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>Access more jobs from top companies with direct apply links.</p>
                  <button onClick={() => navigate('/pricing')} style={{
                    width: '100%', padding: '12px', background: '#FDB913', color: '#24385E',
                    border: 'none', borderRadius: 10, fontWeight: 800, cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(253,185,19,0.3)'
                  }}>
                    Get access to full jobs →
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Job Details */}
          <div style={{
            flex: 1,
            background: '#fff',
            overflowY: 'auto',
            padding: isMobile ? '20px' : '32px',
            display: (isMobile && mobileActiveCol === 'left') ? 'none' : 'block'
          }}>
            {selectedTeaserCompany ? (
              <>
                {isMobile && mobileActiveCol === 'right' && (
                  <button onClick={() => setMobileActiveCol('left')} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', padding: '0 0 16px', color: '#24385E', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>
                    <ChevronLeft size={18} /> Back to companies
                  </button>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                  <LogoBox name={selectedTeaserCompany.name} size={isMobile ? 50 : 60} fontSize={isMobile ? 16 : 18} />
                  <div>
                    <h2 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: '#24385E', margin: 0 }}>{selectedTeaserCompany.name}</h2>
                    <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: isMobile ? 13 : 14 }}>{selectedTeaserCompany.count}+ Visa Opportunities Found</p>
                  </div>
                </div>

                <div style={{ marginBottom: 32 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>Current Openings</h4>
                  {teaserJobs.map((job, idx) => (
                    <CompanyJobCard key={idx} job={job} isMobile={isMobile} />
                  ))}
                </div>

                <div style={{
                  padding: isMobile ? '24px' : '32px', background: 'linear-gradient(135deg, #24385E 0%, #1e293b 100%)',
                  borderRadius: 24, textAlign: 'center', color: '#fff', boxShadow: '0 12px 32px rgba(36,56,94,0.25)',
                  position: 'relative', overflow: 'hidden'
                }}>
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, background: 'rgba(253,185,19,0.1)', borderRadius: '50%' }}></div>
                  <h3 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 900, marginBottom: 12, position: 'relative' }}>Unlock Premium Access</h3>
                  <p style={{ color: '#cbd5e1', marginBottom: 28, fontSize: isMobile ? 14 : 15, position: 'relative', maxWidth: 460, margin: '0 auto 28px' }}>
                    Get the full wage levels, historic sponsorship records, and direct application links for every company.
                  </p>
                  <button onClick={() => navigate('/pricing')} style={{
                    width: isMobile ? '100%' : 'auto',
                    padding: '14px 40px', background: '#FDB913', color: '#24385E',
                    border: 'none', borderRadius: 12, fontWeight: 900, cursor: 'pointer',
                    fontSize: 15, transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(253,185,19,0.4)',
                    position: 'relative'
                  }}>
                    Complete Payment to Get Full Access →
                  </button>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: isMobile ? 40 : 100, color: '#64748b' }}>
                <Building2 size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                <p>Select a company to view available roles</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const JOBS_PER_PAGE = 15;
const COMPANIES_PER_PAGE = 25;

const Homepage = () => {
  const { user, loading: authLoading, subscriptionExpired, signOut, paymentStatus, paymentLoading, refresh: refreshAuth } = useAuth();
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
  const [jobLevelFilter, setJobLevelFilter] = useState('all');
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [allProcessedCompanies, setAllProcessedCompanies] = useState(window._allProcessedCompanies || []);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(!!window._allProcessedCompanies);
  const [levelFilter, setLevelFilter] = useState('all'); // 'all' | 'Lv 1' | 'Lv 2' | 'Lv 3' | 'Lv 4'
  const [showCompanyFilters, setShowCompanyFilters] = useState(false);
  const [showJobFilters, setShowJobFilters] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allRoles, setAllRoles] = useState([]);
  const [jobFilteredSuggestions, setJobFilteredSuggestions] = useState([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);

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
    if (!user || subscriptionExpired || paymentLoading || paymentStatus === 'pending') return;

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
      if (levelFilter !== 'all') {
        arr = arr.filter(n => n.wageLevel === levelFilter);
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
      const cached = sessionStorage.getItem('_companiesCache_v4');
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
          if (levelFilter !== 'all') {
            arr = arr.filter(n => n.wageLevel === levelFilter);
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
      const [auditRes, jobsRes] = await Promise.all([
        // Fetch confirmed company names only from External DB
        externalSupabase.from('audit_reviews').select('company').eq('tl_confirmation', 'yes'),
        // Fetch job stats (4 lightweight columns, single batch up to 5000)
        supabase.from('job_jobrole_sponsored_sync').select('company, job_role_name, wage_level, wage_num').limit(5000)
      ]);

      const confirmedNames = Array.from(
        new Set((auditRes.data || []).map(r => r.company))
      ).filter(Boolean);

      let jobData = jobsRes.data || [];

      // If jobs table has more than 5000, fetch remaining pages in background
      if (jobData.length === 5000) {
        // Show first-page results immediately using the data we have, then fill in more
        buildAndSetCompanies(confirmedNames, jobData, true);

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

      buildAndSetCompanies(confirmedNames, jobData, false);

    } catch (err) {
      if (!err.message?.includes('fetch') && window.navigator.onLine) {
        console.error("fetchCompanies Error:", err);
      }
    } finally {
      setCompaniesLoading(false);
    }

    function buildAndSetCompanies(confirmedNames, jobData, preliminary) {
      const companyStats = new Map();
      confirmedNames.forEach(name => companyStats.set(name, { company: name, jobCount: 0, maxWageNum: 0, wageLevel: 'Lv 1', industries: new Set() }));
      jobData.forEach(j => {
        if (companyStats.has(j.company)) {
          const s = companyStats.get(j.company);
          s.jobCount++;
          if ((j.wage_num || 0) > s.maxWageNum) { s.maxWageNum = j.wage_num; s.wageLevel = j.wage_level || 'Lv 1'; }
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
        try { sessionStorage.setItem('_companiesCache_v4', JSON.stringify(finalArr)); } catch (e) { }
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
      if (levelFilter !== 'all') {
        viewArr = viewArr.filter(n => n.wageLevel === levelFilter);
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
    const search = (searchOverride !== undefined) ? searchOverride : (jobSearch || debouncedCompanySearch);
    const level = levelOverride || jobLevelFilter;

    // --- Cache check ---
    if (!window._companyJobsCache) window._companyJobsCache = new Map();
    const cacheKey = `${selectedCompany}|${page}|${search}|${level}`;
    const cached = window._companyJobsCache.get(cacheKey);
    if (cached) {
      setCompanyJobs(cached.jobs);
      setTotalCompanyJobs(cached.total);
      return;
    }

    setJobsLoading(true);
    try {
      const from = (page - 1) * JOBS_PER_PAGE;
      let q = supabase.from('job_jobrole_sponsored_sync').select('*', { count: 'exact' }).eq('company', selectedCompany);

      if (search && search.trim()) {
        const words = search.trim().split(/\s+/).filter(w => w.length >= 1);
        if (words.length > 0) {
          // Rule: (Title has ALL words) OR (Job Role has ALL words)
          // This is the "Strict AND" rule.
          const titleCond = `and(${words.map(w => `title.ilike.%${w}%`).join(',')})`;
          const roleCond = `and(${words.map(w => `job_role_name.ilike.%${w}%`).join(',')})`;
          q = q.or(`${titleCond},${roleCond}`);
        }
      }

      if (level !== 'all') q = q.eq('wage_level', level);

      const { data, error, count } = await q
        .order('wage_num', { ascending: false, nullsFirst: false })
        .order('date_posted', { ascending: false })
        .range(from, from + JOBS_PER_PAGE - 1);
      if (error) throw error;

      const seen = new Set();
      const unique = (data || []).map(j => ({
        ...j,
        job_id: j.id,
        role: j.job_role_name,
        isTeaser: paymentStatus === 'pending'
      })).filter(j => {
        const k = j.url || j.id;
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      const total = paymentStatus === 'pending' ? Math.min(2, count || 0) : (count || 0);

      // Final Priority Sort: (1) Visible Salary First, (2) Apply Link, (3) Freshness
      unique.sort((a, b) => {
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

      setCompanyJobs(unique);
      setTotalCompanyJobs(total);
      window._companyJobsCache.set(cacheKey, { jobs: unique, total });
    } catch (err) {
      console.error("fetchCompanyJobs Error:", err);
    } finally {
      setJobsLoading(false);
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
    setSelectedCompany(c.company);
    setSelectedCompanyData(c);
    setJobPage(1);
    setJobSearch('');
    setJobLevelFilter('all'); // Reset job level filter when company changes
    if (isMobile) setMobileActiveCol('right');
  };

  if (authLoading || paymentLoading) return <div className="h-screen w-screen flex items-center justify-center bg-[#f5f5f7]"><Loader2 className="w-8 h-8 text-[#24385E] animate-spin" /></div>;
  if (!user) return <div className="bg-white"><Navbar /><HeroSection /><Testimonials /><FAQ /><Footer /></div>;

  // ── Payment gate: show teaser if not paid ──
  const isPaid = paymentStatus === 'paid' || paymentStatus === 'active';
  if (!isPaid) return <TeaserDashboard user={user} signOut={handleLogout} navigate={navigate} isMobile={isMobile} />;

  const navItems = [
    { id: 'all_jobs', label: 'All Jobs', icon: Briefcase },
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
      zIndex: 1000,
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
    searchBtn: { height: isMobile ? '46px' : '50px', padding: isMobile ? '0 20px' : '0 28px', background: '#24385E', color: '#fff', border: 'none', borderRadius: '60px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', flexShrink: 0, boxShadow: '0 2px 6px rgba(36,56,94,0.3)' },
  };

  return (
    <div style={S.page}>

      {/* Sidebar Overlay for Mobile */}
      {isMobile && mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 90 }}
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
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#EAB308' }}>Level</span>
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
            return (
              <button key={item.id} style={S.navItem(active)} onClick={() => { setActiveView(item.id); if (isMobile) setMobileMenuOpen(false); }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#333'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666'; } }}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.6} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div style={{ height: '1px', background: '#efefef', margin: '8px 0 8px' }} />

          <button style={S.navItem(activeView === 'all_companies')} onClick={() => { setActiveView('all_companies'); if (isMobile) setMobileMenuOpen(false); }}
            onMouseEnter={e => { if (activeView !== 'all_companies') { e.currentTarget.style.background = '#f5f5f5'; e.currentTarget.style.color = '#333'; } }}
            onMouseLeave={e => { if (activeView !== 'all_companies') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666'; } }}
          >
            <Building2 size={18} strokeWidth={2.2} />
            <span style={{ lineHeight: '1.35' }}>All Companies<br />that Sponsor</span>
          </button>
        </nav>

        {/* Bottom */}
        <div style={S.sidebarBottom}>
          <button style={S.navItem(activeView === 'settings')} onClick={() => { setActiveView('settings'); if (isMobile) setMobileMenuOpen(false); }}
            onMouseEnter={e => { if (activeView !== 'settings') { e.currentTarget.style.background = '#f5f5f5'; } }}
            onMouseLeave={e => { if (activeView !== 'settings') { e.currentTarget.style.background = 'transparent'; } }}
          >
            <Settings size={18} strokeWidth={1.6} /><span>Settings</span>
          </button>

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
            <div style={{ flex: 1, overflowY: 'auto', background: '#fff', scrollbarWidth: 'none' }}>
              <PaymentDetailsTab />
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
                        Filters {levelFilter !== 'all' ? `(${levelFilter})` : ''}
                      </button>
                    )}
                  </div>
                </div>

                {/* ── Level Filter Buttons (Inside Toggle) ── */}
                {showCompanyFilters && (
                  <div style={{ padding: '0 20px 12px', display: 'flex', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', background: '#fff', borderBottom: '1px solid #efefef', marginBottom: '16px' }} className="no-scrollbar">
                    {['all', 'Lv 1', 'Lv 2', 'Lv 3', 'Lv 4'].map((lv) => (
                      <button
                        key={lv}
                        onClick={() => { setLevelFilter(lv); setCompanyPage(1); }}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: levelFilter === lv ? '1.5px solid #24385E' : '1.5px solid #e5e7eb',
                          background: levelFilter === lv ? '#24385E' : '#fff',
                          color: levelFilter === lv ? '#fff' : '#6b7280',
                          boxShadow: levelFilter === lv ? '0 4px 10px rgba(36, 56, 94, 0.15)' : 'none'
                        }}
                      >
                        {lv === 'all' ? 'All Roles' : lv}
                      </button>
                    ))}
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
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <LogoBox name={selectedCompany} size={isMobile ? 44 : 56} fontSize={isMobile ? 15 : 18} />
                          <div style={{ minWidth: 0 }}>
                            <h2 style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 800, color: '#111', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedCompany}</h2>
                            <p style={{ fontSize: '12px', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ExternalLink size={12} color="#999" />
                              <a
                                href={`https://${selectedCompanyData?.domain || `${selectedCompany.toLowerCase().replace(/\s+/g, '')}.com`}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  color: '#24385E',
                                  textDecoration: 'none',
                                  fontWeight: 700,
                                  transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.textDecoration = 'underline'; e.currentTarget.style.color = '#FDB913'; }}
                                onMouseLeave={e => { e.currentTarget.style.textDecoration = 'none'; e.currentTarget.style.color = '#24385E'; }}
                              >
                                {selectedCompanyData?.domain || `${selectedCompany.toLowerCase().replace(/\s+/g, '')}.com`}
                              </a>
                            </p>
                          </div>
                        </div>
                        {!isMobile && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <button onClick={() => { setSelectedCompany(null); setSelectedCompanyData(null); }}
                              style={{ padding: '6px', borderRadius: '8px', background: 'none', border: 'none', cursor: 'pointer' }}
                              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                              onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                              <X size={18} color="#aaa" />
                            </button>
                          </div>
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
                          {['all', 'Lv 1', 'Lv 2', 'Lv 3', 'Lv 4'].map((lv) => (
                            <button
                              key={lv}
                              onClick={() => { setJobLevelFilter(lv); setJobPage(1); }}
                              style={{
                                padding: '5px 10px',
                                borderRadius: '12px',
                                fontSize: '10px',
                                fontWeight: 800,
                                whiteSpace: 'nowrap',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                border: jobLevelFilter === lv ? '1.5px solid #24385E' : '1.5px solid #e5e7eb',
                                background: jobLevelFilter === lv ? '#24385E' : '#fff',
                                color: jobLevelFilter === lv ? '#fff' : '#6b7280',
                              }}
                            >
                              {lv === 'all' ? 'All Levels' : lv}
                            </button>
                          ))}
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
                            <CompanyJobCard key={job.url || job.id || i} job={{ ...job, isVerified: true }}
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
            <div style={{ flex: 1, overflowY: 'auto', background: '#fff', scrollbarWidth: 'none' }}>
              <div style={{ padding: isMobile ? '20px 16px' : '40px', maxWidth: '1000px', margin: '0 auto' }}>
                <AllJobsTab />
              </div>
            </div>
          )}

          {/* Settings / Saved / Applied Views */}
          {activeView === 'saved' && <div style={{ flex: 1, overflowY: 'auto', background: '#fff', scrollbarWidth: 'none' }}><div style={{ padding: isMobile ? '20px 16px' : '40px', maxWidth: '900px', margin: '0 auto' }}><SavedJobsTab /></div></div>}
          {activeView === 'applied' && <div style={{ flex: 1, overflowY: 'auto', background: '#fff', scrollbarWidth: 'none' }}><div style={{ padding: isMobile ? '20px 16px' : '40px', maxWidth: '900px', margin: '0 auto' }}><AppliedJobsTab /></div></div>}
          {activeView === 'settings' && <div style={{ flex: 1, overflowY: 'auto', background: '#fff', scrollbarWidth: 'none' }}><div style={{ padding: isMobile ? '20px 16px' : '40px', maxWidth: '800px', margin: '0 auto' }}><ProfileTab /></div></div>}

        </div>
      </div>
    </div>
  );
};

export default Homepage;
