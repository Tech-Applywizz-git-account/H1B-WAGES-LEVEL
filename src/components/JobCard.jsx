import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Clock,
    Briefcase,
    ExternalLink,
    Bookmark,
    BookmarkCheck,
    CheckCircle,
    ArrowUpRight,
    Star
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';
import { getWageLevel } from '../dataSyncService';

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
                level: job.wage_level,
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
                        level: match['Wage Level'] || 'Lv 2',
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

    const getCompanyInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 3).toUpperCase();
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
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4 shadow-sm hover:shadow-md transition-shadow relative">


            <div className="flex gap-8">
                {/* Left Section: Logo & Verified */}
                <div className="flex flex-col items-center shrink-0">
                    <div className="w-24 h-24 border border-[#24385E]/10 rounded-xl bg-[#24385E]/5 flex items-center justify-center text-2xl font-black text-[#24385E]/40 mb-3">
                        {getCompanyInitials(job.company)}
                    </div>
                    <div className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                        <CheckCircle size={12} className="fill-white text-emerald-600" />
                        Human Verified
                    </div>
                </div>

                {/* Middle Section: Job Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-4">
                        <h2 className="text-[24px] font-bold text-[#24385E] leading-tight">
                            {job.company || 'Company Name'}
                        </h2>

                        <button
                            onClick={handleSaveToggle}
                            disabled={saving}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-sm font-bold border ${saved
                                ? 'bg-[#FDB913]/10 border-[#FDB913]/30 text-[#24385E]'
                                : 'bg-white border-gray-100 text-gray-400 hover:border-[#24385E]/20 hover:text-[#24385E]'
                                }`}
                        >
                            {saved ? <BookmarkCheck size={18} fill="currentColor" /> : <Bookmark size={18} />}
                            {saved ? 'Saved' : 'Save'}
                        </button>
                    </div>

                    <div className="space-y-2 mb-6 text-[15px]">
                        <div className="flex gap-2">
                            <span className="font-bold text-[#24385E] w-24">Job Role</span>
                            <span className="text-gray-600">: {job.title || job.role || 'Not Specified'}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-[#24385E] w-24">Job Type</span>
                            <span className="text-gray-600">: {job.role || job.domain || '.Net'}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="font-bold text-[#24385E] w-24">Date Posted</span>
                            <span className="text-gray-600">: {formatDate(job.date_posted)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 mt-auto select-none">
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <MapPin size={16} className="text-[#FDB913]" />
                            <span className="font-medium">{job.location || 'Location'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Clock size={16} className="text-[#FDB913]" />
                            <span className="font-medium">{job.years_exp_required || 'Experience'}</span>
                        </div>
                    </div>
                </div>

                {/* Right Section: Wage & Action */}
                <div className="w-[160px] flex flex-col gap-4 shrink-0">
                    <div className="bg-[#24385E] rounded-2xl p-5 flex flex-col items-center justify-center text-white shadow-lg relative overflow-hidden group">
                        {/* Decorative background circle */}
                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-[#FDB913]/10 rounded-full"></div>

                        <div className="flex gap-0.5 mb-2">
                            {[1, 2, 3, 4].map((star) => {
                                const level = parseInt(wageInfo.level?.match(/\d/)?.[0] || '2');
                                return (
                                    <Star
                                        key={star}
                                        size={14}
                                        className={star <= level ? "fill-[#FDB913] text-[#FDB913]" : "text-white/20"}
                                    />
                                );
                            })}
                        </div>

                        <div className="text-4xl font-black mb-1">
                            {wageInfo.loading ? '...' : (wageInfo.level || 'Lv 2')}
                        </div>
                        <div className="text-[11px] font-medium text-white/70 uppercase tracking-widest">
                            Wage Level
                        </div>
                    </div>

                    <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#FDB913] text-[#24385E] text-[14px] font-black rounded-xl hover:bg-[#e5a811] transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                        Apply Now
                        <ExternalLink size={16} />
                    </a>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
