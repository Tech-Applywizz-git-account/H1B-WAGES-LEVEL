import React from 'react';
import LogoBox from './LogoBox';

const CompanyCard = ({ company, jobCount, wageLevel, industries, isSelected, onClick, isMobile, isVerified }) => {
    const level = parseInt(wageLevel?.match(/\d/)?.[0] || '2');

    const cardStyle = {
        display: 'block',
        width: '100%',
        background: '#ffffff',
        borderRadius: '20px',
        padding: isMobile ? '14px 16px' : '20px 22px',
        marginBottom: '10px',
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <LogoBox name={company} size={isMobile ? 36 : 44} fontSize={isMobile ? 12 : 14} className={isSelected ? 'bg-navy-select' : ''} />

                    <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <p style={{ fontSize: isMobile ? '15px' : '17px', fontWeight: 700, color: '#111', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {company}
                            </p>
                            {isVerified && (
                                <svg width="14" height="14" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
                                    <path d="M50 4 L57 16 L70 10 L70 24 L84 24 L78 37 L91 44 L81 55 L88 68 L74 69 L70 83 L57 78 L50 90 L43 78 L30 83 L26 69 L12 68 L19 55 L9 44 L22 37 L16 24 L30 24 L30 10 L43 16 Z" fill="#22c55e" />
                                    <polyline points="33,52 44,63 68,38" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            )}
                        </div>
                        {!isMobile && (
                            <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>
                                Visa inquiries: <span style={{ color: '#24385E', fontWeight: 500 }}>{company?.toLowerCase().replace(/\s+/g, '')}@careers.com</span>
                            </p>
                        )}
                    </div>
                </div>
                <span style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: 700, color: '#24385E', whiteSpace: 'nowrap', flexShrink: 0, marginTop: '2px' }}>
                    {jobCount?.toLocaleString()} jobs
                </span>
            </div>

            {/* Row 2: Industry chips */}
            {industries && industries.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '10px' }}>
                    {industries.slice(0, isMobile ? 2 : 3).map((ind, i) => (
                        <span key={i} style={{
                            fontSize: '11px', color: '#555', border: '1px solid #e0e0e0',
                            borderRadius: '8px', padding: '3px 10px', background: '#fff',
                        }}>{ind}</span>
                    ))}
                </div>
            )}

            {/* Row 4: Wage badges */}
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {['Lv 1', 'Lv 2', 'Lv 3', 'Lv 4'].map((lbl, i) => (
                    <span key={lbl} style={{
                        fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px',
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
