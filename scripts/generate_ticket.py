#!/usr/bin/env python3
"""
GOGOBUS PDF Ticket Generator
Server-side ticket generation using reportlab

Usage:
    python generate_ticket.py --booking-ref BK3F8A2C --output ticket.pdf
    
Or import and use programmatically:
    from generate_ticket import generate_ticket
    pdf_bytes = generate_ticket(booking_data)
"""

import io
import json
import argparse
from datetime import datetime
from typing import Dict, Any, Optional

from reportlab.lib import colors
from reportlab.lib.pagesizes import A5
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

# Try to import qrcode for QR generation
try:
    import qrcode
    from qrcode.image.pure import PyPNGImage
    HAS_QRCODE = True
except ImportError:
    HAS_QRCODE = False
    print("Warning: qrcode not installed. QR codes will not be generated.")

# ============================================================
# CONFIGURATION
# ============================================================

class Config:
    """Ticket configuration"""
    COMPANY_NAME = "GOGOBUS"
    TAGLINE = "Travel with Confidence"
    PHONE = "+267 12 345 678"
    EMAIL = "support@gogobus.co.bw"
    WEBSITE = "www.gogobus.co.bw"
    ADDRESS = "Plot 123, Main Mall, Gaborone, Botswana"
    
    # Colors (RGB tuples, 0-1 scale)
    PRIMARY = (0.106, 0.302, 0.290)      # #1B4D4A
    PRIMARY_DARK = (0.082, 0.239, 0.227)  # #153D3A
    ACCENT = (0.961, 0.651, 0.137)        # #F5A623
    SUCCESS = (0.133, 0.773, 0.369)       # #22C55E
    GRAY = (0.392, 0.455, 0.545)          # #64748B
    LIGHT_GRAY = (0.945, 0.961, 0.976)    # #F1F5F9
    WHITE = (1, 1, 1)
    BLACK = (0.059, 0.090, 0.165)         # #0F172A


# ============================================================
# QR CODE GENERATION
# ============================================================

def generate_qr_code(data: Dict[str, Any], size: int = 150) -> Optional[io.BytesIO]:
    """Generate QR code as PNG bytes"""
    if not HAS_QRCODE:
        return None
    
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=10,
            border=1,
        )
        qr.add_data(json.dumps(data))
        qr.make(fit=True)
        
        img = qr.make_image(fill_color=f"rgb({int(Config.PRIMARY[0]*255)},{int(Config.PRIMARY[1]*255)},{int(Config.PRIMARY[2]*255)})", 
                           back_color="white")
        
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        return buffer
    except Exception as e:
        print(f"QR generation error: {e}")
        return None


# ============================================================
# PDF TICKET GENERATOR
# ============================================================

def generate_ticket(booking_data: Dict[str, Any], output_path: Optional[str] = None) -> bytes:
    """
    Generate a PDF ticket from booking data.
    
    Args:
        booking_data: Dictionary containing booking information
        output_path: Optional file path to save PDF
        
    Returns:
        PDF as bytes
    """
    # Create buffer
    buffer = io.BytesIO()
    
    # Page setup (A5 size)
    page_width, page_height = A5
    margin = 10 * mm
    
    # Create canvas
    c = canvas.Canvas(buffer, pagesize=A5)
    c.setTitle(f"GOGOBUS Ticket - {booking_data.get('booking_reference', 'Unknown')}")
    c.setAuthor(Config.COMPANY_NAME)
    
    # ==================== HEADER ====================
    # Primary background
    c.setFillColor(colors.Color(*Config.PRIMARY))
    c.rect(0, page_height - 35*mm, page_width, 35*mm, fill=True, stroke=False)
    
    # Logo text
    c.setFillColor(colors.Color(*Config.WHITE))
    c.setFont("Helvetica-Bold", 20)
    c.drawString(margin, page_height - 18*mm, Config.COMPANY_NAME)
    
    # Tagline
    c.setFont("Helvetica", 8)
    c.drawString(margin, page_height - 24*mm, Config.TAGLINE)
    
    # E-Ticket badge
    c.setFillColor(colors.Color(*Config.ACCENT))
    c.roundRect(page_width - margin - 25*mm, page_height - 22*mm, 
                25*mm, 10*mm, 2*mm, fill=True, stroke=False)
    c.setFillColor(colors.Color(*Config.WHITE))
    c.setFont("Helvetica-Bold", 7)
    c.drawCentredString(page_width - margin - 12.5*mm, page_height - 16*mm, "E-TICKET")
    
    # ==================== ROUTE SECTION ====================
    y = page_height - 55*mm
    
    # Extract route data
    origin = booking_data.get('origin', 'ORIGIN')
    destination = booking_data.get('destination', 'DESTINATION')
    
    # Handle nested structure
    if 'trips' in booking_data and booking_data['trips']:
        trip = booking_data['trips']
        if 'routes' in trip and trip['routes']:
            route = trip['routes']
            origin = route.get('origin', origin)
            destination = route.get('destination', destination)
    
    # Origin
    c.setFillColor(colors.Color(*Config.BLACK))
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(margin + 20*mm, y, origin[:3].upper())
    
    c.setFillColor(colors.Color(*Config.GRAY))
    c.setFont("Helvetica", 9)
    c.drawCentredString(margin + 20*mm, y - 6*mm, origin)
    
    # Route line
    c.setStrokeColor(colors.Color(*Config.LIGHT_GRAY))
    c.setLineWidth(1)
    c.line(margin + 40*mm, y + 3*mm, page_width - margin - 40*mm, y + 3*mm)
    
    # Bus icon circle
    c.setFillColor(colors.Color(*Config.ACCENT))
    c.circle(page_width/2, y + 3*mm, 4*mm, fill=True, stroke=False)
    c.setFillColor(colors.Color(*Config.WHITE))
    c.setFont("Helvetica-Bold", 5)
    c.drawCentredString(page_width/2, y + 1.5*mm, "BUS")
    
    # Destination
    c.setFillColor(colors.Color(*Config.BLACK))
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(page_width - margin - 20*mm, y, destination[:3].upper())
    
    c.setFillColor(colors.Color(*Config.GRAY))
    c.setFont("Helvetica", 9)
    c.drawCentredString(page_width - margin - 20*mm, y - 6*mm, destination)
    
    # ==================== DATE & TIME ====================
    y = page_height - 80*mm
    
    # Parse departure time
    departure_str = booking_data.get('departure_time')
    if 'trips' in booking_data and booking_data['trips']:
        departure_str = booking_data['trips'].get('departure_time', departure_str)
    
    if departure_str:
        try:
            if isinstance(departure_str, str):
                # Handle ISO format
                departure_str = departure_str.replace('Z', '+00:00')
                departure = datetime.fromisoformat(departure_str.replace('Z', '+00:00').split('+')[0])
            else:
                departure = departure_str
            formatted_date = departure.strftime("%a, %d %b %Y")
            formatted_time = departure.strftime("%H:%M")
        except Exception:
            formatted_date = "Date TBC"
            formatted_time = "--:--"
    else:
        formatted_date = "Date TBC"
        formatted_time = "--:--"
    
    # Date box
    c.setFillColor(colors.Color(*Config.LIGHT_GRAY))
    c.roundRect(margin, y, 50*mm, 18*mm, 3*mm, fill=True, stroke=False)
    
    c.setFillColor(colors.Color(*Config.GRAY))
    c.setFont("Helvetica", 7)
    c.drawString(margin + 4*mm, y + 13*mm, "DATE")
    
    c.setFillColor(colors.Color(*Config.BLACK))
    c.setFont("Helvetica-Bold", 10)
    c.drawString(margin + 4*mm, y + 5*mm, formatted_date)
    
    # Time box
    c.setFillColor(colors.Color(*Config.LIGHT_GRAY))
    c.roundRect(page_width - margin - 50*mm, y, 50*mm, 18*mm, 3*mm, fill=True, stroke=False)
    
    c.setFillColor(colors.Color(*Config.GRAY))
    c.setFont("Helvetica", 7)
    c.drawString(page_width - margin - 46*mm, y + 13*mm, "DEPARTURE")
    
    c.setFillColor(colors.Color(*Config.PRIMARY))
    c.setFont("Helvetica-Bold", 16)
    c.drawString(page_width - margin - 46*mm, y + 4*mm, formatted_time)
    
    # ==================== PERFORATED DIVIDER ====================
    y = page_height - 105*mm
    
    # Dashed line
    c.setStrokeColor(colors.Color(*Config.LIGHT_GRAY))
    c.setLineWidth(0.5)
    c.setDash(3, 2)
    c.line(margin, y, page_width - margin, y)
    c.setDash()
    
    # Cutout circles
    c.setFillColor(colors.white)
    c.circle(0, y, 5*mm, fill=True, stroke=False)
    c.circle(page_width, y, 5*mm, fill=True, stroke=False)
    
    # ==================== PASSENGER INFO ====================
    y = page_height - 125*mm
    
    passenger_name = booking_data.get('passenger_name', 'PASSENGER')
    passenger_phone = booking_data.get('passenger_phone', 'N/A')
    seat_number = booking_data.get('seat_number', '--')
    
    # Passenger name
    c.setFillColor(colors.Color(*Config.GRAY))
    c.setFont("Helvetica", 7)
    c.drawString(margin, y + 8*mm, "PASSENGER")
    
    c.setFillColor(colors.Color(*Config.BLACK))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, y, passenger_name.upper())
    
    # Phone
    c.setFillColor(colors.Color(*Config.GRAY))
    c.setFont("Helvetica", 7)
    c.drawString(margin, y - 10*mm, "PHONE")
    
    c.setFillColor(colors.Color(*Config.BLACK))
    c.setFont("Helvetica", 10)
    c.drawString(margin, y - 17*mm, passenger_phone)
    
    # Seat box
    c.setFillColor(colors.Color(*Config.GRAY))
    c.setFont("Helvetica", 7)
    c.drawString(page_width - margin - 25*mm, y + 8*mm, "SEAT")
    
    c.setFillColor(colors.Color(*Config.PRIMARY))
    c.roundRect(page_width - margin - 25*mm, y - 12*mm, 25*mm, 18*mm, 3*mm, fill=True, stroke=False)
    
    c.setFillColor(colors.Color(*Config.WHITE))
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(page_width - margin - 12.5*mm, y - 5*mm, seat_number)
    
    # ==================== BOOKING REFERENCE ====================
    y = page_height - 155*mm
    
    booking_ref = booking_data.get('booking_reference', 'UNKNOWN')
    payment_status = booking_data.get('payment_status', 'pending')
    
    c.setFillColor(colors.Color(*Config.GRAY))
    c.setFont("Helvetica", 7)
    c.drawString(margin, y + 5*mm, "BOOKING REFERENCE")
    
    c.setFillColor(colors.Color(*Config.PRIMARY))
    c.setFont("Helvetica-Bold", 18)
    c.drawString(margin, y - 5*mm, booking_ref)
    
    # Payment status badge
    status_color = Config.SUCCESS if payment_status == 'paid' else Config.ACCENT
    c.setFillColor(colors.Color(*status_color))
    c.roundRect(page_width - margin - 20*mm, y, 20*mm, 8*mm, 2*mm, fill=True, stroke=False)
    
    c.setFillColor(colors.Color(*Config.WHITE))
    c.setFont("Helvetica-Bold", 6)
    c.drawCentredString(page_width - margin - 10*mm, y + 2.5*mm, payment_status.upper())
    
    # ==================== QR CODE & AMOUNT ====================
    y = page_height - 190*mm
    
    # Amount
    total_amount = booking_data.get('total_amount') or booking_data.get('price', 0)
    if 'trips' in booking_data and booking_data['trips']:
        total_amount = total_amount or booking_data['trips'].get('price', 0)
    
    payment_method = booking_data.get('payment_method', 'N/A')
    method_labels = {
        'card': 'Credit/Debit Card',
        'orange_money': 'Orange Money',
        'myzaka': 'MyZaka',
        'cash': 'Cash',
        'bank_transfer': 'Bank Transfer',
    }
    
    c.setFillColor(colors.Color(*Config.GRAY))
    c.setFont("Helvetica", 7)
    c.drawString(margin, y + 15*mm, "AMOUNT PAID")
    
    c.setFillColor(colors.Color(*Config.BLACK))
    c.setFont("Helvetica-Bold", 20)
    c.drawString(margin, y + 3*mm, f"P{float(total_amount):.2f}")
    
    c.setFillColor(colors.Color(*Config.GRAY))
    c.setFont("Helvetica", 8)
    c.drawString(margin, y - 5*mm, f"via {method_labels.get(payment_method, payment_method)}")
    
    # QR Code
    qr_x = page_width - margin - 30*mm
    qr_y = y - 5*mm
    qr_size = 28*mm
    
    # QR background
    c.setFillColor(colors.Color(*Config.LIGHT_GRAY))
    c.roundRect(qr_x - 2*mm, qr_y - 2*mm, qr_size + 4*mm, qr_size + 4*mm, 3*mm, fill=True, stroke=False)
    
    # Generate and add QR code
    qr_data = {
        'ref': booking_ref,
        'v': 1,
    }
    qr_buffer = generate_qr_code(qr_data)
    
    if qr_buffer:
        from reportlab.lib.utils import ImageReader
        qr_img = ImageReader(qr_buffer)
        c.drawImage(qr_img, qr_x, qr_y, width=qr_size, height=qr_size)
    else:
        # Placeholder text if no QR
        c.setFillColor(colors.Color(*Config.GRAY))
        c.setFont("Helvetica", 6)
        c.drawCentredString(qr_x + qr_size/2, qr_y + qr_size/2 + 2*mm, "SCAN TO")
        c.drawCentredString(qr_x + qr_size/2, qr_y + qr_size/2 - 2*mm, "VERIFY")
    
    # ==================== FOOTER ====================
    y = 15*mm
    
    # Divider
    c.setStrokeColor(colors.Color(*Config.LIGHT_GRAY))
    c.setLineWidth(0.3)
    c.line(margin, y + 8*mm, page_width - margin, y + 8*mm)
    
    # Contact info
    c.setFillColor(colors.Color(*Config.GRAY))
    c.setFont("Helvetica", 6)
    c.drawString(margin, y + 3*mm, Config.PHONE)
    c.drawCentredString(page_width/2, y + 3*mm, Config.EMAIL)
    c.drawRightString(page_width - margin, y + 3*mm, Config.WEBSITE)
    
    # Terms
    c.setFont("Helvetica", 5)
    c.drawCentredString(page_width/2, y - 2*mm, 
                        "Please arrive at the station 30 minutes before departure. This ticket is non-transferable.")
    
    # ==================== FINALIZE ====================
    c.save()
    
    # Get PDF bytes
    pdf_bytes = buffer.getvalue()
    buffer.close()
    
    # Save to file if path provided
    if output_path:
        with open(output_path, 'wb') as f:
            f.write(pdf_bytes)
        print(f"Ticket saved to: {output_path}")
    
    return pdf_bytes


# ============================================================
# CLI INTERFACE
# ============================================================

def main():
    parser = argparse.ArgumentParser(description='Generate GOGOBUS PDF Ticket')
    parser.add_argument('--booking-ref', required=True, help='Booking reference')
    parser.add_argument('--output', '-o', default='ticket.pdf', help='Output file path')
    parser.add_argument('--json', '-j', help='JSON file with booking data')
    
    args = parser.parse_args()
    
    # Load booking data
    if args.json:
        with open(args.json, 'r') as f:
            booking_data = json.load(f)
    else:
        # Sample data for testing
        booking_data = {
            'booking_reference': args.booking_ref,
            'passenger_name': 'Thabo Molefe',
            'passenger_phone': '+267 71 234 567',
            'passenger_email': 'thabo@example.com',
            'seat_number': '2A',
            'total_amount': 472.50,
            'payment_status': 'paid',
            'payment_method': 'card',
            'trips': {
                'departure_time': datetime.now().replace(hour=6, minute=0).isoformat(),
                'arrival_time': datetime.now().replace(hour=16, minute=30).isoformat(),
                'price': 450,
                'routes': {
                    'origin': 'Gaborone',
                    'destination': 'Maun',
                }
            }
        }
    
    generate_ticket(booking_data, args.output)
    print(f"✅ Ticket generated successfully!")


if __name__ == '__main__':
    main()
