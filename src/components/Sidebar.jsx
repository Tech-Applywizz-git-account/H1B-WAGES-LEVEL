// import React, { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import {
//     Briefcase,
//     Heart,
//     User,
//     Settings,
//     CreditCard,
//     Search,
//     Shield,
//     List,
// } from "lucide-react";
// import useAuth from '../hooks/useAuth';

// const Sidebar = ({ className = "", showHeader = true }) => {
//     const { role, user, signOut } = useAuth();
//     const navigate = useNavigate();
//     const location = useLocation();

//     // Determine active tab based on path and state
//     const getActiveTab = () => {
//         if (location.pathname === '/') return 'alljobs';
//         if (location.state?.initialTab) return location.state.initialTab;
//         return 'overview';
//     };

//     const [activeTab, setActiveTab] = useState(getActiveTab());

//     const isAdmin = role === "admin";

//     const tabs = [
//         { id: "overview", label: "Overview", icon: Search },
//         { id: "alljobs", label: "All Jobs", icon: List },
//         { id: "saved", label: "Saved Jobs", icon: Heart },
//         { id: "applied", label: "Applied Jobs", icon: Briefcase },
//         { id: "profile", label: "Profile", icon: User },
//         { id: "settings", label: "Settings", icon: Settings },
//         { id: "billing", label: "Billing", icon: CreditCard },
//         ...(isAdmin ? [{ id: "admin", label: "Admin Controls", icon: Shield }] : []),
//     ];

//     const handleTabClick = (tabId) => {
//         setActiveTab(tabId);
//         if (tabId === 'alljobs') {
//             navigate('/');
//         } else {
//             // Navigate to dashboard with specific tab
//             navigate('/dashboard', { state: { initialTab: tabId } });
//         }
//     };

//     return (
//         <aside className={`w-64 bg-white border-r border-gray-200 p-6 overflow-y-auto ${className}`}>
//             {showHeader && (
//                 <div className="mb-8">
//                     <h2 className="text-lg font-semibold text-gray-700 mb-2">
//                         H1B Wage Level
//                     </h2>
//                     <div className="text-sm text-gray-500 flex items-center gap-2">
//                         <div
//                             className={`w-2 h-2 rounded-full ${isAdmin ? "bg-red-500" : "bg-green-500"}`}
//                         ></div>
//                         <span>{isAdmin ? "Admin" : "User"} Account</span>
//                     </div>
//                 </div>
//             )}

//             <nav className="space-y-2">
//                 {tabs.map((tab) => {
//                     const isActive = activeTab === tab.id;
//                     return (
//                         <button
//                             key={tab.id}
//                             onClick={() => handleTabClick(tab.id)}
//                             className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all 
//                 ${isActive
//                                     ? "bg-yellow-300 text-gray-900 font-semibold shadow-sm"
//                                     : "text-gray-600 hover:bg-gray-100"
//                                 }`}
//                         >
//                             <tab.icon size={20} />
//                             {tab.label}
//                         </button>
//                     );
//                 })}

//                 {/* Logout Button */}
//                 <button
//                     onClick={async () => {
//                         localStorage.removeItem('userRole');
//                         localStorage.removeItem('userId');
//                         await signOut();
//                         navigate('/login');
//                     }}
//                     className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all mt-8"
//                 >
//                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
//                     </svg>
//                     Logout
//                 </button>
//             </nav>
//         </aside>
//     );
// };

// export default Sidebar;



// components/Sidebar.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Briefcase, Heart, User, Settings, CreditCard, Search, Shield, List,
} from "lucide-react";
import useAuth from '../hooks/useAuth';

const Sidebar = ({ className = "", showHeader = true }) => {
    const { role, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Determine active tab based on path and state
    const getActiveTab = () => {
        const path = location.pathname;
        if (path === '/' || path === '/jobs' || path === '/search') return 'alljobs';
        if (location.state?.initialTab) return location.state.initialTab;
        return 'overview';
    };

    // Determine active tab based on path and state
    const [activeTab, setActiveTab] = useState(() => getActiveTab());

    // Update active tab when location changes
    useEffect(() => {
        setActiveTab(getActiveTab());
    }, [location]);

    // Get admin status from multiple reliable sources
    const getAdminStatus = () => {
        // Check in order of reliability
        if (role === "admin") return true;

        // Check localStorage as fallback
        const storedRole = localStorage.getItem("userRole");
        if (storedRole === "admin") return true;

        // Check URL parameters as last resort
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('role') === 'admin') return true;

        return false;
    };

    const isAdmin = getAdminStatus();

    // Define tabs with admin tab conditionally
    const baseTabs = [
        { id: "overview", label: "Overview", icon: Search },
        { id: "alljobs", label: "All Jobs", icon: List },
        { id: "saved", label: "Saved Jobs", icon: Heart },
        { id: "applied", label: "Applied Jobs", icon: Briefcase },
        { id: "profile", label: "Profile", icon: User },
        // { id: "settings", label: "Settings", icon: Settings },
        { id: "billing", label: "Billing", icon: CreditCard },
    ];

    const adminTab = { id: "admin", label: "Admin Controls", icon: Shield };
    const tabs = isAdmin ? [...baseTabs, adminTab] : baseTabs;

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        if (tabId === 'alljobs') {
            navigate('/jobs');
        } else {
            navigate('/dashboard', {
                state: {
                    initialTab: tabId,
                    preserveRole: true // Pass flag to preserve role
                }
            });
        }
    };

    if (!mounted) {
        return null; // or a loading skeleton
    }

    return (
        <aside className={`w-64 bg-white border-r border-gray-200 p-6 overflow-y-auto ${className}`}>
            {showHeader && (
                <div className="mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">
                        H1B Wage Level
                    </h2>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isAdmin ? "bg-red-500" : "bg-green-500"}`}></div>
                        <span>{isAdmin ? "Admin" : "User"} Account</span>
                        <span className="text-xs text-gray-400 ml-2">
                            {role || localStorage.getItem('userRole') || 'unknown'}
                        </span>
                    </div>
                </div>
            )}

            <nav className="space-y-2">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all 
                                ${isActive
                                    ? "bg-yellow-300 text-gray-900 font-semibold shadow-sm"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            <Icon size={20} />
                            {tab.label}
                        </button>
                    );
                })}

                {/* Logout Button */}
                <button
                    onClick={async () => {
                        // Clear all possible role storages
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('userId');
                        sessionStorage.removeItem('userRole');
                        await signOut();
                        navigate('/login');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all mt-8"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                    </svg>
                    Logout
                </button>
            </nav>
        </aside>
    );
};

export default React.memo(Sidebar); // Memoize to prevent unnecessary re-renders