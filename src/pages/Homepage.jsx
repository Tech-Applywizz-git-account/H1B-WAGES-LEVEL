import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import SearchFilters from '../components/SearchFilters';
import JobCard from '../components/JobCard';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const JOBS_PER_PAGE = 10;

const homepageJobs = [
  {
    id: 1,
    company: 'HDR',
    title: 'Electrical EIT/Designer',
    location: 'Charlotte, North Carolina',
    categories: ['Electrical Engineering', 'Specialized Engineering'],
    tags: ['On-Site', "Bachelor's", 'Full Time'],
    visas: ['Green Card', 'TN', 'OPT', 'CPT'],
  },
  {
    id: 2,
    company: 'ADT',
    title: 'Installation Technician',
    location: 'Miami, Florida',
    categories: ['Electrical Technician', 'HVAC Technician'],
    tags: ['On-Site', 'Associate', 'Full Time'],
    visas: ['Green Card', 'OPT'],
  },
  {
    id: 3,
    company: 'Google',
    title: 'Product Manager',
    location: 'Mountain View, CA',
    categories: ['Product', 'Strategy'],
    tags: ['Hybrid', "Bachelor's", 'Full Time'],
    visas: ['H-1B', 'TN', 'Green Card'],
  },
];

const Homepage = () => {
  const [jobs, setJobs] = useState(() => {
    try {
      const cached = sessionStorage.getItem('homepageJobs');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      console.error("Failed to parse cached jobs", e);
      sessionStorage.removeItem('homepageJobs');
      return [];
    }
  });
  const [loading, setLoading] = useState(() => {
    return !sessionStorage.getItem('homepageJobs');
  });
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({
    role: [],
    location: [],
    company: [],
    experience: []
  });
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(() => {
    const cachedTotal = sessionStorage.getItem('homepageTotalJobs');
    return cachedTotal ? parseInt(cachedTotal, 10) : 0;
  });

  const [subscriptionExpired, setSubscriptionExpired] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchSavedJobIds = async () => {
    if (!user) {
      setSavedJobIds(new Set());
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saved_jobs')
        .select('job_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const ids = new Set(data.map(item => item.job_id));
      setSavedJobIds(ids);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    }
  };

  const fetchAppliedJobIds = async () => {
    if (!user) {
      setAppliedJobIds(new Set());
      return;
    }

    try {
      const { data, error } = await supabase
        .from('applied_jobs')
        .select('job_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const ids = new Set(data.map(item => item.job_id));
      setAppliedJobIds(ids);
      console.log('✅ Fetched applied job IDs:', Array.from(ids));
    } catch (err) {
      console.error('Error fetching applied jobs:', err);
    }
  };
  // Check subscription status
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('created_at')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          const joinedDate = new Date(data.created_at);
          const endDate = new Date(joinedDate);
          endDate.setMonth(endDate.getMonth() + 1);

          if (new Date() > endDate) {
            setSubscriptionExpired(true);
          } else {
            setSubscriptionExpired(false);
          }
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
      }
    };

    checkSubscription();
  }, [user]);

  // Fetch saved job IDs for the current user
  useEffect(() => {
    fetchSavedJobIds();
    fetchAppliedJobIds();
  }, [user]);

  // Handle save/unsave toggle callback
  const handleSaveToggle = (jobId, isSaved) => {
    setSavedJobIds(prev => {
      const newSet = new Set(prev);
      if (isSaved) {
        newSet.add(jobId);
      } else {
        newSet.delete(jobId);
      }
      return newSet;
    });
  };

  // Handle apply toggle callback
  const handleApplyToggle = (jobId, isApplied) => {
    setAppliedJobIds(prev => {
      const newSet = new Set(prev);
      if (isApplied) {
        newSet.add(jobId);
      } else {
        newSet.delete(jobId);
      }
      return newSet;
    });
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

  useEffect(() => {
    if (user && !subscriptionExpired) {
      fetchJobs();
    } else if (!user) {
      setLoading(false); // If not user, just show dummy data
    }
  }, [filters, currentPage, user, subscriptionExpired]);

  const fetchJobs = async () => {
    // Only show loading spinner if we clearly don't have data to show, 
    // or if we want to ensure the user knows a search is happening (e.g. invalid current data).
    // But for tab switching, we want to act 'instant'.
    if (jobs.length === 0) setLoading(true);

    try {
      let query = supabase
        .from('job_jobrole_all')
        .select('*', { count: 'exact' })
        .order('upload_date', { ascending: false });

      // Apply Search
      if (searchInput) {
        setLoading(true); // Always show loader for explicit search interactions
        query = query.or(`title.ilike.%${searchInput}%,company.ilike.%${searchInput}%,description.ilike.%${searchInput}%`);
      }

      // Apply Filters
      if (filters.role.length > 0) {
        const roleConditions = filters.role.map(r => `job_role_name.ilike.%${r}%`).join(',');
        if (roleConditions) query = query.or(roleConditions);
      }

      if (filters.company.length > 0) {
        const companyConditions = filters.company.map(c => `company.ilike.%${c}%`).join(',');
        if (companyConditions) query = query.or(companyConditions);
      }

      if (filters.location.length > 0) {
        const locConditions = filters.location.map(l => `location.ilike.%${l.split(',')[0]}%`).join(',');
        if (locConditions) query = query.or(locConditions);
      }

      // Smart Experience Filter - maps to years_exp_required column with intelligent range matching
      if (filters.experience.length > 0) {
        const expConditions = [];

        filters.experience.forEach(expInput => {
          // Extract numbers from input (e.g., "1", "8", "5-7", "8-14")
          const numbers = expInput.match(/\d+/g);

          if (numbers && numbers.length > 0) {
            // Convert to numbers
            const nums = numbers.map(n => parseInt(n));
            const minInput = Math.min(...nums);
            const maxInput = nums.length > 1 ? Math.max(...nums) : minInput;

            // Match ranges that overlap with the input
            // For "0-4 years", "5-7 years", "8-11 years", "11+ years"
            const rangePatterns = [];

            // Check common patterns in your database
            const dbRanges = [
              { pattern: '0-4', min: 0, max: 4 },
              { pattern: '5-7', min: 5, max: 7 },
              { pattern: '8-11', min: 8, max: 11 },
              { pattern: '11+', min: 11, max: 100 } // 11+ means 11 or more
            ];

            dbRanges.forEach(range => {
              // Check if ranges overlap
              // Ranges overlap if: minInput <= range.max AND maxInput >= range.min
              if (minInput <= range.max && maxInput >= range.min) {
                rangePatterns.push(`years_exp_required.ilike.%${range.pattern}%`);
              }
            });

            // Add all matching patterns
            if (rangePatterns.length > 0) {
              expConditions.push(...rangePatterns);
            }
          } else {
            // If no numbers found, do simple string match (fallback)
            expConditions.push(`years_exp_required.ilike.%${expInput}%`);
          }
        });

        // Remove duplicates and apply
        const uniqueConditions = [...new Set(expConditions)];
        if (uniqueConditions.length > 0) {
          query = query.or(uniqueConditions.join(','));
        }
      }

      // Pagination
      const from = (currentPage - 1) * JOBS_PER_PAGE;
      const to = from + JOBS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      setJobs(data || []);
      setTotalJobs(count || 0);

      // Cache results only if it's the default view (no search, page 1, basic filters)
      // or simply cache the latest view so navigating back restores it.
      // Saving simpler: just cache what we have.
      sessionStorage.setItem('homepageJobs', JSON.stringify(data || []));
      sessionStorage.setItem('homepageTotalJobs', (count || 0).toString());

    } catch (error) {
      console.error("Error fetching homepage jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClick = () => {
    setCurrentPage(1); // Reset to page 1 on search
    if (user && !subscriptionExpired) {
      fetchJobs();
      fetchSavedJobIds(); // Refresh saved status on search
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div>
      <Navbar />
      {!user && <HeroSection />}

      <div className="flex bg-gray-50">
        {/* Sidebar for logged-in users, below Hero, beside Search */}
        {user && (
          <div className="hidden md:block w-64 flex-shrink-0 border-r border-gray-200 bg-white">
            <Sidebar className="h-[calc(100vh-80px)] sticky top-0" showHeader={false} />
          </div>
        )}

        <main className="flex-1 w-full">
          <section className="bg-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center mb-6">
                <h3 className="text-3xl font-semibold text-gray-900">Search for your perfect role.</h3>
                <p className="text-gray-500 mt-2">Data verified by the U.S. Government.</p>
              </div>

              {/* Search Bar */}
              <div className="flex items-center bg-white rounded-full shadow-lg border border-gray-100 overflow-hidden max-w-4xl mx-auto mb-6">
                <div className="px-4 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search for jobs, companies, or titles..."
                  className="flex-1 px-2 py-4 text-gray-900 text-base focus:outline-none"
                />
                <button
                  onClick={handleSearchClick}
                  className="px-6 py-3 bg-primary-yellow text-primary-dark font-semibold hover:bg-yellow-500 transition"
                >
                  Search
                </button>
              </div>

              <SearchFilters onFilterChange={(newFilters) => {
                setFilters(newFilters);
                setCurrentPage(1); // Reset page on filter change
              }} />

              {/* Job Cards List */}
              <div className="mt-8 max-w-4xl mx-auto space-y-4">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
                  </div>
                ) : user ? (
                  // Logged In Logic
                  subscriptionExpired ? (
                    // Subscription Expired View
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                      <div className="p-4 bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-3">Your subscription is expired</h2>
                      <p className="text-gray-500 max-w-md mx-auto mb-8">
                        Your monthly access has ended. Subscribe again to continue accessing verified job listings and premium features.
                      </p>
                      <Link
                        to="/pricing"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-primary-yellow text-primary-dark font-bold rounded-lg shadow-lg hover:bg-yellow-400 transition-all transform hover:-translate-y-1"
                      >
                        Subscribe Now
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </div>
                  ) : (
                    // Active Subscription: Real Data + Pagination
                    jobs.length > 0 ? (
                      <>
                        {jobs.map((job) => {
                          const jobId = job.job_id || job.id;
                          const jobIdString = String(jobId); // Convert to string for consistency

                          console.log('📋 Homepage Rendering Job:', {
                            jobId: jobIdString,
                            title: job.title,
                            company: job.company,
                            isSaved: savedJobIds.has(jobIdString),
                            isApplied: appliedJobIds.has(jobIdString)
                          });

                          return (
                            <JobCard
                              key={jobIdString}
                              job={job}
                              isSaved={savedJobIds.has(jobIdString)}
                              isApplied={appliedJobIds.has(jobIdString)}
                              onSaveToggle={handleSaveToggle}
                              onApplyToggle={handleApplyToggle}
                            />
                          );
                        })}

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-center gap-4 mt-8">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </button>

                          <span className="text-gray-600 font-medium">
                            Page {currentPage} of {totalPages || 1}
                          </span>

                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-10 text-gray-500">
                        <p>No jobs found matching your criteria.</p>
                      </div>
                    )
                  )
                ) : (
                  // Logged Out: Dummy Data + Next leads to Pricing
                  <>
                    {homepageJobs.map((job) => (
                      <JobCard
                        key={job.id}
                        job={job}
                        isSaved={false}
                        onSaveToggle={handleSaveToggle}
                      />
                    ))}

                    <div className="flex justify-center mt-8">
                      <button
                        onClick={() => navigate('/pricing')}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-bold rounded-lg shadow-md hover:from-yellow-500 hover:to-yellow-600 transition-all"
                      >
                        Next
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>
        </main>
      </div>

      <FeaturesSection />
      <HowItWorks />
      <Testimonials />
      <FAQ />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Find Your Dream Job?
          </h2>
          <p className="text-xl mb-8 text-gray-100">
            Join thousands of Telugu professionals who've found their perfect role
          </p>
          <Link
            to="/signup"
            className="inline-block bg-primary-yellow text-primary-dark font-bold px-10 py-4 rounded-lg text-lg hover:bg-yellow-500 transition shadow-lg"
          >
            Get Access
          </Link>
          <p className="mt-4 text-sm text-gray-200">
            Instant access • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Homepage;
