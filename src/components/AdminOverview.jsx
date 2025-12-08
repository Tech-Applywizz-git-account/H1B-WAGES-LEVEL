import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
    Users,
    DollarSign,
    Briefcase,
    TrendingUp,
    Activity,
    CreditCard,
    UserPlus,
    ArrowRight
} from 'lucide-react';

const AdminOverview = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRevenue: 0,
        activeJobs: 0,
        newUsersToday: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // 1. Fetch Users Count
            const { count: userCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            // 2. Fetch Active Jobs Count
            const { count: jobCount } = await supabase
                .from('job_jobrole_all')
                .select('*', { count: 'exact', head: true });

            // 3. Fetch Revenue
            const { data: payments } = await supabase
                .from('payment_details')
                .select('amount, status')
                .eq('status', 'COMPLETED'); // Assuming 'COMPLETED' is the success status

            const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount || 0), 0) || 0;

            // 4. Fetch Recent Activity (New Users)
            const { data: newUsers } = await supabase
                .from('profiles')
                .select('email, created_at, first_name')
                .order('created_at', { ascending: false })
                .limit(5);

            // 5. Fetch Recent Activity (Payments)
            const { data: recentPayments } = await supabase
                .from('payment_details')
                .select('email, amount, created_at')
                .eq('status', 'COMPLETED')
                .order('created_at', { ascending: false })
                .limit(5);

            // Combine and sort activity
            const activity = [
                ...(newUsers || []).map(u => ({
                    type: 'signup',
                    title: 'New User Registered',
                    desc: u.email,
                    time: u.created_at,
                    icon: UserPlus,
                    color: 'blue'
                })),
                ...(recentPayments || []).map(p => ({
                    type: 'payment',
                    title: 'Payment Received',
                    desc: `+${formatCurrency(p.amount)} from ${p.email}`,
                    time: p.created_at,
                    icon: DollarSign,
                    color: 'green'
                }))
            ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

            setStats({
                totalUsers: userCount || 0,
                totalRevenue: totalRevenue,
                activeJobs: jobCount || 0,
                newUsersToday: 0 // Placeholder or calculate if needed
            });
            setRecentActivity(activity);

        } catch (error) {
            console.error('Error fetching dashboard overview:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    if (loading) {
        return <div className="p-10 text-center text-gray-500">Loading dashboard overview...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
                <p className="text-gray-600 mt-1">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Revenue */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Total Revenue</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(stats.totalRevenue)}</h3>
                        <p className="text-sm text-green-600 flex items-center mt-1">
                            <TrendingUp className="w-3 h-3 mr-1" /> Lifetime
                        </p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-full">
                        <DollarSign className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                {/* Users */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Total Users</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</h3>
                        <p className="text-sm text-blue-600 flex items-center mt-1">
                            <Users className="w-3 h-3 mr-1" /> Registered
                        </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-full">
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                {/* Jobs */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Active Jobs</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.activeJobs}</h3>
                        <p className="text-sm text-purple-600 flex items-center mt-1">
                            <Briefcase className="w-3 h-3 mr-1" /> Listed
                        </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-full">
                        <Briefcase className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                {/* Growth */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Conversion Rate</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">
                            {stats.totalUsers > 0
                                ? ((stats.totalRevenue / 30) / stats.totalUsers * 100).toFixed(0)
                                : 0}%
                        </h3>
                        <p className="text-sm text-yellow-600 flex items-center mt-1">
                            <Activity className="w-3 h-3 mr-1" /> Paid Users
                        </p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-full">
                        <TrendingUp className="w-8 h-8 text-yellow-600" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-gray-500" />
                        Recent Activity
                    </h3>
                    <div className="flow-root">
                        <ul role="list" className="-mb-8">
                            {recentActivity.map((activity, activityIdx) => (
                                <li key={activityIdx}>
                                    <div className="relative pb-8">
                                        {activityIdx !== recentActivity.length - 1 ? (
                                            <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-${activity.color}-50`}>
                                                    <activity.icon className={`h-5 w-5 text-${activity.color}-600`} aria-hidden="true" />
                                                </span>
                                            </div>
                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                <div>
                                                    <p className="text-sm text-gray-500">
                                                        <span className="font-medium text-gray-900">{activity.title}</span>: {activity.desc}
                                                    </p>
                                                </div>
                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                    <time dateTime={activity.time}>{formatDate(activity.time)}</time>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-4 pt-4 border-t text-right">
                        <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center justify-end gap-1">
                            View all activity <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3 group">
                            <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <Users className="w-5 h-5 text-blue-700" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Manage Users</p>
                                <p className="text-xs text-gray-500">Add, edit, or remove users</p>
                            </div>
                        </button>

                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3 group">
                            <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                                <CreditCard className="w-5 h-5 text-green-700" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">View Revenue</p>
                                <p className="text-xs text-gray-500">Check financial reports</p>
                            </div>
                        </button>

                        <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors flex items-center gap-3 group">
                            <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                                <Briefcase className="w-5 h-5 text-purple-700" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Post New Job</p>
                                <p className="text-xs text-gray-500">Create a new job listing</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview;
