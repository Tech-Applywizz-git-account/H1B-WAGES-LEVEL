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
//             Telugu Wala Links
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
//               Telugu Wala Links
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
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import {
  Briefcase,
  Heart,
  User,
  Settings,
  CreditCard,
  Search,
  Shield,
  List,
} from "lucide-react";
import AdminControls from "../components/AdminControls";
import AdminOverview from "../components/AdminOverview";
import AllJobsTab from "../components/AllJobsTab";
import SavedJobsTab from "../components/SavedJobsTab";
import BillingTab from "../components/BillingTab";
import useAuth from "../hooks/useAuth";
import { supabase } from "../supabaseClient";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { role, loading, user, signOut } = useAuth();
  const navigate = useNavigate();

  // Redirect 'All Jobs' to Homepage
  useEffect(() => {
    if (activeTab === 'alljobs') {
      navigate('/');
    }
  }, [activeTab, navigate]);
  const [savedJobsCount, setSavedJobsCount] = useState(0);

  // Authentication redirect
  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [loading, user, navigate]);

  // Fetch saved jobs count
  useEffect(() => {
    if (user) {
      fetchSavedJobsCount();
    }
  }, [user]);

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
  const isAdmin = role === "admin";

  console.log(
    "🔍 Dashboard ==> user:",
    user?.email,
    "| role:",
    role,
    "| isAdmin:",
    isAdmin
  );

  // Show loading while auth context initializes
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-dark"></div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: Search },
    { id: "alljobs", label: "All Jobs", icon: List },
    { id: "saved", label: "Saved Jobs", icon: Heart },
    { id: "applied", label: "Applied Jobs", icon: Briefcase },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "billing", label: "Billing", icon: CreditCard },
    ...(isAdmin ? [{ id: "admin", label: "Admin Controls", icon: Shield }] : []),
  ];

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
        <aside className="w-64 fixed top-[80px] left-0 h-[calc(100vh-80px)] bg-white border-r border-gray-200 p-6 overflow-y-auto shadow-sm">
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">
              Telugu Wala Links
            </h2>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isAdmin ? "bg-red-500" : "bg-green-500"
                  }`}
              ></div>
              <span>{isAdmin ? "Admin" : "User"} Account</span>
            </div>
          </div>

          <nav className="space-y-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all 
                    ${isActive
                      ? "bg-yellow-300 text-gray-900 font-semibold shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  <tab.icon size={20} />
                  {tab.label}
                </button>
              );
            })}

            {/* Logout */}
            <button
              onClick={async () => {
                console.log("🚨 Logout button clicked in Dashboard");
                await signOut();
                navigate("/", { replace: true });
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

        {/* Main */}
        <main className="flex-1 ml-64 p-10 overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.email?.split("@")[0] || "User"}!
            </h1>
            <p className="text-gray-600 mt-2">
              {isAdmin
                ? "You have administrator privileges"
                : "Manage your job applications and profile"}
            </p>
          </div>

          {activeTab === "overview" && (
            isAdmin ? (
              <AdminOverview />
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Dashboard Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-lg shadow-md border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Saved Jobs</p>
                        <p className="text-2xl font-bold mt-2">{savedJobsCount}</p>
                      </div>
                      <Heart className="h-8 w-8 text-gray-300" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Applied Jobs</p>
                        <p className="text-2xl font-bold mt-2">0</p>
                      </div>
                      <Briefcase className="h-8 w-8 text-gray-300" />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md border">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500 text-sm">Account Type</p>
                        <p className="text-2xl font-bold mt-2">{isAdmin ? "Admin" : "Standard"}</p>
                      </div>
                      <User className="h-8 w-8 text-gray-300" />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md border">
                  <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                  <p className="text-gray-600">No recent activity to display.</p>
                </div>
              </>
            )
          )}



          {activeTab === "saved" && (
            <SavedJobsTab />
          )}

          {activeTab === "applied" && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Applied Jobs
              </h2>
              <div className="bg-white p-10 rounded-lg shadow-md border text-center">
                <Briefcase size={45} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600">No applications yet.</p>
              </div>
            </>
          )}

          {activeTab === "profile" && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Profile Settings
              </h2>
              <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="w-full p-3 border rounded-lg bg-gray-50"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2">Account Role</label>
                  <input
                    type="text"
                    value={isAdmin ? "Administrator" : "Standard User"}
                    readOnly
                    className="w-full p-3 border rounded-lg bg-gray-50"
                  />
                </div>
                <p className="text-gray-600 text-sm">
                  More profile options coming soon...
                </p>
              </div>
            </>
          )}

          {activeTab === "settings" && (
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

          {activeTab === "billing" && (
            <BillingTab />
          )}

          {activeTab === "admin" && isAdmin && (
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
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
