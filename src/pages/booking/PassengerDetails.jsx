import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useBooking } from '../../context/BookingContext';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import PassengerForm from '../../components/booking/PassengerForm';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { logError } from '../../utils/logger';
import styles from './Booking.module.css';

const PassengerDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { selectedRoute, selectedSeats, passengerDetails, setPassengerDetails } = useBooking();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // #region agent log
  useEffect(() => {
  }, [selectedSeats, selectedRoute]);
  // #endregion

  useEffect(() => {
    const loadProfile = async () => {
      if (user?.id) {
        try {
          const profile = await profileService.getProfile(user.id);
          setUserProfile(profile);
        } catch (error) {
          logError('Failed to load profile', error);
        }
      }
      setLoading(false);
    };

    loadProfile();
  }, [user]);

  useEffect(() => {
    // #region agent log
    // #endregion
    if (!selectedSeats || selectedSeats.length === 0) {
      // #region agent log
      // #endregion
      // Redirect to home/search instead of non-existent route
      navigate('/home');
    }
  }, [selectedSeats, navigate]);

  const handlePassengerChange = (index, data) => {
    const updated = [...passengerDetails];
    updated[index] = { ...updated[index], ...data };
    setPassengerDetails(updated);
  };

  const handleContinue = () => {
    // #region agent log
    // #endregion
    
    // Initialize passenger details if needed
    let detailsToValidate = passengerDetails;
    if (passengerDetails.length !== selectedSeats.length) {
      // #region agent log
      // #endregion
      // Initialize passenger details for all selected seats
      const newDetails = selectedSeats.map((seat, index) => {
        const existing = passengerDetails[index] || {};
        return {
          seatNumber: seat,
          fullName: existing.fullName || userProfile?.full_name || '',
          email: existing.email || userProfile?.email || user?.email || '',
          phone: existing.phone || userProfile?.phone || '',
          idNumber: existing.idNumber || '',
        };
      });
      setPassengerDetails(newDetails);
      detailsToValidate = newDetails; // Use the new details for validation
    }

    // Ensure we have the right number of passenger details
    if (detailsToValidate.length !== selectedSeats.length) {
      console.error('Passenger details count mismatch:', {
        detailsCount: detailsToValidate.length,
        seatsCount: selectedSeats.length
      });
      alert('Error: Passenger details count does not match selected seats. Please try again.');
      return;
    }

    // #region agent log
    // #endregion

    // Validate required fields using the correct details array
    const allValid = detailsToValidate.every(
      (p) => p && p.fullName && p.fullName.trim() && p.email && p.email.trim() && p.phone && p.phone.trim()
    );

    // #region agent log
    // #endregion

    if (!allValid) {
      // #region agent log
      // #endregion
      // Find which fields are missing
      const missingFields = detailsToValidate
        .map((p, idx) => {
          const missing = [];
          if (!p.fullName) missing.push('Full Name');
          if (!p.email) missing.push('Email');
          if (!p.phone) missing.push('Phone');
          return missing.length > 0 ? `Passenger ${idx + 1}: ${missing.join(', ')}` : null;
        })
        .filter(Boolean);
      
      alert(`Please fill in all required passenger details.\n\nMissing fields:\n${missingFields.join('\n')}`);
      return;
    }

    // #region agent log
    // #endregion
    navigate('/booking/summary');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className={styles.bookingScreen}>
      <div className={styles.bookingHeader}>
        <button className={styles.backButton} onClick={(e) => {
          // #region agent log
          // #endregion
          try {
            // #region agent log
            // #endregion
            navigate('/home');
            // #region agent log
            // #endregion
          } catch (err) {
            // #region agent log
            // #endregion
            console.error('Navigation error:', err);
          }
        }}>
          ← Back
        </button>
        <h1>Passenger Details</h1>
      </div>

      <div className={styles.bookingContent}>
        <p className={styles.instruction}>
          Please provide details for {selectedSeats.length} passenger{selectedSeats.length !== 1 ? 's' : ''}
        </p>

        {selectedSeats.map((seat, index) => (
          <PassengerForm
            key={seat}
            seatNumber={seat}
            index={index}
            defaultData={userProfile}
            onChange={(data) => handlePassengerChange(index, data)}
          />
        ))}

        <div className={styles.bookingFooter}>
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetails;
