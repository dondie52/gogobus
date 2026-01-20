import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.title}>GOGOBUS</h3>
            <p className={styles.description}>
              Safe and Comfortable Travel to Your Destination
            </p>
          </div>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Quick Links</h4>
            <Link to="/home" className={styles.link}>Home</Link>
            <Link to="/tickets" className={styles.link}>My Tickets</Link>
            <Link to="/profile" className={styles.link}>Profile</Link>
          </div>
          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Support</h4>
            <Link to="/help-support" className={styles.link}>Help & Support</Link>
            <Link to="/terms" className={styles.link}>Terms</Link>
            <Link to="/privacy" className={styles.link}>Privacy</Link>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>&copy; {new Date().getFullYear()} GOGOBUS (Pty) Ltd. All rights reserved.</p>
          <p className={styles.companyInfo}>
            Registered in Botswana | 
            <a href="mailto:support@gogobus.co.bw" className={styles.link}> support@gogobus.co.bw</a> | 
            <a href="tel:+26712345678" className={styles.link}> +267 12 345 678</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
