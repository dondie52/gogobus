import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiAward, FiCreditCard, FiMap, FiSettings, FiHeart, FiPhone } from 'react-icons/fi';
import styles from './ProfileMenu.module.css';

const ProfileMenu = () => {
  const navigate = useNavigate();

  const menuItems = [
    { icon: FiUser, label: 'Edit Profile', path: '/profile/edit' },
    { icon: FiAward, label: 'Rewards', path: '/profile/rewards' },
    { icon: FiCreditCard, label: 'Wallet', path: '/profile/wallet' },
    { icon: FiMap, label: 'Saved Routes', path: '/profile/saved-routes' },
    { icon: FiHeart, label: 'Travel Preferences', path: '/profile/travel-preferences' },
    { icon: FiPhone, label: 'Emergency Contacts', path: '/profile/emergency-contacts' },
    { icon: FiSettings, label: 'Settings', path: '/profile/settings' },
  ];

  return (
    <div className={styles.profileMenu}>
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            className={styles.menuItem}
            onClick={() => navigate(item.path)}
          >
            <Icon className={styles.menuIcon} />
            <span className={styles.menuLabel}>{item.label}</span>
            <span className={styles.menuArrow}>→</span>
          </button>
        );
      })}
    </div>
  );
};

export default ProfileMenu;
