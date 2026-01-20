import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// GOGOBUS QR SCANNER - Boarding System
// For bus conductors to scan and verify passenger tickets
// ============================================================

// Mock function - replace with actual adminService import
const mockAdminService = {
  getBookingByReference: async (ref) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data for testing
    const mockBookings = {
      'BK3F8A2C': {
        id: '1',
        booking_reference: 'BK3F8A2C',
        passenger_name: 'Thabo Molefe',
        passenger_phone: '+267 71 234 567',
        seat_number: '2A',
        payment_status: 'paid',
        is_boarded: false,
        trips: {
          departure_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          routes: { origin: 'Gaborone', destination: 'Maun' }
        }
      },
      'BK7D9E1F': {
        id: '2',
        booking_reference: 'BK7D9E1F',
        passenger_name: 'Keitumetse Kgosi',
        passenger_phone: '+267 72 345 678',
        seat_number: '3B',
        payment_status: 'paid',
        is_boarded: true,
        boarded_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        trips: {
          departure_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          routes: { origin: 'Gaborone', destination: 'Maun' }
        }
      },
      'BK2C4B8A': {
        id: '3',
        booking_reference: 'BK2C4B8A',
        passenger_name: 'Mpho Tau',
        passenger_phone: '+267 73 456 789',
        seat_number: '5C',
        payment_status: 'unpaid',
        is_boarded: false,
        trips: {
          departure_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          routes: { origin: 'Gaborone', destination: 'Maun' }
        }
      }
    };
    
    const booking = mockBookings[ref.toUpperCase()];
    if (booking) {
      return { data: booking, error: null };
    }
    return { data: null, error: { message: 'Booking not found' } };
  },
  
  markAsBoarded: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: { id, is_boarded: true, boarded_at: new Date().toISOString() }, error: null };
  }
};

// Use mock for demo, replace with: import adminService from '../services/adminService';
const adminService = mockAdminService;

// ============================================================
// ICONS
// ============================================================

const Icons = {
  Scan: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  ),
  Camera: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>
    </svg>
  ),
  Keyboard: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/>
    </svg>
  ),
  Check: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Ticket: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/>
    </svg>
  ),
  MapPin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Clock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Phone: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
    </svg>
  ),
  CheckCircle: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/>
    </svg>
  ),
  XCircle: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/>
    </svg>
  ),
  Bus: () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6v6m8-6v6M5 18v2m14-2v2M3 6h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6ZM3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"/><circle cx="7" cy="15" r="1"/><circle cx="17" cy="15" r="1"/>
    </svg>
  ),
};

// ============================================================
// STYLES
// ============================================================

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap');

  :root {
    --color-primary: #1B4D4A;
    --color-primary-dark: #153D3A;
    --color-primary-light: #2A6B67;
    --color-accent: #F5A623;
    --color-accent-dark: #E8941F;
    --color-success: #22C55E;
    --color-success-dark: #16A34A;
    --color-error: #DC2626;
    --color-error-dark: #B91C1C;
    --color-warning: #F59E0B;
    --color-white: #FFFFFF;
    --color-gray-50: #F8FAFC;
    --color-gray-100: #F1F5F9;
    --color-gray-200: #E2E8F0;
    --color-gray-300: #CBD5E1;
    --color-gray-400: #94A3B8;
    --color-gray-500: #64748B;
    --color-gray-600: #475569;
    --color-gray-700: #334155;
    --color-gray-800: #1E293B;
    --color-gray-900: #0F172A;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .scanner-app {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    min-height: 100vh;
    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
    color: var(--color-white);
  }

  /* Header */
  .scanner-header {
    padding: 20px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    background: rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
  }

  .back-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: var(--color-white);
    width: 44px;
    height: 44px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .back-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .header-content {
    flex: 1;
  }

  .header-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 2px;
  }

  .header-subtitle {
    font-size: 13px;
    opacity: 0.7;
  }

  .header-logo {
    width: 40px;
    height: 40px;
    background: var(--color-accent);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Mode Toggle */
  .mode-toggle {
    display: flex;
    background: rgba(0, 0, 0, 0.2);
    padding: 4px;
    border-radius: 12px;
    margin: 20px 24px;
  }

  .mode-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 16px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    font-family: inherit;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    border-radius: 10px;
    transition: all 0.2s ease;
  }

  .mode-btn.active {
    background: var(--color-white);
    color: var(--color-primary);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  /* Scanner Area */
  .scanner-container {
    padding: 0 24px 24px;
  }

  .camera-viewport {
    position: relative;
    background: var(--color-gray-900);
    border-radius: 24px;
    overflow: hidden;
    aspect-ratio: 1;
    max-width: 400px;
    margin: 0 auto;
  }

  .camera-video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .scanner-overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .scan-frame {
    width: 70%;
    height: 70%;
    position: relative;
  }

  .scan-corner {
    position: absolute;
    width: 40px;
    height: 40px;
    border: 4px solid var(--color-accent);
  }

  .scan-corner.tl { top: 0; left: 0; border-right: none; border-bottom: none; border-radius: 8px 0 0 0; }
  .scan-corner.tr { top: 0; right: 0; border-left: none; border-bottom: none; border-radius: 0 8px 0 0; }
  .scan-corner.bl { bottom: 0; left: 0; border-right: none; border-top: none; border-radius: 0 0 0 8px; }
  .scan-corner.br { bottom: 0; right: 0; border-left: none; border-top: none; border-radius: 0 0 8px 0; }

  .scan-line {
    position: absolute;
    left: 10%;
    right: 10%;
    height: 3px;
    background: linear-gradient(90deg, transparent, var(--color-accent), transparent);
    border-radius: 2px;
    animation: scanLine 2s ease-in-out infinite;
  }

  @keyframes scanLine {
    0%, 100% { top: 15%; opacity: 0; }
    50% { top: 85%; opacity: 1; }
  }

  .camera-placeholder {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: var(--color-gray-400);
  }

  .camera-placeholder svg {
    width: 48px;
    height: 48px;
    opacity: 0.5;
  }

  .camera-placeholder p {
    font-size: 14px;
  }

  .camera-error {
    background: rgba(220, 38, 38, 0.1);
    color: var(--color-error);
    padding: 12px 16px;
    border-radius: 12px;
    text-align: center;
    font-size: 13px;
    margin-top: 16px;
  }

  /* Manual Entry */
  .manual-entry {
    max-width: 400px;
    margin: 0 auto;
    padding: 32px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 24px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .manual-entry-title {
    font-size: 18px;
    font-weight: 700;
    text-align: center;
    margin-bottom: 8px;
  }

  .manual-entry-subtitle {
    font-size: 14px;
    opacity: 0.7;
    text-align: center;
    margin-bottom: 24px;
  }

  .reference-input-group {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }

  .reference-input {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    padding: 16px 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px;
    font-weight: 600;
    color: var(--color-white);
    text-transform: uppercase;
    letter-spacing: 2px;
    text-align: center;
    outline: none;
    transition: all 0.2s ease;
  }

  .reference-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
    letter-spacing: 1px;
  }

  .reference-input:focus {
    border-color: var(--color-accent);
    background: rgba(255, 255, 255, 0.15);
  }

  .search-btn {
    background: var(--color-accent);
    border: none;
    color: var(--color-white);
    width: 56px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .search-btn:hover {
    background: var(--color-accent-dark);
    transform: scale(1.02);
  }

  .search-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .example-refs {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }

  .example-ref {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--color-white);
    padding: 8px 16px;
    border-radius: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .example-ref:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: var(--color-accent);
  }

  /* Result Card */
  .result-container {
    padding: 24px;
    max-width: 440px;
    margin: 0 auto;
  }

  .result-card {
    background: var(--color-white);
    border-radius: 24px;
    overflow: hidden;
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .result-status {
    padding: 32px 24px;
    text-align: center;
  }

  .result-status.success {
    background: linear-gradient(135deg, var(--color-success) 0%, var(--color-success-dark) 100%);
    color: var(--color-white);
  }

  .result-status.error {
    background: linear-gradient(135deg, var(--color-error) 0%, var(--color-error-dark) 100%);
    color: var(--color-white);
  }

  .result-status.warning {
    background: linear-gradient(135deg, var(--color-warning) 0%, #D97706 100%);
    color: var(--color-white);
  }

  .result-status.already-boarded {
    background: linear-gradient(135deg, var(--color-gray-500) 0%, var(--color-gray-600) 100%);
    color: var(--color-white);
  }

  .status-icon {
    margin-bottom: 12px;
  }

  .status-icon svg {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
  }

  .status-title {
    font-size: 22px;
    font-weight: 800;
    margin-bottom: 4px;
  }

  .status-subtitle {
    font-size: 14px;
    opacity: 0.9;
  }

  .result-details {
    padding: 24px;
    color: var(--color-gray-800);
  }

  .booking-ref {
    display: inline-block;
    background: var(--color-gray-100);
    padding: 8px 16px;
    border-radius: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 16px;
    font-weight: 600;
    color: var(--color-primary);
    margin-bottom: 20px;
  }

  .detail-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid var(--color-gray-100);
  }

  .detail-row:last-child {
    border-bottom: none;
  }

  .detail-icon {
    width: 40px;
    height: 40px;
    background: var(--color-gray-100);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
    flex-shrink: 0;
  }

  .detail-content {
    flex: 1;
  }

  .detail-label {
    font-size: 12px;
    color: var(--color-gray-500);
    margin-bottom: 2px;
  }

  .detail-value {
    font-size: 15px;
    font-weight: 600;
    color: var(--color-gray-800);
  }

  .seat-badge {
    background: var(--color-primary);
    color: var(--color-white);
    padding: 8px 20px;
    border-radius: 10px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 18px;
    font-weight: 700;
  }

  .result-actions {
    padding: 16px 24px 24px;
    display: flex;
    gap: 12px;
  }

  .action-btn {
    flex: 1;
    padding: 16px 24px;
    border-radius: 14px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .action-btn.primary {
    background: var(--color-primary);
    border: none;
    color: var(--color-white);
  }

  .action-btn.primary:hover {
    background: var(--color-primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(27, 77, 74, 0.3);
  }

  .action-btn.secondary {
    background: var(--color-white);
    border: 2px solid var(--color-gray-200);
    color: var(--color-gray-700);
  }

  .action-btn.secondary:hover {
    background: var(--color-gray-50);
    border-color: var(--color-gray-300);
  }

  .action-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  /* Loading State */
  .loading-container {
    padding: 48px 24px;
    text-align: center;
  }

  .loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.2);
    border-top-color: var(--color-accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 16px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .loading-text {
    font-size: 16px;
    font-weight: 600;
  }

  /* Stats Bar */
  .stats-bar {
    display: flex;
    gap: 12px;
    padding: 0 24px 20px;
    margin-top: auto;
  }

  .stat-item {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 16px;
    text-align: center;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 2px;
  }

  .stat-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.7;
  }

  /* Responsive */
  @media (max-width: 480px) {
    .scanner-header {
      padding: 16px 20px;
    }

    .mode-toggle {
      margin: 16px 20px;
    }

    .scanner-container {
      padding: 0 20px 20px;
    }

    .manual-entry {
      padding: 24px 20px;
    }

    .result-container {
      padding: 20px;
    }

    .result-actions {
      flex-direction: column;
    }

    .stats-bar {
      padding: 0 20px 16px;
    }

    .stat-item {
      padding: 12px;
    }

    .stat-value {
      font-size: 20px;
    }
  }
`;

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function QRScanner() {
  const [mode, setMode] = useState('camera'); // 'camera' or 'manual'
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { booking, status: 'valid' | 'invalid' | 'already_boarded' | 'unpaid' }
  const [cameraError, setCameraError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stats, setStats] = useState({ scanned: 0, boarded: 0 });
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Start camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please check permissions or use manual entry.');
      setCameraActive(false);
    }
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Handle mode change
  useEffect(() => {
    if (mode === 'camera') {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => stopCamera();
  }, [mode, startCamera, stopCamera]);

  // Simulate QR code detection (in real app, use a library like @zxing/browser)
  useEffect(() => {
    if (!cameraActive || mode !== 'camera') return;

    // In production, you'd use a QR scanning library here
    // This is a placeholder that simulates scanning after 3 seconds
    const simulateScan = () => {
      // Uncomment to test auto-scanning:
      // handleSearch('BK3F8A2C');
    };

    // For demo purposes only
    // const timer = setTimeout(simulateScan, 5000);
    // return () => clearTimeout(timer);
  }, [cameraActive, mode]);

  // Search for booking
  const handleSearch = async (ref = reference) => {
    if (!ref.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const { data: booking, error } = await adminService.getBookingByReference(ref.trim());

      setStats(prev => ({ ...prev, scanned: prev.scanned + 1 }));

      if (error || !booking) {
        setResult({ booking: null, status: 'invalid' });
      } else if (booking.is_boarded) {
        setResult({ booking, status: 'already_boarded' });
      } else if (booking.payment_status !== 'paid') {
        setResult({ booking, status: 'unpaid' });
      } else {
        setResult({ booking, status: 'valid' });
      }
    } catch (err) {
      console.error('Search error:', err);
      setResult({ booking: null, status: 'invalid' });
    } finally {
      setLoading(false);
    }
  };

  // Mark as boarded
  const handleBoard = async () => {
    if (!result?.booking) return;

    setLoading(true);
    try {
      const { error } = await adminService.markAsBoarded(result.booking.id);
      
      if (!error) {
        setStats(prev => ({ ...prev, boarded: prev.boarded + 1 }));
        setResult({
          booking: { ...result.booking, is_boarded: true, boarded_at: new Date().toISOString() },
          status: 'boarded_success'
        });
      }
    } catch (err) {
      console.error('Boarding error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset scanner
  const handleReset = () => {
    setResult(null);
    setReference('');
    if (mode === 'camera') {
      startCamera();
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-BW', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render result card
  const renderResult = () => {
    if (!result) return null;

    const { booking, status } = result;

    const statusConfig = {
      valid: {
        class: 'success',
        icon: <Icons.CheckCircle />,
        title: 'Valid Ticket',
        subtitle: 'Ready to board'
      },
      invalid: {
        class: 'error',
        icon: <Icons.XCircle />,
        title: 'Not Found',
        subtitle: 'This booking reference is invalid'
      },
      already_boarded: {
        class: 'already-boarded',
        icon: <Icons.AlertTriangle style={{ width: 64, height: 64 }} />,
        title: 'Already Boarded',
        subtitle: `Boarded at ${booking?.boarded_at ? formatDate(booking.boarded_at) : 'N/A'}`
      },
      unpaid: {
        class: 'warning',
        icon: <Icons.AlertTriangle style={{ width: 64, height: 64 }} />,
        title: 'Payment Pending',
        subtitle: 'Ticket has not been paid for'
      },
      boarded_success: {
        class: 'success',
        icon: <Icons.CheckCircle />,
        title: 'Boarded!',
        subtitle: 'Passenger successfully checked in'
      }
    };

    const config = statusConfig[status];

    return (
      <div className="result-container">
        <div className="result-card">
          <div className={`result-status ${config.class}`}>
            <div className="status-icon">{config.icon}</div>
            <div className="status-title">{config.title}</div>
            <div className="status-subtitle">{config.subtitle}</div>
          </div>

          {booking && (
            <div className="result-details">
              <div className="booking-ref">{booking.booking_reference}</div>

              <div className="detail-row">
                <div className="detail-icon"><Icons.User /></div>
                <div className="detail-content">
                  <div className="detail-label">Passenger</div>
                  <div className="detail-value">{booking.passenger_name}</div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon"><Icons.Phone /></div>
                <div className="detail-content">
                  <div className="detail-label">Phone</div>
                  <div className="detail-value">{booking.passenger_phone}</div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon"><Icons.MapPin /></div>
                <div className="detail-content">
                  <div className="detail-label">Route</div>
                  <div className="detail-value">
                    {booking.trips?.routes?.origin} → {booking.trips?.routes?.destination}
                  </div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon"><Icons.Clock /></div>
                <div className="detail-content">
                  <div className="detail-label">Departure</div>
                  <div className="detail-value">{formatDate(booking.trips?.departure_time)}</div>
                </div>
              </div>

              <div className="detail-row">
                <div className="detail-icon"><Icons.Ticket /></div>
                <div className="detail-content">
                  <div className="detail-label">Seat Number</div>
                </div>
                <div className="seat-badge">{booking.seat_number}</div>
              </div>
            </div>
          )}

          <div className="result-actions">
            {status === 'valid' && (
              <button 
                className="action-btn primary"
                onClick={handleBoard}
                disabled={loading}
              >
                <Icons.Check />
                Confirm Boarding
              </button>
            )}
            
            {(status === 'boarded_success' || status === 'already_boarded' || status === 'invalid' || status === 'unpaid') && (
              <button 
                className="action-btn primary"
                onClick={handleReset}
              >
                <Icons.Refresh />
                Scan Next
              </button>
            )}
            
            {status === 'valid' && (
              <button 
                className="action-btn secondary"
                onClick={handleReset}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{styles}</style>
      <div className="scanner-app">
        {/* Header */}
        <header className="scanner-header">
          <button className="back-btn">
            <Icons.ArrowLeft />
          </button>
          <div className="header-content">
            <div className="header-title">Boarding Scanner</div>
            <div className="header-subtitle">Scan tickets to verify and board passengers</div>
          </div>
          <div className="header-logo">
            <Icons.Bus />
          </div>
        </header>

        {/* Mode Toggle */}
        {!result && (
          <div className="mode-toggle">
            <button 
              className={`mode-btn ${mode === 'camera' ? 'active' : ''}`}
              onClick={() => setMode('camera')}
            >
              <Icons.Camera />
              Camera
            </button>
            <button 
              className={`mode-btn ${mode === 'manual' ? 'active' : ''}`}
              onClick={() => setMode('manual')}
            >
              <Icons.Keyboard />
              Manual
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !result && (
          <div className="loading-container">
            <div className="loading-spinner" />
            <div className="loading-text">Verifying ticket...</div>
          </div>
        )}

        {/* Result Display */}
        {result && renderResult()}

        {/* Scanner / Manual Entry */}
        {!loading && !result && (
          <div className="scanner-container">
            {mode === 'camera' ? (
              <>
                <div className="camera-viewport">
                  <video 
                    ref={videoRef}
                    className="camera-video"
                    autoPlay
                    playsInline
                    muted
                  />
                  
                  {!cameraActive && !cameraError && (
                    <div className="camera-placeholder">
                      <Icons.Camera />
                      <p>Starting camera...</p>
                    </div>
                  )}
                  
                  {cameraActive && (
                    <div className="scanner-overlay">
                      <div className="scan-frame">
                        <div className="scan-corner tl" />
                        <div className="scan-corner tr" />
                        <div className="scan-corner bl" />
                        <div className="scan-corner br" />
                        <div className="scan-line" />
                      </div>
                    </div>
                  )}
                </div>
                
                {cameraError && (
                  <div className="camera-error">{cameraError}</div>
                )}
              </>
            ) : (
              <div className="manual-entry">
                <div className="manual-entry-title">Enter Booking Reference</div>
                <div className="manual-entry-subtitle">
                  Type the code shown on the passenger's ticket
                </div>
                
                <div className="reference-input-group">
                  <input
                    type="text"
                    className="reference-input"
                    placeholder="BK••••••"
                    value={reference}
                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    maxLength={8}
                    autoFocus
                  />
                  <button 
                    className="search-btn"
                    onClick={() => handleSearch()}
                    disabled={!reference.trim()}
                  >
                    <Icons.Scan />
                  </button>
                </div>

                <div className="example-refs">
                  <span style={{ fontSize: 12, opacity: 0.6, marginRight: 8 }}>Try:</span>
                  {['BK3F8A2C', 'BK7D9E1F', 'BK2C4B8A'].map(ref => (
                    <button 
                      key={ref}
                      className="example-ref"
                      onClick={() => {
                        setReference(ref);
                        handleSearch(ref);
                      }}
                    >
                      {ref}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <div className="stat-value">{stats.scanned}</div>
            <div className="stat-label">Scanned</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.boarded}</div>
            <div className="stat-label">Boarded</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.scanned - stats.boarded}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
      </div>
    </>
  );
}
