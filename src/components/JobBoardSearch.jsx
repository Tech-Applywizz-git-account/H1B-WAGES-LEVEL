import React from 'react';
import {
    Search,
    Sparkles,
    Flame,
    Bookmark,
    RotateCcw,
    FileSearch,
    Monitor,
    Zap,
    Ban,
    Filter
} from 'lucide-react';

const filterTabs = [
    { id: 'fresh', label: 'Fresh Jobs', icon: Flame, activeColor: 'bg-yellow-400 text-[#24385E]', color: 'text-orange-500' },
    { id: 'saved', label: 'Saved', icon: Bookmark, color: 'text-gray-400' },
    { id: 'applied', label: 'Applied', icon: RotateCcw, color: 'text-yellow-600' },
    // { id: 'reviewing', label: 'Reviewing', icon: FileSearch, color: 'text-blue-500' },
    // { id: 'interviewing', label: 'Interviewing', icon: Monitor, color: 'text-[#24385E]' },
    // { id: 'offered', label: 'Offered', icon: Zap, color: 'text-indigo-500' },
    // { id: 'rejected', label: 'Rejected', icon: Ban, color: 'text-gray-500' },
];

const JobBoardSearch = ({ searchInput, onSearchChange, activeFilter = 'fresh' }) => {
    return (
        <div className="w-full bg-white px-8 py-6 space-y-6">
            {/* Search Bar */}
            <div className="max-w-7xl mx-auto">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Sparkles size={20} className="text-yellow-500" />
                    </div>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Ask AI about jobs or search keywords..."
                        className="w-full h-14 pl-14 pr-12 bg-white border-2 border-yellow-400 rounded-full text-[15px] font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/10 transition-all shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                        <Search size={22} className="text-gray-300" />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between max-w-7xl mx-auto overflow-x-auto no-scrollbar pb-2">
                <div className="flex items-center gap-3">
                    {filterTabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeFilter === tab.id;

                        return (
                            <button
                                key={tab.id}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all whitespace-nowrap text-[13px] font-bold
                                    ${isActive
                                        ? (tab.activeColor || "bg-[#fafafa] border-[#24385E] text-[#24385E]")
                                        : "bg-[#fafafa] border-[#f0f0f0] text-gray-700 hover:border-gray-200"
                                    }`}
                            >
                                <Icon size={16} className={isActive ? "" : tab.color} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-[#f0f0f0] bg-[#fafafa] text-[#24385E] text-[13px] font-bold hover:bg-gray-50 transition-all whitespace-nowrap ml-4">
                    <Filter size={18} className="text-gray-400" />
                    Filters
                </button>
            </div>
        </div>
    );
};

export default JobBoardSearch;
