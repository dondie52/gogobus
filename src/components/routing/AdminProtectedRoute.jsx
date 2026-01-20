import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { logWarn } from '../../utils/logger';

/**
 * AdminProtectedRoute - Protects admin routes
 * Only allows access to users with 'admin' role
 */
const AdminProtectedRoute = ({ children }) => {
  const { user, userProfile, isAdmin, loading } = useAuth();
  const [profileLoadTimeout, setProfileLoadTimeout] = React.useState(false);

  // #region agent log
  React.useEffect(() => {
  }, [user, userProfile, isAdmin, loading, profileLoadTimeout]);
  // #endregion

  // Track when profile loading should be attempted and set timeout
  React.useEffect(() => {
    if (user && !loading) {
      // Set timeout after 3 seconds if profile is still null
      const timeoutId = setTimeout(() => {
        if (userProfile === null) {
          // #region agent log
          // #endregion
          setProfileLoadTimeout(true);
        }
      }, 3000);
      
      return () => clearTimeout(timeoutId);
    } else {
      setProfileLoadTimeout(false);
    }
  }, [user, loading, userProfile]);

  if (loading) {
    // #region agent log
    // #endregion
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // #region agent log
    // #endregion
    return <Navigate to="/login" replace />;
  }

  // Wait for profile to load, but with timeout
  // userProfile will be null if:
  // 1. Still loading (initial state)
  // 2. Profile doesn't exist (getProfile returns null for PGRST116)
  // We need to distinguish between these cases
  if (userProfile === null && user && !profileLoadTimeout) {
    // #region agent log
    // #endregion
    // Wait a bit for profile to load, but show loading state
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column', gap: '16px' }}>
        <LoadingSpinner size="large" />
        <p style={{ color: '#666', fontSize: '14px' }}>Loading admin profile...</p>
      </div>
    );
  }

  // If timeout occurred, redirect (profile likely doesn't exist)
  if (profileLoadTimeout && userProfile === null) {
    // #region agent log
    // #endregion
    return <Navigate to="/home" replace />;
  }

  // If profile exists but role is not admin, redirect
  if (userProfile && userProfile.role !== 'admin') {
    // #region agent log
    // #endregion
    logWarn('User is not admin. Role:', userProfile.role);
    return <Navigate to="/home" replace />;
  }

  // Final check using isAdmin flag
  if (!isAdmin) {
    // #region agent log
    // #endregion
    logWarn('isAdmin check failed. userProfile:', userProfile);
    return <Navigate to="/home" replace />;
  }

  // #region agent log
  // #endregion
  return children;
};

export default AdminProtectedRoute;
