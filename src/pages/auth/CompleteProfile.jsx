import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AvatarUpload from '../../components/auth/AvatarUpload';
import { logError } from '../../utils/logger';
import styles from './CompleteProfile.module.css';

const BOTSWANA_PROVINCES = [
  'Central', 'Ghanzi', 'Kgalagadi', 'Kgatleng', 'Kweneng',
  'North East', 'North West', 'South East', 'Southern'
];

const BOTSWANA_CITIES = {
  'Central': ['Serowe', 'Mahalapye', 'Palapye', 'Tutume', 'Tonota'],
  'Ghanzi': ['Ghanzi'],
  'Kgalagadi': ['Tshabong'],
  'Kgatleng': ['Mochudi'],
  'Kweneng': ['Molepolole', 'Thamaga'],
  'North East': ['Masunga'],
  'North West': ['Maun', 'Gumare', 'Shakawe'],
  'South East': ['Ramotswa'],
  'Southern': ['Kanye', 'Moshupa', 'Jwaneng']
};

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [completionProgress, setCompletionProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Calculate profile completion progress
  useEffect(() => {
    let progress = 0;
    if (avatar) progress += 20;
    if (fullName.length >= 2) progress += 20;
    if (email) progress += 20;
    if (phone) progress += 15;
    if (province) progress += 12.5;
    if (city) progress += 12.5;
    setCompletionProgress(progress);
  }, [avatar, fullName, email, phone, province, city]);

  useEffect(() => {
    // Pre-fill from signup data
    const signupData = localStorage.getItem('gogobus_signupData');
    if (signupData) {
      try {
        const data = JSON.parse(signupData);
        if (data.fullName) setFullName(data.fullName);
        if (data.email) setEmail(data.email);
        if (data.phone) setPhone(data.phone);
      } catch (e) {
        logError('Error parsing signup data', e);
      }
    }

    // Pre-fill from user if available
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (fullName.length < 2) {
      setError('Please enter your full name');
      return;
    }

    if (!province) {
      setError('Please select your province');
      return;
    }

    if (!city) {
      setError('Please select your city');
      return;
    }

    setLoading(true);
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Upload avatar if provided
      let avatarUrl = null;
      if (avatar) {
        avatarUrl = await profileService.uploadAvatar(user.id, avatar);
      }

      // Update profile
      await profileService.updateProfile(user.id, {
        full_name: fullName,
        email: email,
        phone: phone,
        province: province,
        city: city,
        avatar_url: avatarUrl,
      });

      // Clear signup data
      localStorage.removeItem('gogobus_signupData');

      navigate('/home');
    } catch (err) {
      setError(err.message || 'Failed to complete profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableCities = province ? (BOTSWANA_CITIES[province] || []) : [];

  return (
    <div className={styles.completeProfileScreen}>
      {/* Background decoration */}
      <div className={styles.backgroundDecoration}>
        <div className={styles.decorCircle1}></div>
        <div className={styles.decorCircle2}></div>
        <div className={styles.decorCircle3}></div>
      </div>

      <div className={`${styles.completeProfileContainer} ${isLoaded ? styles.loaded : ''}`}>
        {/* Header with progress */}
        <div className={styles.completeProfileHeader}>
          <div className={styles.headerTop}>
            <button 
              className={styles.skipBtn} 
              onClick={() => navigate('/home')}
              type="button"
            >
              Skip for now
            </button>
          </div>
          
          <div className={styles.headerIcon}>
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="36" fill="rgba(245, 166, 35, 0.15)"/>
              <circle cx="40" cy="30" r="12" fill="#F5A623"/>
              <path d="M20 58C20 48 28 42 40 42C52 42 60 48 60 58" stroke="#F5A623" strokeWidth="4" strokeLinecap="round"/>
              <circle cx="54" cy="54" r="10" fill="#1B4D4A"/>
              <path d="M50 54L53 57L58 51" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <h1 className={styles.completeProfileTitle}>Complete Your Profile</h1>
          <p className={styles.completeProfileSubtitle}>
            Add your details to personalize your GOGOBUS experience
          </p>

          {/* Progress bar */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill} 
                style={{ width: `${completionProgress}%` }}
              ></div>
            </div>
            <span className={styles.progressText}>{Math.round(completionProgress)}% Complete</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.completeProfileForm}>
          {error && (
            <div className={styles.errorMessage}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Avatar Upload */}
          <div className={styles.avatarSection}>
            <AvatarUpload onAvatarChange={setAvatar} />
            <p className={styles.avatarHint}>Tap to add a profile photo</p>
          </div>

          {/* Personal Info Section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Personal Information
            </h3>

            <div className={`${styles.inputGroup} ${focusedField === 'fullName' ? styles.focused : ''}`}>
              <label className={styles.inputLabel}>Full Name</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocusedField('fullName')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Enter your full name"
                  className={styles.input}
                  required
                />
                {fullName.length >= 2 && (
                  <svg className={styles.checkIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>

            <div className={`${styles.inputGroup} ${focusedField === 'email' ? styles.focused : ''}`}>
              <label className={styles.inputLabel}>Email Address</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="yourname@example.com"
                  className={styles.input}
                  required
                />
                {email && (
                  <svg className={styles.checkIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>

            <div className={`${styles.inputGroup} ${focusedField === 'phone' ? styles.focused : ''}`}>
              <label className={styles.inputLabel}>Phone Number</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92V19.92C22 20.48 21.56 20.93 21 20.98C20.61 21.01 20.21 21.03 19.81 21.03C10.84 21.03 3.47 13.66 3.47 4.69C3.47 4.29 3.49 3.89 3.52 3.5C3.57 2.94 4.02 2.5 4.58 2.5H7.58C8.06 2.5 8.48 2.85 8.56 3.32C8.67 4.01 8.86 4.68 9.13 5.31C9.27 5.63 9.19 6 8.93 6.26L7.66 7.53C9.06 10.08 11.14 12.16 13.69 13.56L14.96 12.29C15.22 12.03 15.59 11.95 15.91 12.09C16.54 12.36 17.21 12.55 17.9 12.66C18.37 12.74 18.72 13.16 18.72 13.64V16.64C18.72 17.2 18.28 17.65 17.72 17.7C17.33 17.73 16.93 17.75 16.53 17.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onFocus={() => setFocusedField('phone')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="+267 71 234 567"
                  className={styles.input}
                  required
                />
                {phone && (
                  <svg className={styles.checkIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17L4 12" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" stroke="currentColor" strokeWidth="2"/>
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              Location
            </h3>

            <div className={`${styles.inputGroup} ${focusedField === 'province' ? styles.focused : ''}`}>
              <label className={styles.inputLabel}>Province</label>
              <div className={styles.selectWrapper}>
                <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7L9 4L15 7L21 4V17L15 20L9 17L3 20V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 4V17M15 7V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <select
                  value={province}
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setCity('');
                  }}
                  onFocus={() => setFocusedField('province')}
                  onBlur={() => setFocusedField(null)}
                  className={styles.select}
                  required
                >
                  <option value="">Select Province</option>
                  {BOTSWANA_PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <svg className={styles.selectArrow} width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <div className={`${styles.inputGroup} ${focusedField === 'city' ? styles.focused : ''} ${!province ? styles.disabled : ''}`}>
              <label className={styles.inputLabel}>City</label>
              <div className={styles.selectWrapper}>
                <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M3 21H21M5 21V7L13 3V21M13 21V7L19 10V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onFocus={() => setFocusedField('city')}
                  onBlur={() => setFocusedField(null)}
                  className={styles.select}
                  required
                  disabled={!province}
                >
                  <option value="">{province ? 'Select City' : 'Select Province First'}</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <svg className={styles.selectArrow} width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <Button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? (
              <span className={styles.loadingState}>
                <LoadingSpinner size="small" />
                <span>Saving Profile...</span>
              </span>
            ) : (
              <span className={styles.buttonContent}>
                Complete Profile
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            )}
          </Button>
        </form>

        {/* Footer info */}
        <div className={styles.footerInfo}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span>Your information is secure and will only be used to enhance your experience</span>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
