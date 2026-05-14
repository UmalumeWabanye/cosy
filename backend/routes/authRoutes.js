const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const sendInviteEmail = require('../utils/sendInviteEmail');

const router = express.Router();

// LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!user.password) {
      console.log('User found but NO PASSWORD FIELD!', user);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('bcrypt.compare result:', isMatch);
    if (!isMatch) {
      console.log('Incorrect password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    console.log('Login success:', email);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        university: user.university,
        fundingType: user.fundingType,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// REGISTER ROUTE
router.post('/register', async (req, res) => {
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
        fundingType: user.fundingType,
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error (register)' });
  }
});

module.exports = router;

// GET current user (for /api/auth/me)
router.get('/me', protect, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'Not authorized' });
  res.json({ success: true, user: req.user });
});

// PATCH /api/auth/me — update student profile (name, phone, university, fundingType, avatar)
router.patch('/me', protect, async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'university', 'fundingType', 'avatar'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Could not update profile' });
  }
});

// PATCH /api/auth/change-password
router.patch('/change-password', protect, async (req, res) => {
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
router.put('/profile', protect, async (req, res) => {
  try {
    const allowed = ['phone', 'whatsapp', 'avatar', 'city', 'province', 'propertyType', 'numberOfProperties', 'idNumber', 'profileComplete'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    const user = await User.findByIdAndUpdate(req.user._id, { $set: updates }, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Could not update profile' });
  }
});

// POST /api/auth/invite — admin invites a new user
router.post('/invite', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { name, email, role } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email and role are required' });
    }
    const allowedRoles = ['student', 'landlord', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
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
router.get('/invite/:token', async (req, res) => {
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
router.post('/setup-password', async (req, res) => {
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
