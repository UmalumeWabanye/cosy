require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const correlationId = require('./middleware/correlationId');

// Route imports
const authRoutes = require('./routes/authRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const requestRoutes = require('./routes/requestRoutes');
const adminRoutes = require('./routes/adminRoutes');
const landlordRoutes = require('./routes/landlordRoutes');
const studentRoutes = require('./routes/studentRoutes');
const savedRoutes = require('./routes/savedRoutes');
const messageRoutes = require('./routes/messageRoutes');
const viewingRoutes = require('./routes/viewingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const { runReminderJobs } = require('./utils/runReminderJobs');
const { getQueueHealth, processSideEffectQueue } = require('./utils/sideEffectQueue');

// Connect to MongoDB
connectDB();

const app = express();
app.set('trust proxy', 1);

// CORS configuration - must be before routes
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://cosyliving.netlify.app',
      'https://cosy-ten.vercel.app',
      /https:\/\/cosy.*\.netlify\.app$/,
      /https:\/\/cosy.*\.vercel\.app$/,
    ];
    
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return origin === allowedOrigin;
    });
    
    if (!origin || isAllowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Correlation-Id',
    'x-correlation-id',
  ],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(correlationId);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
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

app.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

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

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/landlord', landlordRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/viewings', viewingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/analytics', analyticsRoutes);

const reminderJobsEnabled = process.env.ENABLE_REMINDER_JOBS !== 'false';
if (reminderJobsEnabled) {
  const reminderIntervalMs = Number(process.env.REMINDER_JOBS_INTERVAL_MS || 6 * 60 * 60 * 1000);

  setTimeout(() => {
    runReminderJobs().catch((error) => {
      console.error('Initial reminder job failed:', error.message || error);
    });
  }, 30 * 1000);

  setInterval(() => {
    runReminderJobs().catch((error) => {
      console.error('Scheduled reminder job failed:', error.message || error);
    });
  }, reminderIntervalMs);
}

const sideEffectQueueEnabled = process.env.ENABLE_SIDE_EFFECT_QUEUE !== 'false';
if (sideEffectQueueEnabled) {
  const intervalMs = Number(process.env.SIDE_EFFECT_QUEUE_INTERVAL_MS || 15000);

  setTimeout(() => {
    processSideEffectQueue().catch((error) => {
      console.error('Initial side-effect queue run failed:', error.message || error);
    });
  }, 5000);

  setInterval(() => {
    processSideEffectQueue().catch((error) => {
      console.error('Scheduled side-effect queue run failed:', error.message || error);
    });
  }, intervalMs);
}

// Backwards-compatible admin-prefixed routes (some frontends call /api/admin/...)
app.use('/api/admin/properties', propertyRoutes);
app.use('/api/admin/requests', requestRoutes);

// Lightweight admin probe: unauthenticated health check for admin-prefixed routes
app.get('/api/admin/health', (req, res) => {
  res.json({ status: 'ok', adminPrefix: true, timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
// Bind explicitly to 0.0.0.0 to ensure IPv4 localhost access and avoid
// potential binding to only IPv6 or another interface in some environments.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT} (host 0.0.0.0)`);
});

module.exports = app;
