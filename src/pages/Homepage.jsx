import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import HeroSection from '../components/HeroSection';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import SearchFilters from '../components/SearchFilters';
import JobCard from '../components/JobCard';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';
import { Loader2, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import RenewalPayment from '../components/RenewalPayment';

const JOBS_PER_PAGE = 10;

const homepageJobs = [
  {
    id: 1,
    company: 'hackajob',
    title: 'Data Engineer',
    location: 'Philadelphia, PA',
    categories: ['Electrical Engineering', 'Specialized Engineering'],
    tags: ['On-Site', "Bachelor's", 'Full Time'],
    visas: ['Green Card', 'TN', 'OPT', 'CPT'],
  },
  {
    id: 2,
    company: 'Torch Dental',
    title: 'Software Engineer, Product',
    location: 'New York, NY',
    categories: ['Electrical Technician', 'HVAC Technician'],
    tags: ['On-Site', 'Associate', 'Full Time'],
    visas: ['Green Card', 'OPT'],
  },
  {
    id: 3,
    company: 'Verisk',
    title: 'Devops Engineer II',
    location: 'Jersey City, NJ',
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
  const [suggestions, setSuggestions] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [filters, setFilters] = useState({
    role: [],
    location: [],
    company: [],
    experience: []
  });
  const [showRenewalFlow, setShowRenewalFlow] = useState(false);
  const [renewalStep, setRenewalStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [renewProfile, setRenewProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [renewError, setRenewError] = useState('');
  const [renewLoading, setRenewLoading] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [shouldScrollToSearch, setShouldScrollToSearch] = useState(false);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(() => {
    const cachedTotal = sessionStorage.getItem('homepageTotalJobs');
    return cachedTotal ? parseInt(cachedTotal, 10) : 0;
  });

  const { user, role, isAdmin, subscriptionExpired, subscriptionEndDate, checkingSub } = useAuth();
  const navigate = useNavigate();
  const searchSectionRef = useRef(null);

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

  const handleSearchSuggestions = (value) => {
    setSearchInput(value); // Update input immediately

    if (searchTimeout) clearTimeout(searchTimeout);

    const timeoutId = setTimeout(async () => {
      if (!value || value.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('job_jobrole_all')
          .select('title, company')
          .or(`title.ilike.%${value}%,company.ilike.%${value}%`)
          .limit(10);

        if (data) {
          const uniqueValues = new Set();
          const lowerValue = value.toLowerCase();
          data.forEach(item => {
            if (item.title && item.title.toLowerCase().includes(lowerValue)) uniqueValues.add(item.title);
            if (item.company && item.company.toLowerCase().includes(lowerValue)) uniqueValues.add(item.company);
          });
          setSuggestions([...uniqueValues].slice(0, 8));
        }
      } catch (err) {
        console.error("Error fetching suggestions:", err);
      }
    }, 300);

    setSearchTimeout(timeoutId);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchInput(suggestion);
    setSuggestions([]);
    setCurrentPage(1);
    if (user && !subscriptionExpired) {
      fetchJobs(1, suggestion); // Immediately fetch with new term
      fetchSavedJobIds();
    }
  };
  // Subscription check is now handled by useAuth hook

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
  }, [filters, currentPage, user?.id, subscriptionExpired]);

  // Scroll to search bar after jobs are loaded
  useEffect(() => {
    if (!loading && shouldScrollToSearch) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        const searchElement = document.getElementById('search-anchor');
        if (searchElement) {
          const offset = 100; // Account for navbar
          const elementPosition = searchElement.offsetTop;
          window.scrollTo({
            top: elementPosition - offset,
            behavior: 'smooth'
          });
        }
        setShouldScrollToSearch(false);
      });
    }
  }, [loading, shouldScrollToSearch]);

  const fetchJobs = async (pageOverride = null, searchOverride = null) => {
    // Determine effective values (use overrides or fall back to state)
    const activePage = pageOverride !== null ? pageOverride : currentPage;
    const activeSearch = searchOverride !== null ? searchOverride : searchInput;

    // Show loading spinner if:
    // 1. We don't have data to show yet (jobs.length === 0), OR
    // 2. There are active role filters
    if (jobs.length === 0 || filters.role.length > 0) setLoading(true);

    try {
      let query = supabase
        .from('job_jobrole_all')
        .select('*', { count: 'exact' })
        .order('upload_date', { ascending: false }); // Always get latest jobs first

      // --- Apply Filters to SQL Query ---

      // Search Text (SQL Filter) - Prioritize Role/Title Search
      let searchKeywords = [];
      let searchRolePart = '';
      let searchLocPart = '';
      if (activeSearch) {
        setLoading(true);
        const searchLower = activeSearch.toLowerCase();

        if (searchLower.includes(' in ')) {
          // "Software Engineer in New York" format
          const parts = searchLower.split(' in ');
          searchRolePart = parts[0].trim();
          searchLocPart = parts[1].trim();
          searchKeywords = [searchRolePart, searchLocPart];
          // Match role OR location in query to pull candidates for client-side scoring
          query = query.or(`title.ilike.%${searchRolePart}%,job_role_name.ilike.%${searchRolePart}%,location.ilike.%${searchLocPart}%`);
        } else {
          // Regular search - PRIORITIZE role/title, same as filter dropdown
          searchKeywords = searchLower.split(/\s+/).filter(k => k.length > 1);
          if (searchKeywords.length > 0) {
            // Search primarily in title and job_role_name (matching filter behavior)
            const conditions = searchKeywords.flatMap(k => [
              `title.ilike.%${k}%`,
              `job_role_name.ilike.%${k}%`,
              // Secondary: also check company and location
              `company.ilike.%${k}%`,
              `location.ilike.%${k}%`
            ]).join(',');
            query = query.or(conditions);
          } else {
            // Single term - prioritize role/title first
            query = query.or(`title.ilike.%${activeSearch}%,job_role_name.ilike.%${activeSearch}%,company.ilike.%${activeSearch}%,location.ilike.%${activeSearch}%,description.ilike.%${activeSearch}%`);
          }
        }
      }

      // Role Filter - search in BOTH title and job_role_name to match search bar behavior
      if (filters.role.length > 0) {
        const roleConditions = filters.role.flatMap(r => [
          `title.ilike.%${r}%`,
          `job_role_name.ilike.%${r}%`
        ]).join(',');
        if (roleConditions) query = query.or(roleConditions);
      }

      // Company Filter
      if (filters.company.length > 0) {
        const companyConditions = filters.company.map(c => `company.ilike.%${c}%`).join(',');
        if (companyConditions) query = query.or(companyConditions);
      }

      // Location Filter
      if (filters.location.length > 0) {
        const locConditions = filters.location.map(l => `location.ilike.%${l.split(',')[0]}%`).join(',');
        if (locConditions) query = query.or(locConditions);
      }

      // Experience Filter
      if (filters.experience.length > 0) {
        const expConditions = [];
        filters.experience.forEach(expInput => {
          const numbers = expInput.match(/\d+/g);
          if (numbers && numbers.length > 0) {
            const nums = numbers.map(n => parseInt(n));
            const minInput = Math.min(...nums);
            const maxInput = nums.length > 1 ? Math.max(...nums) : minInput;

            const dbRanges = [
              { pattern: '0-4', min: 0, max: 4 },
              { pattern: '5-7', min: 5, max: 7 },
              { pattern: '8-11', min: 8, max: 11 },
              { pattern: '11+', min: 11, max: 100 }
            ];

            const rangePatterns = [];
            dbRanges.forEach(range => {
              if (minInput <= range.max && maxInput >= range.min) {
                rangePatterns.push(`years_exp_required.ilike.%${range.pattern}%`);
              }
            });
            if (rangePatterns.length > 0) expConditions.push(...rangePatterns);
          } else {
            expConditions.push(`years_exp_required.ilike.%${expInput}%`);
          }
        });
        const uniqueConditions = [...new Set(expConditions)];
        if (uniqueConditions.length > 0) {
          query = query.or(uniqueConditions.join(','));
        }
      }

      // --- Sorting Strategy ---
      // If we have a Search Input OR Role Filters, we prioritize strict relevance (Client Side Sorting).
      const useRelevanceSorting = activeSearch || filters.role.length > 0;

      if (useRelevanceSorting) {
        // Fetch ALL matching results for client-side sorting (no limit)

        const { data, error, count } = await query;
        if (error) throw error;

        if (data) {
          const normalizedSearch = activeSearch ? activeSearch.trim().toLowerCase() : '';
          const roleFilters = filters.role.map(r => r.toLowerCase());

          // Sort by Relevance and Filter
          const sortedData = data
            .map(job => {
              const getScore = (item) => {
                let score = 0;
                const title = (item.title || '').trim().toLowerCase();
                const role = (item.job_role_name || '').trim().toLowerCase();
                const location = (item.location || '').trim().toLowerCase();
                const company = (item.company || '').trim().toLowerCase();
                const description = (item.description || '').toLowerCase();

                // 1. Text Search Relevance
                if (normalizedSearch) {
                  // Huge bonus for EXACT full string match in title or role
                  if (title === normalizedSearch) score += 5000;
                  else if (role === normalizedSearch) score += 3000;

                  // Big bonus for full string INCLUSION in title or role
                  if (title.includes(normalizedSearch)) score += 2000;
                  else if (role.includes(normalizedSearch)) score += 1000;

                  if (searchRolePart && searchLocPart) {
                    // "Role in Location" Query
                    if (title.includes(searchRolePart)) score += 1000;
                    if (role.includes(searchRolePart)) score += 500;
                    if (location.includes(searchLocPart)) score += 1000;
                    if (description.includes(searchRolePart)) score += 50;
                  } else if (searchKeywords.length > 0) {
                    // Multi-keyword Search
                    let matchCount = 0;
                    let titleMatches = 0;
                    let roleMatches = 0;

                    searchKeywords.forEach(kw => {
                      let kwMatch = false;
                      if (title.includes(kw)) {
                        score += 600;
                        kwMatch = true;
                        titleMatches++;
                      }
                      if (role.includes(kw)) {
                        score += 400;
                        kwMatch = true;
                        roleMatches++;
                      }
                      if (company.includes(kw)) { score += 200; kwMatch = true; }
                      if (location.includes(kw)) { score += 50; kwMatch = true; }
                      if (description.includes(kw)) { score += 10; kwMatch = true; }

                      if (kwMatch) matchCount++;
                    });

                    // Bonus for matching multiple keywords
                    if (matchCount > 1) score += (matchCount * 400);
                    // Critical bonus: if multiple keywords match specifically in title/role
                    if (titleMatches + roleMatches > 1) score += 1000;
                  }
                }

                // 2. Role Filter Relevance
                if (roleFilters.length > 0) {
                  roleFilters.forEach(rf => {
                    if (title === rf) score += 4000;
                    else if (title.includes(rf)) score += 2000;

                    if (role === rf) score += 1500;
                    else if (role.includes(rf)) score += 800;
                  });
                }

                return score;
              };

              return { ...job, _score: getScore(job) };
            })
            .filter(item => {
              if (normalizedSearch || roleFilters.length > 0) {
                const title = (item.title || '').toLowerCase();
                const role = (item.job_role_name || '').toLowerCase();
                const company = (item.company || '').toLowerCase();
                const location = (item.location || '').toLowerCase();


                // 1. If ROLE filters are active, check BOTH title and role fields
                if (roleFilters.length > 0) {
                  const matchesRole = roleFilters.some(rf => {
                    const rfKeywords = rf.toLowerCase().split(/\s+/).filter(k => k.length > 2);
                    // Check full phrase in title or role
                    const fullMatchTitle = title.includes(rf.toLowerCase());
                    const fullMatchRole = role.includes(rf.toLowerCase());
                    // Check if ALL keywords exist in title or role
                    const allKeywordsInTitle = rfKeywords.length > 0 && rfKeywords.every(kw => title.includes(kw));
                    const allKeywordsInRole = rfKeywords.length > 0 && rfKeywords.every(kw => role.includes(kw));

                    return fullMatchTitle || fullMatchRole || allKeywordsInTitle || allKeywordsInRole;
                  });
                  if (!matchesRole) return false;
                }


                // 2. If SEARCH text is active, enforce strict matching
                if (normalizedSearch) {
                  // Special case: "Role in Location" format (e.g., "data engineer in troy")
                  if (searchRolePart && searchLocPart) {
                    // Role part must be in title or job_role_name
                    const roleInTitle = title.includes(searchRolePart);
                    const roleInJobRole = role.includes(searchRolePart);
                    // Location part must be in location field
                    const locationMatch = location.includes(searchLocPart);

                    // Must match BOTH: role in title/role_name AND location in location
                    if (!(roleInTitle || roleInJobRole) || !locationMatch) {
                      return false;
                    }
                  }
                  // For multi-word searches, keywords can be in title AND/OR role fields combined
                  // else if (searchKeywords.length > 1) {
                  //   // Check if full phrase exists in title or role (best match)
                  //   const hasExactPhraseInTitle = title.includes(normalizedSearch);
                  //   const hasExactPhraseInRole = role.includes(normalizedSearch);
                  //   // Check if ALL keywords are present in title OR all in role
                  //   const hasAllKeywordsInTitle = searchKeywords.every(kw => title.includes(kw));
                  //   const hasAllKeywordsInRole = searchKeywords.every(kw => role.includes(kw));
                  //   // NEW: Check if ALL keywords exist when combining title + role fields
                  //   const hasAllKeywordsCombined = searchKeywords.every(kw =>
                  //     title.includes(kw) || role.includes(kw)
                  //   );
                  //   // Allow company exact match as alternative
                  //   const isCompanyMatch = company.includes(normalizedSearch);

                  //   if (!hasExactPhraseInTitle && !hasExactPhraseInRole &&
                  //     !hasAllKeywordsInTitle && !hasAllKeywordsInRole &&
                  //     !hasAllKeywordsCombined && !isCompanyMatch) {
                  //     return false;
                  //   }
                  // }
                  // Note: SQL query already filtered correctly, no additional filtering needed
                }

                return item._score > 0;
              }
              return true;
            })
            .sort((a, b) => b._score - a._score);

          // Handle client-side pagination
          const totalSorted = sortedData.length;
          setTotalJobs(totalSorted);

          const from = (activePage - 1) * JOBS_PER_PAGE;
          const to = from + JOBS_PER_PAGE;
          const paginatedData = sortedData.slice(from, to);

          setJobs(paginatedData);

          sessionStorage.setItem('homepageJobs', JSON.stringify(paginatedData));
          sessionStorage.setItem('homepageTotalJobs', totalSorted.toString());
        }

      } else {
        // --- DEFAULT MODE: Server-Side Pagination (Date Sorted) ---
        // Query is already ordered by upload_date above
        const from = (activePage - 1) * JOBS_PER_PAGE;
        const to = from + JOBS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        if (error) throw error;

        setJobs(data || []);
        setTotalJobs(count || 0);

        // Cache results
        sessionStorage.setItem('homepageJobs', JSON.stringify(data || []));
        sessionStorage.setItem('homepageTotalJobs', (count || 0).toString());
      }

    } catch (error) {
      console.error("Error fetching homepage jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenewClick = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setRenewProfile({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || user.email || '',
        phone: data.phone || '',
        location: data.location || ''
      });
      setShowRenewalFlow(true);
      setRenewalStep(1);
    } catch (err) {
      console.error('Error fetching profile for renewal:', err);
      alert('Failed to load profile details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfileAndProceed = async () => {
    setRenewLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: renewProfile.firstName,
          last_name: renewProfile.lastName,
          mobile_number: renewProfile.phone
        })
        .eq('id', user.id);

      if (error) throw error;
      setRenewalStep(2);
    } catch (err) {
      console.error('Error updating profile:', err);
      setRenewError('Failed to update profile details.');
    } finally {
      setRenewLoading(false);
    }
  };

  const handleSearchClick = () => {
    // Clear any pending suggestions timeout to prevent them from reappearing after search
    if (searchTimeout) clearTimeout(searchTimeout);
    setSuggestions([]);

    setCurrentPage(1); // Reset to page 1 on search
    if (user && !subscriptionExpired) {
      fetchJobs(1, searchInput);
      fetchSavedJobIds(); // Refresh saved status on search
      setShouldScrollToSearch(true); // Trigger scroll after jobs load
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setShouldScrollToSearch(true); // Trigger scroll after new jobs load
    }
  };

  return (
    <div className="bg-white">
      <Navbar />

      <div className="flex bg-white">
        {/* Sidebar for logged-in users, below Hero, beside Search */}
        {user && (
          <div className="hidden md:block w-64 flex-shrink-0 border-r border-gray-100 bg-white">
            <Sidebar className="h-[calc(100vh-80px)] sticky top-0" showHeader={false} />
          </div>
        )}

        <main className="flex-1 w-full">
          <section className="bg-white">
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
              <div id="search-anchor" className="text-center mb-6 md:mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900">Search for your perfect role.</h3>
                <p className="text-gray-500 mt-2 text-xs md:text-sm">Data verified by the U.S. Government.</p>
              </div>

              <SearchFilters onFilterChange={(newFilters) => {
                setFilters(newFilters);
                setCurrentPage(1); // Reset page on filter change
              }} />

              {/* Search Bar Wrapper */}
              <div className="relative max-w-[1400px] mx-auto mb-6 mt-6 z-20 px-4">
                <div className="flex items-center bg-white rounded-full shadow-[0_15px_50px_-15px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden ring-1 ring-gray-900/5 hover:ring-indigo-500/30 transition-all duration-300">
                  <div className="pl-6 pr-2 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => handleSearchSuggestions(e.target.value)}
                    onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearchClick();
                      }
                    }}
                    placeholder="Search jobs..."
                    className="flex-1 px-3 md:px-4 py-4 md:py-5 text-gray-900 text-base md:text-lg placeholder-gray-400 focus:outline-none bg-transparent font-medium"
                  />
                  <button
                    onClick={handleSearchClick}
                    className="mr-1.5 md:mr-2 px-5 md:px-10 py-3 md:py-3.5 bg-[#111827] text-white font-bold hover:bg-black transition-all rounded-full shadow-lg hover:shadow-gray-200 active:scale-[0.98] text-sm md:text-base"
                  >
                    Search
                  </button>
                </div>

                {/* Suggestions Dropdown */}
                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-30">
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent input blur momentarily
                          handleSuggestionClick(suggestion);
                        }}
                        className="w-full text-left px-6 py-3 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors border-b border-gray-50 last:border-0"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Job Cards List */}
              <div className="mt-6 max-w-[1400px] mx-auto space-y-4">
                {loading || (user && checkingSub) ? (
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
                      <h2 className="text-3xl font-bold text-gray-900 mb-2 font-display">Subscription Expired</h2>
                      <p className="text-sm text-gray-500 mb-2 italic">subscribe to get the access</p>
                      {subscriptionEndDate && (
                        <p className="text-xs text-red-400 mb-8 font-medium">Your access ended on {new Date(subscriptionEndDate).toLocaleDateString()}</p>
                      )}

                      {showRenewalFlow ? (
                        <div className="max-w-xl mx-auto p-4 text-left">
                          {renewalStep === 1 && (
                            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
                              <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">Your Registration Details</h3>
                                <button
                                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                                  className="text-sm text-blue-600 font-semibold hover:underline bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                                >
                                  {isEditingProfile ? 'Save Changes' : 'Edit Details'}
                                </button>
                              </div>
                              <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">First Name</label>
                                    <input
                                      type="text"
                                      value={renewProfile.firstName}
                                      disabled={!isEditingProfile}
                                      onChange={(e) => setRenewProfile({ ...renewProfile, firstName: e.target.value })}
                                      className={`w-full p-3 rounded-xl border transition-all ${!isEditingProfile ? 'bg-gray-50 border-gray-100 text-gray-700 font-medium' : 'bg-white border-blue-400 focus:ring-4 focus:ring-blue-100'}`}
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Last Name</label>
                                    <input
                                      type="text"
                                      value={renewProfile.lastName}
                                      disabled={!isEditingProfile}
                                      onChange={(e) => setRenewProfile({ ...renewProfile, lastName: e.target.value })}
                                      className={`w-full p-3 rounded-xl border transition-all ${!isEditingProfile ? 'bg-gray-50 border-gray-100 text-gray-700 font-medium' : 'bg-white border-blue-400 focus:ring-4 focus:ring-blue-100'}`}
                                    />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                  <input type="text" value={renewProfile.email} disabled className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 font-medium cursor-not-allowed" />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                                  <input
                                    type="text"
                                    value={renewProfile.phone}
                                    disabled={!isEditingProfile}
                                    onChange={(e) => setRenewProfile({ ...renewProfile, phone: e.target.value })}
                                    className={`w-full p-3 rounded-xl border transition-all ${!isEditingProfile ? 'bg-gray-50 border-gray-100 text-gray-700 font-medium' : 'bg-white border-blue-400 focus:ring-4 focus:ring-blue-100'}`}
                                  />
                                </div>

                                <div className="pt-6 border-t border-gray-100 mt-6">
                                  {renewError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{renewError}</p>}
                                  <button
                                    onClick={handleUpdateProfileAndProceed}
                                    disabled={renewLoading}
                                    className="w-full bg-primary-yellow text-primary-dark font-black text-lg py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                  >
                                    {renewLoading ? 'Saving Info...' : 'Get Access'}
                                  </button>
                                  <button onClick={() => setShowRenewalFlow(false)} className="w-full mt-4 text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors uppercase tracking-widest">Cancel Renewal</button>
                                </div>
                              </div>
                            </div>
                          )}

                          {renewalStep === 2 && (
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                              <h3 className="text-xl font-bold text-gray-900 mb-2">Complete Payment</h3>
                              <p className="text-gray-600 mb-6 text-sm">Subscribe for 1 month access ($30.00)</p>
                              <div id="paypal-renewal-container">
                                {/* Component for Renewal Payment */}
                                <div className="p-10 text-center border-2 border-dashed border-gray-200 rounded-lg">
                                  <p className="text-gray-500 text-sm mb-4">Click below to pay with PayPal</p>
                                  <RenewalPayment
                                    user={user}
                                    profile={renewProfile}
                                    onSuccess={() => {
                                      setRenewalStep(3);
                                      setSubscriptionExpired(false);
                                      setTimeout(() => setShowRenewalFlow(false), 3000);
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {renewalStep === 3 && (
                            <div className="text-center p-8">
                              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10" />
                              </div>
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                              <p className="text-gray-600">Your subscription has been renewed. Redirecting...</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={handleRenewClick}
                            className="inline-flex items-center gap-2 px-10 py-4 bg-primary-yellow text-primary-dark font-bold rounded-xl shadow-xl hover:bg-yellow-400 transition-all transform hover:-translate-y-1 active:scale-95"
                          >
                            Get Access
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        </>
                      )}
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

      <Testimonials />
      <FAQ />

      <Footer />
    </div>
  );
};

export default Homepage;
