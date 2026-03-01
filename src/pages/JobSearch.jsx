import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Search, MapPin, Briefcase, GraduationCap, FileText, X } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const mockJobs = [
    {
        id: 1,
        company: 'JPMorgan Chase',
        logo: '🏦',
        title: 'Senior Software Engineer',
        location: 'New York, NY',
        salary: '$140K–$190K',
        posted: 'New 2h ago',
        categories: ['Software Engineering', 'Cloud & DevOps'],
        tags: ['On-Site', "Bachelor's", 'Full Time'],
        visas: ['H-1B', 'Green Card', 'E-3'],
    },
    {
        id: 2,
        company: 'AMD',
        logo: '💻',
        title: 'Machine Learning Engineer',
        location: 'Austin, TX',
        salary: '$150K–$200K',
        posted: 'New 4h ago',
        categories: ['Machine Learning', 'AI'],
        tags: ['Hybrid', "Master's", 'Full Time'],
        visas: ['H-1B', 'OPT', 'Green Card'],
    },
    {
        id: 3,
        company: 'Google',
        logo: '🔍',
        title: 'Product Manager',
        location: 'Mountain View, CA',
        salary: '$160K–$220K',
        posted: '1d ago',
        categories: ['Product Management'],
        tags: ['Remote', "Bachelor's", 'Full Time'],
        visas: ['H-1B', 'TN', 'Green Card'],
    },
];

const filterOptions = {
    visa: ['H-1B', 'Green Card', '🍇 OPT', '📚 CPT', '🇨🇦🇲🇽 TN', '🇦🇺 E-3', '🍑 J-1', '🇦🇺 AU E-3', '🇨🇦🇲🇽 CA/MX TN', '🇸🇬 SG H-1B1', '🇨🇱 CL H-1B1'],
    location: ['New York, New York', 'Chicago, Illinois', 'San Francisco, California', 'Austin, Texas', 'Boston, Massachusetts'],
    education: ["High School", "Associate's", "Bachelor's", "Master's", "Doctorate", "Other"],
    experience: ['0-4 years', '5-7 years', '8-11 years']
};

const JobSearch = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('visa');
    const [activeFilters, setActiveFilters] = useState({
        visa: ['H-1B', 'Green Card'],
        location: [],
        education: [],
        experience: []
    });
    const [selectedJob, setSelectedJob] = useState(null);

    const getVisaColor = (visa) => {
        const colors = {
            'H-1B': 'bg-visa-h1b',
            'Green Card': 'bg-visa-greencard',
            'OPT': 'bg-visa-opt',
            'CPT': 'bg-visa-opt',
            'TN': 'bg-visa-tn',
            'E-3': 'bg-visa-e3',
            'J-1': 'bg-visa-j1',
        };
        return colors[visa] || 'bg-gray-500';
    };

    const toggleFilter = (category, value) => {
        setActiveFilters(prev => ({
            ...prev,
            [category]: prev[category].includes(value)
                ? prev[category].filter(v => v !== value)
                : [...prev[category], value]
        }));
    };

    const removeFilter = (category, value) => {
        setActiveFilters(prev => ({
            ...prev,
            [category]: prev[category].filter(v => v !== value)
        }));
    };

    const isFilterActive = (category, value) => {
        return activeFilters[category].includes(value);
    };

    const allActiveFilters = Object.entries(activeFilters).flatMap(([category, values]) =>
        values.map(value => ({ category, value }))
    );

    const tabs = [
        { id: 'visa', label: 'Visa You Want', icon: FileText },
        { id: 'location', label: 'Location', icon: MapPin },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'experience', label: 'Experience', icon: Briefcase }
    ];

    return (
        <div>
            <Navbar />

            <div className="min-h-screen bg-gray-50">
                {/* Hero Section - Responsive */}
                {!user && (
                    <div className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
                        <div className="absolute inset-0 bg-black opacity-30"></div>

                        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-32">
                            <div className="text-center">
                                <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                                    Land Your Dream Job <br className="hidden sm:block" />
                                    in the <span className="text-primary-yellow">United States</span>
                                </h1>

                                <p className="text-base sm:text-xl md:text-2xl text-gray-200 mb-6 sm:mb-8 max-w-3xl mx-auto">
                                    Verified roles with H-1B, OPT, Green Card, and other visa sponsorships
                                </p>

                                <form onSubmit={(e) => e.preventDefault()} className="max-w-2xl mx-auto mb-6 sm:mb-8">
                                    <div className="flex items-center bg-white rounded-lg shadow-xl overflow-hidden">
                                        <input
                                            type="text"
                                            placeholder="Search for jobs..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-gray-900 text-base sm:text-lg focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            className="bg-primary-yellow text-primary-dark px-6 sm:px-8 py-3 sm:py-4 hover:bg-yellow-500 transition font-semibold flex items-center space-x-1 sm:space-x-2 flex-shrink-0"
                                        >
                                            <Search size={18} className="sm:w-5 sm:h-5" />
                                            <span className="text-sm sm:text-base">Search</span>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabbed Filter Section - Horizontally Scrollable on Mobile */}
                <div className="bg-white border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-8 py-3 sm:py-4">
                        {/* Tab Navigation - Scrollable on Mobile */}
                        <div className="overflow-x-auto scrollbar-hide px-4 sm:px-0">
                            <div className="flex space-x-1 border-b border-gray-200 min-w-max sm:justify-center">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap flex-shrink-0 ${isActive
                                                ? 'text-purple-600 border-purple-600'
                                                : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                                                }`}
                                        >
                                            <Icon size={16} className="sm:w-[18px] sm:h-[18px]" />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Filter Pill Row */}
                        <div className="py-3 sm:py-4 px-4 sm:px-0">
                            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                                {filterOptions[activeTab].map((option) => {
                                    const isSelected = isFilterActive(activeTab, option);
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => toggleFilter(activeTab, option)}
                                            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm cursor-pointer transition-all border min-h-[44px] sm:min-h-0 ${isSelected
                                                ? 'bg-purple-50 border-purple-200 text-gray-800'
                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                                                }`}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}

                                {activeTab === 'location' && (
                                    <button className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs sm:text-sm font-medium shadow-sm cursor-pointer transition-all border border-gray-200 min-h-[44px] sm:min-h-0">
                                        <Search size={14} />
                                        <span>Search for all other locations</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Active Filters Bar */}
                        {allActiveFilters.length > 0 && (
                            <div className="py-3 border-t border-gray-100 px-4 sm:px-0">
                                <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
                                    <span className="text-xs sm:text-sm font-semibold text-gray-700">Active Filters:</span>
                                    {allActiveFilters.map(({ category, value }) => (
                                        <span
                                            key={`${category}-${value}`}
                                            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-purple-50 border border-purple-200 rounded-full text-xs sm:text-sm font-medium text-gray-800"
                                        >
                                            {category === 'visa' && (
                                                <span className={`w-2 h-2 rounded-full ${value === 'Green Card' ? 'bg-green-500' : 'bg-blue-500'
                                                    }`} />
                                            )}
                                            {category === 'location' && <MapPin size={12} className="text-pink-500" />}
                                            {category === 'education' && <GraduationCap size={12} className="text-orange-500" />}
                                            {category === 'experience' && <Briefcase size={12} className="text-indigo-500" />}

                                            <span>{value}</span>

                                            <button
                                                onClick={() => removeFilter(category, value)}
                                                className="hover:text-red-600 transition-colors cursor-pointer ml-0.5"
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Results Section */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                        Showing {mockJobs.length} open jobs
                    </p>

                    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
                        {/* Job Cards */}
                        <div className="space-y-3 sm:space-y-4">
                            {mockJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="card hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => setSelectedJob(job)}
                                >
                                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                                        <div className="flex items-center space-x-2 sm:space-x-3">
                                            <div className="w-10 h-10 sm:w-12 sm:h-12 text-2xl sm:text-3xl flex-shrink-0">{job.logo}</div>
                                            <div>
                                                <div className="font-semibold text-sm sm:text-base text-gray-900">{job.company}</div>
                                                <div className="text-base sm:text-lg font-bold text-primary-dark">{job.title}</div>
                                                <div className="text-xs sm:text-sm text-gray-600">
                                                    {job.location} • {job.salary} • {job.posted}
                                                </div>
                                            </div>
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600 text-xl sm:text-2xl flex-shrink-0">×</button>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                        {job.categories.map((cat, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs sm:text-sm"
                                            >
                                                {cat}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                                        {job.tags.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs sm:text-sm"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                        {job.visas.map((visa, idx) => (
                                            <span
                                                key={idx}
                                                className={`px-2 sm:px-3 py-1 ${getVisaColor(visa)} text-white rounded-full text-xs font-medium border border-white`}
                                            >
                                                {visa}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Job Detail Panel (Desktop) */}
                        {selectedJob && (
                            <div className="hidden lg:block">
                                <div className="card sticky top-32">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-16 h-16 text-4xl">{selectedJob.logo}</div>
                                            <div>
                                                <div className="font-semibold text-gray-900">{selectedJob.company}</div>
                                                <div className="text-2xl font-bold text-primary-dark">
                                                    {selectedJob.title}
                                                </div>
                                                <div className="text-gray-600">{selectedJob.location}</div>
                                                <div className="text-lg font-semibold text-gray-900 mt-1">{selectedJob.salary}</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedJob(null)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <button className="w-full btn-primary mb-6">Sign up to apply</button>

                                    <div className="mb-6">
                                        <h3 className="font-semibold mb-2">Visas accepted:</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.visas.map((visa, idx) => (
                                                <span
                                                    key={idx}
                                                    className={`px-3 py-1 ${getVisaColor(visa)} text-white rounded-full text-sm font-medium`}
                                                >
                                                    {visa}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="prose max-w-none">
                                        <h3 className="font-semibold mb-2">Job Description</h3>
                                        <p className="text-gray-600 mb-4">
                                            We are seeking a talented professional to join our team. This role offers
                                            visa sponsorship and competitive compensation.
                                        </p>

                                        <h3 className="font-semibold mb-2">Responsibilities</h3>
                                        <ul className="text-gray-600 space-y-1 mb-4">
                                            <li>Design and develop scalable software solutions</li>
                                            <li>Collaborate with cross-functional teams</li>
                                            <li>Participate in code reviews and technical discussions</li>
                                        </ul>

                                        <h3 className="font-semibold mb-2">Qualifications</h3>
                                        <ul className="text-gray-600 space-y-1">
                                            <li>Bachelor's degree in Computer Science or related field</li>
                                            <li>3+ years of professional experience</li>
                                            <li>Strong problem-solving skills</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default JobSearch;
