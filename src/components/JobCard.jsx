import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Clock,
    Briefcase,
    ExternalLink,
    Bookmark,
    BookmarkCheck,
    CheckCircle,
    Circle,
    FileText,
    X,
    ArrowUpRight,
    Search,
    Building2
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { leadsSupabase } from '../leadsSupabaseClient';
import useAuth from '../hooks/useAuth';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { getWageLevel } from '../dataSyncService';

const JobCard = ({ job, isSaved = false, isApplied = false, onSaveToggle, onApplyToggle }) => {
    const { user, subscriptionExpired } = useAuth();
    const [wageInfo, setWageInfo] = useState({ level: 'Lv 2', hourly: null, yearly: null, loading: true });

    const [saved, setSaved] = useState(isSaved);
    const [applied, setApplied] = useState(isApplied);
    const [saving, setSaving] = useState(false);
    const [applying, setApplying] = useState(false);

    // Resume help modal state
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [resumeFormData, setResumeFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        country: ''
    });

    useEffect(() => setSaved(isSaved), [isSaved]);
    useEffect(() => setApplied(isApplied), [isApplied]);

    // Fetch Wage Level dynamically
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
            const occupation = job.title || job.job_role_name || '';
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
    }, [job.title, job.location]);

    const handleSaveToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user || subscriptionExpired) return;

        const jobId = job.job_id || job.id;
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

    const handleResumeHelpClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowResumeModal(true);
    };

    const handleResumeFormChange = (field, value) => {
        setResumeFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleResumeFormSubmit = async (e) => {
        e.preventDefault();
        if (!resumeFormData.firstName || !resumeFormData.lastName || !resumeFormData.email || !resumeFormData.phone || !resumeFormData.country) {
            alert('Please fill in all fields');
            return;
        }

        try {
            const fullName = `${resumeFormData.firstName} ${resumeFormData.lastName}`.trim();
            const { error } = await leadsSupabase
                .from('leads')
                .insert([
                    {
                        name: fullName,
                        email: resumeFormData.email,
                        phone: resumeFormData.phone,
                        city: resumeFormData.country,
                        source: 'h1b-wage-level'
                    }
                ]);

            if (error) throw error;
            alert('Thank you! We will contact you soon.');
            setResumeFormData({ firstName: '', lastName: '', email: '', phone: '', country: '' });
            setShowResumeModal(false);
        } catch (err) {
            console.error('Lead error:', err);
            alert('An error occurred. Please try again.');
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-yellow-400/50 hover:border-yellow-400 transition-all duration-300 mb-4 overflow-hidden group flex shadow-[0_2px_15px_-3px_rgba(252,211,77,0.1)] hover:shadow-[0_10px_30px_-5px_rgba(252,211,77,0.2)]">
            {/* Left Content Area */}
            <div className="flex-1 p-6 flex gap-6">
                {/* Logo Placeholder */}
                <div className="shrink-0 pt-1">
                    <div className="w-12 h-12 bg-[#fafafa] border border-yellow-400/30 rounded-xl flex items-center justify-center text-xl font-bold text-[#24385E]">
                        {job.company ? job.company[0].toUpperCase() : 'C'}
                    </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-[18px] font-bold text-[#24385E] leading-snug mb-0.5">
                                {job.title || 'Job Title'}
                            </h3>
                            <p className="text-[14px] text-gray-400 font-medium mb-4">
                                {job.company || 'Company Name'}
                            </p>
                        </div>
                        <button
                            onClick={handleSaveToggle}
                            className={`p-1.5 transition-colors ${saved ? 'text-blue-600' : 'text-gray-300 hover:text-gray-900'}`}
                        >
                            {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                        </button>
                    </div>

                    {/* Meta Row (Icons) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-4 mb-5">
                        <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                            <MapPin size={14} className="text-gray-300" />
                            <span className="truncate">{job.location || 'Location'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                            <Briefcase size={14} className="text-gray-300" />
                            <span>{job.type || 'Full Time'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-gray-500 font-medium">
                            <Circle size={14} className="text-gray-300" />
                            <span>{job.salary || 'Competitive'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-gray-400 font-medium">
                            <Briefcase size={14} className="text-gray-300" />
                            <span>{job.job_role_name || 'Role'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-gray-400 font-medium">
                            <Clock size={14} className="text-gray-300" />
                            <span>{job.years_exp_required || 'Exp Required'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[13px] text-gray-400 font-medium">
                            <Search size={14} className="text-gray-300" />
                            <span>Recently</span>
                        </div>
                    </div>

                    {/* Tags & Time */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#fafafa]">
                        <div className="flex items-center gap-3">
                            {/* Human Verified Badge */}
                            <div className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-emerald-100 shadow-sm whitespace-nowrap">
                                <CheckCircle size={12} className="fill-emerald-600 text-white" />
                                Human Verified
                            </div>
                            <span className="text-[12px] text-gray-400 font-medium ml-1">
                                • Posted {job.upload_date ? new Date(job.upload_date).toLocaleDateString() : 'Recently'}
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleResumeHelpClick}
                                className="text-[12px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                            >
                                <FileText size={14} />
                                Resume help?
                            </button>
                            <a
                                href={job.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-white border border-[#24385E] text-[#24385E] text-[14px] font-bold rounded-xl hover:bg-[#24385E] hover:text-white transition-all shadow-sm"
                            >
                                <ArrowUpRight size={16} />
                                Apply Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Extra-Wide Premium Wage Level Badge with Stars */}
            <div className="w-[140px] bg-[#0a0a0a] flex flex-col items-center justify-center shrink-0 relative overflow-hidden group/wage py-4">
                {/* Background Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#24385E]/30"></div>
                <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-32 h-32 bg-yellow-500/10 blur-[40px] rounded-full"></div>

                {/* The Circular Badge with Number */}
                <div className="relative z-10 mb-2">
                    <div className="w-16 h-16 rounded-full border-[2.5px] border-white/20 flex flex-col items-center justify-center bg-white/5 backdrop-blur-sm shadow-2xl transition-all duration-500 group-hover/wage:border-white/40 group-hover/wage:scale-110">
                        <span className="text-[9px] font-black uppercase tracking-[0.15em] text-white/40 leading-none mb-1">Wage</span>
                        <span className="text-3xl font-black text-white leading-none">
                            {wageInfo.loading ? '...' : (wageInfo.level?.match(/\d/)?.[0] || '2')}
                        </span>
                    </div>
                </div>

                {/* Stars Rating below the circle */}
                <div className="relative z-10 flex items-center justify-center gap-0.5 mb-3">
                    {[1, 2, 3, 4].map((star) => {
                        const level = parseInt(wageInfo.level?.match(/\d/)?.[0] || '2');
                        return (
                            <div key={star} className={`transition-all duration-500 transform ${star <= level ? 'scale-110' : 'opacity-20 scale-90'}`}>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    className={`w-3.5 h-3.5 ${star <= level ? 'fill-yellow-400 text-yellow-400' : 'text-white'}`}
                                >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                </svg>
                            </div>
                        );
                    })}
                </div>

                {/* Fixed Salary Subtext (Fitting large ranges) */}
                {job.salary && (
                    <div className="relative z-10 px-2 text-center">
                        <div className="text-[11px] font-black text-white tracking-tight leading-tight">
                            {job.salary.includes('-')
                                ? job.salary.split('-').map(s => `$${(Number(s.replace(/[^0-9]/g, '')) / 1000).toFixed(0)}k`).join(' - ')
                                : `$${(Number(job.salary.replace(/[^0-9]/g, '')) / 1000).toFixed(0)}k/yr`
                            }
                        </div>
                        <div className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-0.5">Annual Est.</div>
                    </div>
                )}
            </div>

            {/* RESUME HELP MODAL */}
            {showResumeModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={() => setShowResumeModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-[#24385E] mb-1">Get Help with Your Resume</h3>
                            <p className="text-gray-500 text-xs">Fill in your details and we'll contact you soon.</p>
                        </div>
                        <form onSubmit={handleResumeFormSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none text-xs"
                                    value={resumeFormData.firstName}
                                    onChange={(e) => handleResumeFormChange('firstName', e.target.value)}
                                    required
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none text-xs"
                                    value={resumeFormData.lastName}
                                    onChange={(e) => handleResumeFormChange('lastName', e.target.value)}
                                    required
                                />
                            </div>
                            <input
                                type="email"
                                placeholder="Email Address"
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none text-xs"
                                value={resumeFormData.email}
                                onChange={(e) => handleResumeFormChange('email', e.target.value)}
                                required
                            />
                            <PhoneInput
                                defaultCountry="us"
                                value={resumeFormData.phone}
                                onChange={(phone) => handleResumeFormChange('phone', phone)}
                                inputStyle={{ width: '100%', fontSize: '12px', border: '1px solid #E5E7EB', borderRadius: '0.5rem', backgroundColor: '#F9FAFB' }}
                            />
                            <input
                                type="text"
                                placeholder="Country"
                                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:outline-none text-xs"
                                value={resumeFormData.country}
                                onChange={(e) => handleResumeFormChange('country', e.target.value)}
                                required
                            />
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowResumeModal(false)} className="flex-1 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 bg-[#24385E] text-white rounded-lg font-bold shadow-md hover:bg-blue-800 transition-all text-xs">Submit</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobCard;
