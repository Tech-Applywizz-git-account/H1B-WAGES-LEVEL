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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState({
    role: [],
    location: [],
    company: [],
    experience: []
  });
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState('fresh');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Renewal Flow State
  const [showRenewalFlow, setShowRenewalFlow] = useState(false);
  const [renewalStep, setRenewalStep] = useState(1);
  const [renewProfile, setRenewProfile] = useState({
    firstName: '', lastName: '', email: '', phone: '', country: ''
  });

  // Generate a cache key based on current state (using debounced search)
  const cacheKey = useMemo(() => {
    return JSON.stringify({
      p: currentPage,
      s: debouncedSearch,
      f: filters,
      t: activeFilter,
      d: selectedDate
    });
  }, [currentPage, debouncedSearch, filters, activeFilter, selectedDate]);

  // Track the latest fetch to prevent race conditions
  const fetchIdRef = useRef(0);

  const fetchJobs = useCallback(async () => {
    if (!user || subscriptionExpired) return;

    // Check cache first
    if (jobsCache.has(cacheKey)) {
      const cached = jobsCache.get(cacheKey);
      setJobs(cached.data);
      setTotalJobs(cached.total);
      return;
    }

    // Increment fetch ID - only the latest fetch will update state
    const currentFetchId = ++fetchIdRef.current;

    setLoading(true);
    try {
      const from = (currentPage - 1) * JOBS_PER_PAGE;
      const to = from + JOBS_PER_PAGE - 1;

      let results = [];
      let total = 0;

      if (activeFilter === 'saved' || activeFilter === 'applied') {
        const table = activeFilter === 'saved' ? 'saved_jobs' : 'applied_jobs';
        let query = supabase
          .from(table)
          .select('job_data, job_id', { count: 'exact' })
          .eq('user_id', user.id);

        const { data, count, error } = await query.range(from, to).order('created_at', { ascending: false });
        if (error) throw error;
        results = (data || []).map(item => item.job_data);
        total = count || 0;
      } else {
        // MAIN VIEW: Use the pre-filtered database view
        let query = supabase
          .from('confirmed_jobs_view')
          .select('*', { count: 'exact' });

        if (selectedDate) {
          // Use range to capture entire day regardless of time
          query = query.gte('date_posted', `${selectedDate} 00:00:00`)
            .lte('date_posted', `${selectedDate} 23:59:59`);
        }

        if (debouncedSearch) {
          query = query.or(`title.ilike.%${debouncedSearch}%,company.ilike.%${debouncedSearch}%`);
        }

        const { data, error, count } = await query
          .order('wage_num', { ascending: false })
          .order('date_posted', { ascending: false })
          .range(from, to);

        if (error) throw error;

        // Deduplicate by URL to prevent duplicate job cards
        const seen = new Set();
        results = (data || []).filter(job => {
          const key = job.url || job.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        // Use count from database, but ensure it's at least as much as what we got
        // back in the results to prevent "0" showing when results exist.
        total = Math.max(count || 0, results.length);
      }

      // Only update state if this is still the latest fetch (prevents race conditions)
      if (currentFetchId !== fetchIdRef.current) return;

      // Update state and cache
      setJobs(results);
      setTotalJobs(total);
      jobsCache.set(cacheKey, { data: results, total });

    } catch (err) {
      if (currentFetchId !== fetchIdRef.current) return;
      console.error("Fetch jobs error:", err);
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setLoading(false);
      }
    }
  }, [user, subscriptionExpired, currentPage, debouncedSearch, filters, activeFilter, selectedDate]);

  // Initial load of user states
  useEffect(() => {
    if (user) {
      fetchSavedJobIds();
      fetchAppliedJobIds();
    }
  }, [user]);

  // Fetch jobs when filters/page/search change
  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [fetchJobs]);


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

          <div className="bg-white border-b border-[#f0f0f0]">
            <div className="max-w-7xl mx-auto">
              <SearchFilters onFilterChange={(newFilters) => {
                setFilters(newFilters);
                setCurrentPage(1);
              }} />
            </div>
          </div>

          <div className="bg-white px-8 py-5 border-b border-[#f0f0f0]">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-end gap-6">
                {/* Date Filter Column */}
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Filter by Posted Date</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="px-6 py-2.5 bg-[#fafafa] border-2 border-[#f0f0f0] rounded-2xl focus:border-blue-500 focus:outline-none text-[13px] font-bold text-[#24385E] shadow-sm transition-all h-[46px]"
                  />
                </div>

                {/* Counter Tab Column */}
                <div className="flex flex-col">
                  {/* Invisible spacer to match the "Filter by Posted Date" label height */}
                  <span className="text-[10px] font-black opacity-0 mb-1.5">Spacer</span>
                  <div className="px-6 py-2.5 bg-emerald-50 border-2 border-emerald-100/50 rounded-2xl flex items-center gap-2.5 shadow-sm h-[46px]">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                    <span className="text-[14px] font-black text-emerald-600">
                      {totalJobs.toLocaleString()} Sponsored Jobs
                    </span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block text-right">
                <p className="text-[12px] font-bold text-gray-400">
                  Showing real-time confirmed data with high salary metrics.
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 pb-10 max-w-7xl mx-auto mt-8">
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
                    {jobs.map((job, index) => (
                      <JobCard
                        key={job.url || job.id || index}
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
