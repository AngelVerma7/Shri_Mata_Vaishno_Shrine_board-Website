// Yatra Booking API using MySQL

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MySQL Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'yatra_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Generate reference ID
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

    const conn = await pool.getConnection();

    try {
      // Check if user exists
      const [userRows] = await conn.query('SELECT id FROM users WHERE email = ?', [email]);

      let userId;
      if (userRows.length === 0) {
        const [result] = await conn.query(
          'INSERT INTO users (first_name, last_name, email, phone, age, gender) VALUES (?, ?, ?, ?, ?, ?)',
          [firstName, lastName, email, phone, age, gender]
        );
        userId = result.insertId;
      } else {
        userId = userRows[0].id;
      }

      const referenceId = generateReferenceId();

      const [bookingResult] = await conn.query(
        `INSERT INTO yatra_bookings (
          user_id, reference_id, visit_date, duration, group_size,
          transport_mode, accommodation, room_type, wheelchair_access,
          medical_assistance, special_diet, additional_requests, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          referenceId,
          visitDate,
          duration,
          groupSize,
          transportMode,
          accommodation,
          roomType,
          wheelchairAccess || false,
          medicalAssistance || false,
          specialDiet || false,
          additionalRequests,
          'pending'
        ]
      );

      res.json({
        success: true,
        message: 'Booking submitted successfully',
        referenceId,
        booking: {
          id: bookingResult.insertId,
          referenceId,
          status: 'pending'
        }
      });
    } finally {
      conn.release();
    }
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
    const [rows] = await pool.query('SELECT * FROM yatra_bookings WHERE reference_id = ?', [referenceId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, booking: rows[0] });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve booking' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`API server running on port ${PORT}`);
});

module.exports = app;