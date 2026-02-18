import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showResourcesMenu, setShowResourcesMenu] = useState(false);
    const resourcesRef = useRef(null);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, role, loggingOut, signOut } = useAuth();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (resourcesRef.current && !resourcesRef.current.contains(e.target)) {
                setShowResourcesMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSectionClick = (sectionId) => {
        if (location.pathname !== '/') {
            navigate('/');
            setTimeout(() => {
                document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMenuOpen(false);
    };

    const handleLogout = async () => {
        setShowDropdown(false);
        setIsMenuOpen(false);
        await signOut();
        navigate("/", { replace: true });
    };

    const handleDashboardClick = () => {
        setShowDropdown(false);
        setIsMenuOpen(false);
        navigate("/dashboard");
    };

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* -------- Desktop Layout -------- */}
                <div className="hidden md:flex justify-between items-center h-16 w-full">

                    {/* LEFT — Logo */}
                    <Link to="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="flex items-center gap-1.5">
                            <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                                <span className="text-white font-bold text-sm">H</span>
                            </div>
                            <span className="font-bold text-lg text-gray-900 tracking-tight">H1B Wage Level</span>
                        </div>
                    </Link>

                    {/* CENTER Nav */}
                    <div className="flex items-center gap-1">
                        <Link
                            to="/post-a-job"
                            className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                            Post a job
                        </Link>

                        {/* Resources Dropdown */}
                        <div className="relative" ref={resourcesRef}>
                            <button
                                onClick={() => setShowResourcesMenu(!showResourcesMenu)}
                                className="flex items-center gap-1 text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
                            >
                                Resources
                                <ChevronDown size={14} className={`transition-transform ${showResourcesMenu ? 'rotate-180' : ''}`} />
                            </button>
                            {showResourcesMenu && (
                                <div className="absolute left-0 top-full mt-1 w-72 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50">
                                    <div className="px-4 py-2">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">About Us</p>
                                        <a href="#" className="block text-sm text-gray-700 hover:text-gray-900 py-1 hover:underline">About Us</a>
                                        <a href="#" className="block text-sm text-gray-700 hover:text-gray-900 py-1 hover:underline">Is H1B Wage Level Legit?</a>
                                        <a href="#" className="block text-sm text-gray-700 hover:text-gray-900 py-1 hover:underline">How to Use H1B Wage Level</a>
                                    </div>
                                    <div className="border-t border-gray-100 mx-2 my-1"></div>
                                    <div className="px-4 py-2">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Application & Career Strategy</p>
                                        <a href="#" className="block text-sm text-gray-700 hover:text-gray-900 py-1 hover:underline">Visa Sponsorship Jobs in New York City</a>
                                        <a href="#" className="block text-sm text-gray-700 hover:text-gray-900 py-1 hover:underline">H-1B Visa Sponsorship Jobs in 2026</a>
                                        <a href="#" className="block text-sm text-gray-700 hover:text-gray-900 py-1 hover:underline">E-3 Visa: Complete Guide for Australians</a>
                                    </div>
                                    <div className="border-t border-gray-100 mx-2 my-1"></div>
                                    <div className="px-4 py-2">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Policy Updates</p>
                                        <a href="#" className="block text-sm text-gray-700 hover:text-gray-900 py-1 hover:underline">Trump's $100,000 H-1B visa fee</a>
                                        <a href="#" className="block text-sm text-gray-700 hover:text-gray-900 py-1 hover:underline">H-1B Visa Lottery 2026</a>
                                        <a href="#" className="block text-sm text-gray-700 hover:text-gray-900 py-1 hover:underline">Work Authorization for International Students</a>
                                    </div>
                                </div>
                            )}
                        </div>

                        <Link
                            to="/pricing"
                            className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors px-3 py-2 rounded-md hover:bg-gray-50"
                        >
                            Pricing
                        </Link>
                    </div>

                    {/* RIGHT — Login / Profile */}
                    <div className="relative flex items-center gap-3">
                        {!user ? (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="text-gray-600 text-sm font-medium hover:text-gray-900 transition-colors px-3 py-2"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-black hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                                >
                                    Get Access
                                </Link>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <User size={18} className="text-gray-700" />
                                </button>

                                {showDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-xl py-2">
                                        <button
                                            onClick={handleDashboardClick}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                                        >
                                            <LayoutDashboard size={16} className="text-gray-500" />
                                            <span className="text-sm font-medium">{role === "admin" ? "Admin Dashboard" : "My Dashboard"}</span>
                                        </button>
                                        <div className="mx-3 my-1 border-t border-gray-100"></div>
                                        <button
                                            onClick={handleLogout}
                                            disabled={loggingOut}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 disabled:opacity-50"
                                        >
                                            {loggingOut ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-sm font-medium">Logging out...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <LogOut size={16} />
                                                    <span className="text-sm font-medium">Logout</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* -------- Mobile Layout -------- */}
                <div className="md:hidden flex justify-between items-center h-14">
                    <Link to="/" className="flex items-center gap-1.5">
                        <div className="w-7 h-7 bg-black rounded-md flex items-center justify-center">
                            <span className="text-white font-bold text-xs">H</span>
                        </div>
                        <span className="font-bold text-base text-gray-900">H1B Wage Level</span>
                    </Link>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isMenuOpen ? <X size={22} className="text-gray-700" /> : <Menu size={22} className="text-gray-700" />}
                    </button>
                </div>
            </div>

            {/* -------- Mobile Dropdown -------- */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-1">
                    <a href="#" className="block text-sm text-gray-700 font-medium hover:text-gray-900 py-2.5 border-b border-gray-50">Post a job</a>
                    <a href="#" className="block text-sm text-gray-700 font-medium hover:text-gray-900 py-2.5 border-b border-gray-50">Resources</a>
                    <Link
                        to="/pricing"
                        className="block text-sm text-gray-700 font-medium hover:text-gray-900 py-2.5 border-b border-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Pricing
                    </Link>

                    <div className="pt-3 mt-2">
                        {user ? (
                            <>
                                <button
                                    onClick={handleDashboardClick}
                                    className="w-full flex items-center gap-3 py-2.5 text-gray-700 font-medium hover:text-gray-900"
                                >
                                    <LayoutDashboard size={16} className="text-gray-500" />
                                    <span className="text-sm">{role === "admin" ? "Admin Dashboard" : "Dashboard"}</span>
                                </button>
                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="w-full flex items-center gap-3 py-2.5 text-red-600 font-medium hover:text-red-700 disabled:opacity-50"
                                >
                                    <LogOut size={16} />
                                    <span className="text-sm">{loggingOut ? 'Logging out...' : 'Logout'}</span>
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <Link
                                    to="/login"
                                    className="block text-center py-2.5 text-sm text-gray-700 font-medium hover:text-gray-900 border border-gray-200 rounded-lg"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="block text-center bg-black hover:bg-gray-800 text-white text-sm font-semibold py-2.5 rounded-lg"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Get Access
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
