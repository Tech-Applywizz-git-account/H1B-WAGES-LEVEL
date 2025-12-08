import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';
import { User, Mail, MapPin, Briefcase, Phone, Linkedin, Github, Globe, Save, Loader2, CheckCircle } from 'lucide-react';

const ProfileTab = () => {
    const { user, role } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Profile form data
    const [profileData, setProfileData] = useState({
        full_name: '',
        phone: '',
        location: '',
        job_title: '',
        years_of_experience: '',
        skills: '',
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        bio: '',
    });

    // Fetch profile data
    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                setProfileData({
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    location: data.location || '',
                    job_title: data.job_title || '',
                    years_of_experience: data.years_of_experience || '',
                    skills: data.skills || '',
                    linkedin_url: data.linkedin_url || '',
                    github_url: data.github_url || '',
                    portfolio_url: data.portfolio_url || '',
                    bio: data.bio || '',
                });
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profileData.full_name,
                    phone: profileData.phone,
                    location: profileData.location,
                    job_title: profileData.job_title,
                    years_of_experience: profileData.years_of_experience,
                    skills: profileData.skills,
                    linkedin_url: profileData.linkedin_url,
                    github_url: profileData.github_url,
                    portfolio_url: profileData.portfolio_url,
                    bio: profileData.bio,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (error) throw error;

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            console.log('✅ Profile updated successfully');
        } catch (err) {
            console.error('❌ Error updating profile:', err);
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-yellow-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <User className="w-8 h-8 text-yellow-500" />
                    Profile Settings
                </h2>
                <p className="text-gray-600 mt-1">
                    Manage your personal information and job preferences
                </p>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-green-800 font-medium">Profile updated successfully!</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Account Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-gray-600" />
                        Account Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                readOnly
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                            />
                        </div>

                        {/* Account Role (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Account Role
                            </label>
                            <input
                                type="text"
                                value={role === 'admin' ? 'Administrator' : 'Standard User'}
                                readOnly
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                            />
                        </div>
                    </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-gray-600" />
                        Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={profileData.full_name}
                                onChange={handleChange}
                                placeholder="John Doe"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={profileData.phone}
                                onChange={handleChange}
                                placeholder="+1 (555) 123-4567"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            />
                        </div>

                        {/* Location */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Location
                            </label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    name="location"
                                    value={profileData.location}
                                    onChange={handleChange}
                                    placeholder="San Francisco, CA"
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Information */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-gray-600" />
                        Professional Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Current Job Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Job Title
                            </label>
                            <input
                                type="text"
                                name="job_title"
                                value={profileData.job_title}
                                onChange={handleChange}
                                placeholder="Senior Software Engineer"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            />
                        </div>

                        {/* Years of Experience */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Years of Experience
                            </label>
                            <select
                                name="years_of_experience"
                                value={profileData.years_of_experience}
                                onChange={handleChange}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            >
                                <option value="">Select...</option>
                                <option value="0-1">0-1 years</option>
                                <option value="1-3">1-3 years</option>
                                <option value="3-5">3-5 years</option>
                                <option value="5-7">5-7 years</option>
                                <option value="7-10">7-10 years</option>
                                <option value="10+">10+ years</option>
                            </select>
                        </div>

                        {/* Skills */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Skills (comma separated)
                            </label>
                            <input
                                type="text"
                                name="skills"
                                value={profileData.skills}
                                onChange={handleChange}
                                placeholder="React, Node.js, Python, AWS, Docker"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">Enter your skills separated by commas</p>
                        </div>

                        {/* Bio */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Professional Bio
                            </label>
                            <textarea
                                name="bio"
                                value={profileData.bio}
                                onChange={handleChange}
                                rows="4"
                                placeholder="Tell us about your experience, achievements, and career goals..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-gray-600" />
                        Social & Portfolio Links
                    </h3>

                    <div className="space-y-4">
                        {/* LinkedIn */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                LinkedIn Profile
                            </label>
                            <div className="relative">
                                <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="url"
                                    name="linkedin_url"
                                    value={profileData.linkedin_url}
                                    onChange={handleChange}
                                    placeholder="https://linkedin.com/in/yourprofile"
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* GitHub */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                GitHub Profile
                            </label>
                            <div className="relative">
                                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="url"
                                    name="github_url"
                                    value={profileData.github_url}
                                    onChange={handleChange}
                                    placeholder="https://github.com/yourusername"
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Portfolio */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Portfolio Website
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="url"
                                    name="portfolio_url"
                                    value={profileData.portfolio_url}
                                    onChange={handleChange}
                                    placeholder="https://yourportfolio.com"
                                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <button
                        type="button"
                        onClick={fetchProfile}
                        className="px-6 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfileTab;
