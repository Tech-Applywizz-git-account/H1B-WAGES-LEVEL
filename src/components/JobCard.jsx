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

                {/* 1. Brand & Info Section */}
                <div className="flex gap-6 flex-1 min-w-0">
                    <div className="shrink-0 pt-1">
                        <LogoBox name={job.company} size={64} fontSize={20} />
                    </div>

                    <div className="flex-1 min-w-0">
                        {/* Row 1: Company + Date */}
                        <div className="flex items-center justify-between mb-1.5 pr-4">
                            <span className="text-[14px] font-bold text-[#a0aec0] tracking-tight">{job.company || 'Company Name'}</span>
                        </div>

                        {/* Row 2: Title */}
                        <h2 className="text-[24px] font-black leading-tight mb-2.5 truncate">
                            <a
                                href={job.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#111] hover:text-[#FDB913] transition-colors duration-200"
                                style={{ textDecoration: 'none' }}
                                onClick={e => { if (!job.url) e.preventDefault(); }}
                            >
                                {job.title || job.role || 'Not Specified'}
                            </a>
                        </h2>

                        {/* Row 3: Location */}
                        <div className="flex items-center gap-1.5 mb-4 text-[#a0aec0]">
                            <MapPin size={16} color="#cbd5e0" />
                            <span className="text-[14px] font-bold">{job.location || 'United States'}</span>
                        </div>



                        {/* Row 5: Badges */}
                        <div className="flex items-center gap-3">
                            {job.isVerified && (
                                <span className="text-[11px] font-black text-[#059669] bg-[#f0fdf4] px-3.5 py-2 rounded-xl uppercase tracking-widest flex items-center gap-2 border border-[#dcfce7]">
                                    HUMAN VERIFIED <CheckCircle size={14} />
                                </span>
                            )}
                        </div>
                    </div>
                </div>



                {/* 3. Wage & Actions Section */}
                <div className="flex items-center gap-5 shrink-0 lg:pl-6 lg:border-l border-gray-50">

                    <div className="bg-[#1a2b4b] rounded-3xl p-6 flex flex-col items-center justify-center text-white w-full shadow-xl shadow-[#1a2b4b]/15 transition-all duration-300">
                        <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4].map((star) => {
                                const level = parseInt(wageInfo.level?.match(/\d/)?.[0] || '2');
                                return (
                                    <Star
                                        key={star}
                                        size={14}
                                        className={star <= level ? "fill-[#FDB913] text-[#FDB913]" : "text-[#3d4d6b]"}
                                        strokeWidth={2.5}
                                    />
                                );
                            })}
                        </div>
                        <div className="text-4xl font-black italic leading-none mb-1.5">
                            {wageInfo.loading ? '...' : (wageInfo.level || 'Lv 2')}
                        </div>
                        <div className="text-[10px] font-black text-[#718096] uppercase tracking-[2px]">
                            WAGE LEVEL
                        </div>
                    </div>

                    <div className="flex gap-2 w-full">
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-2 py-4 bg-[#FDB913] text-[#1a1a1a] text-[16px] font-black rounded-2xl hover:bg-[#e5a607] transition-all duration-200 shadow-lg shadow-[#FDB913]/25 active:scale-95"
                        >
                            Apply Now
                            <ArrowUpRight size={18} />
                        </a>

                        <button
                            onClick={handleSaveToggle}
                            disabled={saving}
                            className={`p-4 rounded-2xl transition-all border shrink-0 ${saved
                                ? 'bg-[#fff7ed] border-[#FDB913]/30 text-[#FDB913]'
                                : 'bg-white border-[#f1f5f9] text-[#cbd5e0] hover:text-[#24385E] hover:border-[#24385E]/20'
                                }`}
                        >
                            {saved ? <BookmarkCheck size={22} /> : <Bookmark size={22} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCard;
