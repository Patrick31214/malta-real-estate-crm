const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./config/database');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const ownerRoutes = require('./routes/owners');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Allow the developer frontend (CLIENT_URL, usually localhost:3000 in dev mode)
// and the server's own port (localhost:{PORT} in production where React is served
// by this same Express process).
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  `http://localhost:${PORT}`
];
app.use(cors({
  origin: (origin, callback) => {
    // Requests with no Origin header come from:
    //   - Same-origin browser fetches (React app served by this process on port 3001)
    //   - Command-line tools such as Postman or curl
    //   - Mobile webviews
    // All of these are intentionally allowed — same-origin requests require no CORS
    // header, and API testing tools need access during development.
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/owners', ownerRoutes);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  if (process.env.NODE_ENV !== 'production') {
    // In development mode the React app runs on the Vite dev server (port 3000),
    // not on this API server (port 3001).  Redirect the user so they land on the
    // correct address instead of seeing raw JSON.
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return res.redirect(302, clientUrl);
  }
  res.status(200).json({
    success: true,
    message: 'Malta Real Estate CRM API',
    version: '1.0.0'
  });
});

// 404 handler - serve frontend for non-API routes in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  }
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Start listening
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API Documentation: http://localhost:${PORT}/`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
