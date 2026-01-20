// ============================================================
// GOGOBUS PDF TICKET GENERATOR
// Generates professional e-tickets as PDF documents
// Path: src/services/ticketService.js
// ============================================================

import { supabase } from './supabase';
import { logError, logInfo } from '../utils/logger';

// ============================================================
// CONFIGURATION
// ============================================================

const CONFIG = {
  COMPANY: {
    name: 'GOGOBUS',
    tagline: 'Travel with Confidence',
    phone: '+267 12 345 678',
    email: 'support@gogobus.co.bw',
    website: 'www.gogobus.co.bw',
    address: 'Plot 123, Main Mall, Gaborone, Botswana',
  },
  COLORS: {
    primary: '#1B4D4A',
    primaryDark: '#153D3A',
    accent: '#F5A623',
    success: '#22C55E',
    gray: '#64748B',
    lightGray: '#F1F5F9',
    white: '#FFFFFF',
    black: '#0F172A',
  },
};

// ============================================================
// QR CODE GENERATOR (Simple implementation)
// In production, use a library like 'qrcode' npm package
// ============================================================

const generateQRCodeDataURL = async (data) => {
  // For browser-side QR generation, use qrcode library
  // npm install qrcode
  try {
    const QRCode = await import('qrcode');
    return await QRCode.toDataURL(JSON.stringify(data), {
      width: 150,
      margin: 1,
      color: {
        dark: CONFIG.COLORS.primary,
        light: CONFIG.COLORS.white,
      },
    });
  } catch (err) {
    logError('QR Code generation failed', err);
    // Return placeholder if QR generation fails
    return null;
  }
};

// ============================================================
// PDF GENERATION (Client-side using jsPDF)
// ============================================================

/**
 * Generate a PDF ticket using jsPDF (browser-side)
 * Requires: npm install jspdf
 */
export const generateTicketPDF = async (bookingData) => {
  // Dynamic import for client-side only
  const { default: jsPDF } = await import('jspdf');
  
  const {
    booking_reference,
    passenger_name,
    passenger_phone,
    passenger_email,
    seat_number,
    total_amount,
    payment_status,
    payment_method,
    trips: {
      departure_time,
      arrival_time,
      price,
      routes: { origin, destination },
      buses,
    },
  } = bookingData;

  // Create PDF (A5 size for ticket)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [148, 210], // A5
  });

  const pageWidth = 148;
  const pageHeight = 210;
  const margin = 10;
  let y = margin;

  // Helper functions
  const addText = (text, x, fontSize, color = CONFIG.COLORS.black, align = 'left', style = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setTextColor(color);
    doc.setFont('helvetica', style);
    doc.text(text, x, y, { align });
  };

  const drawRect = (x, width, height, color, radius = 0) => {
    doc.setFillColor(color);
    if (radius > 0) {
      doc.roundedRect(x, y, width, height, radius, radius, 'F');
    } else {
      doc.rect(x, y, width, height, 'F');
    }
  };

  const drawLine = (x1, y1, x2, y2, color = CONFIG.COLORS.lightGray, width = 0.5) => {
    doc.setDrawColor(color);
    doc.setLineWidth(width);
    doc.line(x1, y1, x2, y2);
  };

  // ==================== HEADER ====================
  // Background
  drawRect(0, pageWidth, 35, CONFIG.COLORS.primary);
  
  // Logo and company name
  y = 15;
  doc.setFontSize(20);
  doc.setTextColor(CONFIG.COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text('GOGOBUS', margin, y);
  
  y = 22;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(CONFIG.COMPANY.tagline, margin, y);

  // Ticket type badge
  doc.setFillColor(CONFIG.COLORS.accent);
  doc.roundedRect(pageWidth - margin - 30, 10, 30, 12, 2, 2, 'F');
  doc.setFontSize(7);
  doc.setTextColor(CONFIG.COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text('E-TICKET', pageWidth - margin - 15, 17.5, { align: 'center' });

  // ==================== ROUTE SECTION ====================
  y = 45;
  
  // Origin
  doc.setFontSize(24);
  doc.setTextColor(CONFIG.COLORS.black);
  doc.setFont('helvetica', 'bold');
  doc.text(origin.substring(0, 3).toUpperCase(), margin + 15, y, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(CONFIG.COLORS.gray);
  doc.setFont('helvetica', 'normal');
  doc.text(origin, margin + 15, y + 6, { align: 'center' });

  // Arrow/path
  drawLine(margin + 35, y - 3, pageWidth - margin - 35, y - 3, CONFIG.COLORS.lightGray, 1);
  
  // Bus icon (simple representation)
  doc.setFillColor(CONFIG.COLORS.accent);
  doc.circle(pageWidth / 2, y - 3, 4, 'F');
  doc.setFontSize(6);
  doc.setTextColor(CONFIG.COLORS.white);
  doc.text('BUS', pageWidth / 2, y - 1.5, { align: 'center' });

  // Destination
  doc.setFontSize(24);
  doc.setTextColor(CONFIG.COLORS.black);
  doc.setFont('helvetica', 'bold');
  doc.text(destination.substring(0, 3).toUpperCase(), pageWidth - margin - 15, y, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setTextColor(CONFIG.COLORS.gray);
  doc.setFont('helvetica', 'normal');
  doc.text(destination, pageWidth - margin - 15, y + 6, { align: 'center' });

  // ==================== DATE & TIME ====================
  y = 65;
  
  const departureDate = new Date(departure_time);
  const formattedDate = departureDate.toLocaleDateString('en-BW', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = departureDate.toLocaleTimeString('en-BW', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Date box
  doc.setFillColor(CONFIG.COLORS.lightGray);
  doc.roundedRect(margin, y, 60, 20, 3, 3, 'F');
  
  doc.setFontSize(7);
  doc.setTextColor(CONFIG.COLORS.gray);
  doc.text('DATE', margin + 5, y + 6);
  
  doc.setFontSize(11);
  doc.setTextColor(CONFIG.COLORS.black);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedDate, margin + 5, y + 14);

  // Time box
  doc.setFillColor(CONFIG.COLORS.lightGray);
  doc.roundedRect(pageWidth - margin - 60, y, 60, 20, 3, 3, 'F');
  
  doc.setFontSize(7);
  doc.setTextColor(CONFIG.COLORS.gray);
  doc.setFont('helvetica', 'normal');
  doc.text('DEPARTURE', pageWidth - margin - 55, y + 6);
  
  doc.setFontSize(16);
  doc.setTextColor(CONFIG.COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(formattedTime, pageWidth - margin - 55, y + 15);

  // ==================== DIVIDER ====================
  y = 95;
  
  // Perforated line effect
  for (let x = margin; x < pageWidth - margin; x += 4) {
    drawLine(x, y, x + 2, y, CONFIG.COLORS.lightGray, 0.5);
  }
  
  // Circle cutouts
  doc.setFillColor(CONFIG.COLORS.white);
  doc.circle(0, y, 5, 'F');
  doc.circle(pageWidth, y, 5, 'F');

  // ==================== PASSENGER INFO ====================
  y = 105;

  // Passenger
  doc.setFontSize(7);
  doc.setTextColor(CONFIG.COLORS.gray);
  doc.setFont('helvetica', 'normal');
  doc.text('PASSENGER', margin, y);
  
  doc.setFontSize(12);
  doc.setTextColor(CONFIG.COLORS.black);
  doc.setFont('helvetica', 'bold');
  doc.text(passenger_name.toUpperCase(), margin, y + 6);

  // Phone
  doc.setFontSize(7);
  doc.setTextColor(CONFIG.COLORS.gray);
  doc.setFont('helvetica', 'normal');
  doc.text('PHONE', margin, y + 15);
  
  doc.setFontSize(10);
  doc.setTextColor(CONFIG.COLORS.black);
  doc.setFont('helvetica', 'normal');
  doc.text(passenger_phone || 'N/A', margin, y + 21);

  // Seat
  doc.setFontSize(7);
  doc.setTextColor(CONFIG.COLORS.gray);
  doc.text('SEAT', pageWidth - margin - 30, y);
  
  doc.setFillColor(CONFIG.COLORS.primary);
  doc.roundedRect(pageWidth - margin - 30, y + 2, 30, 18, 3, 3, 'F');
  
  doc.setFontSize(16);
  doc.setTextColor(CONFIG.COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text(seat_number, pageWidth - margin - 15, y + 14, { align: 'center' });

  // ==================== BOOKING REFERENCE ====================
  y = 140;
  
  doc.setFontSize(7);
  doc.setTextColor(CONFIG.COLORS.gray);
  doc.setFont('helvetica', 'normal');
  doc.text('BOOKING REFERENCE', margin, y);
  
  doc.setFontSize(18);
  doc.setTextColor(CONFIG.COLORS.primary);
  doc.setFont('helvetica', 'bold');
  doc.text(booking_reference, margin, y + 8);

  // Payment status badge
  const statusColor = payment_status === 'paid' ? CONFIG.COLORS.success : CONFIG.COLORS.accent;
  doc.setFillColor(statusColor);
  doc.roundedRect(pageWidth - margin - 25, y - 2, 25, 10, 2, 2, 'F');
  doc.setFontSize(6);
  doc.setTextColor(CONFIG.COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.text(payment_status.toUpperCase(), pageWidth - margin - 12.5, y + 4, { align: 'center' });

  // ==================== QR CODE AREA ====================
  y = 155;
  
  // QR placeholder (in production, add actual QR code image)
  doc.setFillColor(CONFIG.COLORS.lightGray);
  doc.roundedRect(pageWidth - margin - 35, y, 35, 35, 3, 3, 'F');
  
  doc.setFontSize(6);
  doc.setTextColor(CONFIG.COLORS.gray);
  doc.text('SCAN TO', pageWidth - margin - 17.5, y + 14, { align: 'center' });
  doc.text('VERIFY', pageWidth - margin - 17.5, y + 18, { align: 'center' });
  
  // Add QR code if available
  try {
    const qrData = await generateQRCodeDataURL({
      ref: booking_reference,
      id: bookingData.id,
      v: 1,
    });
    if (qrData) {
      doc.addImage(qrData, 'PNG', pageWidth - margin - 33, y + 2, 31, 31);
    }
  } catch (err) {
    logInfo('QR code not added', { error: err });
  }

  // ==================== AMOUNT ====================
  doc.setFontSize(7);
  doc.setTextColor(CONFIG.COLORS.gray);
  doc.setFont('helvetica', 'normal');
  doc.text('AMOUNT PAID', margin, y + 5);
  
  doc.setFontSize(20);
  doc.setTextColor(CONFIG.COLORS.black);
  doc.setFont('helvetica', 'bold');
  doc.text(`P${Number(total_amount || price).toFixed(2)}`, margin, y + 14);

  // Payment method
  doc.setFontSize(8);
  doc.setTextColor(CONFIG.COLORS.gray);
  doc.setFont('helvetica', 'normal');
  const methodLabel = {
    card: 'Credit/Debit Card',
    orange_money: 'Orange Money',
    myzaka: 'MyZaka',
    cash: 'Cash',
    bank_transfer: 'Bank Transfer',
  }[payment_method] || payment_method;
  doc.text(`via ${methodLabel}`, margin, y + 20);

  // ==================== FOOTER ====================
  y = pageHeight - 20;
  
  // Divider line
  drawLine(margin, y, pageWidth - margin, y, CONFIG.COLORS.lightGray, 0.3);
  
  y = pageHeight - 12;
  doc.setFontSize(6);
  doc.setTextColor(CONFIG.COLORS.gray);
  doc.setFont('helvetica', 'normal');
  doc.text(CONFIG.COMPANY.phone, margin, y);
  doc.text(CONFIG.COMPANY.email, pageWidth / 2, y, { align: 'center' });
  doc.text(CONFIG.COMPANY.website, pageWidth - margin, y, { align: 'right' });
  
  y = pageHeight - 7;
  doc.setFontSize(5);
  doc.text('Please arrive at the station 30 minutes before departure. This ticket is non-transferable.', pageWidth / 2, y, { align: 'center' });

  // ==================== RETURN PDF ====================
  return doc;
};

/**
 * Generate and download ticket
 */
export const downloadTicketPDF = async (bookingData) => {
  try {
    const doc = await generateTicketPDF(bookingData);
    const filename = `GOGOBUS-Ticket-${bookingData.booking_reference}.pdf`;
    doc.save(filename);
    return { success: true, filename };
  } catch (error) {
    logError('PDF generation error', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate ticket as blob (for email/sharing)
 */
export const getTicketPDFBlob = async (bookingData) => {
  try {
    const doc = await generateTicketPDF(bookingData);
    const blob = doc.output('blob');
    return { success: true, blob };
  } catch (error) {
    logError('PDF blob error', error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate ticket as base64 (for storage/API)
 */
export const getTicketPDFBase64 = async (bookingData) => {
  try {
    const doc = await generateTicketPDF(bookingData);
    const base64 = doc.output('datauristring');
    return { success: true, base64 };
  } catch (error) {
    logError('PDF base64 error', error);
    return { success: false, error: error.message };
  }
};

/**
 * Open ticket in new tab for printing
 */
export const printTicket = async (bookingData) => {
  try {
    const doc = await generateTicketPDF(bookingData);
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
    return { success: true };
  } catch (error) {
    logError('Print error', error);
    return { success: false, error: error.message };
  }
};

// ============================================================
// FETCH BOOKING DATA
// ============================================================

/**
 * Get booking with all details needed for ticket
 */
export const getBookingForTicket = async (bookingId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        trips (
          *,
          routes (
            origin,
            destination,
            distance_km,
            duration_minutes
          ),
          buses (
            bus_name,
            registration_number,
            bus_type
          )
        )
      `)
      .eq('id', bookingId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logError('Fetch booking error', error);
    return { data: null, error };
  }
};

/**
 * Get booking by reference
 */
export const getBookingByRefForTicket = async (bookingReference) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        trips (
          *,
          routes (
            origin,
            destination,
            distance_km,
            duration_minutes
          ),
          buses (
            bus_name,
            registration_number,
            bus_type
          )
        )
      `)
      .eq('booking_reference', bookingReference)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    logError('Fetch booking error', error);
    return { data: null, error };
  }
};

// ============================================================
// DEFAULT EXPORT
// ============================================================

const ticketService = {
  generateTicketPDF,
  downloadTicketPDF,
  getTicketPDFBlob,
  getTicketPDFBase64,
  printTicket,
  getBookingForTicket,
  getBookingByRefForTicket,
};

export default ticketService;
