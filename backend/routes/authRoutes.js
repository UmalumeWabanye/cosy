const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

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
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
