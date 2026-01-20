import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { logError } from '../utils/logger';
import { setUser as setSentryUser, clearUser } from '../utils/sentry';
import { initTokenRefresh } from '../utils/security';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  // Fetch user profile when user changes
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:25',message:'AuthContext profile useEffect triggered',data:{userId:user?.id,userEmail:user?.email,userRef:user?JSON.stringify(user):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const fetchProfile = async (userId) => {
      if (!userId) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:29',message:'No userId provided, clearing profile',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setUserProfile(null);
        return;
      }

      try {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:35',message:'Fetching profile in AuthContext',data:{userId:userId,userEmail:user?.email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        const profile = await profileService.getProfile(userId);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:39',message:'Profile fetched in AuthContext',data:{profileExists:!!profile,role:profile?.role,isAdmin:profile?.role==='admin',profileData:profile?{id:profile.id,email:profile.email,role:profile.role}:null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        setUserProfile(profile);
        // Set Sentry user context (only update if full_name changed to prevent infinite loop)
        if (profile && user) {
          // Only update React user state if full_name actually changed
          const newFullName = profile.full_name || '';
          const currentFullName = user.full_name || '';
          if (newFullName !== currentFullName) {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:48',message:'Updating user state - full_name changed',data:{currentFullName:currentFullName,newFullName:newFullName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:54',message:'Error fetching profile in AuthContext',data:{userId:userId,error:error.message,errorCode:error.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
        // #endregion
        logError('Error fetching user profile', error);
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
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:84',message:'AuthContext initializing - getting session',data:{url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Get initial session
    authService.getSession().then((session) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:88',message:'Initial session retrieved',data:{hasSession:!!session,hasUser:!!session?.user,userId:session?.user?.id,expiresAt:session?.expires_at,url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:95',message:'Auth state change event',data:{event:event,hasSession:!!session,hasUser:!!session?.user,userId:session?.user?.id,expiresAt:session?.expires_at,url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
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
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:83',message:'AuthContext.login called',data:{email:email},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    const { user: authUser, session: authSession } = await authService.signIn(email, password);
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthContext.jsx:86',message:'AuthContext.login completed, setting user',data:{email:email,userId:authUser?.id,hasUser:!!authUser},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
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
