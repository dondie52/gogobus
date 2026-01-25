import { createContext, useContext, useState } from 'react';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'BookingContext.jsx:13',message:'BookingProvider initializing',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengerDetails, setPassengerDetails] = useState([]);
  const [booking, setBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const clearBooking = () => {
    setSelectedRoute(null);
    setSelectedSeats([]);
    setPassengerDetails([]);
    setBooking(null);
    setPaymentMethod(null);
  };

  const value = {
    selectedRoute,
    setSelectedRoute,
    selectedSeats,
    setSelectedSeats,
    passengerDetails,
    setPassengerDetails,
    booking,
    setBooking,
    paymentMethod,
    setPaymentMethod,
    clearBooking,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
