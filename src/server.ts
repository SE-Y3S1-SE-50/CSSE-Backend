import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import paymentRoutes from './routes/paymentRoutes';
import authRoutes from './router/auth.router';
import adminRoutes from './router/admin.router';
import coverageRoutes from './router/coverage.router';
import cashPaymentReceiptRoutes from './routes/cashPaymentReceiptRoutes';
import User from './models/users.model';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGO_URL || process.env.MONGODB_URI || 'mongodb://localhost:27017/csse-payments';

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Test endpoint to check user data
app.get('/test-user/:userName', async (req, res) => {
  try {
    const { userName } = req.params;
    const user = await User.findOne({ userName });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let userProfile = null;
    if (user.role === 'Patient' && user.entityId) {
      const Patient = (await import('./models/patient.model')).default;
      userProfile = await Patient.findById(user.entityId);
    }

    res.json({
      user: {
        id: user._id,
        userName: user.userName,
        role: user.role,
        entityId: user.entityId
      },
      profile: userProfile
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test login endpoint
app.post('/test-login', async (req, res) => {
  try {
    const { userName, password } = req.body;
    
    if (!userName || !password) {
      return res.status(400).json({ message: 'Please provide username and password' });
    }

    const user = await User.findOne({ userName });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const bcrypt = (await import('bcryptjs')).default;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Fetch complete user profile data based on role
    let userProfile = null;
    if (user.role === 'Patient' && user.entityId) {
      try {
        const Patient = (await import('./models/patient.model')).default;
        userProfile = await Patient.findById(user.entityId);
      } catch (error) {
        console.log('Error fetching patient profile:', error);
      }
    }

    const responseData = {
      message: "Login successful",
      id: user._id,
      userId: user._id,
      userName: user.userName,
      role: user.role,
      firstName: userProfile?.firstName || '',
      lastName: userProfile?.lastName || '',
      email: userProfile?.email || '',
      phoneNumber: userProfile?.phoneNumber || '',
      gender: userProfile?.gender || '',
      entityId: user.entityId || null,
      hasProfile: !!userProfile
    };

    res.json(responseData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API routes
app.use('/api/payments', paymentRoutes);
app.use('/api/user', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coverage', coverageRoutes);
app.use('/api/cash-receipts', cashPaymentReceiptRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// MongoDB connection
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async (): Promise<void> => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`💳 Payment API: http://localhost:${PORT}/api/payments`);
    });
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

// Start the server
startServer();

export default app;
