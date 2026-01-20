import React, { useState, useEffect } from 'react';
import styles from './PopularRoutes.module.css';

const POPULAR_ROUTES = [
  { origin: 'Gaborone', destination: 'Francistown', price: 150 },
  { origin: 'Gaborone', destination: 'Maun', price: 305 },
  { origin: 'Gaborone', destination: 'Palapye', price: 98 },
  { origin: 'Gaborone', destination: 'Serowe', price: 114 },
  { origin: 'Francistown', destination: 'Maun', price: 200 },
];

const PopularRoutes = ({ onRouteSelect, loading: externalLoading }) => {
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PopularRoutes.jsx:16',message:'PopularRoutes useEffect mount',data:{routesCount:POPULAR_ROUTES.length,hasOnRouteSelect:!!onRouteSelect},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    // Simulate loading
    const timer = setTimeout(() => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PopularRoutes.jsx:21',message:'Setting routes in PopularRoutes',data:{routesCount:POPULAR_ROUTES.length,routes:POPULAR_ROUTES},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      setRoutes(POPULAR_ROUTES);
      setLoading(false);
    }, 500);

    return () => {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PopularRoutes.jsx:27',message:'PopularRoutes cleanup/unmount',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      clearTimeout(timer);
    };
  }, []);

  const handleRouteClick = (route) => {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PopularRoutes.jsx:30',message:'Route clicked in PopularRoutes',data:{route,hasOnRouteSelect:!!onRouteSelect},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    try {
      const today = new Date().toISOString().split('T')[0];
      onRouteSelect({
        origin: route.origin,
        destination: route.destination,
        date: today,
        passengers: 1,
      });
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PopularRoutes.jsx:37',message:'Error in handleRouteClick',data:{errorMessage:error?.message,route},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      throw error;
    }
  };

  const isLoading = externalLoading || loading;

  return (
    <div className={styles.popularRoutes}>
      {isLoading ? (
        <div className={styles.routesGrid}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonLine}></div>
              <div className={styles.skeletonLineShort}></div>
            </div>
          ))}
        </div>
      ) : routes.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className={styles.emptyIcon}>
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p className={styles.emptyText}>No routes found</p>
          <p className={styles.emptySubtext}>Check back later for popular routes</p>
        </div>
      ) : (
        <div className={styles.routesGrid}>
          {routes.map((route, index) => {
            // #region agent log
            if (!route || !route.origin || !route.destination || route.price === undefined) {
              fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'PopularRoutes.jsx:64',message:'Invalid route data detected',data:{route,index,routesLength:routes.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
            }
            // #endregion
            return (
              <button
                key={index}
                className={styles.routeCard}
                onClick={() => handleRouteClick(route)}
              >
                <div className={styles.routeInfo}>
                  <div className={styles.routeCities}>
                    <span className={styles.city}>{route.origin}</span>
                    <span className={styles.arrow}>→</span>
                    <span className={styles.city}>{route.destination}</span>
                  </div>
                  <div className={styles.routePrice}>P{route.price}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PopularRoutes;
