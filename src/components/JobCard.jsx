import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Clock,
    Briefcase,
    Bookmark,
    BookmarkCheck,
    CheckCircle,
    ArrowUpRight,
    Star,
    Globe
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import useAuth from '../hooks/useAuth';
import { getWageLevel } from '../dataSyncService';
import LogoBox from './LogoBox';

const JobCard = ({ job, isSaved = false, isApplied = false, onSaveToggle, onApplyToggle }) => {
    const [wageInfo, setWageInfo] = useState({ level: 'Lv 2', hourly: null, yearly: null, loading: true });
    const [filingCount, setFilingCount] = useState(job.lca_filings || null); // Use null for loading state
    const [saved, setSaved] = useState(isSaved);
    const [saving, setSaving] = useState(false);

    useEffect(() => setSaved(isSaved), [isSaved]);

    // Use pre-calculated wage level and filings if available from the database
    useEffect(() => {
        const fetchMissingData = async () => {
            const company = job.company || '';
            const occupation = job.title || '';
            const location = job.location || '';

            // 1. Handle Wage Level
            if (job.wage_level) {
                setWageInfo(prev => ({
                    ...prev,
                    level: job.wage_level.replace(/^Level\s+/i, 'Lv '),
                    yearly: (job.salary || '').replace(/[^0-9]/g, ''),
                    loading: false
                }));
            } else if (occupation) {
                try {
                    const results = await getWageLevel(occupation, location, job.salary);
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
            } else {
                setWageInfo(prev => ({ ...prev, loading: false }));
            }

            // 2. Handle LCA Filings (if not already enriched by parent)
            if (job.lca_filings === undefined && company) {
                try {
                    const normalize = (name) => {
                        if (!name) return '';
                        let n = name.toLowerCase()
                            .replace(/[\.,]/g, ' ')
                            .replace(/\b(inc|llc|corp|ltd|co|services|com|systems|technologies|group|holdings|usa|us|intl|international|solutions|aws|related|web|tech|software|management|financial|insurance|banking|health|healthcare|travel|company)\b/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
                        if (n.includes('amazon')) return 'amazon';
                        if (n.includes('google') || n.includes('alphabet')) return 'google';
                        if (n.includes('meta') || n.includes('facebook')) return 'meta';
                        if (n.includes('microsoft')) return 'microsoft';
                        if (n === 'apple' || n.startsWith('apple ')) return 'apple';
                        return n;
                    };

                    const norm = normalize(company);
                    const words = norm.split(' ').filter(Boolean);
                    const coreTerm = words.length > 0 ? words[0] : norm;

                    const { data } = await supabase
                        .from('h1b_sponsor_finder')
                        .select('Company, "LCA Filings"')
                        .ilike('Company', `%${coreTerm}%`)
                        .limit(10);

                    if (data && data.length > 0) {
                        // Matching logic
                        const parseCount = (val) => {
                            if (typeof val === 'number') return val;
                            if (!val) return 0;
                            return parseInt(String(val).replace(/,/g, '')) || 0;
                        };

                        const sorted = [...data].sort((a,b) => parseCount(b["LCA Filings"]) - parseCount(a["LCA Filings"]));
                        let bestCount = 0;
                        const nNorm = normalize(company);

                        for (const m of sorted) {
                            const mNorm = normalize(m.Company);
                            const nNormLower = nNorm.toLowerCase().trim();
                            const mNormLower = mNorm.toLowerCase().trim();
                            
                            // Aggressive matching
                            if (mNormLower === nNormLower || mNormLower.includes(nNormLower) || nNormLower.includes(mNormLower)) {
                                bestCount = parseCount(m["LCA Filings"]);
                                break;
                            }
                            
                            // fallback to words matching if first word matches
                            const mWords = mNormLower.split(' ');
                            const nWords = nNormLower.split(' ');
                            if (mWords[0] === nWords[0] && mWords[0].length > 3) {
                                bestCount = parseCount(m["LCA Filings"]);
                                // don't break, keep looking for better exact match
                            }
                        }
                        setFilingCount(bestCount);
                    } else {
                        setFilingCount(0);
                    }
                } catch (e) { 
                    setFilingCount(0);
                }
            } else if (job.lca_filings !== undefined) {
                setFilingCount(job.lca_filings);
            }
        };

        fetchMissingData();
    }, [job.title, job.location, job.role, job.company, job.lca_filings]);

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
                        {/* Row 1: Salary & Location First */}
                        <div className="flex flex-wrap items-center gap-4 mb-3">
                            {job.salary && (
                                <span style={{
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    color: '#24385E',
                                    background: '#f1f5f9',
                                    borderRadius: '10px',
                                    padding: '6px 14px',
                                    display: 'inline-flex',
                                    alignItems: 'center'
                                }}>
                                    {job.salary}
                                </span>
                            )}
                            <div className="flex items-center gap-1.5 text-[#64748b]">
                                <MapPin size={16} color="#cbd5e0" />
                                <span className="text-[14px] font-bold">{job.location || 'United States'}</span>
                            </div>
                        </div>

                        {/* Row 2: Job Title as Main Link */}
                        <h2 className="text-[24px] font-black leading-tight mb-1 truncate">
                            <a
                                href={job.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#111] hover:text-[#FDB913] transition-colors duration-200"
                                style={{ textDecoration: 'none' }}
                                onClick={e => { if (!job.url) e.preventDefault(); }}
                            >
                                {job.title}
                            </a>
                        </h2>

                        {/* Row 3: Company Name as Subtext */}
                        <div className="text-[16px] font-bold text-[#718096] mb-4 flex items-center gap-2">
                            {job.company || 'Company Name'}
                            {filingCount > 0 && (
                                <span className="flex items-center gap-1.5 text-[#24385E] bg-[#f1f5f9] px-2 py-0.5 rounded-md text-[11px] font-black">
                                    <Globe size={12} strokeWidth={3} />
                                    {filingCount.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* Row 4: Badges */}
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

                    <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                        {/* Wage Level Card */}
                        <div className="bg-[#1a2b4b] rounded-2xl py-4 p-5 flex flex-col items-center justify-center text-white flex-1 shadow-xl shadow-[#1a2b4b]/15 transition-all duration-300">
                            <div className="flex gap-1 mb-2">
                                {[1, 2, 3, 4].map((star) => {
                                    const level = parseInt(wageInfo.level?.match(/\d/)?.[0] || '2');
                                    return (
                                        <Star
                                            key={star}
                                            size={12}
                                            className={star <= level ? "fill-[#FDB913] text-[#FDB913]" : "text-[#3d4d6b]"}
                                            strokeWidth={2.5}
                                        />
                                    );
                                })}
                            </div>
                            <div className="text-3xl font-black italic leading-none mb-1">
                                {wageInfo.loading ? '...' : (wageInfo.level || 'Lv 2')}
                            </div>
                            <div className="text-[8px] font-black text-[#718096] uppercase tracking-[1.5px]">
                                WAGE LEVEL
                            </div>
                        </div>

                        {/* LCA Filings Card */}
                        {filingCount > 0 && (
                            <div className="bg-[#1a2b4b] rounded-2xl py-4 p-5 flex flex-col items-center justify-center text-white flex-1 shadow-xl shadow-[#1a2b4b]/15 transition-all duration-300">
                                <Globe size={16} className="text-[#718096] mb-2" strokeWidth={2.5} />
                                <div className="text-3xl font-black italic leading-none mb-1">
                                    {filingCount.toLocaleString()}
                                </div>
                                <div className="text-[8px] font-black text-[#718096] uppercase tracking-[1.5px]">
                                    LCA FILINGS
                                </div>
                            </div>
                        )}
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
