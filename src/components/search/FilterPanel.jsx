import React from 'react';
import styles from './FilterPanel.module.css';

const FilterPanel = ({ timeOfDay, onTimeOfDayChange }) => {
  const timeFilters = [
    { value: null, label: 'All Day' },
    { value: 'morning', label: 'Morning (6AM-12PM)' },
    { value: 'afternoon', label: 'Afternoon (12PM-6PM)' },
    { value: 'evening', label: 'Evening (6PM-6AM)' },
  ];

  return (
    <div className={styles.filterPanel}>
      <h3 className={styles.filterTitle}>Time of Day</h3>
      <div className={styles.filterButtons}>
        {timeFilters.map((filter) => (
          <button
            key={filter.value || 'all'}
            className={`${styles.filterButton} ${timeOfDay === filter.value ? styles.active : ''}`}
            onClick={() => onTimeOfDayChange(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterPanel;
