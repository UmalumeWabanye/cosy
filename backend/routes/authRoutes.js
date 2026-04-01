const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Login route with enhanced debug logging
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email, password });

  const user = await User.findOne({ email });
  console.log('DB result for user:', user);

  if (!user) {
    console.log('User not found:', email);
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.password) {
    console.log('User found but NO PASSWORD FIELD!', user);
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  try {
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Incorrect password for:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (e) {
    console.log('Bcrypt compare threw error:', e);
    return res.status(500).json({ message: 'Server error during password check' });
  }

  // Generate a token
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
    },
  });
});

module.exports = router;
