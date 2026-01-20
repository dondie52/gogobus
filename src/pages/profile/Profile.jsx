import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileMenu from '../../components/profile/ProfileMenu';
import EditProfile from './EditProfile';
import Rewards from './Rewards';
import Wallet from './Wallet';
import SavedRoutes from './SavedRoutes';
import TravelPreferences from './TravelPreferences';
import EmergencyContacts from './EmergencyContacts';
import Settings from './Settings';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { logError } from '../../utils/logger';
import styles from './Profile.module.css';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Profile.jsx:25',message:'Profile useEffect triggered',data:{userId:user?.id,userEmail:user?.email,userRef:user?JSON.stringify(user):null},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    const loadProfile = async () => {
      if (!user?.id) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Profile.jsx:28',message:'No user id, navigating to login',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        navigate('/login');
        return;
      }

      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Profile.jsx:33',message:'Setting loading to true',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
      setLoading(true);
      try {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Profile.jsx:36',message:'Calling profileService.getProfile',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        const profile = await profileService.getProfile(user.id);
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Profile.jsx:38',message:'Profile loaded successfully',data:{userId:user.id,hasProfile:!!profile,profileId:profile?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        setUserProfile(profile);
      } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Profile.jsx:41',message:'Error loading profile',data:{userId:user.id,errorMessage:error?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        logError('Failed to load profile', error);
      } finally {
        // #region agent log
        fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Profile.jsx:44',message:'Setting loading to false',data:{userId:user.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        setLoading(false);
        setTimeout(() => setIsLoaded(true), 100);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/get-started');
    } catch (error) {
      logError('Logout failed', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <div className={styles.loadingAvatar}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
            </svg>
          </div>
          <LoadingSpinner size="medium" />
          <p className={styles.loadingText}>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.profileScreen} ${isLoaded ? styles.loaded : ''}`}>
      <Routes>
        <Route
          path="/"
          element={
            <>
              {/* Profile Hero Section */}
              <div className={styles.profileHero}>
                <div className={styles.heroBackground}>
                  <div className={styles.heroPattern}></div>
                </div>
                
                <div className={styles.heroContent}>
                  <button 
                    className={styles.backButton}
                    onClick={() => {
                      // Go back in history, or to home if no history
                      if (window.history.length > 1) {
                        navigate(-1);
                      } else {
                        navigate('/home');
                      }
                    }}
                    aria-label="Go back"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                  
                  <h1 className={styles.heroTitle}>My Profile</h1>
                  
                  <button 
                    className={styles.settingsButton}
                    onClick={() => navigate('/profile/settings')}
                    aria-label="Go to settings"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                      <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74493 20.1656 6.23584 20.3766 5.705 20.3766C5.17416 20.3766 4.66507 20.1656 4.29 19.79C3.91445 19.4149 3.70343 18.9058 3.70343 18.375C3.70343 17.8442 3.91445 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95235 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87235 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83445 6.74493 3.62343 6.23584 3.62343 5.705C3.62343 5.17416 3.83445 4.66507 4.21 4.29C4.58507 3.91445 5.09416 3.70343 5.625 3.70343C6.15584 3.70343 6.66493 3.91445 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95235 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87235 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83445 17.7642 3.62343 18.295 3.62343C18.8258 3.62343 19.3349 3.83445 19.71 4.21C20.0856 4.58507 20.2966 5.09416 20.2966 5.625C20.2966 6.15584 20.0856 6.66493 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Profile Card */}
              <div className={styles.profileCard}>
                <div className={styles.avatarSection}>
                  <div className={styles.avatarWrapper}>
                    {userProfile?.avatar_url ? (
                      <img 
                        src={userProfile.avatar_url} 
                        alt="Profile" 
                        className={styles.avatar}
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {userProfile?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <button 
                      className={styles.editAvatarBtn}
                      onClick={() => navigate('/profile/edit')}
                      aria-label="Edit profile photo"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M12 20H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M16.5 3.50001C16.8978 3.10219 17.4374 2.87869 18 2.87869C18.2786 2.87869 18.5544 2.93356 18.8118 3.04017C19.0692 3.14677 19.303 3.30303 19.5 3.50001C19.697 3.697 19.8532 3.93085 19.9598 4.18822C20.0665 4.44559 20.1213 4.72144 20.1213 5.00001C20.1213 5.27859 20.0665 5.55444 19.9598 5.81181C19.8532 6.06918 19.697 6.30303 19.5 6.50001L7 19L3 20L4 16L16.5 3.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  <div className={styles.userInfo}>
                    <h2 className={styles.userName}>{userProfile?.full_name || 'User'}</h2>
                    <p className={styles.userEmail}>{user?.email}</p>
                    {userProfile?.phone && (
                      <p className={styles.userPhone}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M22 16.92V19.92C22 20.4704 21.5504 21 21 21H20C14.477 21 10 16.523 10 11V10C10 9.44957 10.5496 9 11.1 9H14.1C14.6504 9 15.1 9.44957 15.1 10C15.1 10.8267 15.2733 11.6133 15.6 12.32L14.8 13.12C14.4134 13.5066 14.4134 14.1334 14.8 14.52L16.48 16.2C16.8666 16.5866 17.4934 16.5866 17.88 16.2L18.68 15.4C19.3867 15.7267 20.1733 15.9 21 15.9C21.5504 15.9 22 16.3496 22 16.9V16.92Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {userProfile.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stats Row */}
                <div className={styles.statsRow}>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{userProfile?.trips_count || 0}</span>
                    <span className={styles.statLabel}>Trips</span>
                  </div>
                  <div className={styles.statDivider}></div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{userProfile?.reward_points || 0}</span>
                    <span className={styles.statLabel}>Points</span>
                  </div>
                  <div className={styles.statDivider}></div>
                  <div className={styles.statItem}>
                    <span className={styles.statValue}>{userProfile?.saved_routes_count || 0}</span>
                    <span className={styles.statLabel}>Saved</span>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <button 
                  className={styles.editProfileBtn}
                  onClick={() => navigate('/profile/edit')}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 20H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16.5 3.50001C16.8978 3.10219 17.4374 2.87869 18 2.87869C18.5626 2.87869 19.1022 3.10219 19.5 3.50001C19.8978 3.89784 20.1213 4.4374 20.1213 5.00001C20.1213 5.56262 19.8978 6.10219 19.5 6.50001L7 19L3 20L4 16L16.5 3.50001Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Edit Profile
                </button>
              </div>

              {/* Menu Sections */}
              <div className={styles.menuContainer}>
                {/* Account Section */}
                <div className={styles.menuSection}>
                  <h3 className={styles.menuSectionTitle}>Account</h3>
                  <div className={styles.menuList}>
                    <button className={styles.menuItem} onClick={() => navigate('/profile/wallet')}>
                      <div className={styles.menuItemLeft}>
                        <div className={styles.menuIcon} style={{ background: 'rgba(34, 197, 94, 0.1)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <rect x="2" y="4" width="20" height="16" rx="2" stroke="#22C55E" strokeWidth="2"/>
                            <path d="M2 10H22" stroke="#22C55E" strokeWidth="2"/>
                            <circle cx="17" cy="14" r="2" fill="#22C55E"/>
                          </svg>
                        </div>
                        <span>My Wallet</span>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    <button className={styles.menuItem} onClick={() => navigate('/profile/rewards')}>
                      <div className={styles.menuItemLeft}>
                        <div className={styles.menuIcon} style={{ background: 'rgba(245, 166, 35, 0.1)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="#F5A623" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span>Rewards & Points</span>
                      </div>
                      <div className={styles.menuBadge}>{userProfile?.reward_points || 0} pts</div>
                    </button>

                    <button className={styles.menuItem} onClick={() => navigate('/profile/saved-routes')}>
                      <div className={styles.menuItemLeft}>
                        <div className={styles.menuIcon} style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M20.84 4.61C20.3292 4.099 19.7228 3.69365 19.0554 3.41708C18.3879 3.14052 17.6725 2.99817 16.95 2.99817C16.2275 2.99817 15.5121 3.14052 14.8446 3.41708C14.1772 3.69365 13.5708 4.099 13.06 4.61L12 5.67L10.94 4.61C9.9083 3.57831 8.50903 2.99871 7.05 2.99871C5.59096 2.99871 4.19169 3.57831 3.16 4.61C2.1283 5.64169 1.54871 7.04097 1.54871 8.5C1.54871 9.95903 2.1283 11.3583 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.351 11.8792 21.7563 11.2728 22.0329 10.6054C22.3095 9.93789 22.4518 9.22249 22.4518 8.5C22.4518 7.77751 22.3095 7.0621 22.0329 6.39464C21.7563 5.72718 21.351 5.12075 20.84 4.61Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span>Saved Routes</span>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Preferences Section */}
                <div className={styles.menuSection}>
                  <h3 className={styles.menuSectionTitle}>Preferences</h3>
                  <div className={styles.menuList}>
                    <button className={styles.menuItem} onClick={() => navigate('/profile/travel-preferences')}>
                      <div className={styles.menuItemLeft}>
                        <div className={styles.menuIcon} style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M4 15C4 15 5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V15Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M4 22V15" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span>Travel Preferences</span>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    <button className={styles.menuItem} onClick={() => navigate('/profile/emergency-contacts')}>
                      <div className={styles.menuItemLeft}>
                        <div className={styles.menuIcon} style={{ background: 'rgba(168, 85, 247, 0.1)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M22 16.92V19.92C22 20.4704 21.5504 21 21 21H20C14.477 21 10 16.523 10 11V10C10 9.44957 10.5496 9 11.1 9H14.1" stroke="#A855F7" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M16 2V8M13 5H19" stroke="#A855F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span>Emergency Contacts</span>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    <button className={styles.menuItem} onClick={() => navigate('/profile/settings')}>
                      <div className={styles.menuItemLeft}>
                        <div className={styles.menuIcon} style={{ background: 'rgba(107, 114, 128, 0.1)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="3" stroke="#6B7280" strokeWidth="2"/>
                            <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74493 20.1656 6.23584 20.3766 5.705 20.3766C5.17416 20.3766 4.66507 20.1656 4.29 19.79C3.91445 19.4149 3.70343 18.9058 3.70343 18.375C3.70343 17.8442 3.91445 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95235 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87235 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83445 6.74493 3.62343 6.23584 3.62343 5.705C3.62343 5.17416 3.83445 4.66507 4.21 4.29C4.58507 3.91445 5.09416 3.70343 5.625 3.70343C6.15584 3.70343 6.66493 3.91445 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95235 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87235 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83445 17.7642 3.62343 18.295 3.62343C18.8258 3.62343 19.3349 3.83445 19.71 4.21C20.0856 4.58507 20.2966 5.09416 20.2966 5.625C20.2966 6.15584 20.0856 6.66493 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span>Settings</span>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Support Section */}
                <div className={styles.menuSection}>
                  <h3 className={styles.menuSectionTitle}>Support</h3>
                  <div className={styles.menuList}>
                    <button className={styles.menuItem} onClick={() => navigate('/help')}>
                      <div className={styles.menuItemLeft}>
                        <div className={styles.menuIcon} style={{ background: 'rgba(20, 184, 166, 0.1)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="#14B8A6" strokeWidth="2"/>
                            <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="17" r="1" fill="#14B8A6"/>
                          </svg>
                        </div>
                        <span>Help & Support</span>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>

                    <button className={styles.menuItem} onClick={() => navigate('/partner')}>
                      <div className={styles.menuItemLeft}>
                        <div className={styles.menuIcon} style={{ background: 'rgba(27, 77, 74, 0.1)' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="#1B4D4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="8.5" cy="7" r="4" stroke="#1B4D4A" strokeWidth="2"/>
                            <path d="M20 8V14M17 11H23" stroke="#1B4D4A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        <span>Become a Partner</span>
                      </div>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Logout Button */}
                <button className={styles.logoutButton} onClick={handleLogout}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Log Out
                </button>

                {/* App Version */}
                <div className={styles.appVersion}>
                  <span>GOGOBUS v1.4.0</span>
                </div>
              </div>

              {/* Bottom Spacer */}
              <div className={styles.bottomSpacer}></div>
            </>
          }
        />
        <Route path="edit" element={<EditProfile profile={userProfile} />} />
        <Route path="rewards" element={<Rewards />} />
        <Route path="wallet" element={<Wallet />} />
        <Route path="saved-routes" element={<SavedRoutes />} />
        <Route path="travel-preferences" element={<TravelPreferences />} />
        <Route path="emergency-contacts" element={<EmergencyContacts />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
    </div>
  );
};

export default Profile;
