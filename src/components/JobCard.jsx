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
    Circle
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';

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
                        {job.country && (
                            <span className="flex items-center gap-1">
                                <Globe className="w-4 h-4" />
                                {job.country}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(job.upload_date || job.date_posted)}
                        </span>
                    </div>

                    <p className="text-gray-600 text-sm line-clamp-2">
                        {job.description}
                    </p>
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
        </div>
    );
};

export default JobCard;
