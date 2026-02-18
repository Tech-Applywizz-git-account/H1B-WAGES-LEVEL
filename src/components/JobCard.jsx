import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Clock,
    Briefcase,
    ExternalLink,
    Building2,
    Bookmark,
    BookmarkCheck,
    Globe,
    CheckCircle,
    Circle,
    FileText,
    X
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { leadsSupabase } from '../leadsSupabaseClient';
import useAuth from '../hooks/useAuth';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

const JobCard = ({ job, isSaved = false, isApplied = false, onSaveToggle, onApplyToggle }) => {
    const { user, subscriptionExpired } = useAuth();

    // DEBUG: Track what's being rendered
    console.log("🎫 JobCard DEBUG:", {
        title: job.title,
        userEmail: user?.email,
        subscriptionExpired: subscriptionExpired,
        willShowActiveLink: user && !subscriptionExpired
    });

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

    const formatDate = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor(Math.abs(now - date) / (1000 * 60 * 60 * 24));
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 30) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    /* =========================
       SAVE JOB
    ========================= */
    const handleSaveToggle = async (e) => {
        e.preventDefault();

        if (!user || subscriptionExpired) {
            alert('Your subscription has expired. Please renew to save jobs.');
            return;
        }

        const jobId = job.job_id || job.id;
        const newSavedState = !saved;

        setSaving(true);
        try {
            if (saved) {
                await supabase
                    .from('saved_jobs')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('job_id', jobId);
                setSaved(false);
            } else {
                await supabase
                    .from('saved_jobs')
                    .insert([{ user_id: user.id, job_id: jobId, job_data: job }]);
                setSaved(true);
            }

            onSaveToggle?.(jobId, newSavedState);
        } catch (err) {
            console.error('Save error:', err);
        } finally {
            setSaving(false);
        }
    };

    /* =========================
       MARK APPLIED
    ========================= */
    const handleApplyToggle = async (e) => {
        e.preventDefault();

        if (!user || subscriptionExpired) {
            alert('Your subscription has expired. Please renew to apply.');
            return;
        }

        const jobId = String(job.job_id || job.id);
        const newAppliedState = !applied;

        setApplying(true);
        try {
            if (applied) {
                await supabase
                    .from('applied_jobs')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('job_id', jobId);
                setApplied(false);
            } else {
                await supabase
                    .from('applied_jobs')
                    .insert([{
                        user_id: user.id,
                        job_id: jobId,
                        job_data: job,
                        application_status: 'applied'
                    }]);
                setApplied(true);
            }

            onApplyToggle?.(jobId, newAppliedState);
        } catch (err) {
            console.error('Apply error:', err);
        } finally {
            setApplying(false);
        }
    };

    /* =========================
       RESUME HELP HANDLERS
    ========================= */
    const handleResumeHelpClick = (e) => {
        e.preventDefault();
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

        // Basic validation
        if (!resumeFormData.firstName || !resumeFormData.lastName || !resumeFormData.email || !resumeFormData.phone || !resumeFormData.country) {
            alert('Please fill in all fields');
            return;
        }

        try {
            // Combine first name and last name for the 'name' field
            const fullName = `${resumeFormData.firstName} ${resumeFormData.lastName}`.trim();

            // Insert data into the leads database
            const { data, error } = await leadsSupabase
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

            if (error) {
                console.error('Error submitting lead:', error);
                alert('There was an error submitting your information. Please try again.');
                return;
            }

            console.log('Lead submitted successfully:', data);
            alert('Thank you! We will contact you soon to help with your resume.');

            // Reset form and close modal
            setResumeFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                country: ''
            });
            setShowResumeModal(false);
        } catch (err) {
            console.error('Unexpected error:', err);
            alert('An unexpected error occurred. Please try again later.');
        }
    };

    return (
        <div className="bg-white rounded-2xl border-2 border-blue-100/80 hover:border-blue-500 hover:shadow-[0_25px_50px_-12px_rgba(59,130,246,0.15)] hover:-translate-y-2 hover:bg-blue-50/5 transition-all duration-500 p-6 group mb-6 relative hover:z-10 cursor-pointer">
            <div className="flex flex-col lg:flex-row gap-6">

                {/* LEFT: LOGO & VERIFIED BADGE */}
                <div className="flex flex-col items-center gap-3 shrink-0">
                    <div className="w-24 h-24 bg-white border border-gray-100 rounded-xl flex items-center justify-center text-2xl font-bold text-gray-400 shadow-sm group-hover:scale-105 group-hover:border-blue-300 transition-all duration-500">
                        {job.company ? job.company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'RA'}
                    </div>
                    <div className="bg-[#059669] text-white text-[11px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm">
                        <CheckCircle size={14} className="fill-white text-[#059669]" />
                        Human Verified
                    </div>
                </div>

                {/* CENTER: JOB INFO */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-extrabold text-[#111827] mb-4 group-hover:text-blue-700 transition-colors duration-300">
                        {job.company || 'Retell AI'}
                    </h3>

                    <div className="space-y-2 mb-6">
                        <div className="flex gap-4 text-sm">
                            <span className="w-24 font-bold text-gray-700">Job Role</span>
                            <span className="text-gray-500">:</span>
                            <span className="text-gray-600 font-medium truncate">{job.title || 'Senior Software Engineer, Infrastructure'}</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <span className="w-24 font-bold text-gray-700">Job Type</span>
                            <span className="text-gray-500">:</span>
                            <span className="text-gray-600 font-medium">{job.job_role_name || job.type || '.Net'}</span>
                        </div>
                        <div className="flex gap-4 text-sm">
                            <span className="w-24 font-bold text-gray-700">Date Posted</span>
                            <span className="text-gray-500">:</span>
                            <span className="text-gray-600 font-medium">{formatDate(job.upload_date || job.date_posted)}</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                        <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {job.location || 'Remote'}
                        </span>
                        <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {job.years_exp_required || '5-6 Years'}
                        </span>
                    </div>
                </div>

                {/* RIGHT: WAGE LEVEL & APPLY */}
                <div className="flex flex-col gap-4 sm:w-48 shrink-0">
                    {/* WAGE LEVEL BOX */}
                    <div className="bg-[#1e3a8a] rounded-2xl p-4 text-center text-white flex flex-col items-center justify-center shadow-md">
                        <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4].map((star) => (
                                <span key={star} className={star <= 3 ? "text-yellow-400" : "text-gray-400"}>
                                    ★
                                </span>
                            ))}
                        </div>
                        <div className="text-4xl font-black mb-1">Lv 3</div>
                        <div className="text-[10px] uppercase font-bold tracking-widest opacity-80">Wage Level</div>
                    </div>

                    {/* APPLY NOW */}
                    {!user || subscriptionExpired ? (
                        <button
                            disabled
                            className="w-full bg-gray-100 text-gray-400 px-6 py-3 rounded-xl cursor-not-allowed flex items-center justify-center gap-2 font-bold text-sm"
                        >
                            {subscriptionExpired ? 'Renew' : 'Apply'}
                            <ExternalLink size={16} />
                        </button>
                    ) : (
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-[#2563eb] hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-center font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-200 transition-all text-sm"
                        >
                            Apply Now
                            <ExternalLink size={16} />
                        </a>
                    )}
                </div>
            </div>

            {/* RESUME HELP BUTTON - Bottom Center of Card */}
            <div className="flex justify-center mt-6 pt-6 border-t border-gray-100">
                <button
                    onClick={handleResumeHelpClick}
                    className="relative overflow-hidden bg-[#7C3AED] text-white text-sm px-8 py-3.5 rounded-full font-bold shadow-[0_10px_25px_-10px_rgba(124,58,237,0.5)] hover:bg-[#6D28D9] transition-all duration-300 group flex items-center gap-2"
                >
                    <span className="absolute inset-0 overflow-hidden">
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></span>
                    </span>

                    <span className="relative flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Get Help with Resume
                        <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </span>
                </button>
            </div>

            {/* RESUME HELP MODAL (Remains as is) */}
            {showResumeModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative animate-fadeIn">
                        <button
                            onClick={() => setShowResumeModal(false)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Get Help with Your Resume</h3>
                            <p className="text-gray-500 text-sm">Fill in your details and we'll help you create the perfect resume</p>
                        </div>

                        <form onSubmit={handleResumeFormSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                                    <input
                                        type="text"
                                        value={resumeFormData.firstName}
                                        onChange={(e) => handleResumeFormChange('firstName', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-purple-500 focus:outline-none transition-all text-sm"
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                                    <input
                                        type="text"
                                        value={resumeFormData.lastName}
                                        onChange={(e) => handleResumeFormChange('lastName', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-purple-500 focus:outline-none transition-all text-sm"
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                                <input
                                    type="email"
                                    value={resumeFormData.email}
                                    onChange={(e) => handleResumeFormChange('email', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-purple-500 focus:outline-none transition-all text-sm"
                                    placeholder="john.doe@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Mobile Number</label>
                                <PhoneInput
                                    defaultCountry="us"
                                    value={resumeFormData.phone}
                                    onChange={(phone) => handleResumeFormChange('phone', phone)}
                                    inputStyle={{
                                        width: '100%',
                                        height: '46px',
                                        fontSize: '14px',
                                        border: 'none',
                                        backgroundColor: '#F9FAFB',
                                        borderRadius: '0.75rem',
                                        paddingLeft: '52px'
                                    }}
                                    className="phone-input-custom"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Country</label>
                                <input
                                    type="text"
                                    value={resumeFormData.country}
                                    onChange={(e) => handleResumeFormChange('country', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-purple-500 focus:outline-none transition-all text-sm"
                                    placeholder="United States"
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowResumeModal(false)}
                                    className="flex-1 py-4 text-gray-500 font-bold hover:text-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all"
                                >
                                    Submit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobCard;
