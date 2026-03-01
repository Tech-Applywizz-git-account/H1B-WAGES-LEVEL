import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Clock,
    Briefcase,
    Bookmark,
    BookmarkCheck,
    CheckCircle,
    ArrowUpRight,
    Star
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';
import { getWageLevel } from '../dataSyncService';
import LogoBox from './LogoBox';

const JobCard = ({ job, isSaved = false, isApplied = false, onSaveToggle, onApplyToggle }) => {
    const { user, subscriptionExpired } = useAuth();
    const [wageInfo, setWageInfo] = useState({ level: 'Lv 2', hourly: null, yearly: null, loading: true });
    const [saved, setSaved] = useState(isSaved);
    const [saving, setSaving] = useState(false);

    useEffect(() => setSaved(isSaved), [isSaved]);

    // Use pre-calculated wage level if available from the database
    useEffect(() => {
        if (job.wage_level) {
            setWageInfo({
                level: job.wage_level.replace(/^Level\s+/i, 'Lv '),
                yearly: (job.salary || '').replace(/[^0-9]/g, ''),
                loading: false
            });
            return;
        }

        const fetchWage = async () => {
            const occupation = job.title || job.job_role_name || job.role || '';
            const location = job.location || '';
            if (!occupation) return;

            try {
                const results = await getWageLevel(occupation, location);
                if (results && results.length > 0) {
                    const match = results[0];
                    setWageInfo({
                        level: match['Wage Level'] || 'Level 2',
                        hourly: match['Hourly'],
                        yearly: match['Yearly'],
                        loading: false
                    });
                } else {
                    setWageInfo(prev => ({ ...prev, loading: false }));
                }
            } catch (err) {
                setWageInfo(prev => ({ ...prev, loading: false }));
            }
        };

        fetchWage();
    }, [job.title, job.location, job.role]);

    const handleSaveToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || subscriptionExpired) return;

        const jobId = job.job_id || job.id || job.audit_id;
        setSaving(true);
        try {
            if (saved) {
                await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', jobId);
                setSaved(false);
            } else {
                await supabase.from('saved_jobs').insert([{ user_id: user.id, job_id: jobId, job_data: job }]);
                setSaved(true);
            }
            onSaveToggle?.(jobId, !saved);
        } catch (err) {
            console.error('Save error:', err);
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Recently';
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '4-digit'
            });
        } catch (e) { return dateStr; }
    };

    return (
        <div className="group bg-white rounded-[24px] border border-gray-100 p-5 mb-5 shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-300 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                {/* 1. Brand Section */}
                <div className="flex items-center gap-5 lg:min-w-[280px]">
                    <LogoBox name={job.company} size={64} fontSize={20} />

                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 border border-emerald-100/50">
                                <CheckCircle size={10} className="fill-emerald-600 text-white" />
                                Human Verified
                            </span>
                            <span className="text-[10px] font-black text-[#24385E] bg-orange-50 px-2.5 py-1 rounded-full uppercase tracking-widest border border-orange-100/50">
                                Sponsored
                            </span>
                        </div>
                        <h2 className="text-[20px] font-black text-[#24385E] leading-tight truncate px-0.5">
                            {job.company || 'Company Name'}
                        </h2>
                    </div>
                </div>

                {/* 2. Role Details Section */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-[17px] font-bold text-[#24385E] mb-3 truncate">
                        {job.title || job.role || 'Not Specified'}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fafafa] rounded-xl border border-gray-100/80 text-gray-500">
                            <MapPin size={14} className="text-[#FDB913]" />
                            <span className="text-[12px] font-bold">{job.location || 'United States'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fafafa] rounded-xl border border-gray-100/80 text-gray-500">
                            <Briefcase size={14} className="text-[#FDB913]" />
                            <span className="text-[12px] font-bold">{job.years_exp_required || 'Open exp.'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fafafa] rounded-xl border border-gray-100/80 text-gray-500">
                            <Clock size={14} className="text-[#FDB913]" />
                            <span className="text-[12px] font-bold">{formatDate(job.date_posted)}</span>
                        </div>
                    </div>
                </div>

                {/* 3. Wage & Actions Section */}
                <div className="flex items-center gap-5 shrink-0 lg:pl-6 lg:border-l border-gray-50">

                    <div className="bg-[#24385E] rounded-2xl p-4 flex flex-col items-center justify-center text-white min-w-[110px] shadow-lg shadow-[#24385E]/10 relative group-hover:bg-[#1a2b4a] transition-colors border border-white/5">
                        <div className="flex gap-0.5 mb-1.5">
                            {[1, 2, 3, 4].map((star) => {
                                const level = parseInt(wageInfo.level?.match(/\d/)?.[0] || '2');
                                return (
                                    <Star
                                        key={star}
                                        size={10}
                                        className={star <= level ? "fill-[#FDB913] text-[#FDB913]" : "text-[#4a5e7a]"}
                                    />
                                );
                            })}
                        </div>
                        <div className="text-2xl font-black italic leading-none mb-1">
                            {wageInfo.loading ? '...' : (wageInfo.level || 'Lv 2')}
                        </div>
                        <div className="text-[8px] font-black text-[#7a9bbf] uppercase tracking-[2px]">
                            WAGE LEVEL
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 min-w-[140px]">
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#FDB913] text-[#24385E] text-[13px] font-black rounded-xl hover:bg-[#24385E] hover:text-white transition-all duration-300 shadow-sm active:scale-95"
                        >
                            Apply Link
                            <ArrowUpRight size={16} />
                        </a>

                        <button
                            onClick={handleSaveToggle}
                            disabled={saving}
                            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all text-[11px] font-black uppercase tracking-wider border ${saved
                                ? 'bg-[#FDB913]/10 border-[#FDB913]/30 text-[#24385E]'
                                : 'bg-white border-gray-100 text-gray-400 hover:border-[#24385E]/20 hover:text-[#24385E]'
                                }`}
                        >
                            {saved ? 'Bookmarked' : 'Save Link'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
