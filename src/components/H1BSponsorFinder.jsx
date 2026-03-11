import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    Search, ChevronDown, ChevronUp, Globe, Users, Briefcase,
    BarChart3, Loader2, MapPin, DollarSign, Award, ArrowUpRight
} from 'lucide-react';

const H1BSponsorFinder = ({ isMobile }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('company');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [stats, setStats] = useState({
        uniqueCompanies: 0,
        totalLcaFilings: 0,
        workerPositions: 0,
        h1bSponsors: 0
    });

    const [workState, setWorkState] = useState('All States');
    const [minSponsorships, setMinSponsorships] = useState(1);
    const [sortBy, setSortBy] = useState('filings');

    const [expandedRows, setExpandedRows] = useState(new Set());
    const [expandedRoles, setExpandedRoles] = useState(new Map());
    const [roleData, setRoleData] = useState({});

    // Refined Palette: Blue + Yellow (Wage Trail Theme)
    const COLORS = {
        primary: '#24385E',
        secondary: '#EAB308',
        background: '#f1f3f6',
        white: '#ffffff',
        textMain: '#1e293b',
        textMuted: '#64748b',
        border: '#e2e8f0'
    };

    useEffect(() => {
        fetchSponsorData();
    }, [searchTerm, searchType, workState, minSponsorships, sortBy]);

    const fetchSponsorData = async () => {
        setLoading(true);
        try {
            let query = supabase.from('h1b_sponsor_finder').select('*');

            if (searchTerm) {
                if (searchType === 'company') {
                    query = query.ilike('Company', `%${searchTerm}%`);
                } else {
                    query = query.ilike('Common Job Titles', `%${searchTerm}%`);
                }
            }

            if (workState !== 'All States') {
                query = query.eq('HQ State', workState);
            }

            if (minSponsorships > 1) {
                query = query.gte('LCA Filings', minSponsorships);
            }

            if (sortBy === 'filings') query = query.order('LCA Filings', { ascending: false });
            else if (sortBy === 'salary') query = query.order('Avg Salary', { ascending: false });
            else if (sortBy === 'workers') query = query.order('Worker Positions', { ascending: false });

            const { data: results, error } = await query.limit(100);
            if (error) throw error;
            setData(results || []);

            const { data: dbStats, error: statsError } = await supabase.rpc('get_h1b_stats');
            if (!statsError && dbStats) {
                setStats({
                    uniqueCompanies: dbStats.unique_companies || 0,
                    totalLcaFilings: dbStats.total_filings || 0,
                    workerPositions: dbStats.worker_positions || 0,
                    h1bSponsors: dbStats.h1b_sponsors || 0
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleCompany = async (row) => {
        const next = new Set(expandedRows);
        if (next.has(row.id)) {
            next.delete(row.id);
        } else {
            next.add(row.id);
            if (!roleData[row.Company]) {
                await fetchRolesForCompany(row.Company);
            }
        }
        setExpandedRows(next);
    };

    const fetchRolesForCompany = async (companyName) => {
        try {
            const { data: filings } = await supabase
                .from('h1b_sponsor_finder')
                .select('*')
                .eq('Company', companyName);

            const grouped = filings.reduce((acc, f) => {
                const title = f["Job Title"] || "Other";
                if (!acc[title]) acc[title] = { title, count: 0, avgPay: 0, items: [], states: new Set() };
                acc[title].count += f["LCA Filings"] || 1;
                acc[title].avgPay += (f.Salary || f["Avg Salary"] || 0);
                acc[title].items.push(f);
                if (f.State) acc[title].states.add(f.State);
                return acc;
            }, {});

            Object.values(grouped).forEach(g => g.avgPay = g.avgPay / (g.items.length || 1));
            setRoleData(prev => ({ ...prev, [companyName]: Object.values(grouped) }));
        } catch (err) {
            console.error("Error fetching role details:", err);
        }
    };

    const toggleRole = (company, roleTitle) => {
        setExpandedRoles(prev => {
            const next = new Map(prev);
            const roles = next.get(company) || new Set();
            if (roles.has(roleTitle)) roles.delete(roleTitle);
            else roles.add(roleTitle);
            next.set(company, roles);
            return next;
        });
    };

    const formatCurrency = (val) => {
        if (!val) return '$0';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: COLORS.background, height: '100%', overflow: 'hidden' }}>

            {/* ═══════════════ HEADER ═══════════════ */}
            <div style={{ padding: '20px 24px', background: COLORS.white, borderBottom: `1.5px solid ${COLORS.border}`, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        padding: '10px',
                        background: `linear-gradient(135deg, ${COLORS.primary} 0%, #3d5a8c 100%)`,
                        borderRadius: '12px',
                        boxShadow: '0 4px 12px rgba(36, 56, 94, 0.2)'
                    }}>
                        <Globe size={22} color="#fff" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '22px', fontWeight: 900, color: COLORS.primary, margin: 0, letterSpacing: '-0.5px' }}>H-1B Visa Sponsor Finder</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff', background: COLORS.secondary, padding: '1px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>OFFICIAL DATA</span>
                            <p style={{ fontSize: '12px', color: COLORS.textMuted, margin: 0, fontWeight: 600 }}>
                                Real-time Labor Condition Application (LCA) Database
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════ STATS CARDS (COMPACT) ═══════════════ */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                gap: '16px',
                padding: '20px 24px'
            }}>
                {[
                    { label: 'Sponsors', value: stats.uniqueCompanies.toLocaleString(), icon: Globe, color: '#3b82f6' },
                    { label: 'Total Filings', value: stats.totalLcaFilings.toLocaleString(), icon: Briefcase, color: '#f59e0b' },
                    { label: 'Positions', value: stats.workerPositions.toLocaleString(), icon: Users, color: '#10b981' },
                    { label: 'H-1B Verified', value: stats.h1bSponsors.toLocaleString(), icon: BarChart3, color: '#6366f1' },
                ].map((s, i) => (
                    <div key={i} style={{
                        background: COLORS.white,
                        padding: '16px 20px',
                        borderRadius: '16px',
                        border: `1.5px solid ${COLORS.border}`,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                        transition: 'transform 0.2s ease'
                    }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{
                                width: '36px', height: '36px',
                                background: `${s.color}15`,
                                borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <s.icon size={18} color={s.color} strokeWidth={2.5} />
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>GLOBAL</div>
                        </div>
                        <div>
                            <p style={{ fontSize: '11px', color: COLORS.textMuted, fontWeight: 700, margin: '4px 0 0' }}>{s.label}</p>
                            <p style={{ fontSize: '18px', fontWeight: 900, color: COLORS.primary, margin: 0 }}>{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '0 24px 24px' }}>

                {/* ═══════════════ SIDEBAR FILTERS (REDUCED SIZE) ═══════════════ */}
                {!isMobile && (
                    <div style={{ width: '230px', marginRight: '24px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ background: COLORS.white, padding: '24px', borderRadius: '20px', border: `1.5px solid ${COLORS.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                            <div style={{ fontSize: '12px', fontWeight: 900, color: COLORS.primary, textTransform: 'uppercase', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '3px', height: '14px', background: COLORS.secondary, borderRadius: '2px' }} />
                                Filters
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 800, color: COLORS.textMain, display: 'block', marginBottom: '10px' }}>HQ State</label>
                                    <div style={{ position: 'relative' }}>
                                        <select
                                            value={workState} onChange={e => setWorkState(e.target.value)}
                                            style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `2px solid ${COLORS.border}`, fontSize: '13px', outline: 'none', cursor: 'pointer', fontWeight: 700, color: COLORS.primary, appearance: 'none', background: 'white' }}
                                        >
                                            <option>All States</option><option>CA</option><option>NY</option><option>TX</option><option>WA</option>
                                        </select>
                                        <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} color={COLORS.textMuted} />
                                    </div>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                        <label style={{ fontSize: '13px', fontWeight: 800, color: COLORS.textMain }}>Min Filings</label>
                                        <span style={{ fontSize: '11px', fontWeight: 900, color: COLORS.primary, background: '#fef3c7', padding: '2px 8px', borderRadius: '6px' }}>{minSponsorships}+</span>
                                    </div>
                                    <input type="range" min="1" max="500" value={minSponsorships} onChange={e => setMinSponsorships(parseInt(e.target.value))} style={{ width: '100%', accentColor: COLORS.secondary, cursor: 'pointer' }} />
                                </div>

                                <div>
                                    <label style={{ fontSize: '13px', fontWeight: 800, color: COLORS.textMain, display: 'block', marginBottom: '12px' }}>Sort Precision</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                        {[
                                            { id: 'filings', label: 'By Total Filings', icon: Briefcase },
                                            { id: 'salary', label: 'By Avg Salary', icon: DollarSign },
                                            { id: 'workers', label: 'By Positions', icon: Users }
                                        ].map(s => (
                                            <button
                                                key={s.id}
                                                onClick={() => setSortBy(s.id)}
                                                style={{
                                                    textAlign: 'left', padding: '12px 14px', borderRadius: '10px', fontSize: '12px', border: 'none', cursor: 'pointer',
                                                    background: sortBy === s.id ? COLORS.primary : '#f8fafc',
                                                    color: sortBy === s.id ? COLORS.white : COLORS.textMain,
                                                    fontWeight: 700, transition: '0.2s',
                                                    display: 'flex', alignItems: 'center', gap: '10px'
                                                }}
                                            >
                                                <s.icon size={14} />
                                                {s.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ═══════════════ MAIN TABLE CONTAINER ═══════════════ */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: COLORS.white, borderRadius: '24px', border: `1.5px solid ${COLORS.border}`, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>

                    {/* Compact Tabs */}
                    <div style={{ borderBottom: `1.5px solid ${COLORS.border}`, padding: '0 24px', background: '#fafbfc' }}>
                        <div style={{ display: 'flex', gap: '32px' }}>
                            {['company', 'role'].map(tab => (
                                <button key={tab} onClick={() => setSearchType(tab)} style={{ padding: '20px 4px', fontSize: '13px', fontWeight: 900, border: 'none', borderBottom: searchType === tab ? `3px solid ${COLORS.secondary}` : '3px solid transparent', color: searchType === tab ? COLORS.primary : COLORS.textMuted, background: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    {tab === 'company' ? 'Sponsor Directory' : 'Job Roles Analysis'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Search Field */}
                    <div style={{ padding: '20px 24px', borderBottom: `1px solid ${COLORS.border}`, background: 'white' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} color={COLORS.textMuted} />
                            <input type="text" placeholder={`Global Search ${searchType === 'company' ? 'among 18,192 verified sponsors...' : 'across 5,000+ occupation roles...'}`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '14px 20px 14px 48px', borderRadius: '14px', border: `2px solid ${COLORS.border}`, fontSize: '15px', outline: 'none', color: COLORS.primary, fontWeight: 600, transition: 'border-color 0.2s', background: '#fcfcfc' }} onFocus={e => e.target.style.borderColor = COLORS.primary} onBlur={e => e.target.style.borderColor = COLORS.border} />
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                                <tr style={{ borderBottom: `1.5px solid ${COLORS.border}` }}>
                                    <th style={{ padding: '14px 24px', textAlign: 'left', fontWeight: 900, color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Organization / Sponsor</th>
                                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 900, color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LCAs</th>
                                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 900, color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Positions</th>
                                    <th style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 900, color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>HQ</th>
                                    <th style={{ padding: '14px 10px', textAlign: 'center', fontWeight: 900, color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>States</th>
                                    <th style={{ padding: '14px 10px', textAlign: 'left', fontWeight: 900, color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Primary Job Titles</th>
                                    <th style={{ padding: '14px 10px', textAlign: 'right', fontWeight: 900, color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Pay</th>
                                    <th style={{ padding: '14px 24px', textAlign: 'right', fontWeight: 900, color: COLORS.textMuted, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Median Pay</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="8" style={{ padding: '60px', textAlign: 'center' }}><Loader2 size={32} className="animate-spin mx-auto" color={COLORS.secondary} /></td></tr>
                                ) : data.length > 0 ? data.map(row => (
                                    <React.Fragment key={row.id}>
                                        <tr onClick={() => toggleCompany(row)} style={{ borderBottom: `1.5px solid #f1f5f9`, cursor: 'pointer', background: expandedRows.has(row.id) ? 'rgba(234,179,8,0.04)' : COLORS.white, transition: 'background 0.2s' }}>
                                            <td style={{ padding: '16px 24px', fontWeight: 800, color: COLORS.primary, fontSize: '13px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    {expandedRows.has(row.id) ? <ChevronUp size={14} color={COLORS.secondary} strokeWidth={3} /> : <ChevronDown size={14} color="#cbd5e1" strokeWidth={3} />}
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                        <span>{row.Company}</span>
                                                        <div style={{ display: 'flex', gap: '4px' }}>
                                                            {row["LCA Filings"] > 1000 && <span style={{ fontSize: '9px', background: '#ecfdf5', color: '#059669', padding: '1px 5px', borderRadius: '4px', fontWeight: 900 }}>TOP SPONSOR</span>}
                                                            {row["Avg Salary"] > 150000 && <span style={{ fontSize: '9px', background: '#fef2f2', color: '#dc2626', padding: '1px 5px', borderRadius: '4px', fontWeight: 900 }}>HIGH WAGE</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 10px', textAlign: 'right', color: COLORS.primary, fontWeight: 900, fontSize: '13px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                                                    {row["LCA Filings"]?.toLocaleString()}
                                                    <div style={{ fontSize: '9px', fontWeight: 800, color: COLORS.textMuted, textTransform: 'uppercase' }}>LCAs</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 10px', textAlign: 'right', color: COLORS.textMain, fontWeight: 700, fontSize: '13px' }}>{row["Worker Positions"]?.toLocaleString() || 0}</td>
                                            <td style={{ padding: '16px 10px', textAlign: 'center' }}>
                                                <span style={{ border: `1.5px solid ${COLORS.primary}`, color: COLORS.primary, padding: '3px 7px', borderRadius: '8px', fontSize: '10px', fontWeight: 900, background: '#f8fafc' }}>{row["HQ State"] || 'US'}</span>
                                            </td>
                                            <td style={{ padding: '16px 10px', textAlign: 'center', color: COLORS.textMuted, fontWeight: 700, fontSize: '13px' }}>{row["# States"] || 1}</td>
                                            <td style={{ padding: '16px 10px', textAlign: 'left', color: COLORS.textMain, fontSize: '12px', fontWeight: 600, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row["Common Job Titles"]}</td>
                                            <td style={{ padding: '16px 10px', textAlign: 'right', fontWeight: 800, color: COLORS.primary, fontSize: '13px' }}>{formatCurrency(row["Avg Salary"])}</td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right', fontWeight: 800, color: COLORS.primary, fontSize: '13px' }}>{formatCurrency(row["Median Salary"])}</td>
                                        </tr>

                                        {expandedRows.has(row.id) && roleData[row.Company] && (
                                            roleData[row.Company].map((role, idx) => (
                                                <React.Fragment key={idx}>
                                                    <tr onClick={(e) => { e.stopPropagation(); toggleRole(row.Company, role.title); }} style={{ background: '#f8fafc', cursor: 'pointer', borderBottom: `1.5px solid ${COLORS.border}` }}>
                                                        <td colSpan="3" style={{ padding: '12px 24px 12px 58px', color: COLORS.primary, fontWeight: 800, fontSize: '14px' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                {expandedRoles.get(row.Company)?.has(role.title) ? <ChevronUp size={14} color={COLORS.secondary} strokeWidth={3} /> : <ChevronDown size={14} color="#cbd5e1" strokeWidth={2.5} />}
                                                                {role.title}
                                                            </div>
                                                        </td>
                                                        <td style={{ padding: '12px 12px', textAlign: 'center' }}>
                                                            <span style={{ fontSize: '10px', fontWeight: 800, color: COLORS.textMuted, background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px' }}>{role.count} FILINGS</span>
                                                        </td>
                                                        <td colSpan="4" style={{ padding: '12px 24px', textAlign: 'right', color: COLORS.primary, fontWeight: 900, fontSize: '14px' }}>
                                                            <span style={{ fontSize: '11px', color: COLORS.textMuted, fontWeight: 700, marginRight: '8px' }}>AVG PAY</span>
                                                            {formatCurrency(role.avgPay)}
                                                        </td>
                                                    </tr>

                                                    {expandedRoles.get(row.Company)?.has(role.title) && role.items.map((item, iIdx) => (
                                                        <tr key={iIdx} style={{ background: COLORS.white, borderBottom: `1px dotted ${COLORS.border}` }}>
                                                            <td colSpan="3" style={{ padding: '10px 24px 10px 92px', color: COLORS.textMuted, fontSize: '13px', fontWeight: 700 }}>
                                                                <span style={{ marginRight: '8px' }}>📍</span>
                                                                {item.City || 'Unknown'}, <strong style={{ color: COLORS.primary }}>{item.State || '??'}</strong>
                                                            </td>
                                                            <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                                                <span style={{ fontSize: '10px', fontWeight: 800, color: '#4338ca', background: '#e0e7ff', padding: '2px 8px', borderRadius: '6px' }}>{item["Visa Type"] || 'H-1B'}</span>
                                                            </td>
                                                            <td colSpan="4" style={{ padding: '10px 24px', textAlign: 'right', color: '#059669', fontWeight: 900, fontSize: '13px' }}>
                                                                <span style={{ fontSize: '11px', color: COLORS.textMuted, fontWeight: 700, marginRight: '8px' }}>SPECIFIC SALARY</span>
                                                                {formatCurrency(item.Salary)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            ))
                                        )}
                                    </React.Fragment>
                                )) : (
                                    <tr><td colSpan="8" style={{ padding: '60px', textAlign: 'center', color: COLORS.textMuted, fontWeight: 700 }}>No sponsor records found for "{searchTerm}".</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default H1BSponsorFinder;
