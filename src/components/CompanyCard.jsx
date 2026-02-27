import React from 'react';

const CompanyCard = ({ company, jobCount, wageLevel, industries, isSelected, onClick }) => {
    const getInitials = (name) => {
        if (!name) return '??';
        return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    };
    const level = parseInt(wageLevel?.match(/\d/)?.[0] || '2');

    const cardStyle = {
        display: 'block',
        width: '100%',
        background: '#ffffff',
        borderRadius: '20px',
        padding: '22px 24px',
        marginBottom: '14px',
        border: isSelected ? '1.5px solid rgba(36,56,94,0.25)' : '1.5px solid #ebebeb',
        boxShadow: isSelected
            ? '0 4px 24px rgba(36,56,94,0.12)'
            : '0 1px 4px rgba(0,0,0,0.05)',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        position: 'relative',
        textAlign: 'left',
        fontFamily: 'inherit',
    };

    return (
        <button style={cardStyle} onClick={onClick}
            onMouseEnter={e => {
                if (!isSelected) {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.10)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }
            }}
            onMouseLeave={e => {
                if (!isSelected) {
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }
            }}
        >
            {/* Row 1: Logo + Name + Job count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                    {/* Logo */}
                    <div style={{
                        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                        background: isSelected ? '#24385E' : '#f0f0f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 800, color: isSelected ? '#fff' : '#888',
                    }}>
                        {getInitials(company)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '17px', fontWeight: 700, color: '#111', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {company}
                        </p>
                        <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>
                            Visa inquiries: <span style={{ color: '#24385E', fontWeight: 500 }}>{company?.toLowerCase().replace(/\s+/g, '')}@careers.com</span>
                        </p>
                    </div>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#24385E', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '2px' }}>
                    {jobCount?.toLocaleString()} jobs
                </span>
            </div>

            {/* Row 2: Industry chips */}
            {industries && industries.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                    {industries.slice(0, 3).map((ind, i) => (
                        <span key={i} style={{
                            fontSize: '12px', color: '#555', border: '1px solid #e0e0e0',
                            borderRadius: '8px', padding: '4px 12px', background: '#fff',
                        }}>{ind}</span>
                    ))}
                    {industries.length > 3 && (
                        <span style={{ fontSize: '12px', color: '#aaa', border: '1px solid #e8e8e8', borderRadius: '8px', padding: '4px 10px', background: '#fff' }}>
                            +{industries.length - 3}
                        </span>
                    )}
                </div>
            )}

            {/* Row 3: Sponsored count */}
            <p style={{ fontSize: '12px', color: '#999', margin: '0 0 12px' }}>
                {jobCount?.toLocaleString()}+ total visas sponsored in the last 12 months
            </p>

            {/* Row 4: Wage badges */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['Lv 1', 'Lv 2', 'Lv 3', 'Lv 4'].map((lbl, i) => (
                    <span key={lbl} style={{
                        fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '7px',
                        background: i + 1 <= level ? '#24385E' : '#fff',
                        color: i + 1 <= level ? '#fff' : '#ccc',
                        border: i + 1 <= level ? '1px solid #24385E' : '1px solid #e0e0e0',
                    }}>{lbl}</span>
                ))}
            </div>
        </button>
    );
};

export default CompanyCard;
