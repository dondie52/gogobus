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
