const express = require('express');
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

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

