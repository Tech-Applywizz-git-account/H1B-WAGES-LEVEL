import React, { useState } from 'react';
import { MapPin, Briefcase, GraduationCap, FileText, Search, X } from 'lucide-react';


const filterOptions = {
    role: ['Software Engineer', 'Product Manager', 'Data Scientist', 'Designer', 'Marketing Manager'],
    location: ['New York, New York', 'Chicago, Illinois', 'San Francisco, California', 'Austin, Texas', 'Boston, Massachusetts'],
    company: ['Google', 'Microsoft', 'Amazon', 'Meta', 'Netflix', 'Tesla'],
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
    const [activeFilters, setActiveFilters] = useState({
        role: [],
        location: [],
        company: [],
        experience: [],
    });


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
                <div className="flex justify-center space-x-1 border-b border-gray-200">
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
                </div>


                {/* Pills */}
                <div className="py-4 overflow-x-auto">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {filterOptions[activeTab].map(option => {
                            const isSelected = isFilterActive(activeTab, option);
                            return (
                                <button
                                    key={option}
                                    onClick={() => toggleFilter(activeTab, option)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium shadow-sm cursor-pointer transition-all border ${isSelected
                                        ? 'bg-purple-50 border-purple-200 text-gray-800'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200'
                                        }`}
                                >
                                    {option}
                                </button>
                            );
                        })}


                        {activeTab === 'location' && (
                            <button className="inline-flex items-center gap-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium shadow-sm cursor-pointer transition-all border border-gray-200">
                                <Search size={14} />
                                <span>Search for all other locations</span>
                            </button>
                        )}
                    </div>
                </div>


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