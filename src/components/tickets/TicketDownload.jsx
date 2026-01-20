import React, { useState } from 'react';
import ticketService from '../../services/ticketService';
import { logError } from '../../utils/logger';
import styles from './TicketDownload.module.css';

// ==================== ICONS ====================
const Icons = {
  Download: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Printer: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9"/>
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
      <rect x="6" y="14" width="12" height="8"/>
    </svg>
  ),
  Share: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/>
      <circle cx="6" cy="12" r="3"/>
      <circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  ),
  Mail: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  ),
  Loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.spinner}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  ),
  AlertCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
};

/**
 * TicketDownload Component
 * 
 * Provides download, print, and share functionality for tickets
 * 
 * @param {Object} bookingData - Full booking data object
 * @param {string} variant - 'button' | 'card' | 'minimal'
 * @param {boolean} showPrint - Show print button
 * @param {boolean} showShare - Show share button
 * @param {boolean} showEmail - Show email button
 */
export default function TicketDownload({ 
  bookingData, 
  variant = 'button',
  showPrint = true,
  showShare = true,
  showEmail = false,
  className = '',
}) {
  const [downloading, setDownloading] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');

  // Reset status after delay
  const showStatus = (type, message = '') => {
    setStatus(type);
    setErrorMessage(message);
    setTimeout(() => {
      setStatus(null);
      setErrorMessage('');
    }, 3000);
  };

  // Download PDF
  const handleDownload = async () => {
    if (downloading || !bookingData) return;
    
    setDownloading(true);
    try {
      const result = await ticketService.downloadTicketPDF(bookingData);
      if (result.success) {
        showStatus('success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      logError('Download error', error);
      showStatus('error', error.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  // Print ticket
  const handlePrint = async () => {
    if (printing || !bookingData) return;
    
    setPrinting(true);
    try {
      const result = await ticketService.printTicket(bookingData);
      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error) {
      logError('Print error', error);
      showStatus('error', error.message || 'Print failed');
    } finally {
      setPrinting(false);
    }
  };

  // Share ticket
  const handleShare = async () => {
    if (sharing || !bookingData) return;
    
    setSharing(true);
    try {
      // Try Web Share API first
      if (navigator.share) {
        const shareData = {
          title: `GOGOBUS Ticket - ${bookingData.booking_reference}`,
          text: `My bus ticket: ${bookingData.trips?.routes?.origin} → ${bookingData.trips?.routes?.destination}. Booking ref: ${bookingData.booking_reference}`,
          url: window.location.href,
        };
        
        // If we can share files, include the PDF
        if (navigator.canShare && navigator.canShare({ files: [] })) {
          const { blob } = await ticketService.getTicketPDFBlob(bookingData);
          if (blob) {
            const file = new File([blob], `GOGOBUS-Ticket-${bookingData.booking_reference}.pdf`, { 
              type: 'application/pdf' 
            });
            shareData.files = [file];
          }
        }
        
        await navigator.share(shareData);
        showStatus('success');
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(window.location.href);
        showStatus('success');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        logError('Share error', error);
        showStatus('error', 'Share failed');
      }
    } finally {
      setSharing(false);
    }
  };

  // Email ticket
  const handleEmail = async () => {
    if (!bookingData) return;
    
    const subject = encodeURIComponent(`GOGOBUS Ticket - ${bookingData.booking_reference}`);
    const body = encodeURIComponent(
      `My GOGOBUS ticket:\n\n` +
      `Route: ${bookingData.trips?.routes?.origin} → ${bookingData.trips?.routes?.destination}\n` +
      `Date: ${new Date(bookingData.trips?.departure_time).toLocaleDateString()}\n` +
      `Booking Reference: ${bookingData.booking_reference}\n` +
      `Seat: ${bookingData.seat_number}\n\n` +
      `View ticket: ${window.location.href}`
    );
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // Render based on variant
  if (variant === 'minimal') {
    return (
      <button 
        className={`${styles.minimalBtn} ${className}`}
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? <Icons.Loader /> : <Icons.Download />}
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${styles.card} ${className}`}>
        <div className={styles.cardHeader}>
          <Icons.Download />
          <span>Download Your Ticket</span>
        </div>
        
        <p className={styles.cardText}>
          Get your e-ticket as a PDF file. You can print it or show it on your phone.
        </p>
        
        <div className={styles.cardActions}>
          <button 
            className={`${styles.btn} ${styles.primary}`}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <Icons.Loader />
                Generating...
              </>
            ) : status === 'success' ? (
              <>
                <Icons.Check />
                Downloaded!
              </>
            ) : (
              <>
                <Icons.Download />
                Download PDF
              </>
            )}
          </button>
          
          {showPrint && (
            <button 
              className={`${styles.btn} ${styles.secondary}`}
              onClick={handlePrint}
              disabled={printing}
            >
              {printing ? <Icons.Loader /> : <Icons.Printer />}
              Print
            </button>
          )}
        </div>
        
        {status === 'error' && (
          <div className={styles.errorMessage}>
            <Icons.AlertCircle />
            {errorMessage || 'Something went wrong'}
          </div>
        )}
      </div>
    );
  }

  // Default: button group
  return (
    <div className={`${styles.buttonGroup} ${className}`}>
      <button 
        className={`${styles.btn} ${styles.primary}`}
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? (
          <>
            <Icons.Loader />
            Generating...
          </>
        ) : status === 'success' ? (
          <>
            <Icons.Check />
            Downloaded!
          </>
        ) : (
          <>
            <Icons.Download />
            Download Ticket
          </>
        )}
      </button>
      
      {showPrint && (
        <button 
          className={`${styles.btn} ${styles.secondary}`}
          onClick={handlePrint}
          disabled={printing}
          title="Print ticket"
        >
          {printing ? <Icons.Loader /> : <Icons.Printer />}
        </button>
      )}
      
      {showShare && (
        <button 
          className={`${styles.btn} ${styles.secondary}`}
          onClick={handleShare}
          disabled={sharing}
          title="Share ticket"
        >
          {sharing ? <Icons.Loader /> : <Icons.Share />}
        </button>
      )}
      
      {showEmail && (
        <button 
          className={`${styles.btn} ${styles.secondary}`}
          onClick={handleEmail}
          title="Email ticket"
        >
          <Icons.Mail />
        </button>
      )}
      
      {status === 'error' && (
        <div className={styles.errorToast}>
          <Icons.AlertCircle />
          {errorMessage || 'Something went wrong'}
        </div>
      )}
    </div>
  );
}

/**
 * Quick download function for use without component
 */
export const quickDownloadTicket = async (bookingData) => {
  return ticketService.downloadTicketPDF(bookingData);
};

/**
 * Quick download by booking reference
 */
export const downloadTicketByRef = async (bookingReference) => {
  const { data, error } = await ticketService.getBookingByRefForTicket(bookingReference);
  if (error || !data) {
    return { success: false, error: error?.message || 'Booking not found' };
  }
  return ticketService.downloadTicketPDF(data);
};
