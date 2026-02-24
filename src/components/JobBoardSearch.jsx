import React from 'react';
import {
    Search,
    Sparkles
} from 'lucide-react';

const JobBoardSearch = ({ searchInput, onSearchChange }) => {
    return (
        <div className="w-full bg-white px-8 pt-8 pb-4">
            {/* Search Bar */}
            <div className="max-w-7xl mx-auto">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <Sparkles size={20} className="text-[#1A3BA3]" />
                    </div>
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Ask AI about jobs or search keywords..."
                        className="w-full h-14 pl-14 pr-12 bg-white border-2 border-[#1A3BA3] rounded-full text-[15px] font-medium placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-[#1A3BA3]/10 transition-all shadow-sm"
                    />
                    <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                        <Search size={22} className="text-gray-300" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobBoardSearch;
