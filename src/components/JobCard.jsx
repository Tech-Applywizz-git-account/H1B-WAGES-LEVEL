import React, { useState } from 'react';
import { MapPin, Clock, Briefcase, ExternalLink, Building2, Bookmark, BookmarkCheck, Globe } from 'lucide-react';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';

const JobCard = ({ job, isSaved = false, onSaveToggle }) => {
    const { user } = useAuth();
    const [saved, setSaved] = useState(isSaved);
    const [saving, setSaving] = useState(false);

    const formatDate = (dateString) => {
        if (!dateString) return 'Recently';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 30) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const handleSaveToggle = async (e) => {
        e.preventDefault();
        if (!user) {
            alert('Please log in to save jobs');
            return;
        }

        setSaving(true);
        try {
            if (saved) {
                const { error } = await supabase
                    .from('saved_jobs')
                    .delete()
                    .eq('user_id', user.id)
                    .eq('job_id', job.job_id);
                if (error) throw error;
                setSaved(false);
            } else {
                const { error } = await supabase
                    .from('saved_jobs')
                    .insert([{ user_id: user.id, job_id: job.job_id, job_data: job }]);

                if (error && error.code !== '23505') throw error;
                setSaved(true);
            }
            if (onSaveToggle) onSaveToggle(job.job_id, !saved);
        } catch (error) {
            console.error('Error toggling save:', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all duration-300 p-6 group">
            <div className="flex flex-col sm:flex-row gap-5">

                {/* Left Content Area (Flexible) */}
                <div className="flex-1 min-w-0">
                    {/* Header: Title & Company */}
                    <div className="mb-3">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-yellow-600 transition-colors leading-tight mb-1">
                            {job.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 font-medium">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span>{job.company}</span>
                        </div>
                    </div>

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[200px]">{job.location || 'Remote'}</span>
                        </div>

                        {job.years_exp_required && (
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="w-4 h-4 text-gray-400" />
                                <span>{job.years_exp_required}</span>
                            </div>
                        )}

                        {job.country && (
                            <div className="flex items-center gap-1.5">
                                <Globe className="w-4 h-4 text-gray-400" />
                                <span>{job.country}</span>
                            </div>
                        )}

                        <div className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>{formatDate(job.upload_date || job.date_posted)}</span>
                        </div>
                    </div>

                    {/* Badges & Description */}
                    <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                            {/* Job Role Badge */}
                            {job.job_role_name && (
                                <span className="inline-block px-3 py-1 bg-yellow-50 text-yellow-800 text-xs font-semibold rounded-full border border-yellow-200">
                                    {job.job_role_name}
                                </span>
                            )}
                            {/* Source Badge */}
                            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                                {job.source}
                            </span>
                        </div>

                        {/* Description Preview */}
                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                            {job.description}
                        </p>
                    </div>
                </div>

                {/* Right Actions Area (Fixed Width on Desktop) */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:border-l sm:border-gray-100 sm:pl-5 sm:min-w-[140px]">
                    {/* Apply Button */}
                    <a
                        href={job.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-gray-900 font-semibold px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm flex items-center justify-center gap-2 group/btn"
                    >
                        Apply Now
                        <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                    </a>

                    {/* Save Button */}
                    <button
                        onClick={handleSaveToggle}
                        disabled={saving}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border font-medium text-sm transition-all ${saved
                                ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                            }`}
                    >
                        {saving ? (
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : saved ? (
                            <>
                                <BookmarkCheck className="w-4 h-4" />
                                Saved
                            </>
                        ) : (
                            <>
                                <Bookmark className="w-4 h-4" />
                                Save
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default JobCard;
