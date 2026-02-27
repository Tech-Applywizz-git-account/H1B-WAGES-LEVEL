//src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../supabaseClient';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        console.log("🔄 Login attempt started for email:", email);

        try {
            // Authenticate with Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;
            if (!authData?.user) throw new Error("Authentication failed.");

            console.log("✅ Login successful! User:", authData.user.email);
            console.log("🔄 Auth context will load role automatically...");

            // Navigate immediately - useAuth context handles role loading via onAuthStateChange
            navigate("/app", { replace: true });


        } catch (err) {
            console.error("💥 Login error:", err);
            setError(err.message || "Login failed. Try again.");

            // Sign out on error to ensure clean state
            await supabase.auth.signOut();

        } finally {
            setLoading(false);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="min-h-screen bg-[#24385E] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FDB913]/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3"></div>
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#FDB913]/5 rounded-full -translate-y-1/2"></div>

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 md:p-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 group">
                        <div className="relative">
                            <div className="w-10 h-10 bg-[#24385E] rounded-xl flex items-center justify-center transform rotate-12 transition-transform group-hover:rotate-0 shadow-lg">
                                <span className="text-white font-black text-xs tracking-tighter">H1-B</span>
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FDB913] rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-[#24385E] tracking-tight leading-none">Wage</span>
                            <span className="text-xl font-bold text-[#FDB913] tracking-tight leading-none">Level</span>
                        </div>
                    </Link>
                </div>

                <h1 className="text-2xl font-black text-[#24385E] mb-2 text-center">
                    Welcome Back
                </h1>
                <p className="text-gray-400 text-sm font-medium text-center mb-8">
                    Login to access your dashboard
                </p>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-red-600 font-semibold text-sm text-center">
                            {error}
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-xs font-black text-[#24385E] uppercase tracking-wider mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-300" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FDB913] focus:border-transparent text-[#24385E] font-medium placeholder:text-gray-300 bg-gray-50/50"
                                aria-label="Email address"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-xs font-black text-[#24385E] uppercase tracking-wider mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-300" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-12 pr-12 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FDB913] focus:border-transparent text-[#24385E] font-medium placeholder:text-gray-300 bg-gray-50/50"
                                aria-label="Password"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center focus:outline-none"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-300 hover:text-[#24385E] transition-colors" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-300 hover:text-[#24385E] transition-colors" />
                                )}
                            </button>
                        </div>
                        <div className="mt-2.5 text-right">
                            <Link to="/forgot-password" className="text-sm font-bold text-[#FDB913] hover:text-[#e5a811] transition-colors">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-[#24385E] hover:bg-[#1a2a47] text-white font-black text-base rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Logging in...</span>
                            </>
                        ) : (
                            <span>Login</span>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <div className="text-center">
                        <p className="text-gray-400 font-medium">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-[#FDB913] font-bold hover:text-[#e5a811] transition-colors">
                                Sign up now
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
