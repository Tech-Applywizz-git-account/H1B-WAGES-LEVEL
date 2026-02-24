import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';
import { Loader2, ChevronLeft, ChevronRight, Search } from 'lucide-react';

// Components
import Sidebar from '../components/Sidebar';
import AppHeader from '../components/AppHeader';
import JobBoardSearch from '../components/JobBoardSearch';
import SearchFilters from '../components/SearchFilters';
import JobCard from '../components/JobCard';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import RenewalPayment from '../components/RenewalPayment';

const JOBS_PER_PAGE = 10;

// Simple memory cache for jobs
const jobsCache = new Map();

const Homepage = () => {
  const { user, loading: authLoading, subscriptionExpired } = useAuth();
  const navigate = useNavigate();

  // Data State
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    role: [],
    location: [],
    company: [],
    experience: []
  });
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());

  // Renewal Flow State
  const [showRenewalFlow, setShowRenewalFlow] = useState(false);
  const [renewalStep, setRenewalStep] = useState(1);
  const [renewProfile, setRenewProfile] = useState({
    firstName: '', lastName: '', email: '', phone: '', country: ''
  });

  // Generate a cache key based on current state
  const cacheKey = useMemo(() => {
    return JSON.stringify({
      p: currentPage,
      s: searchInput,
      f: filters
    });
  }, [currentPage, searchInput, filters]);

  const fetchJobs = useCallback(async () => {
    if (!user || subscriptionExpired) return;

    // Check cache first
    if (jobsCache.has(cacheKey)) {
      const cached = jobsCache.get(cacheKey);
      setJobs(cached.data);
      setTotalJobs(cached.total);
      return;
    }

    setLoading(true);
    try {
      const from = (currentPage - 1) * JOBS_PER_PAGE;
      const to = from + JOBS_PER_PAGE - 1;

      let query = supabase
        .from('job_jobrole_sponsored_sync')
        .select('*', { count: 'exact' });

      if (searchInput) {
        query = query.or(`title.ilike.%${searchInput}%,company.ilike.%${searchInput}%`);
      }

      if (filters.role.length > 0) {
        query = query.or(filters.role.map(r => `title.ilike.%${r}%,job_role_name.ilike.%${r}%`).join(','));
      }
      if (filters.location.length > 0) {
        query = query.or(filters.location.map(l => `location.ilike.%${l.split(',')[0]}%`).join(','));
      }
      if (filters.company.length > 0) {
        query = query.or(filters.company.map(c => `company.ilike.%${c}%`).join(','));
      }

      query = query
        .order('wage_num', { ascending: false, nullsFirst: false })
        .order('date_posted', { ascending: false })
        .range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      const results = data || [];
      const total = count || 0;

      // Update state and cache
      setJobs(results);
      setTotalJobs(total);
      jobsCache.set(cacheKey, { data: results, total });

    } catch (err) {
      console.error("Fetch jobs error:", err);
    } finally {
      setLoading(false);
    }
  }, [user, subscriptionExpired, cacheKey]);

  useEffect(() => {
    if (user) {
      fetchSavedJobIds();
      fetchAppliedJobIds();
      fetchJobs();
    }
  }, [user, fetchJobs]);

  const fetchSavedJobIds = async () => {
    if (!user) return;
    const { data } = await supabase.from('saved_jobs').select('job_id').eq('user_id', user.id);
    if (data) setSavedJobIds(new Set(data.map(i => String(i.job_id))));
  };

  const fetchAppliedJobIds = async () => {
    if (!user) return;
    const { data } = await supabase.from('applied_jobs').select('job_id').eq('user_id', user.id);
    if (data) setAppliedJobIds(new Set(data.map(i => String(i.job_id))));
  };

  const handleSaveToggle = useCallback((jobId, isSaved) => {
    setSavedJobIds(prev => {
      const next = new Set(prev);
      isSaved ? next.add(String(jobId)) : next.delete(String(jobId));
      return next;
    });
  }, []);

  const handleApplyToggle = useCallback((jobId, isApplied) => {
    setAppliedJobIds(prev => {
      const next = new Set(prev);
      isApplied ? next.add(String(jobId)) : next.delete(String(jobId));
      return next;
    });
  }, []);

  const handleRenewClick = async () => {
    setShowRenewalFlow(true);
    setRenewalStep(1);
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setRenewProfile({
          firstName: data.first_name || '',
          lastName: data.last_name || '',
          email: data.email || user.email,
          phone: data.mobile_number || '',
          country: data.location || ''
        });
      }
    } catch (err) { console.error(err); }
  };

  if (authLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white">
        <Navbar />
        <HeroSection />
        <Testimonials />
        <FAQ />
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fafafa] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader title="Job Board" />

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <JobBoardSearch
            searchInput={searchInput}
            onSearchChange={(val) => {
              setSearchInput(val);
              setCurrentPage(1);
            }}
          />

          <div className="bg-white border-b border-[#f0f0f0] mb-6">
            <SearchFilters onFilterChange={(newFilters) => {
              setFilters(newFilters);
              setCurrentPage(1);
            }} />
          </div>

          <div className="px-8 pb-10 max-w-7xl mx-auto">
            {subscriptionExpired ? (
              <div className="text-center py-20 bg-white rounded-[32px] border border-[#f0f0f0] shadow-sm">
                <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-black text-[#24385E] mb-2">Subscription Expired</h3>
                <button onClick={handleRenewClick} className="px-10 py-4 bg-yellow-400 text-[#24385E] font-bold rounded-2xl shadow-xl hover:shadow-yellow-200 transition-all active:scale-95">
                  Renew Access Now
                </button>
              </div>
            ) : (
              <>
                {loading && jobs.length === 0 ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
                  </div>
                ) : jobs.length > 0 ? (
                  <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 ${loading ? 'opacity-50' : ''}`}>
                    {jobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={savedJobIds.has(String(job.id))}
                        isApplied={appliedJobIds.has(String(job.id))}
                        onSaveToggle={handleSaveToggle}
                        onApplyToggle={handleApplyToggle}
                      />
                    ))}

                    <div className="flex items-center justify-between mt-10">
                      <p className="text-[13px] text-gray-500 font-medium whitespace-nowrap">
                        Showing {((currentPage - 1) * JOBS_PER_PAGE) + 1} to {Math.min(currentPage * JOBS_PER_PAGE, totalJobs)} of {totalJobs} jobs
                      </p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2.5 rounded-xl border border-[#f0f0f0] bg-white disabled:opacity-30 transition-all hover:bg-gray-50"><ChevronLeft size={20} /></button>
                        <div className="px-4 py-2 bg-white border border-[#f0f0f0] rounded-xl text-[14px] font-bold text-[#24385E]">{currentPage}</div>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage * JOBS_PER_PAGE >= totalJobs} className="p-2.5 rounded-xl border border-[#f0f0f0] bg-white disabled:opacity-30 transition-all hover:bg-gray-50"><ChevronRight size={20} /></button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-20 text-center bg-white rounded-3xl border border-[#f0f0f0] shadow-sm">
                    <div className="w-20 h-20 bg-[#fafafa] rounded-full flex items-center justify-center mx-auto mb-6"><Search className="w-10 h-10 text-gray-200" /></div>
                    <h3 className="text-xl font-bold text-[#24385E] mb-2">No jobs found</h3>
                    <p className="text-gray-400 max-w-sm mx-auto text-sm">Try broadening your search or filters.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
