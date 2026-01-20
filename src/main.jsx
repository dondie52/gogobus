import React from 'react';
import ReactDOM from 'react-dom/client';
import { initSentry } from './utils/sentry';
import { initAnalytics } from './utils/analytics';
import { runProductionChecks, logProductionReadiness } from './utils/production';
import App from './App';
import './styles/global.css';

// Run production environment checks
runProductionChecks();
logProductionReadiness();

// Initialize Sentry before React app renders
initSentry();

// Initialize GA4 (will check cookie consent internally)
initAnalytics();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
