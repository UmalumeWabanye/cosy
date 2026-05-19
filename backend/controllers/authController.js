const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendInviteEmail = require('../utils/sendInviteEmail');
const Notification = require('../models/Notification');
const crypto = require('crypto');

// @desc   Register a new user
// @route  POST /api/auth/register
// @access Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, university, fundingType, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.statusCode = 400;
      throw new Error('User already exists with that email');
    }

    const normalizedRole = role === 'landlord' ? 'landlord' : role === 'admin' ? 'admin' : 'student';

    const user = await User.create({
      name,
      email,
      password,
      university,
      fundingType,
      role: normalizedRole,
    });

    // Notify admins of new self-registration
    await Notification.create({
      type: 'new_user',
      title: 'New User Registered',
      message: `${name} (${email}) registered as a ${normalizedRole}.`,
      link: '/admin/users',
      refModel: 'User',
      refId: user._id,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      university: user.university,
      fundingType: user.fundingType,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Login user
// @route  POST /api/auth/login
// @access Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.statusCode = 401;
      throw new Error('Invalid email or password');
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      university: user.university,
      fundingType: user.fundingType,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get current user profile
// @route  GET /api/auth/me
// @access Private
const getMe = async (req, res) => {
  res.json(req.user);
};

// @desc   Admin creates/invites a new user (sends setup email via Resend)
// @route  POST /api/auth/invite
// @access Private/Admin
const inviteUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email || !role) {
      res.statusCode = 400;
      throw new Error('Name, email and role are required');
    }

    const allowedRoles = ['student', 'landlord', 'admin'];
    if (!allowedRoles.includes(role)) {
      res.statusCode = 400;
      throw new Error('Invalid role');
    }

    const existing = await User.findOne({ email });
    if (existing) {
      res.statusCode = 400;
      throw new Error('A user with that email already exists');
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
      inviteTokenExpiry: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 h
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const setupUrl = `${frontendUrl}/setup-password?token=${rawToken}`;

    await sendInviteEmail({ name, email, role, setupUrl });

    // Notify admins
    await Notification.create({
      type: 'user_invited',
      title: 'New User Invited',
      message: `${name} (${email}) was invited as a ${role}.`,
      link: '/admin/users',
      refModel: 'User',
      refId: user._id,
    });

    res.status(201).json({
      message: `Invite sent to ${email}`,
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Validate invite token & return user info (no password exposed)
// @route  GET /api/auth/invite/:token
// @access Public
const getInvite = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      inviteToken: hashedToken,
      inviteTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      res.statusCode = 400;
      throw new Error('Invite link is invalid or has expired');
    }

    res.json({ name: user.name, email: user.email, role: user.role });
  } catch (error) {
    next(error);
  }
};

// @desc   Complete account setup (set password from invite link)
// @route  POST /api/auth/setup-password
// @access Public
const setupPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 6) {
      res.statusCode = 400;
      throw new Error('Token and a password of at least 6 characters are required');
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      inviteToken: hashedToken,
      inviteTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      res.statusCode = 400;
      throw new Error('Invite link is invalid or has expired');
    }

    user.password = password;
    user.passwordSet = true;
    user.isVerified = true;
    user.inviteToken = undefined;
    user.inviteTokenExpiry = undefined;
    await user.save();

    res.json({
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, inviteUser, getInvite, setupPassword };
