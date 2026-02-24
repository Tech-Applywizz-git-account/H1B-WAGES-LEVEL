import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { Loader2 } from "lucide-react";

// Components
import Sidebar from "../components/Sidebar";
import AppHeader from "../components/AppHeader";
import AdminOverview from "../components/AdminOverview";
import UserOverview from "../components/UserOverview";
import SavedJobsTab from "../components/SavedJobsTab";
import AppliedJobsTab from "../components/AppliedJobsTab";
import BillingTab from "../components/BillingTab";
import ProfileTab from "../components/ProfileTab";

const Dashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading, isAdmin, checkingSub } = useAuth();

    const [activeTab, setActiveTab] = useState(location.state?.initialTab || "overview");

    useEffect(() => {
        if (location.state?.initialTab && location.state.initialTab !== activeTab) {
            setActiveTab(location.state.initialTab);
        }
    }, [location.state, activeTab]);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login");
        }
    }, [loading, user, navigate]);

    if (loading || checkingSub) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-[#fafafa]">
                <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case "overview":
            case "dashboard":
                return isAdmin ? <AdminOverview /> : <UserOverview />;
            case "saved":
                return <SavedJobsTab />;
            case "applied":
                return <AppliedJobsTab />;
            case "profile":
            case "settings":
                return <ProfileTab />;
            case "billing":
                return <BillingTab />;
            case "admin":
                return <AdminOverview />;
            default:
                return isAdmin ? <AdminOverview /> : <UserOverview />;
        }
    };

    const getTitle = () => {
        const labels = {
            overview: 'Dashboard Overview',
            dashboard: 'Dashboard Overview',
            saved: 'Saved Jobs',
            applied: 'Applied Jobs',
            profile: 'Profile Settings',
            billing: 'Billing & Subscription',
            settings: 'Account Settings',
            admin: 'Admin Controls'
        };
        return labels[activeTab] || 'Dashboard';
    };

    return (
        <div className="flex h-screen bg-[#fafafa] overflow-hidden">
            {/* Sidebar with restored functional tabs */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <AppHeader title={getTitle()} />

                {/* Scrollable Container */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="p-8 max-w-7xl mx-auto">
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
