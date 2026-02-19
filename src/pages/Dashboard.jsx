// import React, { useState } from 'react';
// import Navbar from '../components/Navbar';
// import Footer from '../components/Footer';
// import { Briefcase, Heart, User, Settings, CreditCard, Search, Shield } from 'lucide-react';
// import AdminControls from '../components/AdminControls';
// import useAuth from "../hooks/useAuth";

// const Dashboard = () => {
//     const [activeTab, setActiveTab] = useState('search');
//     const { role } = useAuth();

//     // Mock role for now (remove when Supabase auth is linked)
//     const isAdmin = role === "admin"; 

//     const tabs = [
//         { id: 'search', label: 'Search Jobs', icon: Search },
//         { id: 'saved', label: 'Saved Jobs', icon: Heart },
//         { id: 'applied', label: 'Applied Jobs', icon: Briefcase },
//         { id: 'profile', label: 'Profile', icon: User },
//         { id: 'settings', label: 'Settings', icon: Settings },
//         { id: 'billing', label: 'Billing', icon: CreditCard },
//         ...(isAdmin ? [{ id: 'admin', label: 'Admin Controls', icon: Shield }] : [])
//     ];

//     return (
//         <div>
//             <Navbar />

//             <div className="min-h-screen bg-gray-50">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                     <div className="grid md:grid-cols-4 gap-8">

//                         {/* Sidebar */}
//                         <div className="md:col-span-1">
//                             <div className="card">
//                                 <nav className="space-y-2">
//                                     {tabs.map((tab) => (
//                                         <button
//                                             key={tab.id}
//                                             onClick={() => setActiveTab(tab.id)}
//                                             className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition ${
//                                                 activeTab === tab.id
//                                                     ? 'bg-primary-yellow text-primary-dark font-semibold'
//                                                     : 'text-gray-700 hover:bg-gray-100'
//                                             }`}
//                                         >
//                                             <tab.icon size={20} />
//                                             <span>{tab.label}</span>
//                                         </button>
//                                     ))}
//                                 </nav>
//                             </div>
//                         </div>

//                         {/* Main Content */}
//                         <div className="md:col-span-3">

//                             {/* Search Tab */}
//                             {activeTab === 'search' && (
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-primary-dark mb-6">Search Jobs</h2>
//                                     <div className="card">
//                                         <p className="text-gray-600 mb-4">
//                                             Use the search bar at the top to find your next opportunity!
//                                         </p>
//                                         <a href="/jobs" className="inline-block btn-primary">
//                                             Start Job Search
//                                         </a>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Saved Tab */}
//                             {activeTab === 'saved' && (
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-primary-dark mb-6">Saved Jobs</h2>
//                                     <div className="card">
//                                         <div className="text-center py-12">
//                                             <Heart size={48} className="mx-auto text-gray-300 mb-4" />
//                                             <p className="text-gray-600">No saved jobs yet</p>
//                                             <p className="text-sm text-gray-500 mt-2">
//                                                 Start browsing and save jobs you're interested in
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Applied Tab */}
//                             {activeTab === 'applied' && (
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-primary-dark mb-6">Applied Jobs</h2>
//                                     <div className="card">
//                                         <div className="text-center py-12">
//                                             <Briefcase size={48} className="mx-auto text-gray-300 mb-4" />
//                                             <p className="text-gray-600">No applications yet</p>
//                                             <p className="text-sm text-gray-500 mt-2">
//                                                 Your job applications will appear here
//                                             </p>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Profile Tab */}
//                             {activeTab === 'profile' && (
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-primary-dark mb-6">Profile</h2>
//                                     <div className="card">
//                                         <form className="space-y-6">
//                                             <div className="grid md:grid-cols-2 gap-4">
//                                                 <div>
//                                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                                         First Name
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         placeholder="John"
//                                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
//                                                     />
//                                                 </div>
//                                                 <div>
//                                                     <label className="block text-sm font-medium text-gray-700 mb-2">
//                                                         Last Name
//                                                     </label>
//                                                     <input
//                                                         type="text"
//                                                         placeholder="Doe"
//                                                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-yellow"
//                                                     />
//                                                 </div>
//                                             </div>
//                                         </form>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Settings Tab */}
//                             {activeTab === 'settings' && (
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-primary-dark mb-6">Settings</h2>
//                                     <div className="card">
//                                         <p className="text-gray-600">Settings will go here</p>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Billing Tab */}
//                             {activeTab === 'billing' && (
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-primary-dark mb-6">Billing</h2>
//                                     <div className="card">
//                                         <p className="text-gray-600">Billing info will appear soon</p>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* 🛡️ Admin Controls Tab */}
//                             {activeTab === "admin" && isAdmin && (
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-primary-dark mb-6">Admin Controls</h2>
//                                     <AdminControls />
//                                 </div>
//                             )}

//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <Footer />
//         </div>
//     );
// };

// export default Dashboard;















// //src/pages/Dashboard.jsx
// import React, { useState } from "react";
// import Navbar from "../components/Navbar";
// import Footer from "../components/Footer";
// import {
//   Briefcase,
//   Heart,
//   User,
//   Settings,
//   CreditCard,
//   Search,
//   Shield,
// } from "lucide-react";
// import AdminControls from "../components/AdminControls";
// import useAuth from "../hooks/useAuth";

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState("overview");
//   const { role, loading, user } = useAuth();

//   const isAdmin = role === "admin";

//   // DEBUG: Log role to console
//   console.log("🔍 Dashboard - Current role:", role, "| isAdmin:", isAdmin, "| user:", user?.email);

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
//       </div>
//     );
//   }

//   const tabs = [
//     { id: "overview", label: "Overview", icon: Search },
//     { id: "saved", label: "Saved Jobs", icon: Heart },
//     { id: "applied", label: "Applied Jobs", icon: Briefcase },
//     { id: "profile", label: "Profile", icon: User },
//     { id: "settings", label: "Settings", icon: Settings },
//     { id: "billing", label: "Billing", icon: CreditCard },
//     ...(isAdmin ? [{ id: "admin", label: "Admin Controls", icon: Shield }] : []),
//   ];

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50">
//       <Navbar />

//       {/* DEBUG: Show current role */}
//       <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-center">
//         <p className="font-semibold">
//           🔍 DEBUG: Current Role = "{role || 'null'}" | isAdmin = {isAdmin ? 'true' : 'false'} | User = {user?.email || 'Not logged in'}
//         </p>
//       </div>

//       {/* ------- Full Page Layout -------- */}
//       <div className="flex flex-1">

//         {/* ------- Sidebar ------- */}
//         <aside className="w-64 fixed top-[80px] left-0 h-[calc(100vh-80px)] bg-white border-r border-gray-200 p-6 overflow-y-auto shadow-sm">

//           <h2 className="text-lg font-semibold text-gray-700 mb-8">
//             H1B Wage Level
//           </h2>

//           <nav className="space-y-2">
//             {tabs.map((tab) => {
//               const isActive = activeTab === tab.id;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all 
//                     ${isActive
//                       ? "bg-yellow-300 text-gray-900 font-semibold shadow-sm"
//                       : "text-gray-600 hover:bg-gray-100"
//                     }`}
//                 >
//                   <tab.icon size={20} />
//                   {tab.label}
//                 </button>
//               );
//             })}
//           </nav>
//         </aside>

//         {/* ------- Main Content Area ------- */}
//         <main className="flex-1 ml-64 p-10 overflow-y-auto">

//           {/* OVERVIEW TAB */}
//           {activeTab === "overview" && (
//             <>
//               <h1 className="text-3xl font-bold text-gray-900 mb-6">Overview</h1>
//               <p className="text-gray-600">Your job search stats will appear here.</p>
//             </>
//           )}

//           {/* SAVED JOBS */}
//           {activeTab === "saved" && (
//             <>
//               <h1 className="text-3xl font-bold text-gray-900 mb-6">Saved Jobs</h1>
//               <div className="bg-white p-10 rounded-lg shadow-md border text-center">
//                 <Heart size={45} className="mx-auto text-gray-300 mb-4" />
//                 <p className="text-gray-600">No saved jobs yet.</p>
//               </div>
//             </>
//           )}

//           {/* APPLIED JOBS */}
//           {activeTab === "applied" && (
//             <>
//               <h1 className="text-3xl font-bold text-gray-900 mb-6">Applied Jobs</h1>
//               <div className="bg-white p-10 rounded-lg shadow-md border text-center">
//                 <Briefcase size={45} className="mx-auto text-gray-300 mb-4" />
//                 <p className="text-gray-600">No applications yet.</p>
//               </div>
//             </>
//           )}

//           {/* PROFILE */}
//           {activeTab === "profile" && (
//             <>
//               <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
//               <div className="bg-white p-6 rounded-lg shadow-md border">
//                 <p className="text-gray-600">Profile form coming soon...</p>
//               </div>
//             </>
//           )}

//           {/* SETTINGS */}
//           {activeTab === "settings" && (
//             <>
//               <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
//               <div className="bg-white p-6 rounded-lg shadow-md border">
//                 <p className="text-gray-600">Notification settings and account configuration.</p>
//               </div>
//             </>
//           )}

//           {/* BILLING */}
//           {activeTab === "billing" && (
//             <>
//               <h1 className="text-3xl font-bold text-gray-900 mb-6">Billing</h1>
//               <div className="bg-white p-6 rounded-lg shadow-md border">
//                 <p className="text-gray-600">Subscription and invoice history.</p>
//               </div>
//             </>
//           )}

//           {/* ADMIN TAB */}
//           {activeTab === "admin" && isAdmin && (
//             <>
//               {/* <h1 className="text-3xl font-bold text-gray-900 mb-6">
//                 Admin Controls
//               </h1> */}
//               <AdminControls />
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;





// //src/pages/Dashboard.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Navbar from "../components/Navbar";
// import {
//   Briefcase,
//   Heart,
//   User,
//   Settings,
//   CreditCard,
//   Search,
//   Shield,
// } from "lucide-react";
// import AdminControls from "../components/AdminControls";
// import useAuth from "../hooks/useAuth";

// const Dashboard = () => {
//   const [activeTab, setActiveTab] = useState("overview");
//   const { role, loading, user, signOut } = useAuth();
//   const navigate = useNavigate();

//   // Get immediate role from localStorage while useAuth loads
//   const [immediateRole, setImmediateRole] = useState(null);

//   // Check authentication and get role from localStorage
//   useEffect(() => {
//     // Check if user is logged in
//     if (!loading && !user) {
//       navigate('/login');
//       return;
//     }

//     // Get role from localStorage (set by Login component)
//     const storedRole = localStorage.getItem('userRole');
//     if (storedRole) {
//       setImmediateRole(storedRole);
//     }
//   }, [loading, user, navigate]);

//   // Clean up localStorage once useAuth provides fresh role
//   useEffect(() => {
//     if (role) {
//       localStorage.removeItem('userRole');
//       localStorage.removeItem('userId');
//     }
//   }, [role]);

//   // Use immediateRole if available, otherwise use role from useAuth
//   const currentRole = immediateRole || role;
//   const isAdmin = currentRole === "admin";

//   // DEBUG: Log role to console
//   console.log("🔍 Dashboard - Current role:", currentRole, "| isAdmin:", isAdmin, "| user:", user?.email);

//   // Show loading only if useAuth is still loading AND we don't have immediateRole
//   if (loading && !immediateRole) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gray-50">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
//       </div>
//     );
//   }

//   const tabs = [
//     { id: "overview", label: "Overview", icon: Search },
//     { id: "saved", label: "Saved Jobs", icon: Heart },
//     { id: "applied", label: "Applied Jobs", icon: Briefcase },
//     { id: "profile", label: "Profile", icon: User },
//     { id: "settings", label: "Settings", icon: Settings },
//     { id: "billing", label: "Billing", icon: CreditCard },
//     ...(isAdmin ? [{ id: "admin", label: "Admin Controls", icon: Shield }] : []),
//   ];

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50">
//       <Navbar />

//       {/* DEBUG: Show current role (optional - remove in production) */}
//       {process.env.NODE_ENV === 'development' && (
//         <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-center text-sm">
//           <p className="font-semibold">
//             🔍 DEBUG: Role = "{currentRole || 'null'}" | isAdmin = {isAdmin ? 'true' : 'false'} | Source: {immediateRole ? 'localStorage' : 'useAuth'}
//           </p>
//         </div>
//       )}

//       {/* ------- Full Page Layout -------- */}
//       <div className="flex flex-1">
//         {/* ------- Sidebar ------- */}
//         <aside className="w-64 fixed top-[80px] left-0 h-[calc(100vh-80px)] bg-white border-r border-gray-200 p-6 overflow-y-auto shadow-sm">
//           <div className="mb-8">
//             <h2 className="text-lg font-semibold text-gray-700 mb-2">
//               H1B Wage Level
//             </h2>
//             <div className="text-sm text-gray-500 flex items-center gap-2">
//               <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-red-500' : 'bg-green-500'}`}></div>
//               <span>{isAdmin ? 'Admin' : 'User'} Account</span>
//             </div>
//           </div>

//           <nav className="space-y-2">
//             {tabs.map((tab) => {
//               const isActive = activeTab === tab.id;
//               return (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all 
//                     ${isActive
//                       ? "bg-yellow-300 text-gray-900 font-semibold shadow-sm"
//                       : "text-gray-600 hover:bg-gray-100"
//                     }`}
//                 >
//                   <tab.icon size={20} />
//                   {tab.label}
//                 </button>
//               );
//             })}

//             {/* Logout Button */}
//             <button
//               onClick={async () => {
//                 // Clear localStorage
//                 localStorage.removeItem('userRole');
//                 localStorage.removeItem('userId');
//                 // Sign out
//                 await signOut();
//                 navigate('/login');
//               }}
//               className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all mt-8"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
//               </svg>
//               Logout
//             </button>
//           </nav>
//         </aside>

//         {/* ------- Main Content Area ------- */}
//         <main className="flex-1 ml-64 p-10 overflow-y-auto">
//           {/* Welcome Header */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900">
//               Welcome back, {user?.email?.split('@')[0] || 'User'}!
//             </h1>
//             <p className="text-gray-600 mt-2">
//               {isAdmin
//                 ? "You have administrator privileges"
//                 : "Manage your job applications and profile"
//               }
//             </p>
//           </div>

//           {/* OVERVIEW TAB */}
//           {activeTab === "overview" && (
//             <>
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//                 <div className="bg-white p-6 rounded-lg shadow-md border">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-gray-500 text-sm">Saved Jobs</p>
//                       <p className="text-2xl font-bold mt-2">0</p>
//                     </div>
//                     <Heart className="h-8 w-8 text-gray-300" />
//                   </div>
//                 </div>
//                 <div className="bg-white p-6 rounded-lg shadow-md border">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-gray-500 text-sm">Applied Jobs</p>
//                       <p className="text-2xl font-bold mt-2">0</p>
//                     </div>
//                     <Briefcase className="h-8 w-8 text-gray-300" />
//                   </div>
//                 </div>
//                 <div className="bg-white p-6 rounded-lg shadow-md border">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="text-gray-500 text-sm">Account Type</p>
//                       <p className="text-2xl font-bold mt-2">{isAdmin ? 'Admin' : 'Standard'}</p>
//                     </div>
//                     <User className="h-8 w-8 text-gray-300" />
//                   </div>
//                 </div>
//               </div>
//               <div className="bg-white p-6 rounded-lg shadow-md border">
//                 <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
//                 <p className="text-gray-600">No recent activity to display.</p>
//               </div>
//             </>
//           )}

//           {/* SAVED JOBS */}
//           {activeTab === "saved" && (
//             <>
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Saved Jobs</h2>
//               <div className="bg-white p-10 rounded-lg shadow-md border text-center">
//                 <Heart size={45} className="mx-auto text-gray-300 mb-4" />
//                 <p className="text-gray-600">No saved jobs yet.</p>
//                 <button className="mt-4 px-4 py-2 bg-primary-yellow text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors">
//                   Browse Jobs
//                 </button>
//               </div>
//             </>
//           )}

//           {/* APPLIED JOBS */}
//           {activeTab === "applied" && (
//             <>
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Applied Jobs</h2>
//               <div className="bg-white p-10 rounded-lg shadow-md border text-center">
//                 <Briefcase size={45} className="mx-auto text-gray-300 mb-4" />
//                 <p className="text-gray-600">No applications yet.</p>
//                 <button className="mt-4 px-4 py-2 bg-primary-yellow text-gray-900 rounded-lg hover:bg-yellow-400 transition-colors">
//                   Start Applying
//                 </button>
//               </div>
//             </>
//           )}

//           {/* PROFILE */}
//           {activeTab === "profile" && (
//             <>
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
//               <div className="bg-white p-6 rounded-lg shadow-md border">
//                 <div className="mb-6">
//                   <label className="block text-gray-700 mb-2">Email</label>
//                   <input
//                     type="email"
//                     value={user?.email || ''}
//                     readOnly
//                     className="w-full p-3 border rounded-lg bg-gray-50"
//                   />
//                 </div>
//                 <div className="mb-6">
//                   <label className="block text-gray-700 mb-2">Account Role</label>
//                   <input
//                     type="text"
//                     value={isAdmin ? 'Administrator' : 'Standard User'}
//                     readOnly
//                     className="w-full p-3 border rounded-lg bg-gray-50"
//                   />
//                 </div>
//                 <p className="text-gray-600 text-sm">More profile options coming soon...</p>
//               </div>
//             </>
//           )}

//           {/* SETTINGS */}
//           {activeTab === "settings" && (
//             <>
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
//               <div className="bg-white p-6 rounded-lg shadow-md border">
//                 <p className="text-gray-600">Notification settings and account configuration.</p>
//               </div>
//             </>
//           )}

//           {/* BILLING */}
//           {activeTab === "billing" && (
//             <>
//               <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing & Subscription</h2>
//               <div className="bg-white p-6 rounded-lg shadow-md border">
//                 <p className="text-gray-600">Subscription and invoice history.</p>
//               </div>
//             </>
//           )}

//           {/* ADMIN TAB */}
//           {activeTab === "admin" && isAdmin && (
//             <>
//               <div className="mb-6">
//                 <h2 className="text-2xl font-bold text-gray-900">Admin Controls</h2>
//                 <p className="text-gray-600">Manage users, jobs, and platform settings</p>
//               </div>
//               <AdminControls />
//             </>
//           )}
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;






//src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
    Briefcase,
    Heart,
    User,
    Settings,
    CreditCard,
    Search,
    Shield,
    LayoutDashboard,
    CheckCircle,
} from "lucide-react";
import AdminControls from "../components/AdminControls";
import AdminOverview from "../components/AdminOverview";
import SavedJobsTab from "../components/SavedJobsTab";
import AppliedJobsTab from "../components/AppliedJobsTab";
import BillingTab from "../components/BillingTab";
import ProfileTab from "../components/ProfileTab";
import RenewalPayment from "../components/RenewalPayment";
import useAuth from "../hooks/useAuth";
import { supabase } from "../supabaseClient";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.state?.initialTab || "overview");
    const { role, loading, user, signOut, isAdmin, subscriptionExpired, subscriptionEndDate, checkingSub } = useAuth();
    const navigate = useNavigate();

    const [savedJobsCount, setSavedJobsCount] = useState(0);
    const [appliedJobsCount, setAppliedJobsCount] = useState(0);
    const [showRenewalFlow, setShowRenewalFlow] = useState(false);
    const [renewalStep, setRenewalStep] = useState(1);
    const [renewProfile, setRenewProfile] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        location: ''
    });
    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [renewError, setRenewError] = useState('');
    const [renewLoading, setRenewLoading] = useState(false);

    // Sync activeTab with location state visually to avoid flicker
    const currentTab = activeTab;

    // Sync state in background when location changes
    useEffect(() => {
        if (location.state?.initialTab && location.state.initialTab !== activeTab) {
            setActiveTab(location.state.initialTab);
        }
    }, [location.state, activeTab]);




    const handleRenewClick = async () => {
        setRenewLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            setRenewProfile({
                firstName: data.first_name || '',
                lastName: data.last_name || '',
                email: data.email || user.email || '',
                phone: data.phone || '',
                location: data.location || ''
            });
            setShowRenewalFlow(true);
            setRenewalStep(1);
        } catch (err) {
            console.error('Error fetching profile for renewal:', err);
        } finally {
            setRenewLoading(false);
        }
    };

    const handleUpdateProfileAndProceed = async () => {
        setRenewLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    first_name: renewProfile.firstName,
                    last_name: renewProfile.lastName,
                    mobile_number: renewProfile.phone
                })
                .eq('id', user.id);

            if (error) throw error;
            setRenewalStep(2);
        } catch (err) {
            console.error('Error updating profile:', err);
            setRenewError('Failed to update profile details.');
        } finally {
            setRenewLoading(false);
        }
    };

    // Authentication redirect
    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [loading, user, navigate]);

    // Fetch dashboard stats
    useEffect(() => {
        if (user) {
            fetchSavedJobsCount();
            fetchAppliedJobsCount();
        }
    }, [user]);

    const fetchAppliedJobsCount = async () => {
        try {
            const { count, error } = await supabase
                .from('applied_jobs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (error) throw error;
            setAppliedJobsCount(count || 0);
        } catch (err) {
            console.error('Error fetching applied jobs count:', err);
            setAppliedJobsCount(0);
        }
    };

    const fetchSavedJobsCount = async () => {
        try {
            const { count, error } = await supabase
                .from('saved_jobs')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            if (error) throw error;
            setSavedJobsCount(count || 0);
        } catch (err) {
            console.error('Error fetching saved jobs count:', err);
            setSavedJobsCount(0);
        }
    };

    // Determine admin status from role

    console.log(
        "🔍 Dashboard ==> user:",
        user?.email,
        "| role:",
        role,
        "| isAdmin:",
        isAdmin
    );

    // Show loading while auth context initializes
    if (loading || (user && checkingSub)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark mb-4"></div>
                    <p className="text-gray-500 font-medium">Verifying account access...</p>
                </div>
            </div>
        );
    }



    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            {/* Debug Info
      {process.env.NODE_ENV === "development" && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-center text-sm">
          <p className="font-semibold">
            🔎 Role Debug → role: {role || "null"} | localStorage:
            {immediateRole} | Final: {currentRole}
          </p>
        </div>
      )} */}

            {/* Layout */}
            <div className="flex flex-1">
                {/* Sidebar */}
                <div className="hidden md:block w-64 flex-shrink-0 border-r border-gray-100 bg-white">
                    <Sidebar className="h-[calc(100vh-80px)] sticky top-0" showHeader={false} />
                </div>

                {/* Main */}
                <main className="flex-1 p-4 md:p-10 overflow-y-auto w-full">
                    {/* Mobile Tab Navigation (Only visible on mobile) */}
                    <div className="md:hidden flex overflow-x-auto pb-4 mb-6 gap-2 no-scrollbar">
                        {[
                            { id: "all-jobs", label: "Find Jobs", icon: Search, type: "link", path: "/jobs" },
                            { id: "overview", label: "Overview", icon: LayoutDashboard },
                            { id: "saved", label: "Saved", icon: Heart },
                            { id: "applied", label: "Applied", icon: Briefcase },
                            { id: "profile", label: "Profile", icon: User },
                            { id: "billing", label: "Billing", icon: CreditCard },
                            ...(isAdmin ? [{ id: "admin", label: "Admin", icon: Shield }] : []),
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    if (tab.type === "link") {
                                        navigate(tab.path);
                                    } else {
                                        setActiveTab(tab.id);
                                    }
                                }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab === tab.id
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                    : "bg-white text-gray-500 border border-gray-100"
                                    }`}
                            >
                                <tab.icon size={16} className={tab.id === "all-jobs" ? "text-indigo-600" : ""} />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="mb-6 md:mb-10 bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
                        <div className="relative z-10">
                            <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                Welcome back, <span className="text-indigo-600 italic">{user?.email?.split("@")[0] || "User"}</span>!
                            </h1>
                            <p className="text-gray-500 mt-2 text-lg font-medium max-w-2xl">
                                {isAdmin
                                    ? "You have full administrator control over the H1B Wage Level platform."
                                    : "Track your h1b journey, manage applications, and refine your profile here."}
                            </p>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    {!isAdmin && subscriptionExpired && !["billing", "profile"].includes(currentTab) ? (
                        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto">
                            <div className="p-4 bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-2 font-display">Subscription Expired</h2>
                            <p className="text-sm text-gray-500 mb-2 italic">subscribe to get the access</p>
                            {subscriptionEndDate && (
                                <p className="text-xs text-red-400 mb-10 font-medium">Your access ended on {new Date(subscriptionEndDate).toLocaleDateString()}</p>
                            )}

                            {showRenewalFlow ? (
                                <div className="max-w-xl mx-auto p-4 text-left">
                                    {renewalStep === 1 && (
                                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-xl font-bold text-gray-900">Your Registration Details</h3>
                                                <button
                                                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                                                    className="text-sm text-blue-600 font-semibold hover:underline bg-blue-50 px-3 py-1 rounded-full"
                                                >
                                                    {isEditingProfile ? 'Save Changes' : 'Edit Details'}
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                                                        <input
                                                            type="text"
                                                            value={renewProfile.firstName}
                                                            disabled={!isEditingProfile}
                                                            onChange={(e) => setRenewProfile({ ...renewProfile, firstName: e.target.value })}
                                                            className={`w-full p-3 rounded-xl border transition-all ${!isEditingProfile ? 'bg-gray-50 border-gray-100 text-gray-700 font-medium' : 'bg-white border-blue-400 focus:ring-4 focus:ring-blue-100'}`}
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                                                        <input
                                                            type="text"
                                                            value={renewProfile.lastName}
                                                            disabled={!isEditingProfile}
                                                            onChange={(e) => setRenewProfile({ ...renewProfile, lastName: e.target.value })}
                                                            className={`w-full p-3 rounded-xl border transition-all ${!isEditingProfile ? 'bg-gray-50 border-gray-100 text-gray-700 font-medium' : 'bg-white border-blue-400 focus:ring-4 focus:ring-blue-100'}`}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Email</label>
                                                    <input type="text" value={renewProfile.email} disabled className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed" />
                                                </div>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Phone</label>
                                                    <input
                                                        type="text"
                                                        value={renewProfile.phone}
                                                        disabled={!isEditingProfile}
                                                        onChange={(e) => setRenewProfile({ ...renewProfile, phone: e.target.value })}
                                                        className={`w-full p-3 rounded-xl border transition-all ${!isEditingProfile ? 'bg-gray-50 border-gray-100 text-gray-700 font-medium' : 'bg-white border-blue-400 focus:ring-4 focus:ring-blue-100'}`}
                                                    />
                                                </div>

                                                <div className="pt-6 border-t border-gray-100 mt-6">
                                                    {renewError && <p className="text-red-500 text-sm mb-4 bg-red-50 p-3 rounded-lg border border-red-100">{renewError}</p>}
                                                    <button
                                                        onClick={handleUpdateProfileAndProceed}
                                                        disabled={renewLoading}
                                                        className="w-full bg-primary-yellow text-primary-dark font-black text-lg py-4 rounded-xl hover:bg-yellow-400 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                                    >
                                                        {renewLoading ? 'Saving Info...' : 'Get Access'}
                                                    </button>
                                                    <button onClick={() => setShowRenewalFlow(false)} className="w-full mt-4 text-gray-400 text-sm font-semibold hover:text-gray-600 transition-colors uppercase tracking-widest">Cancel Renewal</button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {renewalStep === 2 && (
                                        <div className="bg-white p-10 rounded-2xl border border-gray-200 shadow-xl text-center">
                                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Payment</h3>
                                            <p className="text-gray-600 mb-8">Unlock full access for 1 month ($30.00)</p>
                                            <div className="max-w-sm mx-auto p-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50">
                                                <RenewalPayment
                                                    user={user}
                                                    profile={renewProfile}
                                                    onSuccess={() => {
                                                        setRenewalStep(3);
                                                        setSubscriptionExpired(false);
                                                        setTimeout(() => {
                                                            setShowRenewalFlow(false);
                                                            setActiveTab("billing");
                                                        }, 3000);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {renewalStep === 3 && (
                                        <div className="bg-white p-12 rounded-2xl border border-gray-200 shadow-xl text-center">
                                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <CheckCircle size={40} />
                                            </div>
                                            <h3 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
                                            <p className="text-gray-600 text-lg">Your subscription is now active. Enjoy your access!</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={handleRenewClick}
                                    className="px-12 py-5 bg-primary-yellow text-primary-dark font-black text-xl rounded-2xl shadow-2xl hover:bg-yellow-400 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center gap-3 mx-auto"
                                >
                                    Get Access
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {currentTab === "overview" && (
                                isAdmin ? (
                                    <AdminOverview />
                                ) : (
                                    <div className="space-y-8 animate-fadeIn">
                                        {/* STATS GRID */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div
                                                onClick={() => navigate('/dashboard', { state: { initialTab: "saved" } })}
                                                className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:border-emerald-200 hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.1)] transition-all duration-300 relative group overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between relative z-10">
                                                    <div>
                                                        <p className="text-emerald-600 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Saved Jobs</p>
                                                        <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">{savedJobsCount}</p>
                                                    </div>
                                                    <div className="p-3 md:p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                                                        <Heart className="h-6 w-6 md:h-7 md:w-7 fill-current" />
                                                    </div>
                                                </div>
                                                <div className="mt-4 text-[10px] md:text-xs font-bold text-gray-400 group-hover:text-emerald-500 transition-colors">Click to view list →</div>
                                            </div>

                                            <div
                                                onClick={() => navigate('/dashboard', { state: { initialTab: "applied" } })}
                                                className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:border-blue-200 hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.1)] transition-all duration-300 relative group overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between relative z-10">
                                                    <div>
                                                        <p className="text-blue-600 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Applied Jobs</p>
                                                        <p className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter">{appliedJobsCount}</p>
                                                    </div>
                                                    <div className="p-3 md:p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                                        <Briefcase className="h-6 w-6 md:h-7 md:w-7" />
                                                    </div>
                                                </div>
                                                <div className="mt-4 text-[10px] md:text-xs font-bold text-gray-400 group-hover:text-blue-500 transition-colors">Check your progress →</div>
                                            </div>

                                            <div
                                                onClick={() => navigate('/dashboard', { state: { initialTab: "billing" } })}
                                                className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 cursor-pointer hover:border-purple-200 hover:shadow-[0_20px_40px_-15px_rgba(139,92,246,0.1)] transition-all duration-300 relative group overflow-hidden"
                                            >
                                                <div className="flex items-center justify-between relative z-10">
                                                    <div>
                                                        <p className="text-purple-600 text-[10px] md:text-xs font-black uppercase tracking-widest mb-1">Account</p>
                                                        <p className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">Standard</p>
                                                    </div>
                                                    <div className="p-3 md:p-4 bg-purple-50 text-purple-600 rounded-2xl group-hover:bg-purple-600 group-hover:text-white transition-all duration-300">
                                                        <User className="h-6 w-6 md:h-7 md:w-7" />
                                                    </div>
                                                </div>
                                                <div className="mt-4 text-[10px] md:text-xs font-bold text-gray-400 group-hover:text-purple-500 transition-colors">View subscription details →</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                            {/* RECENT ACTIVITY */}
                                            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col min-h-[350px]">
                                                <div className="flex items-center justify-between mb-6 md:mb-8">
                                                    <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2">
                                                        <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                                                        Recent Activity
                                                    </h3>
                                                </div>
                                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                                    <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-6 text-gray-300">
                                                        <Search size={40} />
                                                    </div>
                                                    <p className="text-gray-500 font-bold text-lg">No recent activity</p>
                                                    <p className="text-gray-400 text-sm mt-1 max-w-[240px]">
                                                        Start exploring jobs or saving favorites to see your history here.
                                                    </p>
                                                    <button
                                                        onClick={() => navigate('/jobs')}
                                                        className="mt-6 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-600 hover:text-white transition-all"
                                                    >
                                                        Explore All Jobs
                                                    </button>
                                                </div>
                                            </div>

                                            {/* QUICK ACTIONS */}
                                            <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm">
                                                <h3 className="text-lg md:text-xl font-black text-gray-900 flex items-center gap-2 mb-6 md:mb-8">
                                                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                                                    Quick Actions
                                                </h3>
                                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => navigate('/jobs')}
                                                        className="p-4 md:p-6 bg-indigo-50/40 rounded-2xl text-left hover:bg-indigo-50 transition-all border border-transparent hover:border-indigo-100 group"
                                                    >
                                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-3 md:mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                            <Search size={18} />
                                                        </div>
                                                        <span className="block font-black text-xs md:text-sm text-gray-900 tracking-tight">Find Jobs</span>
                                                        <span className="text-[10px] text-gray-400 mt-1 block">Browse H1B roles</span>
                                                    </button>

                                                    <button
                                                        onClick={() => setActiveTab('profile')}
                                                        className="p-6 bg-amber-50/40 rounded-2xl text-left hover:bg-amber-50 transition-all border border-transparent hover:border-amber-100 group"
                                                    >
                                                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 mb-4 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                                            <User size={20} />
                                                        </div>
                                                        <span className="block font-bold text-gray-900">My Profile</span>
                                                        <span className="text-xs text-gray-500 mt-1 block">Update your details</span>
                                                    </button>

                                                    <button
                                                        onClick={() => setActiveTab('saved')}
                                                        className="p-6 bg-emerald-50/40 rounded-2xl text-left hover:bg-emerald-50 transition-all border border-transparent hover:border-emerald-100 group"
                                                    >
                                                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                                            <Heart size={20} />
                                                        </div>
                                                        <span className="block font-bold text-gray-900">Saved</span>
                                                        <span className="text-xs text-gray-500 mt-1 block">View your wishlist</span>
                                                    </button>

                                                    <button
                                                        onClick={() => setActiveTab('billing')}
                                                        className="p-6 bg-purple-50/40 rounded-2xl text-left hover:bg-purple-50 transition-all border border-transparent hover:border-purple-100 group"
                                                    >
                                                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-all">
                                                            <CreditCard size={20} />
                                                        </div>
                                                        <span className="block font-bold text-gray-900">Billing</span>
                                                        <span className="text-xs text-gray-500 mt-1 block">Check subscription</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            {currentTab === "saved" && (
                                <SavedJobsTab />
                            )}

                            {currentTab === "applied" && (
                                <AppliedJobsTab />
                            )}

                            {currentTab === "profile" && (
                                <ProfileTab />
                            )}

                            {currentTab === "settings" && (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                        Account Settings
                                    </h2>
                                    <div className="bg-white p-6 rounded-lg shadow-md border">
                                        <p className="text-gray-600">
                                            Notification settings and account configuration.
                                        </p>
                                    </div>
                                </>
                            )}

                            {currentTab === "billing" && (
                                <BillingTab />
                            )}

                            {currentTab === "admin" && isAdmin && (
                                <>
                                    <div className="mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            Admin Controls
                                        </h2>
                                        <p className="text-gray-600">
                                            Manage users, jobs, and platform settings
                                        </p>
                                    </div>
                                    <AdminControls />
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
