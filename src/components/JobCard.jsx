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
        <div className="bg-white rounded-lg border border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 p-6 group">
            <div className="flex flex-col sm:flex-row gap-5">

                {/* LEFT CONTENT */}
                <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-yellow-600 mb-1">
                        {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 mb-3">
                        <Building2 className="w-4 h-4 text-gray-400" />
                        {job.company}
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mb-4">
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location || 'Remote'}
                        </span>
                        {job.years_exp_required && (
                            <span className="flex items-center gap-1">
                                <Briefcase className="w-4 h-4" />
                                {job.years_exp_required}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(job.upload_date || job.date_posted)}
                        </span>
                    </div>
                </div>

                {/* RIGHT ACTIONS */}
                <div className="flex sm:flex-col gap-3 sm:min-w-[150px]">

                    {/* APPLY NOW */}
                    {!user || subscriptionExpired ? (
                        <button
                            disabled
                            className="w-full bg-gray-100 text-gray-400 px-4 py-2.5 rounded-lg cursor-not-allowed flex justify-center gap-2"
                        >
                            {subscriptionExpired ? 'Renew to Apply' : 'Login to Apply'}
                            <ExternalLink className="w-4 h-4 opacity-50" />
                        </button>
                    ) : (
                        <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-yellow-400 hover:bg-yellow-500 px-4 py-2.5 rounded-lg text-center font-semibold flex justify-center gap-2"
                        >
                            Apply Now
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}

                    {/* MARK APPLIED */}
                    <button
                        onClick={handleApplyToggle}
                        disabled={applying}
                        className={`w-full px-4 py-2.5 rounded-lg border flex justify-center gap-2 ${applied ? 'bg-blue-50 text-blue-700' : 'bg-white text-gray-600'
                            }`}
                    >
                        {applied ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        {applied ? 'Applied' : 'Mark Applied'}
                    </button>

                    {/* SAVE */}
                    <button
                        onClick={handleSaveToggle}
                        disabled={saving}
                        className={`w-full px-4 py-2.5 rounded-lg border flex justify-center gap-2 ${saved ? 'bg-green-50 text-green-700' : 'bg-white text-gray-600'
                            }`}
                    >
                        {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        {saved ? 'Saved' : 'Save'}
                    </button>

                </div>
            </div>

            {/* RESUME HELP BUTTON - Bottom Center of Card */}
            <div className="flex justify-center mt-4 pt-4 border-t border-gray-100">
                <button
                    onClick={handleResumeHelpClick}
                    className="relative overflow-hidden bg-[#7C3AED] text-white text-sm px-6 py-3 rounded-full font-medium shadow-[0_8px_20px_-12px_rgba(124,58,237,0.6)] hover:bg-[#6D28D9] transition-all duration-200 group flex items-center gap-2"
                >
                    {/* Shimmer effect layer */}
                    <span className="absolute inset-0 overflow-hidden">
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></span>
                    </span>

                    {/* Content layer */}
                    <span className="relative flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Get Help with Resume
                        <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                    </span>
                </button>
            </div>

            {/* RESUME HELP MODAL */}
            {showResumeModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-fadeIn">
                        {/* Close button */}
                        <button
                            onClick={() => setShowResumeModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Modal Header */}
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Get Help with Your Resume</h3>
                            <p className="text-gray-600 text-sm">Fill in your details and we'll help you create the perfect resume</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleResumeFormSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={resumeFormData.firstName}
                                        onChange={(e) => handleResumeFormChange('firstName', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={resumeFormData.lastName}
                                        onChange={(e) => handleResumeFormChange('lastName', e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={resumeFormData.email}
                                    onChange={(e) => handleResumeFormChange('email', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="john.doe@example.com"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mobile Number <span className="text-red-500">*</span>
                                </label>
                                <PhoneInput
                                    defaultCountry="us"
                                    value={resumeFormData.phone}
                                    onChange={(phone) => handleResumeFormChange('phone', phone)}
                                    style={{
                                        width: '100%'
                                    }}
                                    inputStyle={{
                                        width: '100%',
                                        height: '42px',
                                        fontSize: '14px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '0.5rem',
                                        paddingLeft: '52px'
                                    }}
                                    countrySelectorStyleProps={{
                                        buttonStyle: {
                                            border: '1px solid #d1d5db',
                                            borderRadius: '0.5rem 0 0 0.5rem',
                                            padding: '0 8px',
                                            height: '42px'
                                        }
                                    }}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Country <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={resumeFormData.country}
                                    onChange={(e) => handleResumeFormChange('country', e.target.value)}
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="United States"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowResumeModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
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
