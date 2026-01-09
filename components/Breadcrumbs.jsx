import React from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom'; // or your routing solution

const Breadcrumbs = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', listStyle: 'none', padding: 0 }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} style={{ display: 'flex', alignItems: 'center' }}>
              {index > 0 && (
                <FiChevronRight 
                  className="w-4 h-4 text-gray-600" 
                  aria-hidden="true"
                />
              )}
              {isLast ? (
                <span aria-current="page" className="breadcrumb-current">
                  {item.label}
                </span>
              ) : (
                <Link to={item.path} className="breadcrumb-link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
