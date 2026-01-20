import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LiveChatWidget from '../chat/LiveChatWidget';
import styles from './AppLayout.module.css';

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Don't show chat widget on admin pages or auth pages
  const isAdminPage = location.pathname.startsWith('/admin');
  const isAuthPage = ['/login', '/signup', '/get-started', '/', '/onboarding', '/otp-verification'].includes(location.pathname);
  const showChatWidget = user && !isAdminPage && !isAuthPage;

  return (
    <div className={styles.appLayout}>
      {children}
      {showChatWidget && <LiveChatWidget />}
    </div>
  );
};

export default AppLayout;
