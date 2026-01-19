// //src/hooks/useAuth.js
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";

// const AuthContext = createContext({
//   user: null,
//   role: null,
//   loading: true,
//   signOut: async () => { },
// });

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchUserRole = async (userId, email) => {
//     try {
//       let { data, error } = await supabase
//         .from("profiles")
//         .select("role")
//         .eq("id", userId)
//         .single();

//       if (error?.code === 'PGRST116') { // No rows returned
//         // Create default profile
//         const { data: newProfile, error: createError } = await supabase
//           .from("profiles")
//           .insert([{
//             id: userId,
//             email: email,
//             role: "user", // Default role
//             created_at: new Date().toISOString()
//           }])
//           .select()
//           .single();

//         if (createError) throw createError;

//         setRole(newProfile.role);
//       } else if (error) {
//         throw error;
//       } else {
//         setRole(data?.role || "user");
//       }
//     } catch (err) {
//       console.error("Error in fetchUserRole:", err);
//       setRole("user");
//     }
//   };

//   const signOut = async () => {
//     console.log("🚨 SignOut called from AuthContext");
//     try {
//       // Clear state immediately for instant UI feedback
//       setUser(null);
//       setRole(null);

//       // Then sign out from Supabase
//       const { error } = await supabase.auth.signOut();

//       if (error) {
//         console.error("Supabase signOut error:", error);
//       } else {
//         console.log("✅ Successfully signed out");
//       }
//     } catch (err) {
//       console.error("SignOut exception:", err);
//     }
//   };

//   useEffect(() => {
//     // Get initial session
//     const getSession = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();

//         if (session?.user) {
//           setUser(session.user);
//           await fetchUserRole(session.user.email, session.user.id);
//         } else {
//           setUser(null);
//           setRole(null);
//         }
//       } catch (error) {
//         console.error("Error checking auth:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     getSession();

//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
//       console.log("Auth state changed:", event);

//       if (event === 'SIGNED_OUT' || !session) {
//         console.log("User signed out, clearing state");
//         setUser(null);
//         setRole(null);
//         setLoading(false);
//         return;
//       }

//       if (session?.user) {
//         setUser(session.user);
//         await fetchUserRole(session.user.email, session.user.id);
//       }
//       setLoading(false);
//     });

//     return () => subscription.unsubscribe();
//   }, []);

//   const value = {
//     user,
//     role,
//     isAdmin: role === "admin",
//     loading,
//     signOut,
//   };

//   // Use React.createElement instead of JSX
//   return React.createElement(AuthContext.Provider, { value }, children);
// }

// export default function useAuth() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// }



// // src/hooks/useAuth.js
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { supabase } from "../supabaseClient";

// const AuthContext = createContext({
//   user: null,
//   role: null,
//   loading: true,
//   signOut: async () => { },
// });

// export function AuthProvider({ children }) {
//   const [user, setUser] = useState(null);
//   const [role, setRole] = useState(localStorage.getItem("userRole") || null);
//   const [loading, setLoading] = useState(true);
//   const [loggingOut, setLoggingOut] = useState(false);

//   // Helper: load profile.role for a user
//   const loadUserRole = async (userObj) => {
//     if (!userObj) {
//       setRole(null);
//       localStorage.removeItem("userRole"); // maintain consistency
//       return;
//     }

//     try {
//       console.log("📡 Querying profiles table for user:", userObj.id);

//       // Add timeout to prevent infinite loading
//       const timeoutPromise = new Promise((_, reject) =>
//         setTimeout(() => reject(new Error("Query timeout")), 5000)
//       );

//       const queryPromise = supabase
//         .from("profiles")
//         .select("role")
//         .eq("id", userObj.id)
//         .single();

//       const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]);

//       if (error) {
//         // PGRST116 is the error for "The result contains 0 rows" when using .single()
//         if (error.code === 'PGRST116') {
//           console.warn("ℹ️ Profile not found (PGRST116). Defaulting to 'user' role.");
//           setRole("user");
//           localStorage.setItem("userRole", "user");
//         } else {
//           console.error("❌ Error loading profile role:", error.message);
//           setRole("user");
//           localStorage.setItem("userRole", "user");
//         }
//       } else {
//         const userRole = profile?.role || "user";
//         console.log("✅ Profile loaded successfully! Role:", userRole);
//         setRole(userRole);
//         localStorage.setItem("userRole", userRole);
//       }
//     } catch (err) {
//       console.error("💥 Unexpected error loading profile role:", err);
//       console.warn("⚠️ Defaulting to 'user' role due to error");
//       setRole("user");
//       localStorage.setItem("userRole", "user");
//     }
//   };

//   // On first load, get existing session
//   useEffect(() => {
//     const init = async () => {
//       try {
//         const {
//           data: { session },
//           error,
//         } = await supabase.auth.getSession();

//         if (error) {
//           console.error("Error getting session:", error.message);
//         }

//         // Force fresh user fetch so Supabase doesn't use cached stale data
//         const { data: freshUser } = await supabase.auth.getUser();

//         if (freshUser?.user) {
//           setUser(freshUser.user);
//           await loadUserRole(freshUser.user);
//         } else if (session?.user) {
//           // fallback if freshUser fails
//           setUser(session.user);
//           await loadUserRole(session.user);
//         } else {
//           setUser(null);
//           setRole(null);
//         }

//       } catch (err) {
//         console.error("Unexpected error during auth init:", err);
//         setUser(null);
//         setRole(null);
//       } finally {
//         setLoading(false);
//       }
//     };

//     init();

//     // Listen for login/logout changes
//     const {
//       data: { subscription },
//     } = supabase.auth.onAuthStateChange(async (_event, session) => {
//       console.log("🔔 Auth change event:", _event);
//       console.log("📝 Session exists:", !!session);

//       if (session?.user) {
//         console.log("👤 Setting user:", session.user.email);
//         setUser(session.user);
//         console.log("🔄 Loading user role...");
//         await loadUserRole(session.user);
//         console.log("✅ Role loaded, setting loading to false");
//       } else {
//         console.log("🚫 No session, clearing user and role");
//         setUser(null);
//         setRole(null);
//       }
//       setLoading(false);
//       console.log("⏹️ Loading state set to false");
//     });

//     return () => {
//       subscription.unsubscribe();
//     };
//   }, []);

//   const signOut = async () => {
//     console.log("🚨 SignOut called from AuthContext");
//     setLoggingOut(true);
//     try {
//       // Clear state immediately for instant UI feedback
//       setUser(null);
//       setRole(null);

//       // Clear localStorage immediately
//       localStorage.removeItem("userRole");
//       localStorage.removeItem("userId");
//       localStorage.removeItem("userEmail");

//       // Then sign out from Supabase
//       const { error } = await supabase.auth.signOut();

//       if (error) {
//         console.error("❌ Supabase signOut error:", error);
//         throw error;
//       } else {
//         console.log("✅ Successfully signed out from Supabase");
//       }
//     } catch (err) {
//       console.error("💥 SignOut exception:", err);
//       // Even if there's an error, ensure state is cleared
//       setUser(null);
//       setRole(null);
//       localStorage.clear();
//     } finally {
//       setLoggingOut(false);
//     }
//   };

//   const value = {
//     user,
//     role,
//     loading,
//     loggingOut,
//     signOut,
//   };

//   // Use React.createElement instead of JSX
//   return React.createElement(AuthContext.Provider, { value }, children);
// }

// export default function useAuth() {
//   const ctx = useContext(AuthContext);
//   if (ctx === undefined) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return ctx;
// }



// src/hooks/useAuth.js
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext({
  user: null,
  role: null,
  subscriptionExpired: false,
  subscriptionEndDate: null,
  checkingSub: true,
  loading: true,
  refresh: async () => { },
  signOut: async () => { },
});

// Cache for user roles to prevent redundant DB queries
const roleCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(() => {
    // Initialize from localStorage immediately
    const storedRole = localStorage.getItem("userRole");
    return storedRole || null;
  });
  const [subscriptionExpired, setSubscriptionExpired] = useState(false);
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(null);
  const [checkingSub, setCheckingSub] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const isInitialLoad = useRef(true);
  const hasProfileQueryRun = useRef(false);

  // Helper: load profile.role for a user with caching
  const loadUserRole = async (userObj) => {
    if (!userObj) {
      setRole(null);
      localStorage.removeItem("userRole");
      return;
    }

    const userId = userObj.id;

    // Check cache first
    const cachedData = roleCache.get(userId);
    if (cachedData && (Date.now() - cachedData.timestamp) < CACHE_DURATION) {
      console.log("✅ Using cached role & sub status:", cachedData.role);
      setRole(cachedData.role);
      setSubscriptionExpired(cachedData.subscriptionExpired);
      setSubscriptionEndDate(cachedData.subscriptionEndDate);
      setCheckingSub(false);
      localStorage.setItem("userRole", cachedData.role);
      return;
    }

    // Check localStorage as fallback (but still verify with DB)
    const storedRole = localStorage.getItem("userRole");
    if (storedRole && isInitialLoad.current) {
      console.log("📝 Using localStorage role temporarily:", storedRole);
      setRole(storedRole);
    }

    // Prevent duplicate queries
    if (hasProfileQueryRun.current && userId === user?.id) {
      console.log("⏭️ Skipping duplicate profile query");
      return;
    }

    hasProfileQueryRun.current = true;

    try {
      console.log("📡 Querying profiles table for user:", userId);

      // Remove timeout - let Supabase handle its own timeout
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role, updated_at, created_at, subscription_end_date")
        .eq("id", userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid PGRST116 error

      if (error) {
        console.error("❌ Error loading profile role:", error.message);

        // Only default to 'user' if we don't have a stored role
        if (!storedRole) {
          console.warn("⚠️ Defaulting to 'user' role due to error");
          setRole("user");
          setSubscriptionExpired(false);
          localStorage.setItem("userRole", "user");
          roleCache.set(userId, { role: "user", subscriptionExpired: false, timestamp: Date.now() });
        }
      } else if (profile) {
        const userRole = profile?.role || "user";
        const isAdmin = userRole === "admin";

        // Calculate subscription status
        let isExpired = false;
        let endDate = null;

        console.log("🔍 RAW DB DATA:", {
          subscription_end_date: profile.subscription_end_date,
          created_at: profile.created_at,
          role: userRole,
          isAdmin: isAdmin
        });

        if (!isAdmin) {
          if (profile.subscription_end_date) {
            endDate = new Date(profile.subscription_end_date);
            const now = new Date();
            isExpired = now > endDate;

            console.log("⏰ DATE COMPARISON:", {
              dbDate: profile.subscription_end_date,
              parsedEndDate: endDate.toISOString(),
              currentTime: now.toISOString(),
              isNowGreaterThanEnd: now > endDate,
              millisecondsDiff: now.getTime() - endDate.getTime()
            });
          } else {
            // If no subscription date exists, user is considered expired/no-access
            isExpired = true;
            console.log("❌ NO SUBSCRIPTION DATE - User marked as EXPIRED");
          }
        } else {
          console.log("👑 ADMIN USER - Bypassing expiry check");
        }

        console.log("📊 FINAL ACCESS DECISION:", {
          user: profile.email || userId,
          role: userRole,
          isAdmin: isAdmin,
          expiryDate: endDate ? endDate.toISOString() : "None",
          isExpired: isExpired,
          willSeeLinks: !isExpired || isAdmin
        });

        // Update state and cache
        setRole(userRole);
        setSubscriptionExpired(isExpired);
        setSubscriptionEndDate(endDate);
        localStorage.setItem("userRole", userRole);
        roleCache.set(userId, {
          role: userRole,
          subscriptionExpired: isExpired,
          subscriptionEndDate: endDate,
          timestamp: Date.now(),
          updatedAt: profile.updated_at
        });
      } else {
        // No profile found - USER SHOULD BE BLOCKED
        console.warn("📭 No profile found for user - MARKING AS EXPIRED");
        const defaultRole = "user";
        setRole(defaultRole);
        setSubscriptionExpired(true);  // ✅ FIX: No profile = No access
        setSubscriptionEndDate(null);
        localStorage.setItem("userRole", defaultRole);
        roleCache.set(userId, {
          role: defaultRole,
          subscriptionExpired: true,  // ✅ FIX: Block access
          subscriptionEndDate: null,
          timestamp: Date.now()
        });
      }
    } catch (err) {
      console.error("💥 Unexpected error loading profile role:", err);
      if (!storedRole) {
        setRole("user");
        setSubscriptionExpired(true);  // ✅ FIX: Error = No access
        setSubscriptionEndDate(null);
        localStorage.setItem("userRole", "user");
        roleCache.set(userId, {
          role: "user",
          subscriptionExpired: true,  // ✅ FIX: Block access on error
          subscriptionEndDate: null,
          timestamp: Date.now()
        });
      }
    } finally {
      isInitialLoad.current = false;
      setCheckingSub(false);
    }
  };

  // On first load, get existing session
  useEffect(() => {
    let isMounted = true;
    let initTimeout;

    const init = async () => {
      try {
        console.log("🚀 Auth initialization started");

        // Set a loading timeout to prevent infinite loading
        initTimeout = setTimeout(() => {
          if (isMounted && loading) {
            console.warn("⚠️ Auth init taking too long, using localStorage fallback");
            const storedRole = localStorage.getItem("userRole");
            if (storedRole && !role) {
              setRole(storedRole);
            }
            setLoading(false);
          }
        }, 3000); // 3 second timeout

        // Get session and user in parallel for faster load
        const [sessionPromise, userPromise] = await Promise.allSettled([
          supabase.auth.getSession(),
          supabase.auth.getUser()
        ]);

        let currentUser = null;

        // Prefer fresh user data, fallback to session
        if (userPromise.status === 'fulfilled' && userPromise.value?.data?.user) {
          currentUser = userPromise.value.data.user;
        } else if (sessionPromise.status === 'fulfilled' && sessionPromise.value?.data?.session?.user) {
          currentUser = sessionPromise.value.data.session.user;
        }

        if (currentUser && isMounted) {
          console.log("👤 User found:", currentUser.email);
          setUser(currentUser);

          // Load role but don't wait for it to finish before setting loading to false
          loadUserRole(currentUser).finally(() => {
            if (isMounted) {
              clearTimeout(initTimeout);
              setLoading(false);
            }
          });
        } else {
          console.log("🚫 No user found");
          if (isMounted) {
            clearTimeout(initTimeout);
            setUser(null);
            setRole(null);
            setLoading(false);
            setCheckingSub(false);
          }
        }

      } catch (err) {
        console.error("💥 Error during auth init:", err);
        if (isMounted) {
          clearTimeout(initTimeout);
          setLoading(false);
          setCheckingSub(false);
        }
      }
    };

    init();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      console.log("🔔 Auth change event:", event);

      switch (event) {
        case 'SIGNED_OUT':
          console.log("🚫 User signed out");
          setUser(null);
          setRole(null);
          localStorage.removeItem("userRole");
          roleCache.clear();
          hasProfileQueryRun.current = false;
          break;

        case 'SIGNED_IN':
        case 'USER_UPDATED':
        case 'TOKEN_REFRESHED':
          if (session?.user) {
            console.log("🔄 Auth event:", event, "for user:", session.user.email);
            setUser(session.user);
            // Load role in background without blocking
            setTimeout(() => loadUserRole(session.user), 100);
          }
          break;

        default:
          console.log("ℹ️ Unhandled auth event:", event);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      subscription?.unsubscribe();
    };
  }, []);

  const refresh = async () => {
    if (user) {
      console.log("🔄 Manually refreshing auth for:", user.email);
      roleCache.delete(user.id);
      hasProfileQueryRun.current = false;
      await loadUserRole(user);
    }
  };

  const signOut = async () => {
    console.log("🚨 SignOut called from AuthContext");
    setLoggingOut(true);
    try {
      // Clear cache and storage first for immediate UI feedback
      roleCache.clear();
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");

      // Update state
      setUser(null);
      setRole(null);
      hasProfileQueryRun.current = false;

      // Sign out from Supabase (fire and forget)
      supabase.auth.signOut().catch(err => {
        console.error("❌ Supabase signOut error:", err);
      });

      console.log("✅ Signed out successfully");
    } catch (err) {
      console.error("💥 SignOut exception:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  const value = {
    user,
    role,
    isAdmin: role === "admin",
    subscriptionExpired,
    subscriptionEndDate,
    checkingSub,
    loading,
    loggingOut,
    refresh,
    signOut,
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}