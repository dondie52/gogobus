import React, { useState, useEffect } from 'react';
import { routeService } from '../../services/routeService';
import Button from '../common/Button';
import Input from '../common/Input';
import LoadingSpinner from '../common/LoadingSpinner';
import { logError } from '../../utils/logger';
import styles from './SearchForm.module.css';

const SearchForm = ({ onSearch }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [passengers, setPassengers] = useState(1);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesList = await routeService.getCities();
        setCities(citiesList);
      } catch (error) {
        logError('Failed to load cities', error);
        // Fallback cities
        setCities([
          'Gaborone', 'Francistown', 'Maun', 'Kasane',
          'Palapye', 'Serowe', 'Nata', 'Lobatse',
          'Selebi-Phikwe', 'Jwaneng', 'Molepolole'
        ]);
      }
    };

    loadCities();
  }, []);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!origin) {
      setError('Please select departure');
      return;
    }

    if (!destination) {
      setError('Please select destination');
      return;
    }

    if (origin === destination) {
      setError('Origin and destination cannot be the same');
      return;
    }

    if (!date) {
      setError('Please select travel date');
      return;
    }

    onSearch({ origin, destination, date, passengers: parseInt(passengers) });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.searchForm}>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.searchRow}>
        <div className={styles.cityInput}>
          <label className={styles.label}>From</label>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">Select departure</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleSwap}
          className={styles.swapButton}
          aria-label="Swap origin and destination"
          title="Swap origin and destination"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path 
              d="M7 16V4M7 4L3 8M7 4L11 8" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M17 8V20M17 20L21 16M17 20L13 16" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className={styles.cityInput}>
          <label className={styles.label}>To</label>
          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">Select destination</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.searchRow}>
        <div className={styles.dateInput}>
          <label className={styles.label}>Date</label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            required
          />
        </div>

        <div className={styles.passengersInput}>
          <label className={styles.label}>Passengers</label>
          <div className={styles.passengerInputWrapper}>
            <button
              type="button"
              className={styles.passengerButton}
              onClick={() => setPassengers(Math.max(1, passengers - 1))}
              aria-label="Decrease passengers"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <Input
              type="number"
              value={passengers}
              onChange={(e) => setPassengers(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              required
              className={styles.passengerInput}
            />
            <button
              type="button"
              className={styles.passengerButton}
              onClick={() => setPassengers(passengers + 1)}
              aria-label="Increase passengers"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading} className={styles.searchButton}>
        {loading ? <LoadingSpinner size="small" /> : 'Search Buses'}
      </Button>
    </form>
  );
};

export default SearchForm;
