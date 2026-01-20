import React, { useState, useEffect } from 'react';
import Input from '../common/Input';
import styles from './PassengerForm.module.css';

const PassengerForm = ({ seatNumber, index, defaultData, onChange }) => {
  const [formData, setFormData] = useState({
    fullName: defaultData?.full_name || '',
    email: defaultData?.email || '',
    phone: defaultData?.phone || '',
    idNumber: '',
  });

  useEffect(() => {
    onChange(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.passengerForm}>
      <h3 className={styles.passengerTitle}>
        Passenger {index + 1} - Seat {seatNumber}
      </h3>
      <div className={styles.formFields}>
        <Input
          label="Full Name"
          value={formData.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          placeholder="Enter full name"
          required
        />
        <Input
          type="email"
          label="Email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Enter email"
          required
        />
        <Input
          type="tel"
          label="Phone Number"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+26771234567"
          required
        />
        <Input
          label="ID Number (Optional)"
          value={formData.idNumber}
          onChange={(e) => handleChange('idNumber', e.target.value)}
          placeholder="Enter ID number"
        />
      </div>
    </div>
  );
};

export default PassengerForm;
