Overview
This is a static website for the Shri Mata Vaishno Devi Shrine Board, built as a religious pilgrimage information portal. The website provides comprehensive information about the shrine, facilities for pilgrims, yatra (pilgrimage) booking capabilities, and a photo gallery. It's designed to serve as an informational hub for devotees planning their visit to the holy shrine.

System Architecture
Frontend Architecture
Technology Stack: Pure HTML5, CSS3, and vanilla JavaScript
UI Framework: Bootstrap 5.3.0 for responsive design and component styling
Icons: Font Awesome 6.4.0 for consistent iconography
Architecture Pattern: Multi-page static website with shared navigation and styling
Backend Architecture
Frontend Server: Python HTTP server on port 5000 for static file serving
API Server: Node.js Express server on port 3001 for database operations
Database: PostgreSQL with Drizzle ORM for booking and user data management
Database Tables: Users, yatra bookings, accommodations, transportation services, gallery images, announcements
Key Components

1. Page Structure
index.html: Homepage with hero banner and main navigation entry point
shrine.html: Information about the Shrine Board and its administration
facilities.html: Details about pilgrim facilities and accommodations
yatra.html: Pilgrimage booking interface and travel information
gallery.html: Photo gallery of the shrine and pilgrimage journey
2. Styling System
Custom CSS: Temple-themed color scheme with CSS custom properties
Color Palette: Golden, red, and brown tones reflecting traditional temple aesthetics
Responsive Design: Bootstrap-based responsive grid system
Consistent Navigation: Fixed-top navbar with active state management
3. Interactive Features
Navigation: Smooth scrolling and active link highlighting
Form Validation: Client-side validation for booking forms
Gallery: Image gallery functionality
Date Restrictions: Booking date validation to prevent past date selection
Data Flow
Frontend Content Delivery
Python HTTP server serves static files directly on port 5000
Browser requests HTML pages
Pages load CSS and JavaScript assets from CDNs and local files
JavaScript enhances user interaction and handles API communication
Backend API Processing
Express.js API server handles form submissions on port 3001
User data and booking information stored in PostgreSQL database
Real-time form validation and booking confirmation
Database operations managed through Drizzle ORM
External Dependencies
CDN Resources
Bootstrap 5.3.0: UI framework and responsive components
Font Awesome 6.4.0: Icon library for consistent visual elements
Development Dependencies
http-server: Node.js package for local development server (alternative option)
Python HTTP Server: Primary development and deployment server
Deployment Strategy
Current Setup
Development: Python's built-in HTTP server on port 5000
Production Ready: Simple static file serving suitable for any web server
No Build Process: Direct deployment of source files without compilation
Deployment Options
Static Hosting: Can be deployed to GitHub Pages, Netlify, or Vercel
Traditional Web Servers: Apache, Nginx, or any HTTP server
CDN Deployment: CloudFront, CloudFlare for global distribution
Configuration
Replit configuration supports both Node.js and Python environments
Parallel workflow setup for development flexibility
Port 5000 configured for web server access
User Preferences
Preferred communication style: Simple, everyday language.
