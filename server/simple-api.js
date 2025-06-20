const express = require('express');
const cors = require('cors');
const { Pool } = require('@neondatabase/serverless');
const ws = require('ws');

// Configure Neon
const { neonConfig } = require('@neondatabase/serverless');
neonConfig.webSocketConstructor = ws;

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Generate reference ID for booking
function generateReferenceId() {
  return 'VD' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
}

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
    const userQuery = 'SELECT * FROM users WHERE email = $1';
    let userResult = await pool.query(userQuery, [email]);
    
    let userId;
    if (userResult.rows.length === 0) {
      // Create new user
      const insertUserQuery = `
        INSERT INTO users (first_name, last_name, email, phone, age, gender)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `;
      const newUserResult = await pool.query(insertUserQuery, [
        firstName, lastName, email, phone, parseInt(age), gender
      ]);
      userId = newUserResult.rows[0].id;
    } else {
      userId = userResult.rows[0].id;
    }

    // Create booking
    const referenceId = generateReferenceId();
    const insertBookingQuery = `
      INSERT INTO yatra_bookings (
        user_id, reference_id, visit_date, duration, group_size,
        transport_mode, accommodation, room_type, wheelchair_access,
        medical_assistance, special_diet, additional_requests, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;
    
    const bookingResult = await pool.query(insertBookingQuery, [
      userId,
      referenceId,
      new Date(visitDate),
      parseInt(duration),
      parseInt(groupSize),
      transportMode,
      accommodation,
      roomType,
      wheelchairAccess || false,
      medicalAssistance || false,
      specialDiet || false,
      additionalRequests,
      'pending'
    ]);

    res.json({
      success: true,
      message: 'Booking submitted successfully',
      referenceId,
      booking: bookingResult.rows[0]
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
    const query = 'SELECT * FROM yatra_bookings WHERE reference_id = $1';
    const result = await pool.query(query, [referenceId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      booking: result.rows[0]
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});

module.exports = app;