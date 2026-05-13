const User = require('../models/User');
const Property = require('../models/Property');
const Request = require('../models/Request');

// ── Users ──────────────────────────────────────────────────────────────────────

// @desc   Get all users (with optional filters)
// @route  GET /api/admin/users
// @access Admin
const getUsers = async (req, res, next) => {
  try {
    const { role, university, fundingType, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (university) filter.university = university;
    if (fundingType) filter.fundingType = fundingType;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      data: users,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single user + their requests
// @route  GET /api/admin/users/:id
// @access Admin
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const requests = await Request.find({ userId: req.params.id })
      .populate('propertyId', 'name location pricing')
      .sort({ createdAt: -1 });

    res.json({ data: { ...user.toObject(), requests } });
  } catch (error) {
    next(error);
  }
};

// @desc   Toggle user active/deactivated (uses isVerified as active flag)
// @route  PATCH /api/admin/users/:id/toggle
// @access Admin
const toggleUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot deactivate an admin account' });

    user.isVerified = !user.isVerified;
    await user.save();

    res.json({ data: user, message: `User ${user.isVerified ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete user
// @route  DELETE /api/admin/users/:id
// @access Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete an admin account' });

    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ── Reports ────────────────────────────────────────────────────────────────────

// @desc   Get aggregated admin reports/summary
// @route  GET /api/admin/reports
// @access Admin
const getReports = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalRequests,
      usersByRole,
      usersByFunding,
      usersByUniversity,
      requestsByStatus,
      propertiesByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Request.countDocuments(),
      User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
      User.aggregate([
        { $match: { fundingType: { $exists: true, $ne: null } } },
        { $group: { _id: '$fundingType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      User.aggregate([
        { $match: { university: { $exists: true, $ne: null } } },
        { $group: { _id: '$university', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      Request.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Property.aggregate([
        { $group: { _id: '$published', count: { $sum: 1 } } },
      ]),
    ]);

    // Monthly signups — last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlySignups = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Monthly requests — last 6 months
    const monthlyRequests = await Request.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      data: {
        summary: { totalUsers, totalProperties, totalRequests },
        usersByRole,
        usersByFunding,
        usersByUniversity,
        requestsByStatus,
        propertiesByStatus,
        monthlySignups,
        monthlyRequests,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Monthly collection report — approved requests with payment breakdown
// @route  GET /api/admin/reports/collection
// @access Admin
const getCollectionReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetYear = Number(year) || now.getFullYear();
    const targetMonth = Number(month) || now.getMonth() + 1; // 1-12

    // Fetch all approved requests, populate student + property
    const approved = await Request.find({ status: 'approved' })
      .populate('student', 'name email fundingType phone')
      .populate('property', 'propertyName city price roomType')
      .sort({ moveInDate: 1 });

    // Build a row per tenant — flag payment status based on moveInDate + leaseDuration
    const rows = approved.map((r) => {
      const moveIn = new Date(r.moveInDate);
      const leaseEndDate = new Date(moveIn);
      leaseEndDate.setMonth(leaseEndDate.getMonth() + r.leaseDuration);

      const targetDate = new Date(targetYear, targetMonth - 1, 1);
      const isActiveInMonth = moveIn <= new Date(targetYear, targetMonth, 0) && leaseEndDate >= targetDate;

      // Simple heuristic: if moveInDate is in the future for this month → expected
      // In a real system you'd have a payments collection; for now we derive from dates
      const isPastDue = moveIn < targetDate && isActiveInMonth;
      const paymentStatus = !isActiveInMonth ? 'inactive' : isPastDue ? 'expected' : 'upcoming';

      return {
        requestId: r._id,
        student: r.student,
        property: r.property,
        moveInDate: r.moveInDate,
        leaseDuration: r.leaseDuration,
        leaseEndDate,
        fundingType: r.fundingType,
        monthlyRent: r.property?.price ?? 0,
        paymentStatus,
        isActiveInMonth,
      };
    });

    const active = rows.filter((r) => r.isActiveInMonth);
    const totalExpected = active.reduce((s, r) => s + r.monthlyRent, 0);

    res.json({
      data: {
        month: targetMonth,
        year: targetYear,
        rows: active,
        summary: {
          totalActiveTenants: active.length,
          totalExpected,
          byFunding: {
            NSFAS: active.filter((r) => r.fundingType === 'NSFAS').length,
            Private: active.filter((r) => r.fundingType === 'Private').length,
            'Self-funded': active.filter((r) => r.fundingType === 'Self-funded').length,
          },
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, getUser, toggleUser, deleteUser, getReports, getCollectionReport };
