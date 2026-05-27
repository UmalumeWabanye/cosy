const Request = require('../models/Request');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const Property = require('../models/Property');
const SavedSearch = require('../models/SavedSearch');
const sendEventEmail = require('./sendEventEmail');
const { canSendEmail, canSendPush } = require('./notificationPreferences');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
let isRunning = false;

const ensureConversation = async (senderId, recipientId, propertyId) => {
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, recipientId], $size: 2 },
    property: propertyId,
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, recipientId],
      property: propertyId,
    });
  }

  return conversation;
};

const sendConversationMessage = async ({ senderId, recipientId, propertyId, text }) => {
  if (!senderId || !recipientId || !propertyId || !text) return;

  const conversation = await ensureConversation(senderId, recipientId, propertyId);

  await Message.create({
    conversation: conversation._id,
    sender: senderId,
    text,
    isReadBy: [senderId],
  });

  conversation.lastMessage = text;
  conversation.lastMessageAt = new Date();
  await conversation.save();
};

const buildSavedSearchFilter = (filters = {}) => {
  const query = {};
  if (filters.city) query.city = new RegExp(filters.city, 'i');
  if (filters.university) query.universityNearby = new RegExp(filters.university, 'i');
  if (filters.search) {
    query.$or = [
      { propertyName: new RegExp(filters.search, 'i') },
      { city: new RegExp(filters.search, 'i') },
      { address: new RegExp(filters.search, 'i') },
      { universityNearby: new RegExp(filters.search, 'i') },
    ];
  }
  if (filters.roomType) query.roomType = new RegExp(`^${filters.roomType}$`, 'i');
  if (filters.nsfas) query.nsfasAccredited = true;

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    query.price = {};
    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice !== '') {
      query.price.$gte = Number(filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice !== '') {
      query.price.$lte = Number(filters.maxPrice);
    }
    if (!Object.keys(query.price).length) delete query.price;
  }

  return query;
};

const runReminderJobs = async () => {
  if (isRunning) {
    return { skipped: true, reason: 'already_running' };
  }

  isRunning = true;
  const now = new Date();

  try {
    const inThreeDays = new Date(now);
    inThreeDays.setDate(inThreeDays.getDate() + 3);

    const moveInRequests = await Request.find({
      status: 'approved',
      moveInReminderSentAt: { $exists: false },
      moveInDate: { $gte: now, $lte: inThreeDays },
    })
      .populate('student', 'name email notificationPreferences')
      .populate('property', 'propertyName createdBy')
      .lean();

    let moveInReminderCount = 0;

    for (const req of moveInRequests) {
      const student = req.student;
      const property = req.property;
      const landlordId = property?.createdBy;
      if (!student?._id || !landlordId || !property?._id) continue;

      const formattedDate = req.moveInDate ? new Date(req.moveInDate).toLocaleDateString('en-ZA') : 'soon';
      const text = `Reminder: your move-in date for ${property.propertyName || 'your accommodation'} is ${formattedDate}. Please confirm your arrival details if needed.`;

      await sendConversationMessage({
        senderId: landlordId,
        recipientId: student._id,
        propertyId: property._id,
        text,
      });

      if (canSendPush(student, 'pushMessages')) {
        await Notification.create({
          recipient: student._id,
          type: 'request_updated',
          title: 'Move-In Reminder',
          message: `Your move-in date is approaching for ${property.propertyName || 'your accommodation'}.`,
          link: '/messages',
          refModel: 'Request',
          refId: req._id,
        });
      }

      if (canSendEmail(student, 'emailMoveInReminders')) {
        await sendEventEmail({
          to: student.email,
          subject: 'Move-in reminder from Cosy',
          heading: 'Your move-in is coming up',
          body: `Your move-in date for ${property.propertyName || 'your accommodation'} is ${formattedDate}.`,
          ctaUrl: `${FRONTEND_URL}/messages`,
          ctaLabel: 'Open Messages',
        });
      }

      await Request.updateOne({ _id: req._id }, { $set: { moveInReminderSentAt: now } });
      moveInReminderCount += 1;
    }

    const unassignedRequests = await Request.find({
      status: 'approved',
      allocationReminderSentAt: { $exists: false },
      $or: [{ roomNumber: { $exists: false } }, { roomNumber: '' }],
      createdAt: { $lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
    })
      .populate('student', 'name email')
      .populate('property', 'propertyName createdBy')
      .lean();

    const landlordCache = new Map();
    let allocationAlertCount = 0;

    for (const req of unassignedRequests) {
      const landlordId = req.property?.createdBy ? String(req.property.createdBy) : '';
      if (!landlordId) continue;

      if (!landlordCache.has(landlordId)) {
        const landlord = await User.findById(landlordId).select('name email notificationPreferences').lean();
        landlordCache.set(landlordId, landlord || null);
      }

      const landlord = landlordCache.get(landlordId);
      if (!landlord) continue;

      const studentName = req.student?.name || 'A student';
      const propertyName = req.property?.propertyName || 'a property';

      if (canSendPush(landlord, 'pushMessages')) {
        await Notification.create({
          recipient: landlord._id,
          type: 'request_updated',
          title: 'Allocation Reminder',
          message: `${studentName} is approved for ${propertyName} but still has no room assigned.`,
          link: `/landlord/requests?requestId=${req._id}`,
          refModel: 'Request',
          refId: req._id,
        });
      }

      if (canSendEmail(landlord, 'emailLandlordAlerts')) {
        await sendEventEmail({
          to: landlord.email,
          subject: 'Approved request still needs room allocation',
          heading: 'Room allocation reminder',
          body: `${studentName} is approved for ${propertyName} but is still unassigned. Please allocate a room to complete onboarding.`,
          ctaUrl: `${FRONTEND_URL}/landlord/requests?requestId=${req._id}`,
          ctaLabel: 'Open Requests',
        });
      }

      await Request.updateOne({ _id: req._id }, { $set: { allocationReminderSentAt: now } });
      allocationAlertCount += 1;
    }

    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const searches = await SavedSearch.find({
      $or: [{ lastAlertSentAt: null }, { lastAlertSentAt: { $lte: dayAgo } }],
    }).lean();

    const userCache = new Map();
    let savedSearchDigestCount = 0;

    for (const search of searches) {
      const studentId = String(search.student);
      if (!userCache.has(studentId)) {
        const student = await User.findById(studentId).select('name email notificationPreferences').lean();
        userCache.set(studentId, student || null);
      }
      const student = userCache.get(studentId);
      if (!student) continue;

      const matchCount = await Property.countDocuments(buildSavedSearchFilter(search.filters));
      const isIncrease = matchCount > Number(search.lastMatchedCount || 0);

      if (isIncrease && canSendPush(student, 'pushApplicationUpdates')) {
        await Notification.create({
          recipient: student._id,
          type: 'request_updated',
          title: 'Saved Search Digest',
          message: `${search.name}: ${matchCount} properties currently match your saved search.`,
          link: '/browse',
          refModel: 'User',
          refId: student._id,
        });
      }

      if (isIncrease && canSendEmail(student, 'emailNewListings')) {
        await sendEventEmail({
          to: student.email,
          subject: 'New matching properties are available',
          heading: 'Saved search digest',
          body: `${search.name}: ${matchCount} properties currently match your search preferences.`,
          ctaUrl: `${FRONTEND_URL}/browse`,
          ctaLabel: 'Browse Matches',
        });
      }

      await SavedSearch.updateOne(
        { _id: search._id },
        { $set: { lastMatchedCount: matchCount, lastAlertSentAt: now } }
      );

      if (isIncrease) savedSearchDigestCount += 1;
    }

    return {
      skipped: false,
      moveInReminderCount,
      allocationAlertCount,
      savedSearchDigestCount,
    };
  } finally {
    isRunning = false;
  }
};

module.exports = { runReminderJobs };
