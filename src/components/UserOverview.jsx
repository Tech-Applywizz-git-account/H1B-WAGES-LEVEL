import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Heart,
    Flame,
    TrendingUp,
    ChevronRight,
    Search
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';

const UserOverview = () => {
    const { user, subscriptionEndDate } = useAuth();
    const [stats, setStats] = useState({
        jobsApplied: 0,
        savedJobs: 0,
        daysLeft: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchStats();
        }
    }, [user, subscriptionEndDate]);

    const fetchStats = async () => {
        try {
            // Count Applied Jobs
            const { count: appliedCount } = await supabase
                .from('applied_jobs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            // Count Saved Jobs
            const { count: savedCount } = await supabase
                .from('saved_jobs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            // Calculate days left
            let days = 0;
            if (subscriptionEndDate) {
                const end = new Date(subscriptionEndDate);
                const now = new Date();
                days = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
            }

            setStats({
                jobsApplied: appliedCount || 0,
                savedJobs: savedCount || 0,
                daysLeft: days
            });
        } catch (err) {
            console.error("Stats error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10">
            {/* Header */}
            <div>
                <h2 className="text-[28px] font-black text-[#24385E] tracking-tight mb-1">Dashboard</h2>
                <p className="text-gray-400 font-medium">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Grid Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Jobs Applied */}
                <div className="bg-[#24385E] p-6 rounded-[32px] text-white shadow-xl shadow-blue-900/10 relative overflow-hidden group">
                    <div className="relative z-10 flex flex-col h-full justify-between">
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-3 bg-white/10 rounded-2xl">
                                <Briefcase size={24} className="text-white" />
                            </div>
                            <span className="text-[12px] font-bold bg-white/10 px-2 py-0.5 rounded-lg border border-white/5">Realtime</span>
                        </div>
                        <div>
                            <p className="text-white/60 text-[13px] font-bold uppercase tracking-wider mb-1">Jobs Applied</p>
                            <h3 className="text-4xl font-black">{stats.jobsApplied}</h3>
                        </div>
                    </div>
                    {/* Background decoration */}
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                </div>

                {/* Saved Jobs */}
                <div className="bg-white p-6 rounded-[32px] border border-[#f0f0f0] shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-3 bg-red-50 rounded-2xl border border-red-100">
                            <Heart size={24} className="text-red-500 fill-red-500" />
                        </div>
                        <span className="text-[12px] font-bold text-gray-400">Personal</span>
                    </div>
                    <div>
                        <p className="text-gray-400 text-[13px] font-bold uppercase tracking-wider mb-1">Saved Jobs</p>
                        <h3 className="text-4xl font-black text-[#24385E]">{stats.savedJobs}</h3>
                    </div>
                </div>

                {/* Days Remaining */}
                <div className="bg-white p-6 rounded-[32px] border border-[#f0f0f0] shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-8">
                        <div className="p-3 bg-[#fffbeb] rounded-2xl border border-[#fef3c7]">
                            <Flame size={24} className="text-yellow-500 fill-yellow-500" />
                        </div>
                        <span className="text-[12px] font-bold text-yellow-600">Premium</span>
                    </div>
                    <div>
                        <p className="text-gray-400 text-[13px] font-bold uppercase tracking-wider mb-1">Days Remaining</p>
                        <h3 className="text-4xl font-black text-[#24385E]">{stats.daysLeft}</h3>
                    </div>
                </div>
            </div>

            {/* Recent Section (Bottom) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Latest Matches */}
                <div className="bg-white p-8 rounded-[32px] border border-[#f0f0f0] shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-[18px] font-black text-[#24385E]">Latest Matches</h3>
                        <button className="text-[13px] font-bold text-indigo-600 hover:underline flex items-center gap-1">
                            Browse All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="flex items-center gap-4 p-4 bg-[#fafafa] rounded-2xl border border-[#f0f0f0]">
                                <div className="w-10 h-10 bg-white border border-[#f0f0f0] rounded-xl flex items-center justify-center font-bold text-[#24385E]">C</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#24385E] truncate">Software Engineer</p>
                                    <p className="text-[12px] text-gray-400 font-medium">Top Tier Co • Remote</p>
                                </div>
                                <button className="p-2 text-gray-300 hover:text-[#24385E] transition-colors"><ChevronRight size={18} /></button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Summary */}
                <div className="bg-white p-8 rounded-[32px] border border-[#f0f0f0] shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-[#fafafa] rounded-2xl flex items-center justify-center mb-6">
                        <TrendingUp size={32} className="text-gray-200" />
                    </div>
                    <h3 className="text-[18px] font-black text-[#24385E] mb-2">Growth Tracker</h3>
                    <p className="text-gray-400 text-sm max-w-[240px] mb-6 font-medium">Keep track of your job search progress and stay ahead of the curve.</p>
                    <button className="px-8 py-3 bg-[#24385E] text-white text-[14px] font-bold rounded-2xl hover:bg-[#1a2b4a] transition-all shadow-lg active:scale-95">
                        Expand Results
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserOverview;
