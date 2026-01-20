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

// #region agent log
fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:19',message:'React app initializing',data:{strictMode:true,url:window.location.href,userAgent:navigator.userAgent.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// #region agent log
fetch('http://127.0.0.1:7244/ingest/c4c33fba-1ee4-4b2f-aa1a-ed506c7c702f',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.jsx:23',message:'React app rendered',data:{url:window.location.href},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
// #endregion
