import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import useAuth from '../hooks/useAuth';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { user, role, loggingOut, signOut } = useAuth();

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
        console.log("🚨 Logout button clicked in Navbar");

        // Close dropdowns first
        setShowDropdown(false);
        setIsMenuOpen(false);

        // Call the centralized signOut from AuthContext (handles all cleanup)
        await signOut();

        // Navigate to homepage
        navigate("/", { replace: true });
    };

    const handleDashboardClick = () => {
        setShowDropdown(false);
        setIsMenuOpen(false);
        navigate("/dashboard");
    };

    return (
        <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* -------- Desktop Layout -------- */}
                <div className="hidden md:flex justify-between items-center h-16 w-full">

                    {/* LEFT — Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center">
                            <span className="text-gray-900 font-bold text-xl">TW</span>
                        </div>
                        <span className="font-bold text-xl text-gray-900">Telugu Wala Links</span>
                    </Link>

                    {/* CENTER Nav */}
                    <div className="flex items-center gap-8">
                        <button
                            onClick={() => handleSectionClick('how-it-works')}
                            className="text-gray-600 font-medium hover:text-gray-900 transition-colors py-2"
                        >
                            How it works
                        </button>
                        <Link
                            to="/pricing"
                            className="text-gray-600 font-medium hover:text-gray-900 transition-colors py-2"
                        >
                            Pricing
                        </Link>
                        <button
                            onClick={() => handleSectionClick('faq')}
                            className="text-gray-600 font-medium hover:text-gray-900 transition-colors py-2"
                        >
                            FAQ
                        </button>
                    </div>

                    {/* RIGHT — Login / Profile */}
                    <div className="relative flex items-center gap-4">
                        {!user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/login"
                                    className="text-gray-600 font-medium hover:text-gray-900 transition-colors px-3 py-2"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold px-5 py-2 rounded-lg transition-colors"
                                >
                                    Get Access
                                </Link>
                            </div>
                        ) : (
                            <>
                                {/* Profile Icon */}
                                <button
                                    onClick={() => setShowDropdown(!showDropdown)}
                                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                >
                                    <User size={20} className="text-gray-700" />
                                </button>

                                {/* Dropdown */}
                                {showDropdown && (
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 shadow-lg rounded-lg py-2">
                                        <button
                                            onClick={handleDashboardClick}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-gray-700"
                                        >
                                            <LayoutDashboard size={18} className="text-gray-500" />
                                            <span className="font-medium">{role === "admin" ? "Admin Dashboard" : "My Dashboard"}</span>
                                        </button>

                                        <div className="mx-3 my-1 border-t border-gray-100"></div>

                                        <button
                                            onClick={handleLogout}
                                            disabled={loggingOut}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loggingOut ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="font-medium">Logging out...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <LogOut size={18} />
                                                    <span className="font-medium">Logout</span>
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
                <div className="md:hidden flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-amber-400 rounded-lg flex items-center justify-center">
                            <span className="text-gray-900 font-bold text-lg">TW</span>
                        </div>
                        <span className="font-bold text-lg text-gray-900">Telugu Wala Links</span>
                    </Link>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {isMenuOpen ? <X size={24} className="text-gray-700" /> : <Menu size={24} className="text-gray-700" />}
                    </button>
                </div>
            </div>

            {/* -------- Mobile Dropdown -------- */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-200 px-4 py-4 space-y-3">
                    <button
                        onClick={() => handleSectionClick('how-it-works')}
                        className="block w-full text-left text-gray-600 font-medium hover:text-gray-900 py-2"
                    >
                        How it works
                    </button>

                    <Link
                        to="/pricing"
                        className="block text-gray-600 font-medium hover:text-gray-900 py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        Pricing
                    </Link>

                    <button
                        onClick={() => handleSectionClick('faq')}
                        className="block w-full text-left text-gray-600 font-medium hover:text-gray-900 py-2"
                    >
                        FAQ
                    </button>

                    <div className="border-t border-gray-200 pt-3 mt-3">
                        {user ? (
                            <>
                                <button
                                    onClick={handleDashboardClick}
                                    className="w-full flex items-center gap-3 py-2 text-gray-700 font-medium hover:text-gray-900"
                                >
                                    <LayoutDashboard size={18} className="text-gray-500" />
                                    {role === "admin" ? "Admin Dashboard" : "Dashboard"}
                                </button>

                                <button
                                    onClick={handleLogout}
                                    disabled={loggingOut}
                                    className="w-full flex items-center gap-3 py-2 text-red-600 font-medium hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loggingOut ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                            Logging out...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut size={18} />
                                            Logout
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <div className="flex flex-col gap-3">
                                <Link
                                    to="/login"
                                    className="block text-center py-2 text-gray-700 font-medium hover:text-gray-900"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="block text-center bg-amber-400 hover:bg-amber-500 text-gray-900 font-semibold py-2.5 rounded-lg"
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
