const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, param } = require('express-validator');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const { handleValidation } = require('../middleware/validateRequest');
const sendInviteEmail = require('../utils/sendInviteEmail');

const router = express.Router();

// LOGIN ROUTE
router.post('/login', [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters long'),
  handleValidation,
], async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        university: user.university,
        course: user.course,
        yearOfStudy: user.yearOfStudy,
        fundingType: user.fundingType,
        avatar: user.avatar,
        idNumber: user.idNumber,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// REGISTER ROUTE
router.post('/register', [
  body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters long'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isString().isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters long'),
  body('role').optional().isIn(['student', 'admin', 'landlord']).withMessage('Invalid role'),
  body('university').optional().isString().trim().isLength({ max: 150 }).withMessage('University is too long'),
  body('fundingType').optional().isString().trim().isLength({ max: 50 }).withMessage('Funding type is invalid'),
  handleValidation,
], async (req, res) => {
  const { name, email, password, role, university, fundingType } = req.body;
  try {
    // Check if the user already exists
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    // Create user (password hash handled by User schema pre-save)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      university,
      fundingType,
      isVerified: false,
      verifiedStudent: false,
    });
  // Create JWT
  const token = generateToken(user._id);
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        university: user.university,
        course: user.course,
        yearOfStudy: user.yearOfStudy,
        fundingType: user.fundingType,
        avatar: user.avatar,
        idNumber: user.idNumber,
        notificationPreferences: user.notificationPreferences,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error (register)' });
  }
});

// GET current user (for /api/auth/me)
router.get('/me', protect, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  res.json({ success: true, user: req.user });
});

// PATCH /api/auth/me — update student profile (name, phone, university, fundingType, avatar)
router.patch('/me', [
  protect,
  body('name').optional().isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters long'),
  body('phone').optional().isString().trim().isLength({ max: 30 }).withMessage('Phone number is invalid'),
  body('university').optional().isString().trim().isLength({ max: 150 }).withMessage('University is too long'),
  body('course').optional().isString().trim().isLength({ max: 150 }).withMessage('Course is too long'),
  body('yearOfStudy').optional().isString().trim().isLength({ max: 30 }).withMessage('Year of study is invalid'),
  body('fundingType').optional().isString().trim().isLength({ max: 50 }).withMessage('Funding type is invalid'),
  body('avatar').optional().isString().withMessage('Avatar is invalid'),
  body('idNumber').optional().isString().trim().isLength({ max: 30 }).withMessage('ID number is invalid'),
  body('profileComplete').optional().isBoolean().withMessage('Profile complete must be true or false'),
  body('livingPreference').optional().isIn(['individual', 'shared', 'noPreference']).withMessage('Living preference is invalid'),
  body('notificationPreferences').optional().isObject().withMessage('Notification preferences are invalid'),
  body('notificationPreferences.emailApplicationUpdates').optional().isBoolean().withMessage('Invalid emailApplicationUpdates value'),
  body('notificationPreferences.emailAllocationUpdates').optional().isBoolean().withMessage('Invalid emailAllocationUpdates value'),
  body('notificationPreferences.emailMoveInReminders').optional().isBoolean().withMessage('Invalid emailMoveInReminders value'),
  body('notificationPreferences.emailLandlordAlerts').optional().isBoolean().withMessage('Invalid emailLandlordAlerts value'),
  body('notificationPreferences.emailNewListings').optional().isBoolean().withMessage('Invalid emailNewListings value'),
  body('notificationPreferences.pushApplicationUpdates').optional().isBoolean().withMessage('Invalid pushApplicationUpdates value'),
  body('notificationPreferences.pushMessages').optional().isBoolean().withMessage('Invalid pushMessages value'),
  body('notificationPreferences.pushAllocationUpdates').optional().isBoolean().withMessage('Invalid pushAllocationUpdates value'),
  handleValidation,
], async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'university', 'course', 'yearOfStudy', 'fundingType', 'avatar', 'idNumber', 'profileComplete', 'livingPreference', 'notificationPreferences'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    if (updates.profileComplete !== undefined) {
      updates.profileComplete = updates.profileComplete === true || updates.profileComplete === 'true';
    }

    // If avatar is a base64 data URI, upload it to Cloudinary
    if (updates.avatar && updates.avatar.startsWith('data:')) {
      const cloudinary = require('../config/cloudinary');
      const result = await cloudinary.uploader.upload(updates.avatar, {
        folder: 'cosy/avatars',
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      });
      updates.avatar = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Could not update profile' });
  }
});

// PATCH /api/auth/change-password
router.patch('/change-password', [
  protect,
  body('currentPassword').isString().isLength({ min: 6, max: 128 }).withMessage('Current password must be 6-128 characters long'),
  body('newPassword').isString().isLength({ min: 6, max: 128 }).withMessage('New password must be 6-128 characters long'),
  handleValidation,
], async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Current password and a new password of at least 6 characters are required' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const match = await user.matchPassword(currentPassword);
    if (!match) return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Could not change password' });
  }
});

// PUT /api/auth/profile — update landlord onboarding profile
router.put('/profile', [
  protect,
  body('phone').optional().isString().trim().isLength({ max: 30 }).withMessage('Phone number is invalid'),
  body('whatsapp').optional().isString().trim().isLength({ max: 30 }).withMessage('WhatsApp number is invalid'),
  body('avatar').optional().isString().withMessage('Avatar is invalid'),
  body('city').optional().isString().trim().isLength({ max: 80 }).withMessage('City is too long'),
  body('province').optional().isString().trim().isLength({ max: 80 }).withMessage('Province is too long'),
  body('propertyType').optional().isString().trim().isLength({ max: 80 }).withMessage('Property type is invalid'),
  body('numberOfProperties').optional().isString().trim().isLength({ max: 30 }).withMessage('Number of properties is invalid'),
  body('idNumber').optional().isString().trim().isLength({ max: 30 }).withMessage('ID number is invalid'),
  body('profileComplete').optional().isBoolean().withMessage('Profile complete must be true or false'),
  handleValidation,
], async (req, res) => {
  try {
    const allowed = ['phone', 'whatsapp', 'avatar', 'city', 'province', 'propertyType', 'numberOfProperties', 'idNumber', 'profileComplete'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    // Upload base64 avatar to Cloudinary
    if (updates.avatar && updates.avatar.startsWith('data:')) {
      const cloudinary = require('../config/cloudinary');
      const result = await cloudinary.uploader.upload(updates.avatar, {
        folder: 'cosy/avatars',
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
      });
      updates.avatar = result.secure_url;
    }

    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Could not update profile' });
  }
});

// POST /api/auth/invite — admin invites a new user
router.post('/invite', [
  protect,
  adminOnly,
  body('name').isString().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters long'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('role').isIn(['student', 'landlord', 'admin']).withMessage('Invalid role'),
  handleValidation,
], async (req, res) => {
  try {
    const { name, email, role } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'A user with that email already exists' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    const user = await User.create({
      name,
      email,
      role,
      isInvited: true,
      passwordSet: false,
      isVerified: false,
      inviteToken: hashedToken,
      inviteTokenExpiry: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const setupUrl = `${frontendUrl}/setup-password?token=${rawToken}`;

    await sendInviteEmail({ name, email, role, setupUrl });

    res.status(201).json({ message: `Invite sent to ${email}`, userId: user._id });
  } catch (err) {
    console.error('Invite error:', err);
    res.status(500).json({ message: err.message || 'Could not send invite' });
  }
});

// GET /api/auth/invite/:token — validate invite token
router.get('/invite/:token', [
  param('token').isHexadecimal().isLength({ min: 64, max: 64 }).withMessage('Invalid invite token'),
  handleValidation,
], async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      inviteToken: hashedToken,
      inviteTokenExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invite link is invalid or has expired' });
    }
    res.json({ name: user.name, email: user.email, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/setup-password — complete account setup via invite
router.post('/setup-password', [
  body('token').isHexadecimal().isLength({ min: 64, max: 64 }).withMessage('Invalid invite token'),
  body('password').isString().isLength({ min: 6, max: 128 }).withMessage('Password must be 6-128 characters long'),
  handleValidation,
], async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6) {
      return res.status(400).json({ message: 'Token and a password of at least 6 characters are required' });
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      inviteToken: hashedToken,
      inviteTokenExpiry: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invite link is invalid or has expired' });
    }

    user.password = password;
    user.passwordSet = true;
    user.isVerified = true;
    user.inviteToken = undefined;
    user.inviteTokenExpiry = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);
    res.json({
      token: jwtToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error('Setup password error:', err);
    res.status(500).json({ message: 'Could not complete setup' });
  }
});

module.exports = router;
