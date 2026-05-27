const express = require('express');
const router = express.Router();
const AnalyticsEvent = require('../models/AnalyticsEvent');

const ALLOWED_EVENTS = new Set([
  'landing-page-load',
  'cta-click',
  'listing-view',
  'compare-click',
  'save-search',
  'signup-attempt',
  'signup-confirm',
  'application-submit',
  'browse-visit',
  'campus-page-view',
]);

router.post('/events', async (req, res, next) => {
  try {
    const event = String(req.body?.event || '').trim();
    if (!event || !ALLOWED_EVENTS.has(event)) {
      return res.status(400).json({ message: 'Invalid analytics event' });
    }

    await AnalyticsEvent.create({
      event,
      url: typeof req.body?.url === 'string' ? req.body.url : '',
      source: typeof req.body?.source === 'string' ? req.body.source : 'direct',
      sessionId: typeof req.body?.sessionId === 'string' ? req.body.sessionId : '',
      properties: typeof req.body === 'object' && req.body !== null ? req.body : {},
      userId: req.body?.userId || null,
    });

    return res.status(202).json({ success: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
