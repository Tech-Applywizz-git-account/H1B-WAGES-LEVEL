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



// src/hooks/useAuth.js
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthContext = createContext({
  user: null,
  role: null,
  loading: true,
  signOut: async () => { },
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Helper: load profile.role for a user
  const loadUserRole = async (userObj) => {
    if (!userObj) {
      setRole(null);
      return;
    }

    try {
      console.log("📡 Querying profiles table for user:", userObj.id);

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Query timeout")), 5000)
      );

      const queryPromise = supabase
        .from("profiles")
        .select("role")
        .eq("id", userObj.id)
        .single();

      const { data: profile, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        // PGRST116 is the error for "The result contains 0 rows" when using .single()
        if (error.code === 'PGRST116') {
          console.warn("ℹ️ Profile not found (PGRST116). Defaulting to 'user' role.");
          setRole("user");
        } else {
          console.error("❌ Error loading profile role:", error.message);
          setRole("user");
        }
      } else {
        const userRole = profile?.role || "user";
        console.log("✅ Profile loaded successfully! Role:", userRole);
        setRole(userRole);
      }
    } catch (err) {
      console.error("💥 Unexpected error loading profile role:", err);
      console.warn("⚠️ Defaulting to 'user' role due to error");
      setRole("user");
    }
  };

  // On first load, get existing session
  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error.message);
        }

        // Force fresh user fetch so Supabase doesn't use cached stale data
        const { data: freshUser } = await supabase.auth.getUser();

        if (freshUser?.user) {
          setUser(freshUser.user);
          await loadUserRole(freshUser.user);
        } else if (session?.user) {
          // fallback if freshUser fails
          setUser(session.user);
          await loadUserRole(session.user);
        } else {
          setUser(null);
          setRole(null);
        }

      } catch (err) {
        console.error("Unexpected error during auth init:", err);
        setUser(null);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    init();

    // Listen for login/logout changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("🔔 Auth change event:", _event);
      console.log("📝 Session exists:", !!session);

      if (session?.user) {
        console.log("👤 Setting user:", session.user.email);
        setUser(session.user);
        console.log("🔄 Loading user role...");
        await loadUserRole(session.user);
        console.log("✅ Role loaded, setting loading to false");
      } else {
        console.log("🚫 No session, clearing user and role");
        setUser(null);
        setRole(null);
      }
      setLoading(false);
      console.log("⏹️ Loading state set to false");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("🚨 SignOut called from AuthContext");
    setLoggingOut(true);
    try {
      // Clear state immediately for instant UI feedback
      setUser(null);
      setRole(null);

      // Clear localStorage immediately
      localStorage.removeItem("userRole");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");

      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("❌ Supabase signOut error:", error);
        throw error;
      } else {
        console.log("✅ Successfully signed out from Supabase");
      }
    } catch (err) {
      console.error("💥 SignOut exception:", err);
      // Even if there's an error, ensure state is cleared
      setUser(null);
      setRole(null);
      localStorage.clear();
    } finally {
      setLoggingOut(false);
    }
  };

  const value = {
    user,
    role,
    loading,
    loggingOut,
    signOut,
  };

  // Use React.createElement instead of JSX
  return React.createElement(AuthContext.Provider, { value }, children);
}

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
