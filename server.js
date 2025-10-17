const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import the Express app
const app = require('./src/app');

const PORT = process.env.PORT || 8000;
const MONGO_URL = process.env.MONGO_URL;

// Create HTTP server
const server = http.createServer(app);

// MongoDB connection events
mongoose.connection.once('open', () => {
  console.log('✅ MongoDB connection is ready!');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error connecting with MongoDB:', err);
});

// Start server function
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 Server listening on port ${PORT}...`);
      console.log(`📊 Health check: http://localhost:${PORT}/`);
      console.log(`💳 API Base: http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();