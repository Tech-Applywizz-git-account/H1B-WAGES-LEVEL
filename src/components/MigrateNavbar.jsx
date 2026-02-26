import React, { useState, useEffect } from 'react';
import { Menu, X, Globe, User, LogOut, LayoutDashboard } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const MigrateNavbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const navigate = useNavigate();
    const { user, role, loggingOut, signOut } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('#migrate-user-dropdown')) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        setShowDropdown(false);
        setIsOpen(false);
        await signOut();
        navigate('/', { replace: true });
    };

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 py-3' : 'bg-white py-5'}`}>
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo Area */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="relative">
                        <div className="w-10 h-10 bg-[#24385E] rounded-xl flex items-center justify-center transform rotate-12 transition-transform group-hover:rotate-0 shadow-lg">
                            <span className="text-white font-black text-xl italic tracking-tighter">W</span>
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-[#24385E] tracking-tight leading-none">Wage</span>
                        <span className="text-xl font-bold text-yellow-500 tracking-tight leading-none">Level</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {/* <Link to="#" className="text-[15px] font-semibold text-[#24385E] hover:text-yellow-600 transition-colors">Post a job</Link>
                    <Link to="#" className="text-[15px] font-semibold text-[#24385E] hover:text-yellow-600 transition-colors">Resources</Link> */}
                    <Link to="/pricing" className="text-[15px] font-semibold text-[#24385E] hover:text-yellow-600 transition-colors">Pricing</Link>

                    {user ? (
                        /* --- LOGGED IN: show user avatar + dropdown --- */
                        <div className="relative" id="migrate-user-dropdown">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#24385E]/10 hover:bg-[#24385E]/20 rounded-full transition-all"
                            >
                                <div className="w-7 h-7 bg-[#24385E] rounded-full flex items-center justify-center">
                                    <User size={14} className="text-white" />
                                </div>
                                <span className="text-[14px] font-bold text-[#24385E]">
                                    {user.email?.split('@')[0]}
                                </span>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 shadow-xl rounded-2xl py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Signed in as</p>
                                        <p className="text-sm font-bold text-[#24385E] truncate">{user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => { setShowDropdown(false); navigate('/dashboard'); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-[#24385E] transition-colors"
                                    >
                                        <LayoutDashboard size={16} className="text-yellow-500" />
                                        <span className="text-sm font-bold">{role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}</span>
                                    </button>
                                    <div className="mx-3 my-1 border-t border-gray-100"></div>
                                    <button
                                        onClick={handleLogout}
                                        disabled={loggingOut}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-500 transition-colors disabled:opacity-50"
                                    >
                                        {loggingOut ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                                <span className="text-sm font-bold">Logging out...</span>
                                            </>
                                        ) : (
                                            <>
                                                <LogOut size={16} />
                                                <span className="text-sm font-bold">Logout</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* --- LOGGED OUT: show Login + Get Access --- */
                        <>
                            <Link to="/login" className="text-[15px] font-semibold text-[#24385E] hover:text-yellow-600 transition-colors">Login</Link>
                            <Link to="/signup" className="px-6 py-2.5 bg-[#24385E] hover:bg-[#1a2a47] text-white font-bold text-[15px] rounded-full shadow-lg transition-all transform hover:scale-105 active:scale-95">
                                Get Access
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden p-2 text-[#1F2937]"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`fixed inset-0 bg-white z-[60] md:hidden transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-10">
                        <div className="flex items-center gap-2">
                            <Globe size={28} className="text-[#1F2937]" />
                            <span className="font-bold text-xl text-[#1F2937]">Wage Level</span>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="p-2"><X size={28} /></button>
                    </div>
                    <div className="flex flex-col gap-6 text-xl font-bold text-[#24385E]">
                        <Link to="#" onClick={() => setIsOpen(false)}>Post a job</Link>
                        <Link to="#" onClick={() => setIsOpen(false)}>Resources</Link>
                        <Link to="/pricing" onClick={() => setIsOpen(false)}>Pricing</Link>

                        {user ? (
                            /* --- Mobile Logged In --- */
                            <div className="flex flex-col gap-4 pt-4 border-t border-gray-100">
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest -mb-2">My Account</p>
                                <button
                                    onClick={() => { setIsOpen(false); navigate('/dashboard'); }}
                                    className="flex items-center gap-3 text-[#24385E]"
                                >
                                    <LayoutDashboard size={20} className="text-yellow-500" />
                                    {role === 'admin' ? 'Admin Dashboard' : 'My Dashboard'}
                                </button>
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="flex items-center gap-3 text-red-500 disabled:opacity-50"
                                >
                                    <LogOut size={20} />
                                    {loggingOut ? 'Logging out...' : 'Logout'}
                                </button>
                            </div>
                        ) : (
                            /* --- Mobile Logged Out --- */
                            <>
                                <Link to="/login" onClick={() => setIsOpen(false)}>Login</Link>
                                <Link to="/signup" onClick={() => setIsOpen(false)} className="w-full py-4 bg-[#24385E] text-white text-center rounded-2xl shadow-xl text-base">
                                    Get Access Now
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default MigrateNavbar;
