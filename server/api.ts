import express, { Request, Response } from 'express';
import cors from 'cors';
import { storage } from './storage';
import type { InsertUser, InsertYatraBooking } from '../shared/schema';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Generate reference ID for booking
function generateReferenceId(): string {
  return 'VD' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
}

// Routes

// Submit yatra booking
app.post('/api/yatra/book', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      age,
      gender,
      visitDate,
      duration,
      groupSize,
      transportMode,
      accommodation,
      roomType,
      wheelchairAccess,
      medicalAssistance,
      specialDiet,
      additionalRequests
    } = req.body;

    // Check if user exists
    let user = await storage.getUserByEmail(email);
    
    // Create user if doesn't exist
    if (!user) {
      const newUser: InsertUser = {
        firstName,
        lastName,
        email,
        phone,
        age,
        gender
      };
      user = await storage.createUser(newUser);
    }

    // Create booking
    const referenceId = generateReferenceId();
    const bookingData: InsertYatraBooking = {
      userId: user.id,
      referenceId,
      visitDate: new Date(visitDate),
      duration: parseInt(duration),
      groupSize: parseInt(groupSize),
      transportMode,
      accommodation,
      roomType,
      wheelchairAccess: wheelchairAccess || false,
      medicalAssistance: medicalAssistance || false,
      specialDiet: specialDiet || false,
      additionalRequests,
      status: 'pending'
    };

    const booking = await storage.createYatraBooking(bookingData);

    res.json({
      success: true,
      message: 'Booking submitted successfully',
      referenceId,
      booking
    });

  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit booking. Please try again.'
    });
  }
});

// Get booking by reference ID
app.get('/api/yatra/booking/:referenceId', async (req, res) => {
  try {
    const { referenceId } = req.params;
    const booking = await storage.getYatraBookingByReferenceId(referenceId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking'
    });
  }
});

// Get accommodations
app.get('/api/accommodations', async (req, res) => {
  try {
    const { location } = req.query;
    let accommodations;
    
    if (location) {
      accommodations = await storage.getAccommodationsByLocation(location as string);
    } else {
      accommodations = await storage.getAccommodations();
    }

    res.json({
      success: true,
      accommodations
    });

  } catch (error) {
    console.error('Get accommodations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve accommodations'
    });
  }
});

// Get transportation services
app.get('/api/transportation', async (req, res) => {
  try {
    const services = await storage.getTransportationServices();
    
    res.json({
      success: true,
      services
    });

  } catch (error) {
    console.error('Get transportation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transportation services'
    });
  }
});

// Get gallery images
app.get('/api/gallery', async (req, res) => {
  try {
    const { category } = req.query;
    let images;
    
    if (category) {
      images = await storage.getGalleryImagesByCategory(category as string);
    } else {
      images = await storage.getGalleryImages();
    }

    res.json({
      success: true,
      images
    });

  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve gallery images'
    });
  }
});

// Get announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await storage.getActiveAnnouncements();
    
    res.json({
      success: true,
      announcements
    });

  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve announcements'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

export default app;