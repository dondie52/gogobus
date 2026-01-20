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
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:19',message:'PassengerDetails mounted',data:{selectedSeats:selectedSeats,selectedSeatsLength:selectedSeats?.length,hasSelectedRoute:!!selectedRoute},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:36',message:'PassengerDetails useEffect - selectedSeats check',data:{selectedSeats:selectedSeats,selectedSeatsLength:selectedSeats?.length,hasSelectedSeats:!!selectedSeats,willRedirect:!selectedSeats || selectedSeats.length === 0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
    // #endregion
    if (!selectedSeats || selectedSeats.length === 0) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:40',message:'Redirecting - no selectedSeats',data:{selectedSeats:selectedSeats,selectedSeatsLength:selectedSeats?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:61',message:'handleContinue called',data:{passengerDetailsLength:passengerDetails.length,selectedSeatsLength:selectedSeats.length,passengerDetails:passengerDetails,selectedSeats:selectedSeats},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion
    
    // Initialize passenger details if needed
    let detailsToValidate = passengerDetails;
    if (passengerDetails.length !== selectedSeats.length) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:67',message:'Initializing passenger details',data:{passengerDetailsLength:passengerDetails.length,selectedSeatsLength:selectedSeats.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:84',message:'Before validation',data:{detailsToValidateLength:detailsToValidate.length,detailsToValidate:detailsToValidate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion

    // Validate required fields using the correct details array
    const allValid = detailsToValidate.every(
      (p) => p && p.fullName && p.fullName.trim() && p.email && p.email.trim() && p.phone && p.phone.trim()
    );

    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:90',message:'Validation result',data:{allValid:allValid,detailsToValidate:detailsToValidate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
    // #endregion

    if (!allValid) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:95',message:'Validation failed',data:{allValid:allValid,detailsToValidate:detailsToValidate},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
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
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:101',message:'Navigating to booking summary',data:{navigationPath:'/booking/summary'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
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
          fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:146',message:'Back button clicked',data:{currentPath:location.pathname,eventType:e?.type,defaultPrevented:e?.defaultPrevented},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
          // #endregion
          try {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:150',message:'Before navigate call',data:{targetPath:'/home',currentPath:location.pathname},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
            navigate('/home');
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:153',message:'After navigate call',data:{targetPath:'/home'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'B'})}).catch(()=>{});
            // #endregion
          } catch (err) {
            // #region agent log
            fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PassengerDetails.jsx:156',message:'Error in navigate',data:{errorMessage:err?.message,errorStack:err?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
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
