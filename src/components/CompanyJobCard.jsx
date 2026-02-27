import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Clock, ExternalLink, Star } from 'lucide-react';

const CompanyJobCard = ({ job, onSave, isSaved = false, isLandingPage = false }) => {
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
    const getInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??';
    const level = parseInt(job.wage_level?.match(/\d/)?.[0] || '2');
    const timeAgo = formatTimeAgo(job.date_posted || job.time);
    const isNew = timeAgo.includes('m ago') || timeAgo === 'Just now';

    const renderCTA = () => {
        const baseStyle = {
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            width: '100%', padding: '11px 8px',
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
                <Link
                    to="/signup"
                    style={baseStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    Sign Up to Apply <ExternalLink size={13} />
                </Link>
            );
        }

        return (
            <a
                href={job.url || job.apply_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
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
            padding: '20px 22px',
            marginBottom: '12px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
            transition: 'all 200ms ease',
            display: 'flex',
            gap: '16px',
            alignItems: 'stretch',
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
            <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                {/* Logo */}
                <div style={{
                    width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
                    background: '#f0f0f0', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '12px', fontWeight: 800, color: '#888', marginTop: '2px'
                }}>
                    {getInitials(job.company)}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Company + time */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '3px' }}>
                        <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>{job.company}</p>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: isNew ? '#22c55e' : '#aaa', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo}</span>
                    </div>

                    {/* Job title */}
                    <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111', margin: '0 0 5px', lineHeight: 1.3 }}>
                        {job.title || job.role || 'Job Position'}
                    </h3>

                    {/* Location */}
                    <p style={{ fontSize: '12px', color: '#aaa', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} />{job.location || 'United States'}
                    </p>

                    {/* Tag chips */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        {(job.role || job.functions?.[0]) && (
                            <span style={{ fontSize: '12px', color: '#555', border: '1px solid #e0e0e0', borderRadius: '7px', padding: '3px 10px' }}>{job.role || job.functions[0]}</span>
                        )}
                        {job.salary && (
                            <span style={{ fontSize: '12px', color: '#555', border: '1px solid #e0e0e0', borderRadius: '7px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <DollarSign size={10} />{job.salary}
                            </span>
                        )}
                        {(job.years_exp_required || job.commitment) && (
                            <span style={{ fontSize: '12px', color: '#555', border: '1px solid #e0e0e0', borderRadius: '7px', padding: '3px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Clock size={10} />{job.years_exp_required || job.commitment}
                            </span>
                        )}
                    </div>

                    {/* Human Verified badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{
                            fontSize: '12px', fontWeight: 700, color: '#16a34a',
                            background: '#f0fdf4', border: '1px solid #bbf7d0',
                            borderRadius: '8px', padding: '4px 12px',
                            display: 'flex', alignItems: 'center', gap: '5px',
                        }}>
                            ✓ Human Verified
                        </span>
                    </div>
                </div>
            </div>

            {/* ── RIGHT: Wage level card + Apply button ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', flexShrink: 0, width: '120px', justifyContent: 'center' }}>

                {/* Navy wage level badge */}
                <div style={{
                    background: '#24385E',
                    borderRadius: '14px',
                    padding: '16px 12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    width: '100%',
                }}>
                    {/* Stars */}
                    <div style={{ display: 'flex', gap: '2px', marginBottom: '4px' }}>
                        {[1, 2, 3, 4].map(i => (
                            <Star key={i} size={13}
                                fill={i <= level ? '#EAB308' : 'none'}
                                color={i <= level ? '#EAB308' : '#4a5e7a'}
                                strokeWidth={1.5}
                            />
                        ))}
                    </div>
                    {/* Level number */}
                    <span style={{ fontSize: '26px', fontWeight: 900, color: '#ffffff', lineHeight: 1, fontStyle: 'italic', letterSpacing: '-1px' }}>
                        Lv {level}
                    </span>
                    {/* Label */}
                    <span style={{ fontSize: '9px', fontWeight: 700, color: '#7a9bbf', letterSpacing: '1.5px', textTransform: 'uppercase', marginTop: '2px' }}>
                        WAGE LEVEL
                    </span>
                </div>

                {/* CTA Button */}
                {renderCTA()}
            </div>
        </div>
    );
};

export default CompanyJobCard;
