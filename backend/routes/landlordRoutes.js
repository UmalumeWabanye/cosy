const express = require('express');
const { protect } = require('../middleware/auth');
const Property = require('../models/Property');
const Request = require('../models/Request');

const router = express.Router();

router.use(protect);

router.get('/reports/collection', async (req, res) => {
  try {
    if (req.user?.role !== 'landlord') {
      return res.status(403).json({ message: 'Landlord access required' });
    }

    const { month, year } = req.query;
    const now = new Date();
    const targetYear = Number(year) || now.getFullYear();
    const targetMonth = Number(month) || now.getMonth() + 1;

    const properties = await Property.find({ createdBy: req.user._id })
      .select('_id propertyName city price roomType isAvailable')
      .lean();

    const propertyIds = properties.map((property) => property._id);

    if (propertyIds.length === 0) {
      return res.json({
        data: {
          month: targetMonth,
          year: targetYear,
          properties: { total: 0, active: 0 },
          rows: [],
          summary: {
            totalActiveTenants: 0,
            totalExpected: 0,
            totalApplications: 0,
            pendingApplications: 0,
            approvedApplications: 0,
            rejectedApplications: 0,
            byFunding: { NSFAS: 0, Private: 0, 'Self-funded': 0 },
          },
        },
      });
    }
    const requests = await Request.find({ property: { $in: propertyIds }, status: 'approved' })
      .populate('student', 'name email fundingType phone university course')
      .populate('property', 'propertyName city price roomType')
      .sort({ createdAt: -1 });

    const monthStart = new Date(targetYear, targetMonth - 1, 1);
    const monthEnd = new Date(targetYear, targetMonth, 0);

    const rows = requests.map((request) => {
      const moveInDate = request.moveInDate ? new Date(request.moveInDate) : null;
      const leaseEndDate = moveInDate ? new Date(moveInDate) : null;

      if (leaseEndDate) {
        leaseEndDate.setMonth(leaseEndDate.getMonth() + Number(request.leaseDuration || 0));
      }

      const isActiveInMonth = Boolean(
        moveInDate &&
        leaseEndDate &&
        !Number.isNaN(moveInDate.getTime()) &&
        !Number.isNaN(leaseEndDate.getTime()) &&
        moveInDate <= monthEnd &&
        leaseEndDate >= monthStart
      );

      return {
        requestId: request._id,
        student: request.student,
        property: request.property,
        moveInDate: request.moveInDate,
        leaseDuration: request.leaseDuration,
        leaseEndDate,
        fundingType: request.fundingType,
        applicationStatus: request.status,
        monthlyRent: request.property?.price ?? 0,
        paymentStatus: !isActiveInMonth ? 'inactive' : request.status === 'approved' ? 'expected' : 'pending',
        isActiveInMonth,
      };
    });

    const active = rows.filter((row) => row.isActiveInMonth);

    res.json({
      data: {
        month: targetMonth,
        year: targetYear,
        properties: {
          total: properties.length,
          active: properties.filter((property) => property.isAvailable !== false).length,
        },
        rows: active,
        summary: {
          totalActiveTenants: active.length,
          totalExpected: active.reduce((sum, row) => sum + row.monthlyRent, 0),
          totalApplications: requests.filter((r) => r.status === 'approved').length,
          pendingApplications: requests.filter((r) => r.status === 'pending').length,
          approvedApplications: requests.filter((r) => r.status === 'approved').length,
          rejectedApplications: requests.filter((r) => r.status === 'rejected').length,
          byFunding: {
            NSFAS: active.filter((row) => row.fundingType === 'NSFAS').length,
            Private: active.filter((row) => row.fundingType === 'Private').length,
            'Self-funded': active.filter((row) => row.fundingType === 'Self-funded').length,
          },
        },
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to load collection report' });
  }
});

module.exports = router;
