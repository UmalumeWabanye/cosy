const express = require('express');
const { protect } = require('../middleware/auth');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const router = express.Router();

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name email avatar role university course')
      .populate('property', 'propertyName city images')
      .sort({ lastMessageAt: -1 })
      .lean();

    const data = await Promise.all(conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        sender: { $ne: req.user._id },
        isReadBy: { $ne: req.user._id },
      });
      return { ...conv, unreadCount };
    }));

    res.json({ data });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load conversations' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { recipientId, propertyId = null } = req.body;
    if (!recipientId) return res.status(400).json({ message: 'recipientId is required' });

    if (String(recipientId) === String(req.user._id)) {
      return res.status(400).json({ message: 'Cannot message yourself' });
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, recipientId], $size: 2 },
      ...(propertyId ? { property: propertyId } : { property: null }),
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, recipientId],
        property: propertyId,
      });
    }

    const populated = await conversation.populate('participants', 'name email avatar role university course');
    res.status(201).json({ data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to start conversation' });
  }
});

router.get('/:conversationId', async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId)
      .populate('participants', 'name email avatar role university course')
      .populate('property', 'propertyName city images');

    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.some((p) => String(p._id) === String(req.user._id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: 1 });

    await Message.updateMany(
      { conversation: conversation._id, sender: { $ne: req.user._id }, isReadBy: { $ne: req.user._id } },
      { $addToSet: { isReadBy: req.user._id } }
    );

    res.json({ data: { conversation, messages } });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to load messages' });
  }
});

router.post('/:conversationId', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text is required' });

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });
    if (!conversation.participants.some((id) => String(id) === String(req.user._id))) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      text: text.trim(),
      isReadBy: [req.user._id],
    });

    conversation.lastMessage = text.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await message.populate('sender', 'name email avatar role');
    res.status(201).json({ data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to send message' });
  }
});

module.exports = router;
