import React from 'react';
import styles from './ProfileHeader.module.css';

const ProfileHeader = ({ profile }) => {
  // Safely extract name parts with fallbacks
  const nameParts = profile?.full_name?.split(' ') || [];
  const firstName = nameParts[0] || 'User';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  // Safely get first initial
  const firstInitial = firstName && firstName.length > 0 
    ? firstName.charAt(0).toUpperCase() 
    : 'U';

  return (
    <div className={styles.profileHeader}>
      <div className={styles.avatarSection}>
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="Avatar" className={styles.avatarImage} />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {firstInitial}
          </div>
        )}
      </div>
      <div className={styles.profileInfo}>
        <h1 className={styles.profileName}>
          {profile?.full_name || 'User Name'}
        </h1>
        <p className={styles.profileEmail}>{profile?.email || 'user@example.com'}</p>
        {profile?.phone && (
          <p className={styles.profilePhone}>{profile.phone}</p>
        )}
        {profile?.city && profile?.province && (
          <p className={styles.profileLocation}>
            {profile.city}, {profile.province}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
