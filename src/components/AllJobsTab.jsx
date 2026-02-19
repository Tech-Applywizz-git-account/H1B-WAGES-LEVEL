import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import JobCard from './JobCard';
import useAuth from '../hooks/useAuth';
import {
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Loader2,
    AlertCircle,
    Briefcase
} from 'lucide-react';

const JOBS_PER_PAGE = 12;

const AllJobsTab = () => {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCompany, setFilterCompany] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [savedJobIds, setSavedJobIds] = useState(new Set());

    // Calculate total pages
    const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);

    // Fetch saved job IDs for the current user
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
            console.log('✅ Fetched saved job IDs:', ids.size);
        } catch (err) {
            console.error('❌ Error fetching saved jobs:', err);
        }
    };

    // Fetch jobs with pagination and optional filtering
    const fetchJobs = async (page = 1) => {
        setLoading(true);
        setError(null);

        try {
            console.log('📡 Fetching jobs - Page:', page);

            // Create base query
            let query = supabase
                .from('job_jobrole_all')
                .select('*', { count: 'exact' })
                .order('upload_date', { ascending: false });

            // APPLY FILTERS
            const hasActiveSearch = !!(searchTerm || filterRole || filterCompany || filterLocation);

            // If searching/filtering, we fetch more to allow better client-side relevance sorting
            const fetchLimit = hasActiveSearch ? 100 : JOBS_PER_PAGE;
            const from = hasActiveSearch ? 0 : (page - 1) * JOBS_PER_PAGE;
            const to = hasActiveSearch ? fetchLimit - 1 : from + JOBS_PER_PAGE - 1;

            if (searchTerm) {
                // Search in title, company, description, and job_role_name
                query = query.or(`title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,job_role_name.ilike.%${searchTerm}%`);
            }

            if (filterCompany) query = query.ilike('company', `%${filterCompany}%`);
            if (filterLocation) query = query.ilike('location', `%${filterLocation}%`);
            if (filterRole) query = query.ilike('job_role_name', `%${filterRole}%`);

            query = query.range(from, to);

            const { data, error: fetchError, count } = await query;

            if (fetchError) throw fetchError;

            let processedData = data || [];

            if (hasActiveSearch && processedData.length > 0) {
                const sTerm = searchTerm.toLowerCase();
                const rTerm = filterRole.toLowerCase();
                const cTerm = filterCompany.toLowerCase();
                const lTerm = filterLocation.toLowerCase();

                processedData = processedData
                    .map(job => {
                        let score = 0;
                        const title = (job.title || '').toLowerCase();
                        const role = (job.job_role_name || '').toLowerCase();
                        const company = (job.company || '').toLowerCase();
                        const loc = (job.location || '').toLowerCase();
                        const desc = (job.description || '').toLowerCase();

                        if (sTerm) {
                            if (title === sTerm) score += 1000;
                            else if (title.includes(sTerm)) score += 500;
                            if (role === sTerm) score += 300;
                            else if (role.includes(sTerm)) score += 150;
                            if (company.includes(sTerm)) score += 100;
                            if (desc.includes(sTerm)) score += 10;
                        }

                        if (rTerm) {
                            if (role.includes(rTerm)) score += 500;
                            if (title.includes(rTerm)) score += 300;
                        }

                        if (cTerm && company.includes(cTerm)) score += 500;
                        if (lTerm && loc.includes(lTerm)) score += 500;

                        return { ...job, _score: score };
                    })
                    // Strict filter: Enforce that the result actually matches the intent
                    .filter(job => {
                        const title = (job.title || '').toLowerCase();
                        const role = (job.job_role_name || '').toLowerCase();
                        const company = (job.company || '').toLowerCase();

                        // 1. If Role Filter is active, title MUST contain the keywords
                        if (rTerm) {
                            const rKeywords = rTerm.split(/\s+/).filter(k => k.length > 2);
                            const titleMatchesRole = title.includes(rTerm) || (rKeywords.length > 0 && rKeywords.every(k => title.includes(k)));
                            if (!titleMatchesRole) return false;
                        }

                        // 2. If General Search is active, enforce strict matching
                        if (sTerm) {
                            const sKeywords = sTerm.split(/\s+/).filter(k => k.length > 2);

                            if (sKeywords.length > 1) {
                                // Multi-word search: require ALL keywords in title or exact company match
                                const hasExactPhrase = title.includes(sTerm);
                                const hasAllKeywords = sKeywords.every(k => title.includes(k));
                                const companyMatch = company.includes(sTerm);

                                if (!hasExactPhrase && !hasAllKeywords && !companyMatch) {
                                    return false;
                                }
                            } else {
                                // Single word: must match title or company
                                const titleMatch = title.includes(sTerm);
                                const companyMatch = company.includes(sTerm);

                                if (!titleMatch && !companyMatch) {
                                    return false;
                                }
                            }
                        }

                        return job._score > 0 || !hasActiveSearch;
                    })
                    .sort((a, b) => b._score - a._score);

                // Re-calculate pagination for client-side sorted results
                setTotalJobs(processedData.length);
                const pFrom = (page - 1) * JOBS_PER_PAGE;
                const pTo = pFrom + JOBS_PER_PAGE;
                setJobs(processedData.slice(pFrom, pTo));
            } else {
                setJobs(processedData);
                setTotalJobs(count || 0);
            }
            setCurrentPage(page);
        } catch (err) {
            console.error('❌ Error fetching jobs:', err);
            setError(err.message || 'Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    // Real-time subscription for new job insertions
    useEffect(() => {
        console.log('🔔 Setting up real-time subscription for jobs table');

        const subscription = supabase
            .channel('job-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'job_jobrole_all'
                },
                (payload) => {
                    console.log('🆕 New job inserted:', payload.new);

                    // If on first page and no filters, prepend the new job
                    if (currentPage === 1 && !searchTerm && !filterCompany && !filterLocation && !filterRole) {
                        setJobs(prevJobs => [payload.new, ...prevJobs.slice(0, JOBS_PER_PAGE - 1)]);
                        setTotalJobs(prev => prev + 1);
                    } else {
                        // Just update the count
                        setTotalJobs(prev => prev + 1);
                    }
                }
            )
            .subscribe();

        return () => {
            console.log('🔕 Cleaning up real-time subscription');
            subscription.unsubscribe();
        };
    }, [currentPage, searchTerm, filterCompany, filterLocation, filterRole]);

    // Fetch saved jobs when user changes
    useEffect(() => {
        fetchSavedJobIds();
    }, [user]);

    // Initial fetch and refetch when filters change
    useEffect(() => {
        fetchJobs(1);
    }, [searchTerm, filterCompany, filterLocation, filterRole]);

    // Handle save/unsave toggle
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

    // Handle page changes
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            fetchJobs(newPage);
            // Scroll to top smoothly
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setFilterCompany('');
        setFilterLocation('');
        setFilterRole('');
    };

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <Briefcase className="w-8 h-8 text-gray-900" />
                        All Jobs
                    </h2>
                    <p className="text-gray-600 mt-1">
                        {totalJobs.toLocaleString()} job{totalJobs !== 1 ? 's' : ''} available
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                    </div>

                    {/* Company Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter by company..."
                            value={filterCompany}
                            onChange={(e) => setFilterCompany(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                    </div>

                    {/* Location Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter by location..."
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Filter by role..."
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Reset Filters Button */}
                {(searchTerm || filterCompany || filterLocation || filterRole) && (
                    <button
                        onClick={resetFilters}
                        className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Reset Filters
                    </button>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 text-gray-900 animate-spin mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Loading jobs...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
                    <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-red-800 font-semibold mb-1">Error Loading Jobs</h3>
                        <p className="text-red-600 text-sm">{error}</p>
                        <button
                            onClick={() => fetchJobs(currentPage)}
                            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            )}

            {/* No Jobs State */}
            {!loading && !error && jobs.length === 0 && (
                <div className="bg-gray-50 rounded-xl p-12 text-center border border-gray-200">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No jobs found</h3>
                    <p className="text-gray-500">
                        {searchTerm || filterCompany || filterLocation || filterRole
                            ? 'Try adjusting your filters to see more results'
                            : 'No jobs available at the moment. Check back soon!'}
                    </p>
                </div>
            )}

            {/* Jobs Grid */}
            {!loading && !error && jobs.length > 0 && (
                <>
                    <div className="grid grid-cols-1 gap-4">
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                isSaved={savedJobIds.has(job.job_id)}
                                onSaveToggle={handleSaveToggle}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            {/* Previous Button */}
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                <ChevronLeft className="w-5 h-5" />
                                Previous
                            </button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-2">
                                {getPageNumbers().map((page, index) => (
                                    page === '...' ? (
                                        <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                                            ...
                                        </span>
                                    ) : (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`px-4 py-2 rounded-lg font-medium transition-all ${currentPage === page
                                                ? 'bg-gray-900 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                ))}
                            </div>

                            {/* Next Button */}
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                Next
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* Page Info */}
                    <div className="text-center text-sm text-gray-500">
                        Showing {((currentPage - 1) * JOBS_PER_PAGE) + 1} - {Math.min(currentPage * JOBS_PER_PAGE, totalJobs)} of {totalJobs.toLocaleString()} jobs
                    </div>
                </>
            )}
        </div>
    );
};

export default AllJobsTab;
