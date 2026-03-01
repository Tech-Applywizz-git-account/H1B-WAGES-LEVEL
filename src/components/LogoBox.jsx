import React, { useState, useEffect } from 'react';
import { getCompanyLogo } from '../utils/logoHelper';

/**
 * Super-Resilient LogoBox.
 * Optimized for a 100% clean console with zero network error logs.
 * Uses getCompanyLogo as the single source of truth for the best possible URL.
 * Falls back to initials silently if the primary logo fails to load.
 */
const LogoBox = ({ name, size = 40, fontSize = 12, className = "" }) => {
    const [error, setError] = useState(false);

    // Get the best possible logo URL from our resolver
    const logoUrl = getCompanyLogo(name);
    const initials = name ? name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : '??';

    // Reset error state when company name changes
    useEffect(() => {
        setError(false);
    }, [name]);

    const containerStyle = {
        width: size,
        height: size,
        borderRadius: size > 40 ? '16px' : '10px',
        overflow: 'hidden',
        border: '1.5px solid #f3f4f6',
        background: (error || !logoUrl) ? '#24385E' : '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.02)',
        transition: 'all 0.3s ease-out',
        position: 'relative'
    };

    return (
        <div style={containerStyle} className={className}>
            {(logoUrl && !error) ? (
                <img
                    key={name}
                    src={logoUrl}
                    alt={name || ""}
                    style={{
                        width: '85%',
                        height: '85%',
                        objectFit: 'contain',
                        opacity: 1,
                        filter: error ? 'blur(2px)' : 'none'
                    }}
                    onLoad={(e) => {
                        // Detect silent 1x1 fallback pixel and show initials instead
                        if (e.target.naturalWidth <= 1 && e.target.naturalHeight <= 1) {
                            setError(true);
                        }
                    }}
                    onError={() => setError(true)}
                />
            ) : (
                <span style={{ color: '#fff', fontWeight: 900, fontSize, letterSpacing: '-0.5px' }}>
                    {initials}
                </span>
            )}
        </div>
    );
};

export default LogoBox;
