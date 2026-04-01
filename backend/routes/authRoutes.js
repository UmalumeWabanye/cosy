const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Login route with debug logging
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  const user = await User.findOne({ email });
  if (!user) {
    console.log('User not found:', email);
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    console.log('Incorrect password for:', email);
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Create token if needed
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
      // Add any other user fields to send to the client
    },
  });
});

module.exports = router;
