import React, { useState, useEffect } from 'react';
import { MapPin, Briefcase, FileText, Search, X, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';

const defaultOptions = {
    role: ['Software Engineer', 'Software Developer', 'Data Engineer', 'Data Analyst', 'Data Scientist', 'GenAI', 'AI Engineer', 'DevOps', 'Supply Chain', 'Healthcare'],
    location: ['Seattle, WA', 'San Francisco, CA', 'Austin, TX', 'New York, NY', 'Chicago, IL', 'Cincinnati, OH'],
    company: ['Microsoft', 'Amazon', 'Apple', 'Nvidia', 'JP Morgan', 'US Bank', 'Oracle', 'Meta'],
    experience: ['Internship', '<1 year', '1-2 years', '3-4 years', '5-7 years', '8-14 years', '15+ years'],
};

const tabs = [
    { id: 'role', label: 'Role', icon: Briefcase },
    { id: 'location', label: 'Location', icon: MapPin },
    { id: 'company', label: 'Company', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
];

const SearchFilters = ({ onFilterChange }) => {
    const [activeTab, setActiveTab] = useState('role');
    const [showFilters, setShowFilters] = useState(false);

    const [activeFilters, setActiveFilters] = useState({
        role: [],
        location: [],
        company: [],
        experience: [],
    });

    const [filterOptions, setFilterOptions] = useState(defaultOptions);

    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const { data, error } = await supabase
                    .from('job_jobrole_all')
                    .select('years_exp_required');

                if (error) throw error;

                if (data && data.length > 0) {
                    const getTopItems = (items) => {
                        const counts = {};
                        items.forEach(item => {
                            if (item) {
                                const cleanItem = item.trim();
                                counts[cleanItem] = (counts[cleanItem] || 0) + 1;
                            }
                        });
                        return Object.entries(counts)
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 30)
                            .map(entry => entry[0]);
                    };

                    // Only fetching dynamic experience options now
                    const experiences = getTopItems(data.map(d => d.years_exp_required));

                    setFilterOptions(prev => ({
                        ...prev,
                        // location: Keep default hardcoded US locations
                        // company: Keep default hardcoded companies
                        // role: Keep default hardcoded roles
                        experience: experiences.length > 0 ? experiences : prev.experience,
                    }));
                }
            } catch (err) {
                console.error("Error fetching filter options:", err);
            }
        };

        fetchFilterOptions();
    }, []);

    const [showLocationInput, setShowLocationInput] = useState(false);
    const [customLocation, setCustomLocation] = useState('');

    const [showRoleInput, setShowRoleInput] = useState(false);
    const [customRole, setCustomRole] = useState('');

    const [showCompanyInput, setShowCompanyInput] = useState(false);
    const [customCompany, setCustomCompany] = useState('');

    const [showExperienceInput, setShowExperienceInput] = useState(false);
    const [customExperience, setCustomExperience] = useState('');

    // Suggestion State
    const [suggestions, setSuggestions] = useState([]);
    const [searchTimeout, setSearchTimeout] = useState(null);

    const handleSearchInput = (value, category) => {
        if (searchTimeout) clearTimeout(searchTimeout);

        const timeoutId = setTimeout(async () => {
            if (!value || value.length < 2) {
                setSuggestions([]);
                return;
            }

            const columnMap = {
                role: 'job_role_name',
                location: 'location',
                company: 'company',
                experience: 'years_exp_required'
            };
            const column = columnMap[category];

            try {
                const { data, error } = await supabase
                    .from('job_jobrole_all')
                    .select(column)
                    .ilike(column, `%${value}%`)
                    .limit(50);

                if (data) {
                    const values = data.map(item => item[column]).filter(Boolean);
                    const uniqueValues = [...new Set(values.map(v => v.trim()))];
                    setSuggestions(uniqueValues.slice(0, 10));
                }
            } catch (err) {
                console.error("Error fetching suggestions:", err);
            }
        }, 300);

        setSearchTimeout(timeoutId);
    };

    const handleCustomLocationSubmit = (e) => {
        if (e.key === 'Enter' && customLocation.trim()) {
            toggleFilter('location', customLocation.trim());
            setCustomLocation('');
            setShowLocationInput(false);
        }
    };

    const handleCustomRoleSubmit = (e) => {
        if (e.key === 'Enter' && customRole.trim()) {
            toggleFilter('role', customRole.trim());
            setCustomRole('');
            setShowRoleInput(false);
        }
    };

    const handleCustomCompanySubmit = (e) => {
        if (e.key === 'Enter' && customCompany.trim()) {
            toggleFilter('company', customCompany.trim());
            setCustomCompany('');
            setShowCompanyInput(false);
        }
    };

    const handleCustomExperienceSubmit = (e) => {
        if (e.key === 'Enter' && customExperience.trim()) {
            toggleFilter('experience', customExperience.trim());
            setCustomExperience('');
            setShowExperienceInput(false);
        }
    };

    const toggleFilter = (category, value) => {
        setActiveFilters(prev => {
            const newState = {
                ...prev,
                [category]: prev[category].includes(value)
                    ? prev[category].filter(v => v !== value)
                    : [...prev[category], value],
            };
            if (onFilterChange) onFilterChange(newState);
            return newState;
        });
    };

    const removeFilter = (category, value) => {
        setActiveFilters(prev => {
            const newState = {
                ...prev,
                [category]: prev[category].filter(v => v !== value),
            };
            if (onFilterChange) onFilterChange(newState);
            return newState;
        });
    };

    const isFilterActive = (category, value) => activeFilters[category].includes(value);

    const allActiveFilters = Object.entries(activeFilters).flatMap(([category, values]) =>
        values.map(value => ({ category, value })),
    );

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

                {/* Tabs */}
                <div className="flex justify-center items-center space-x-1 border-b border-gray-200">
                    {tabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${isActive
                                    ? 'text-purple-600 border-purple-600'
                                    : 'text-gray-500 hover:text-gray-700 border-transparent hover:border-gray-300'
                                    }`}
                            >
                                <Icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}

                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="ml-2 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ChevronDown
                            size={20}
                            className={`text-gray-500 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>

                {/* Pills */}
                {showFilters && (
                    <div className="py-4">
                        {/* 1️⃣ TOP OPTIONS (Pills) */}
                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                            {(activeTab === 'location' ? filterOptions.location.slice(0, 5)
                                : activeTab === 'role' ? filterOptions.role
                                    : activeTab === 'company' ? filterOptions.company.slice(0, 8)
                                        : filterOptions.experience
                            ).map(option => (
                                <button
                                    key={option}
                                    onClick={() => toggleFilter(activeTab, option)}
                                    className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium shadow-sm border transition-all 
                                    ${isFilterActive(activeTab, option)
                                            ? 'bg-purple-50 border-purple-200 text-gray-800'
                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                                        }`}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>

                        {/* 2️⃣ SEARCH INPUT (Separate Line, Last) */}
                        <div className="flex justify-center w-full relative z-10">
                            {/* Suggestion Dropdown Helper */}
                            {suggestions.length > 0 && (
                                <div className="absolute bottom-full mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20">
                                    {suggestions.map((suggestion, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                toggleFilter(activeTab, suggestion);
                                                setSuggestions([]);
                                                // Clear local inputs
                                                if (activeTab === 'location') { setCustomLocation(''); setShowLocationInput(false); }
                                                if (activeTab === 'role') { setCustomRole(''); setShowRoleInput(false); }
                                                if (activeTab === 'company') { setCustomCompany(''); setShowCompanyInput(false); }
                                                if (activeTab === 'experience') { setCustomExperience(''); setShowExperienceInput(false); }
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'location' && (
                                showLocationInput ? (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-500 rounded-full shadow-sm w-64">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={customLocation}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCustomLocation(val);
                                                handleSearchInput(val, 'location');
                                            }}
                                            onKeyDown={handleCustomLocationSubmit}
                                            onBlur={() => setTimeout(() => setShowLocationInput(false), 200)} // Delay for click
                                            placeholder="Type location..."
                                            className="outline-none text-sm text-gray-700 w-full"
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowLocationInput(true)}
                                        className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200"
                                    >
                                        <Search size={14} />
                                        <span>Search for all other locations</span>
                                    </button>
                                )
                            )}

                            {activeTab === 'role' && (
                                showRoleInput ? (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-500 rounded-full shadow-sm w-64">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={customRole}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCustomRole(val);
                                                handleSearchInput(val, 'role');
                                            }}
                                            onKeyDown={handleCustomRoleSubmit}
                                            onBlur={() => setTimeout(() => setShowRoleInput(false), 200)}
                                            placeholder="Type role..."
                                            className="outline-none text-sm text-gray-700 w-full"
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowRoleInput(true)}
                                        className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200"
                                    >
                                        <Search size={14} />
                                        <span>Search for all other roles</span>
                                    </button>
                                )
                            )}

                            {activeTab === 'company' && (
                                showCompanyInput ? (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-500 rounded-full shadow-sm w-64">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={customCompany}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCustomCompany(val);
                                                handleSearchInput(val, 'company');
                                            }}
                                            onKeyDown={handleCustomCompanySubmit}
                                            onBlur={() => setTimeout(() => setShowCompanyInput(false), 200)}
                                            placeholder="Type company..."
                                            className="outline-none text-sm text-gray-700 w-full"
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowCompanyInput(true)}
                                        className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200"
                                    >
                                        <Search size={14} />
                                        <span>Search for all other companies</span>
                                    </button>
                                )
                            )}

                            {activeTab === 'experience' && (
                                showExperienceInput ? (
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-purple-500 rounded-full shadow-sm w-64">
                                        <input
                                            type="text"
                                            autoFocus
                                            value={customExperience}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setCustomExperience(val);
                                                handleSearchInput(val, 'experience');
                                            }}
                                            onKeyDown={handleCustomExperienceSubmit}
                                            onBlur={() => setTimeout(() => setShowExperienceInput(false), 200)}
                                            placeholder="Type experience..."
                                            className="outline-none text-sm text-gray-700 w-full"
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowExperienceInput(true)}
                                        className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200"
                                    >
                                        <Search size={14} />
                                        <span>Search for all other experience levels</span>
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* Active Filters */}
                {allActiveFilters.length > 0 && (
                    <div className="py-3 border-t border-gray-100">
                        <div className="flex items-center gap-3 flex-wrap justify-center">
                            <span className="text-sm font-semibold text-gray-700">Active Filters:</span>

                            {allActiveFilters.map(({ category, value }) => (
                                <span
                                    key={`${category}-${value}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full text-sm font-medium text-gray-800"
                                >
                                    {category === 'role' && <Briefcase size={12} className="text-blue-500" />}
                                    {category === 'location' && <MapPin size={12} className="text-pink-500" />}
                                    {category === 'company' && <FileText size={12} className="text-orange-500" />}
                                    {category === 'experience' && <Briefcase size={12} className="text-indigo-500" />}

                                    <span>{value}</span>

                                    <button
                                        onClick={() => removeFilter(category, value)}
                                        className="hover:text-red-600 transition-colors cursor-pointer ml-1"
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
    );
};

export default SearchFilters;
