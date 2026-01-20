import React from 'react';
import styles from './SortOptions.module.css';

const SortOptions = ({ sortBy, onSortChange }) => {
  const sortOptions = [
    { value: 'departure', label: 'Departure Time' },
    { value: 'price', label: 'Price' },
    { value: 'duration', label: 'Duration' },
  ];

  return (
    <div className={styles.sortOptions}>
      <label className={styles.sortLabel}>Sort by:</label>
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value)}
        className={styles.sortSelect}
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortOptions;
