// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Mail, Lock } from 'lucide-react';

// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const navigate = useNavigate();

//     const handleSubmit = (e) => {
//         e.preventDefault();
//         // Here you would authenticate with backend
//         console.log('Login attempt:', { email, password });
//         // For now, redirect to dashboard
//         navigate('/dashboard');
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
//             <div className="absolute inset-0 bg-black opacity-30"></div>

//             <div className="relative card max-w-md w-full">
//                 {/* Logo */}
//                 <div className="text-center mb-8">
//                     <div className="inline-block">
//                         <Link to="/" className="flex items-center space-x-2">
//                             <div className="w-12 h-12 bg-primary-yellow rounded-lg flex items-center justify-center">
//                                 <span className="text-primary-dark font-bold text-2xl">H1B</span>
//                             </div>
//                             <span className="font-bold text-xl text-primary-dark">H1B Wage Level</span>
//                         </Link>
//                     </div>
//                 </div>

//                 <h1 className="text-2xl font-bold text-primary-dark mb-6 text-center">
//                     Login to H1B Wage Level
//                 </h1>

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {/* Email Field */}
//                     <div>
//                         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                             Email
//                         </label>
//                         <div className="relative">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <Mail className="h-5 w-5 text-gray-400" />
//                             </div>
//                             <input
//                                 id="email"
//                                 type="email"
//                                 placeholder="email@example.com"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 required
//                                 className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
//                             />
//                         </div>
//                     </div>

//                     {/* Password Field */}
//                     <div>
//                         <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                             Password
//                         </label>
//                         <div className="relative">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <Lock className="h-5 w-5 text-gray-400" />
//                             </div>
//                             <input
//                                 id="password"
//                                 type="password"
//                                 placeholder="Enter your password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 required
//                                 className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
//                             />
//                         </div>
//                         <div className="mt-2 text-right">
//                             <Link to="/forgot-password" className="text-sm text-accent-blue hover:underline">
//                                 Forgot password?
//                             </Link>
//                         </div>
//                     </div>

//                     <button
//                         type="submit"
//                         className="w-full btn-primary flex items-center justify-center space-x-2"
//                     >
//                         <span>Continue</span>
//                     </button>
//                 </form>

//                 <div className="mt-6 text-center">
//                     <p className="text-gray-600">
//                         Don't have an account?{' '}
//                         <Link to="/signup" className="text-accent-blue font-semibold hover:underline">
//                             Sign up
//                         </Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Login;













// //src/pages/Login.jsx
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Mail, Lock } from 'lucide-react';
// import { supabase } from '../supabaseClient';

// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState('');
//     const navigate = useNavigate();

//     const [loading, setLoading] = useState(false);
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError("");
//         setLoading(true);

//         try {
//             const { data, error } = await supabase.auth.signInWithPassword({
//                 email,
//                 password
//             });

//             if (error) throw error;

//             // ✅ Wait for role to be fetched before redirecting
//             const { data: profile } = await supabase
//                 .from("profiles")
//                 .select("role")
//                 .eq("email", email)
//                 .single();

//             console.log("✅ Login successful, role:", profile?.role);

//             // Redirect based on role if needed (or just go to dashboard)
//             navigate('/dashboard');

//         } catch (err) {
//             console.error("Login error:", err);
//             setError(err.message || "Failed to login");
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
//             <div className="absolute inset-0 bg-black opacity-30"></div>

//             <div className="relative card max-w-md w-full">
//                 {/* Logo */}
//                 <div className="text-center mb-8">
//                     <div className="inline-block">
//                         <Link to="/" className="flex items-center space-x-2">
//                             <div className="w-12 h-12 bg-primary-yellow rounded-lg flex items-center justify-center">
//                                 <span className="text-primary-dark font-bold text-2xl">H1B</span>
//                             </div>
//                             <span className="font-bold text-xl text-primary-dark">H1B Wage Level</span>
//                         </Link>
//                     </div>
//                 </div>

//                 <h1 className="text-2xl font-bold text-primary-dark mb-6 text-center">
//                     Login to H1B Wage Level
//                 </h1>

//                 {error && (
//                     <p className="text-red-500 text-center mb-4 font-medium">
//                         {error}
//                     </p>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {/* Email */}
//                     <div>
//                         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                             Email
//                         </label>
//                         <div className="relative">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <Mail className="h-5 w-5 text-gray-400" />
//                             </div>
//                             <input
//                                 id="email"
//                                 type="email"
//                                 placeholder="email@example.com"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 required
//                                 className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
//                             />
//                         </div>
//                     </div>

//                     {/* Password */}
//                     <div>
//                         <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                             Password
//                         </label>
//                         <div className="relative">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <Lock className="h-5 w-5 text-gray-400" />
//                             </div>
//                             <input
//                                 id="password"
//                                 type="password"
//                                 placeholder="Enter your password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 required
//                                 className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow"
//                             />
//                         </div>
//                         <div className="mt-2 text-right">
//                             <Link to="/forgot-password" className="text-sm text-accent-blue hover:underline">
//                                 Forgot password?
//                             </Link>
//                         </div>
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
//                     >
//                         {loading ? (
//                             <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                         ) : (
//                             <span>Continue</span>
//                         )}
//                     </button>
//                 </form>

//                 <div className="mt-6 text-center">
//                     <p className="text-gray-600">
//                         Don't have an account?{' '}
//                         <Link to="/signup" className="text-accent-blue font-semibold hover:underline">
//                             Sign up
//                         </Link>
//                     </p>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Login;






// //src/pages/Login.jsx
// import React, { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
// import { supabase } from '../supabaseClient';

// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [showPassword, setShowPassword] = useState(false);
//     const [error, setError] = useState('');
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(false);
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError("");
//         setLoading(true);

//         console.log("🔄 Login attempt started for email:", email);
//         console.log("📤 Sending request to Supabase Auth...");

//         try {
//             // Step 1: Check credentials in Auth table
//             console.log("🔑 Calling supabase.auth.signInWithPassword...");
//             const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
//                 email,
//                 password
//             });

//             console.log("📥 Auth response received:", {
//                 hasData: !!authData,
//                 hasError: !!authError,
//                 errorDetails: authError
//             });


//             if (authError) {
//                 console.error("❌ Auth error details:", {
//                     message: authError.message,
//                     status: authError.status,
//                     name: authError.name,
//                     code: authError.code
//                 });
//                 throw authError;
//             }

//             // Check if authData exists
//             if (!authData || !authData.user) {
//                 console.error("❌ No authData or user found!");
//                 throw new Error("Authentication failed: No user data returned");
//             }

//             const userId = authData.user.id;
//             console.log("✅ Auth successful!");
//             console.log("👤 User ID:", userId);
//             console.log("📧 User Email:", authData.user.email);
//             console.log("🔑 Session exists:", !!authData.session);

//             if (!userId) {
//                 console.error("❌ User ID is null or undefined!");
//                 throw new Error("Authentication succeeded but user ID is missing");
//             }

//             // Step 2: Check user existence in profiles table
//             console.log("🔍 Checking profiles table for user ID:", userId);
//             console.log("📡 Supabase client:", supabase ? "Available" : "Not available");

//             const { data: profile, error: profileError } = await supabase
//                 .from("profiles")
//                 .select("role, email, created_at")
//                 .eq("id", userId)
//                 .single();

//             console.log("📊 Profiles table query result:", {
//                 hasProfile: !!profile,
//                 profileData: profile,
//                 profileError: profileError,
//                 errorCode: profileError?.code,
//                 errorMessage: profileError?.message
//             });

//             // ... rest of your code

//         } catch (err) {
//             console.error("💥 CATCH BLOCK - Login error details:", {
//                 name: err.name,
//                 message: err.message,
//                 stack: err.stack,
//                 fullError: JSON.stringify(err, Object.getOwnPropertyNames(err))
//             });

//             setError(err.message || "Failed to login. Please check your credentials and try again.");
//             setLoading(false);

//             // Sign out if auth succeeded but profile failed
//             try {
//                 console.log("🔄 Attempting to sign out due to error...");
//                 await supabase.auth.signOut();
//                 console.log("✅ Signed out successfully");
//             } catch (signOutErr) {
//                 console.error("⚠️ Error during sign out:", signOutErr);
//             }

//             // Clear any localStorage items
//             localStorage.removeItem('userRole');
//             localStorage.removeItem('userEmail');
//             localStorage.removeItem('userId');
//         }
//     };

//     const togglePasswordVisibility = () => {
//         setShowPassword(!showPassword);
//         console.log("👁️ Password visibility toggled:", !showPassword);
//     };

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
//             <div className="absolute inset-0 bg-black opacity-30"></div>

//             <div className="relative card max-w-md w-full">
//                 {/* Logo */}
//                 <div className="text-center mb-8">
//                     <div className="inline-block">
//                         <Link to="/" className="flex items-center space-x-2">
//                             <div className="w-12 h-12 bg-primary-yellow rounded-lg flex items-center justify-center">
//                                 <span className="text-primary-dark font-bold text-2xl">H1B</span>
//                             </div>
//                             <span className="font-bold text-xl text-primary-dark">H1B Wage Level</span>
//                         </Link>
//                     </div>
//                 </div>

//                 <h1 className="text-2xl font-bold text-primary-dark mb-6 text-center">
//                     Login to H1B Wage Level
//                 </h1>

//                 {error && (
//                     <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
//                         <p className="text-red-600 font-medium text-center">
//                             {error}
//                         </p>
//                         <p className="text-red-500 text-sm text-center mt-1">
//                             Check console for detailed error logs
//                         </p>
//                     </div>
//                 )}

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     {/* Email */}
//                     <div>
//                         <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
//                             Email Address
//                         </label>
//                         <div className="relative">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <Mail className="h-5 w-5 text-gray-400" />
//                             </div>
//                             <input
//                                 id="email"
//                                 type="email"
//                                 placeholder="email@example.com"
//                                 value={email}
//                                 onChange={(e) => setEmail(e.target.value)}
//                                 required
//                                 className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
//                                 aria-label="Email address"
//                             />
//                         </div>
//                     </div>

//                     {/* Password */}
//                     <div>
//                         <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
//                             Password
//                         </label>
//                         <div className="relative">
//                             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                                 <Lock className="h-5 w-5 text-gray-400" />
//                             </div>
//                             <input
//                                 id="password"
//                                 type={showPassword ? "text" : "password"}
//                                 placeholder="Enter your password"
//                                 value={password}
//                                 onChange={(e) => setPassword(e.target.value)}
//                                 required
//                                 className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
//                                 aria-label="Password"
//                             />
//                             <button
//                                 type="button"
//                                 onClick={togglePasswordVisibility}
//                                 className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
//                                 aria-label={showPassword ? "Hide password" : "Show password"}
//                             >
//                                 {showPassword ? (
//                                     <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                                 ) : (
//                                     <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
//                                 )}
//                             </button>
//                         </div>
//                         <div className="mt-2 text-right">
//                             <Link to="/forgot-password" className="text-sm text-accent-blue hover:underline">
//                                 Forgot password?
//                             </Link>
//                         </div>
//                     </div>

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed py-3"
//                     >
//                         {loading ? (
//                             <>
//                                 <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                                 <span>Logging in...</span>
//                             </>
//                         ) : (
//                             <span>Continue to Dashboard</span>
//                         )}
//                     </button>
//                 </form>

//                 <div className="mt-8 pt-6 border-t border-gray-200">
//                     <div className="text-center">
//                         <p className="text-gray-600">
//                             Don't have an account?{' '}
//                             <Link to="/signup" className="text-accent-blue font-semibold hover:underline">
//                                 Sign up now
//                             </Link>
//                         </p>
//                     </div>

//                     {/* Debug info - Only in development */}
//                     {process.env.NODE_ENV === 'development' && (
//                         <div className="mt-4 p-3 bg-gray-100 rounded-lg">
//                             <p className="text-xs text-gray-600 text-center">
//                                 🔍 Check browser console for detailed login logs
//                             </p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Login;|




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
            navigate("/dashboard", { replace: true });


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
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black opacity-30"></div>

            <div className="relative card max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-block">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-12 h-12 bg-primary-dark rounded-lg flex items-center justify-center">
                                <span className="text-primary-white font-bold text-2xl">H1B</span>
                            </div>
                            <span className="font-bold text-xl text-primary-dark">Wage Level</span>
                        </Link>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-primary-dark mb-6 text-center">
                    Login to H1B Wage Level
                </h1>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <p className="text-red-600 font-medium text-center">
                            {error}
                        </p>
                        <p className="text-red-500 text-sm text-center mt-1">
                            Check console for detailed error logs
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                                aria-label="Email address"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent"
                                aria-label="Password"
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                ) : (
                                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                )}
                            </button>
                        </div>
                        <div className="mt-2 text-right">
                            <Link to="/forgot-password" className="text-sm text-accent-blue hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed py-3"
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

                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-accent-blue font-semibold hover:underline">
                                Sign up now
                            </Link>
                        </p>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                            <p className="text-xs text-gray-600 text-center">
                                🔍 Check browser console for detailed login logs
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
