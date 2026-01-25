import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { logError } from '../utils/logger';
import { setUser as setSentryUser, clearUser } from '../utils/sentry';
import { initTokenRefresh } from '../utils/security';
import { supabase } from '../services/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:18',message:'AuthProvider initializing',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Fetch user profile when user changes
  useEffect(() => {
    // #region agent log
    // #endregion
    const fetchProfile = async (userId) => {
      if (!userId) {
        // #region agent log
        // #endregion
        setUserProfile(null);
        return;
      }

      try {
        // #region agent log
        // #endregion
        const profile = await profileService.getProfile(userId);
        // #region agent log
        // #endregion
        setUserProfile(profile);
        // Set Sentry user context (only update if full_name changed to prevent infinite loop)
        if (profile && user) {
          // Only update React user state if full_name actually changed
          const newFullName = profile.full_name || '';
          const currentFullName = user.full_name || '';
          if (newFullName !== currentFullName) {
            // #region agent log
            // #endregion
            setUser({
              ...user,
              full_name: newFullName,
            });
          }
          // Always update Sentry context (separate from React state)
          setSentryUser({
            id: user.id,
            email: user.email,
            full_name: profile.full_name,
          });
        }
      } catch (error) {
        // #region agent log
        // #endregion
        
        // Distinguish between "profile doesn't exist" (expected for new users) vs actual errors
        if (error.code === 'PGRST116' || error.message?.includes('No rows')) {
          // Profile doesn't exist - expected for new users, not an error
          // Use console.debug instead of console.log for expected behaviors
          console.debug('Profile not found - new user');
        } else {
          // Actual error - log it
          logError('Error fetching user profile', error);
        }
        setUserProfile(null);
      }
    };

    if (user?.id) {
      fetchProfile(user.id);
    } else {
      setUserProfile(null);
    }
  }, [user]);

  useEffect(() => {
    // Get initial session
    authService.getSession().then((session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Initialize automatic token refresh with rotation
    const cleanupTokenRefresh = initTokenRefresh();

    return () => {
      subscription.unsubscribe();
      if (cleanupTokenRefresh) {
        cleanupTokenRefresh();
      }
    };
  }, []);

  const login = async (email, password) => {
    // #region agent log
    // #endregion
    const { user: authUser, session: authSession } = await authService.signIn(email, password);
    // #region agent log
    // #endregion
    setUser(authUser);
    setSession(authSession);
    return { user: authUser, session: authSession };
  };

  const signup = async (email, password, metadata = {}) => {
    const { user: authUser, session: authSession } = await authService.signUp(email, password, metadata);
    setUser(authUser);
    setSession(authSession);
    return { user: authUser, session: authSession };
  };

  const logout = async () => {
    await authService.signOut();
    clearUser(); // Clear Sentry user context
    setUser(null);
    setUserProfile(null);
    setSession(null);
  };

  const signInWithProvider = async (provider) => {
    await authService.signInWithProvider(provider);
  };

  const sendOTP = async (email) => {
    return await authService.sendOTP(email);
  };

  const verifyOTP = async (email, token) => {
    const { user: authUser, session: authSession } = await authService.verifyOTP(email, token);
    setUser(authUser);
    setSession(authSession);
    return { user: authUser, session: authSession };
  };

  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  const updatePassword = async (newPassword) => {
    return await authService.updatePassword(newPassword);
  };

  const resendVerificationEmail = async (email) => {
    return await authService.resendVerificationEmail(email);
  };

  const value = {
    user,
    userProfile,
    session,
    loading,
    login,
    signup,
    logout,
    signInWithProvider,
    sendOTP,
    verifyOTP,
    resetPassword,
    updatePassword,
    resendVerificationEmail,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === 'admin',
    isEmailVerified: !!user?.email_confirmed_at,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
