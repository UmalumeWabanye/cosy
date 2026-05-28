const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, adminOnly } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validateRequest');
const {
  getUsers,
  getUser,
  getLandlordOverview,
  getLandlordFilterOptions,
  toggleUser,
  deleteUser,
  getReports,
  getTransportOversight,
  getMaintenanceOversight,
  getPropertyHealth,
  getCollectionReport,
} = require('../controllers/adminController');
const {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { runReminderJobs } = require('../utils/runReminderJobs');
const AnalyticsEvent = require('../models/AnalyticsEvent');
const SideEffectJob = require('../models/SideEffectJob');
const {
  getQueueHealth,
  processSideEffectQueue,
  requeueFailedJobs,
  requeueFailedJobsByIds,
} = require('../utils/sideEffectQueue');

// All routes require authentication
router.use(protect);

// Verify admin portal key server-side before granting dashboard entry
router.post('/access/verify', [
  adminOnly,
  body('accessKey').isString().trim().notEmpty().isLength({ max: 128 }).withMessage('Access key is required'),
  handleValidation,
], (req, res) => {
  const expectedKey = process.env.ADMIN_PORTAL_KEY;

  if (!expectedKey) {
    return res.status(500).json({ message: 'Admin portal key is not configured on the server' });
  }

  if (req.body.accessKey !== expectedKey) {
    return res.status(403).json({ message: 'Invalid admin access key' });
  }

  return res.json({ success: true });
});

// Admin-only management routes
router.use('/users', adminOnly);
router.get('/users', getUsers);
router.get('/users/landlord-filter-options', getLandlordFilterOptions);
router.get('/users/:id/overview', getLandlordOverview);
router.get('/users/:id', getUser);
router.patch('/users/:id/toggle', toggleUser);
router.delete('/users/:id', deleteUser);

router.use('/reports', adminOnly);
router.get('/reports', getReports);
router.get('/reports/property-health', getPropertyHealth);
router.get('/reports/transport', getTransportOversight);
router.get('/reports/maintenance', getMaintenanceOversight);
router.get('/reports/collection', getCollectionReport);
router.get('/reports/funnel-summary', async (req, res, next) => {
  try {
    const days = Math.max(1, Math.min(90, Number(req.query.days || 30)));
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const rows = await AnalyticsEvent.aggregate([
      {
        $match: {
          createdAt: { $gte: from },
          event: {
            $in: [
              'landing-page-load',
              'browse-visit',
              'listing-view',
              'signup-attempt',
              'signup-confirm',
              'application-submit',
            ],
          },
        },
      },
      { $group: { _id: '$event', count: { $sum: 1 } } },
    ]);

    const counts = rows.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {
      'landing-page-load': 0,
      'browse-visit': 0,
      'listing-view': 0,
      'signup-attempt': 0,
      'signup-confirm': 0,
      'application-submit': 0,
    });

    const toPct = (num, den) => (den > 0 ? Number(((num / den) * 100).toFixed(2)) : 0);

    return res.json({
      success: true,
      window: { days, from: from.toISOString(), to: new Date().toISOString() },
      funnel: counts,
      conversion: {
        landingToBrowsePct: toPct(counts['browse-visit'], counts['landing-page-load']),
        browseToListingPct: toPct(counts['listing-view'], counts['browse-visit']),
        listingToSignupAttemptPct: toPct(counts['signup-attempt'], counts['listing-view']),
        signupAttemptToConfirmPct: toPct(counts['signup-confirm'], counts['signup-attempt']),
        signupConfirmToApplicationPct: toPct(counts['application-submit'], counts['signup-confirm']),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/jobs/reminders/run', adminOnly, async (req, res, next) => {
  try {
    const result = await runReminderJobs();
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

router.get('/jobs/side-effects/health', adminOnly, async (req, res, next) => {
  try {
    const failedSampleLimit = Math.max(1, Math.min(50, Number(req.query.failedSampleLimit || 10)));
    const result = await getQueueHealth({ failedSampleLimit });
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

router.post('/jobs/side-effects/run', adminOnly, async (req, res, next) => {
  try {
    const batchSize = Math.max(1, Math.min(200, Number(req.body?.batchSize || 50)));
    const result = await processSideEffectQueue({ batchSize, workerId: `admin:${req.user?._id || 'unknown'}` });
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

router.post('/jobs/side-effects/requeue-failed', adminOnly, async (req, res, next) => {
  try {
    const { id } = req.body || {};
    const limit = Math.max(1, Math.min(500, Number(req.body?.limit || 100)));
    const result = await requeueFailedJobs({ id, limit });
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

router.get('/jobs/side-effects', adminOnly, async (req, res, next) => {
  try {
    const status = String(req.query.status || '').trim();
    const type = String(req.query.type || '').trim();
    const correlationId = String(req.query.correlationId || '').trim();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(req.query.limit || 20)));

    const query = {};
    if (status && ['pending', 'processing', 'completed', 'failed'].includes(status)) {
      query.status = status;
    }
    if (type && ['email', 'notification'].includes(type)) {
      query.type = type;
    }
    if (correlationId) {
      query.correlationId = new RegExp(correlationId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    }

    const skip = (page - 1) * limit;
    const [total, jobs] = await Promise.all([
      SideEffectJob.countDocuments(query),
      SideEffectJob.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('type status attempts maxAttempts runAfter lastError correlationId lockedAt completedAt createdAt updatedAt')
        .lean(),
    ]);

    res.json({
      success: true,
      data: jobs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
});

router.get('/jobs/side-effects/:id', adminOnly, async (req, res, next) => {
  try {
    const job = await SideEffectJob.findById(req.params.id).lean();
    if (!job) {
      return res.status(404).json({ message: 'Queue job not found' });
    }
    return res.json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
});

router.post('/jobs/side-effects/requeue-selected', adminOnly, async (req, res, next) => {
  try {
    const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
    const result = await requeueFailedJobsByIds({ ids });
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

// Notifications are admin-only in this namespace
router.use('/notifications', adminOnly);
router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', markAllRead);
router.patch('/notifications/:id/read', markRead);
router.delete('/notifications/:id', deleteNotification);

module.exports = router;
