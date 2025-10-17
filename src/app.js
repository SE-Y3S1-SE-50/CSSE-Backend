const express = require('express');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");

// Import routers
const appointmentRouter = require('./router/appointment.router');
const userRouter = require('./router/auth.router');
const patientRouter = require('./router/patient.router');
const doctorRouter = require('./router/doctor.router');
const departmentRouter = require('./router/department.router');
const staffRouter = require('./router/staff.router');
const scheduleRouter = require('./router/schedule.router');
const adminRouter = require('./router/admin.router');

// Import payment-related routers
const paymentRoutes = require('./routes/paymentRoutes');
const coverageRoutes = require('./router/coverage.router');
const cashPaymentReceiptRoutes = require('./routes/cashPaymentReceiptRoutes');

const app = express();

app.use(express.json());
app.use(cookieParser());

// CORS configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes - Main API
app.use('/api/appointment', appointmentRouter);
app.use('/api/user', userRouter);
app.use('/api/patient', patientRouter);
app.use('/api/doctor', doctorRouter);
app.use('/api/department', departmentRouter);
app.use('/api/staff', staffRouter);
app.use('/api/schedule', scheduleRouter);
app.use('/api/admin', adminRouter);

// Payment-related routes
app.use('/api/payments', paymentRoutes);
app.use('/api/coverage', coverageRoutes);
app.use('/api/cash-receipts', cashPaymentReceiptRoutes);

// Auth helpers - moved to /api prefix for consistency
app.get('/api/check-cookie', (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return res.json({ role: decoded.role, id: decoded.id });
  } catch (err) {
    console.error('Error verifying token:', err.message);
    return res.status(401).json({ message: 'Unauthorized: Invalid or expired token' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  res.json({ message: 'Logged out successfully!' });
});

// Root routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Doctor Booking API!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.get('/api', (req, res) => {
  res.json({ 
    message: 'Doctor Booking API is running!',
    version: '1.0.0',
    endpoints: {
      appointments: '/api/appointment',
      users: '/api/user',
      patients: '/api/patient',
      doctors: '/api/doctor',
      departments: '/api/department',
      staff: '/api/staff',
      schedules: '/api/schedule',
      admin: '/api/admin',
      payments: '/api/payments',
      coverage: '/api/coverage',
      cashReceipts: '/api/cash-receipts'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res) => {
  console.warn(`404 Error: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack || err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

module.exports = app;