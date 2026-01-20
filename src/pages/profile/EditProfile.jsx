import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AvatarUpload from '../../components/auth/AvatarUpload';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import styles from './ProfilePages.module.css';

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

const EditProfile = ({ profile }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [province, setProvince] = useState(profile?.province || '');
  const [city, setCity] = useState(profile?.city || '');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (fullName.length < 2) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      let avatarUrl = profile?.avatar_url;
      if (avatar) {
        avatarUrl = await profileService.uploadAvatar(user.id, avatar);
      }

      await profileService.updateProfile(user.id, {
        full_name: fullName,
        email: email,
        phone: phone,
        province: province,
        city: city,
        avatar_url: avatarUrl,
      });

      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const availableCities = province ? (BOTSWANA_CITIES[province] || []) : [];

  return (
    <div className={styles.profilePage}>
      <div className={styles.profilePageHeader}>
        <button className={styles.backButton} onClick={() => navigate('/profile')}>
          ← Back
        </button>
        <h1>Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className={styles.profilePageContent}>
        {error && <div className={styles.errorMessage}>{error}</div>}

        <AvatarUpload onAvatarChange={setAvatar} />

        <Input
          type="text"
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Enter your full name"
          required
        />

        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />

        <Input
          type="tel"
          label="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+26771234567"
          required
        />

        <div className={styles.formGroup}>
          <label className={styles.label}>Province</label>
          <select
            value={province}
            onChange={(e) => {
              setProvince(e.target.value);
              setCity('');
            }}
            className={styles.select}
          >
            <option value="">Select Province</option>
            {BOTSWANA_PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>City</label>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={styles.select}
            disabled={!province}
          >
            <option value="">Select City</option>
            {availableCities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <Button type="submit" disabled={loading} className={styles.submitButton}>
          {loading ? <LoadingSpinner size="small" /> : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default EditProfile;
