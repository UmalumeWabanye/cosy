require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('../config/db');
const errorHandler = require('../middleware/errorHandler');
const correlationId = require('../middleware/correlationId');
const { getQueueHealth } = require('../utils/sideEffectQueue');

// Route imports
const authRoutes = require('../routes/authRoutes');
const propertyRoutes = require('../routes/propertyRoutes');
const requestRoutes = require('../routes/requestRoutes');
const landlordRoutes = require('../routes/landlordRoutes');
const reviewRoutes = require('../routes/reviewRoutes');
const maintenanceRoutes = require('../routes/maintenanceRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// CORS configuration
app.use(cors({ 
  origin: ['https://cosyliving.netlify.app', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(correlationId);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

app.use('/api/', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health check
app.get('/api/health', async (req, res) => {
  const queueEnabled = process.env.ENABLE_SIDE_EFFECT_QUEUE !== 'false';
  let queue = null;

  if (queueEnabled) {
    try {
      const health = await getQueueHealth({ failedSampleLimit: 3 });
      queue = health.queue;
    } catch (error) {
      queue = { status: 'unavailable', message: error?.message || 'queue health unavailable' };
    }
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    queue,
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

module.exports = app;
