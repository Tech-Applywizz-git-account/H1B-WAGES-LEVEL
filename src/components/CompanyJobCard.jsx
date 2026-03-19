import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Clock, ExternalLink, Star, Globe } from 'lucide-react';
import LogoBox from './LogoBox';
import useAuth from '../hooks/useAuth';

const CompanyJobCard = ({ job, onSave, isSaved = false, isLandingPage = false, isMobile }) => {
    const { user } = useAuth();
    const [filingCount, setFilingCount] = useState(job.lca_filings || 0);
    const formatTimeAgo = (dateStr) => {
        if (!dateStr) return 'Recently';
        try {
            const d = new Date(dateStr), now = new Date();
            const h = Math.floor((now - d) / 36e5), days = Math.floor((now - d) / 864e5);
            if (h < 1) return 'Just now';
            if (h < 24) return `New ${h}m ago`;
            if (days < 7) return `${days}d ago`;
            return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch { return dateStr; }
    };

    const level = job.wage_level ? parseInt(job.wage_level.match(/\d/)?.[0]) : null;
    const timeAgo = formatTimeAgo(job.date_posted || job.time);
    const isNew = timeAgo.includes('m ago') || timeAgo === 'Just now';

    // Fetch missing fillings if needed
    React.useEffect(() => {
        if (job.lca_filings === undefined && job.company) {
            const fetchFilings = async () => {
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
                    if (n.includes('apple')) return 'apple';
                    return n;
                };

                const norm = normalize(job.company);
                const words = norm.split(' ').filter(Boolean);
                const coreTerm = words.length > 0 ? words[0] : norm;

                try {
                    const { data } = await supabase
                        .from('h1b_sponsor_finder')
                        .select('Company, "LCA Filings"')
                        .ilike('Company', `%${coreTerm}%`)
                        .limit(10);

                    if (data && data.length > 0) {
                        const parseCount = (v) => typeof v === 'number' ? v : parseInt(String(v).replace(/,/g, '')) || 0;
                        const sorted = [...data].sort((a,b) => parseCount(b["LCA Filings"]) - parseCount(a["LCA Filings"]));
                        let best = 0;
                        const nNorm = normalize(job.company);

                        for (const m of sorted) {
                            const mNorm = normalize(m.Company);
                            if (mNorm === nNorm || mNorm.includes(nNorm) || nNorm.includes(mNorm)) {
                                best = parseCount(m["LCA Filings"]);
                                break;
                            }
                        }
                        if (best > 0) setFilingCount(best);
                    }
                } catch (e) { /* ignore */ }
            };
            fetchFilings();
        }
    }, [job.company, job.lca_filings]);

    const renderCTA = () => {
        const baseStyle = {
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            width: '100%', padding: isMobile ? '10px 8px' : '11px 8px',
            background: '#EAB308', color: '#1a1a1a',
            borderRadius: '12px', fontSize: '13px', fontWeight: 800,
            textDecoration: 'none', border: 'none', cursor: 'pointer',
            transition: 'all 180ms ease',
            boxShadow: '0 2px 8px rgba(234,179,8,0.35)',
            whiteSpace: 'nowrap',
        };

        const handleMouseEnter = e => {
            e.currentTarget.style.background = '#ca9f00';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(234,179,8,0.45)';
        };
        const handleMouseLeave = e => {
            e.currentTarget.style.background = '#EAB308';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(234,179,8,0.35)';
        };

        if (isLandingPage) {
            return (
                <Link to={user ? "/pricing" : "/signup"} style={baseStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    {user ? "Get Access to Apply" : "Get Access to Apply"} <ExternalLink size={13} />
                </Link>
            );
        }

        if (job.isTeaser) {
            return (
                <Link to="/pricing" style={baseStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                    Get Access to Apply <ExternalLink size={13} />
                </Link>
            );
        }

        return (
            <a
                href={job.url || job.apply_url || '#'}
                target="_blank" rel="noopener noreferrer"
                style={baseStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={e => { if (!job.url && !job.apply_url) e.preventDefault(); }}
            >
                Apply Now <ExternalLink size={13} />
            </a>
        );
    };

    return (
        <div style={{
            background: '#fff',
            borderRadius: '16px',
            border: '1.5px solid #ebebeb',
            padding: isMobile ? '16px' : '20px 22px',
            marginBottom: '12px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'all 200ms ease',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : '16px',
            alignItems: isMobile ? 'flex-start' : 'stretch',
        }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = '#d8d8d8';
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = '#ebebeb';
            }}
        >
            {/* ── LEFT: Job info ── */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: '12px', alignItems: 'flex-start', width: '100%' }}>
                <LogoBox name={job.company} size={isMobile ? 32 : 38} fontSize={11} />

                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Row 1: Salary & Location First */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        {job.salary && (
                            <span style={{
                                fontSize: '11px',
                                fontWeight: 700,
                                color: '#24385E',
                                background: '#f1f5f9',
                                borderRadius: '6px',
                                padding: '3px 8px'
                            }}>
                                {job.salary}
                            </span>
                        )}
                        <span style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
                            <MapPin size={12} /> {job.location || 'United States'}
                        </span>
                    </div>

                    {/* Row 2: Job Title as Main Link */}
                    <h3 style={{ fontSize: isMobile ? '16px' : '17px', fontWeight: 800, margin: '0 0 2px', lineHeight: 1.3 }}>
                        {job.isTeaser ? (
                            <Link
                                to="/pricing"
                                style={{
                                    color: '#111',
                                    textDecoration: 'none',
                                    transition: 'color 150ms ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#EAB308'}
                                onMouseLeave={e => e.currentTarget.style.color = '#111'}
                            >
                                {job.title}
                            </Link>
                        ) : (
                            <a
                                href={job.url || job.apply_url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: '#111',
                                    textDecoration: 'none',
                                    transition: 'color 150ms ease'
                                }}
                                onMouseEnter={e => e.currentTarget.style.color = '#EAB308'}
                                onMouseLeave={e => e.currentTarget.style.color = '#111'}
                                onClick={e => { if (!job.url && !job.apply_url) e.preventDefault(); }}
                            >
                                {job.title}
                            </a>
                        )}
                    </h3>

                    {/* Row 3: Company Name as Subtext */}
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#718096', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {job.company}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {job.isVerified && (
                            <span style={{
                                fontSize: '9px', fontWeight: 800, color: '#16a34a',
                                background: '#f0fdf4', border: '1px solid #bbf7d0',
                                borderRadius: '6px', padding: '3px 8px',
                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                textTransform: 'uppercase', letterSpacing: '0.5px'
                            }}>
                                Human Verified <svg width="12" height="12" viewBox="0 0 100 100"><path d="M50 4 L57 16 L70 10 L70 24 L84 24 L78 37 L91 44 L81 55 L88 68 L74 69 L70 83 L57 78 L50 90 L43 78 L30 83 L26 69 L12 68 L19 55 L9 44 L22 37 L16 24 L30 24 L30 10 L43 16 Z" fill="#22c55e" /><polyline points="33,52 44,63 68,38" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Wage level / Apply ── */}
            <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'row' : 'column',
                alignItems: isMobile ? 'center' : 'center',
                gap: '10px',
                flexShrink: 0,
                width: isMobile ? '100%' : '200px',
                justifyContent: 'space-between',
                paddingTop: isMobile ? '8px' : '0',
                borderTop: isMobile ? '1px solid #f1f5f9' : 'none'
            }}>
                <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                    {/* Wage Level Card */}
                    <div style={{
                        background: '#24385E',
                        borderRadius: '12px',
                        padding: isMobile ? '10px 10px' : '11px 10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '2px',
                        flex: 1,
                        minWidth: 0
                    }}>
                        <div style={{ display: 'flex', gap: '2px', marginBottom: '1px' }}>
                            {[1, 2, 3, 4].map(i => (
                                <Star key={i} size={isMobile ? 8 : 10}
                                    fill={i <= level ? '#FDB913' : 'none'}
                                    color={i <= level ? '#FDB913' : '#4a5e7a'}
                                    strokeWidth={1.5}
                                />
                            ))}
                        </div>
                        <span style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 900, color: '#ffffff', lineHeight: 1, fontStyle: 'italic' }}>
                            {level ? `Lv ${level}` : 'Lv 1'}
                        </span>
                        <span style={{ fontSize: '7px', fontWeight: 700, color: '#7a9bbf', textTransform: 'uppercase', marginTop: '1px', letterSpacing: '1px' }}>WAGE LEVEL</span>
                    </div>
                </div>

                <div style={{ flex: 1 }}>
                    {renderCTA()}
                </div>
            </div>
        </div>
    );
};

export default CompanyJobCard;
