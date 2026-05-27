const User = require('../models/User');
const Property = require('../models/Property');
const Request = require('../models/Request');
const Viewing = require('../models/Viewing');
const Maintenance = require('../models/Maintenance');

// ── Users ──────────────────────────────────────────────────────────────────────

// @desc   Get all users (with optional filters)
// @route  GET /api/admin/users
// @access Admin
const getUsers = async (req, res, next) => {
  try {
    const {
      role,
      university,
      fundingType,
      search,
      city,
      institution,
      college,
      page = 1,
      limit = 20,
    } = req.query;
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

    // Landlord-specific location/institution filtering based on owned properties.
    if (role === 'landlord' && (city || university || institution || college)) {
      const propertyFilter = {};
      const institutionQuery = university || institution || college;

      if (city) propertyFilter.city = { $regex: city, $options: 'i' };
      if (institutionQuery) {
        propertyFilter.universityNearby = { $regex: institutionQuery, $options: 'i' };
      }

      const matchingLandlords = await Property.distinct('createdBy', propertyFilter);
      filter._id = { $in: matchingLandlords };
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

// @desc   Get landlord profile + portfolio data for admin drill-down
// @route  GET /api/admin/users/:id/overview
// @access Admin
const getLandlordOverview = async (req, res, next) => {
  try {
    const landlord = await User.findById(req.params.id).select('-password');
    if (!landlord) return res.status(404).json({ message: 'User not found' });
    if (landlord.role !== 'landlord') {
      return res.status(400).json({ message: 'Selected user is not a landlord' });
    }

    const properties = await Property.find({ createdBy: landlord._id }).sort({ createdAt: -1 });
    const propertyIds = properties.map((property) => property._id);

    const [requests, viewings] = await Promise.all([
      Request.find({ property: { $in: propertyIds } })
        .populate('student', 'name email university course fundingType')
        .populate('property', 'propertyName city universityNearby price isAvailable')
        .sort({ createdAt: -1 }),
      Viewing.find({ property: { $in: propertyIds } })
        .populate('student', 'name email university course')
        .populate('property', 'propertyName city universityNearby price isAvailable')
        .sort({ createdAt: -1 }),
    ]);

    const now = new Date();
    const requestsByProperty = new Map();
    const viewingsByProperty = new Map();

    for (const request of requests) {
      const propertyId = String(request.property?._id || request.property);
      const group = requestsByProperty.get(propertyId) || [];
      group.push(request);
      requestsByProperty.set(propertyId, group);
    }

    for (const viewing of viewings) {
      const propertyId = String(viewing.property?._id || viewing.property);
      const group = viewingsByProperty.get(propertyId) || [];
      group.push(viewing);
      viewingsByProperty.set(propertyId, group);
    }

    const portfolio = properties.map((property) => {
      const propertyId = String(property._id);
      const propertyRequests = requestsByProperty.get(propertyId) || [];
      const propertyViewings = viewingsByProperty.get(propertyId) || [];

      const approvedRequests = propertyRequests.filter((request) => request.status === 'approved');
      const activeResidents = approvedRequests
        .filter((request) => {
          const moveInDate = request.moveInDate ? new Date(request.moveInDate) : null;
          if (!moveInDate || Number.isNaN(moveInDate.getTime())) return false;

          const leaseMonths = Number(request.leaseDuration || 0);
          const leaseEndDate = new Date(moveInDate);
          leaseEndDate.setMonth(leaseEndDate.getMonth() + leaseMonths);

          return moveInDate <= now && leaseEndDate >= now;
        })
        .map((request) => request.student)
        .filter(Boolean);

      return {
        property,
        metrics: {
          totalApplications: propertyRequests.length,
          pendingApplications: propertyRequests.filter((request) => request.status === 'pending').length,
          approvedApplications: approvedRequests.length,
          rejectedApplications: propertyRequests.filter((request) => request.status === 'rejected').length,
          totalViewings: propertyViewings.length,
          pendingViewings: propertyViewings.filter((viewing) => viewing.status === 'pending').length,
          activeResidents: activeResidents.length,
        },
        activeResidents,
      };
    });

    const uniqueResidents = new Map();
    for (const item of portfolio) {
      for (const resident of item.activeResidents) {
        uniqueResidents.set(String(resident._id), resident);
      }
    }

    res.json({
      data: {
        landlord,
        summary: {
          totalProperties: properties.length,
          activeProperties: properties.filter((property) => property.isAvailable).length,
          totalApplications: requests.length,
          pendingApplications: requests.filter((request) => request.status === 'pending').length,
          approvedApplications: requests.filter((request) => request.status === 'approved').length,
          rejectedApplications: requests.filter((request) => request.status === 'rejected').length,
          totalViewings: viewings.length,
          pendingViewings: viewings.filter((viewing) => viewing.status === 'pending').length,
          activeResidents: uniqueResidents.size,
        },
        portfolio,
        requests,
        viewings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get landlord filter options for admin users page
// @route  GET /api/admin/users/landlord-filter-options
// @access Admin
const getLandlordFilterOptions = async (req, res, next) => {
  try {
    const [cities, institutions] = await Promise.all([
      Property.distinct('city', { city: { $exists: true, $ne: '' } }),
      Property.distinct('universityNearby', { universityNearby: { $exists: true, $ne: '' } }),
    ]);

    res.json({
      data: {
        cities: cities.filter(Boolean).sort((a, b) => a.localeCompare(b)),
        institutions: institutions.filter(Boolean).sort((a, b) => a.localeCompare(b)),
      },
    });
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

// @desc   Transport oversight report for admin
// @route  GET /api/admin/reports/transport
// @access Admin
const getTransportOversight = async (req, res, next) => {
  try {
    const properties = await Property.find({ 'transportation.enabled': true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    const modeCounts = { private: 0, campus_route: 0, both: 0 };
    const rows = properties.map((property) => {
      const transportation = property.transportation || {};
      const mode = transportation.mode || 'none';
      if (modeCounts[mode] !== undefined) modeCounts[mode] += 1;

      const schedules = Array.isArray(transportation.schedules) ? transportation.schedules : [];
      const completeScheduleCount = schedules.filter((schedule) => {
        const days = Array.isArray(schedule.days) ? schedule.days.filter(Boolean) : [];
        return Boolean(
          schedule.routeName &&
          schedule.pickupFromResidence &&
          schedule.departureToCampus &&
          schedule.returnPickupFromCampus &&
          schedule.arrivalAtResidence &&
          days.length
        );
      }).length;

      return {
        propertyId: property._id,
        propertyName: property.propertyName,
        city: property.city,
        universityNearby: property.universityNearby,
        landlord: property.createdBy
          ? {
              id: property.createdBy._id,
              name: property.createdBy.name,
              email: property.createdBy.email,
            }
          : null,
        transport: {
          mode,
          providerName: transportation.providerName || '',
          contact: transportation.contact || '',
          notes: transportation.notes || '',
          scheduleCount: schedules.length,
          completeScheduleCount,
          schedules,
        },
      };
    });

    const propertiesWithMissingProviderInfo = rows.filter((row) => {
      const mode = row.transport.mode;
      if (!['private', 'both'].includes(mode)) return false;
      return !row.transport.providerName || !row.transport.contact;
    }).length;

    const propertiesWithNoSchedules = rows.filter((row) => row.transport.scheduleCount === 0).length;
    const propertiesWithIncompleteSchedules = rows.filter(
      (row) => row.transport.scheduleCount > 0 && row.transport.completeScheduleCount < row.transport.scheduleCount
    ).length;

    res.json({
      data: {
        summary: {
          totalTransportEnabledProperties: rows.length,
          modeCounts,
          propertiesWithNoSchedules,
          propertiesWithIncompleteSchedules,
          propertiesWithMissingProviderInfo,
        },
        rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Maintenance oversight report for admin
// @route  GET /api/admin/reports/maintenance
// @access Admin
const getMaintenanceOversight = async (req, res, next) => {
  try {
    const tickets = await Maintenance.find({})
      .populate('student', 'name email university fundingType')
      .populate('landlord', 'name email')
      .populate('property', 'propertyName city universityNearby address')
      .sort({ createdAt: -1 })
      .lean();

    const now = new Date();
    const statusCounts = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    const priorityCounts = { low: 0, medium: 0, high: 0, urgent: 0 };

    const landlordMap = new Map();
    const propertyMap = new Map();

    const rows = tickets.map((ticket) => {
      const status = ticket.status || 'open';
      const priority = ticket.priority || 'medium';
      if (statusCounts[status] !== undefined) statusCounts[status] += 1;
      if (priorityCounts[priority] !== undefined) priorityCounts[priority] += 1;

      const ageMs = now.getTime() - new Date(ticket.createdAt).getTime();
      const ageDays = Math.max(0, Math.floor(ageMs / (1000 * 60 * 60 * 24)));
      const unresolved = ['open', 'in_progress'].includes(status);
      const overdue = unresolved && ageDays >= 7;
      const awaitingFollowUp = unresolved && ageDays >= 3;
      const acknowledged = Boolean(ticket.acknowledgedAt || ticket.expectedDate || ticket.landlordNote);
      const acknowledgementHours = ticket.acknowledgedAt
        ? Math.max(0, Math.round((new Date(ticket.acknowledgedAt).getTime() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60)))
        : null;

      if (ticket.landlord?._id) {
        const landlordId = String(ticket.landlord._id);
        const group = landlordMap.get(landlordId) || {
          landlord: ticket.landlord,
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          acknowledged: 0,
          overdue: 0,
          ackHours: [],
        };
        group.total += 1;
        if (status === 'open') group.open += 1;
        if (status === 'in_progress') group.inProgress += 1;
        if (status === 'resolved') group.resolved += 1;
        if (acknowledged) group.acknowledged += 1;
        if (overdue) group.overdue += 1;
        if (acknowledgementHours !== null) group.ackHours.push(acknowledgementHours);
        landlordMap.set(landlordId, group);
      }

      if (ticket.property?._id) {
        const propertyId = String(ticket.property._id);
        const group = propertyMap.get(propertyId) || {
          property: ticket.property,
          total: 0,
          open: 0,
          inProgress: 0,
          resolved: 0,
          overdue: 0,
        };
        group.total += 1;
        if (status === 'open') group.open += 1;
        if (status === 'in_progress') group.inProgress += 1;
        if (status === 'resolved') group.resolved += 1;
        if (overdue) group.overdue += 1;
        propertyMap.set(propertyId, group);
      }

      return {
        maintenanceId: ticket._id,
        property: ticket.property,
        landlord: ticket.landlord,
        student: ticket.student,
        roomNumber: ticket.roomNumber || '',
        category: ticket.category,
        priority,
        status,
        description: ticket.description,
        expectedDate: ticket.expectedDate,
        landlordNote: ticket.landlordNote || '',
        acknowledgedAt: ticket.acknowledgedAt || null,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
        ageDays,
        unresolved,
        overdue,
        awaitingFollowUp,
        acknowledged,
        acknowledgementHours,
      };
    });

    const landlordRows = Array.from(landlordMap.values())
      .map((entry) => {
        const ackHours = entry.ackHours.filter((value) => Number.isFinite(value));
        const averageAckHours = ackHours.length
          ? Math.round(ackHours.reduce((sum, value) => sum + value, 0) / ackHours.length)
          : null;
        return {
          landlord: entry.landlord,
          total: entry.total,
          open: entry.open,
          inProgress: entry.inProgress,
          resolved: entry.resolved,
          acknowledged: entry.acknowledged,
          overdue: entry.overdue,
          averageAckHours,
        };
      })
      .sort((a, b) => b.total - a.total);

    const propertyRows = Array.from(propertyMap.values())
      .sort((a, b) => b.total - a.total)
      .map((entry) => ({
        property: entry.property,
        total: entry.total,
        open: entry.open,
        inProgress: entry.inProgress,
        resolved: entry.resolved,
        overdue: entry.overdue,
      }));

    const unresolvedCount = rows.filter((row) => row.unresolved).length;
    const overdueCount = rows.filter((row) => row.overdue).length;
    const awaitingFollowUpCount = rows.filter((row) => row.awaitingFollowUp).length;
    const acknowledgedCount = rows.filter((row) => row.acknowledged).length;
    const acknowledgedWithin24h = rows.filter((row) => row.acknowledgementHours !== null && row.acknowledgementHours <= 24).length;
    const acknowledgedWithin72h = rows.filter((row) => row.acknowledgementHours !== null && row.acknowledgementHours <= 72).length;
    const averageAcknowledgementHours = (() => {
      const values = rows.map((row) => row.acknowledgementHours).filter((value) => value !== null);
      if (!values.length) return null;
      return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
    })();

    res.json({
      data: {
        summary: {
          totalTickets: rows.length,
          unresolvedCount,
          overdueCount,
          awaitingFollowUpCount,
          acknowledgedCount,
          acknowledgedWithin24h,
          acknowledgedWithin72h,
          averageAcknowledgementHours,
          statusCounts,
          priorityCounts,
        },
        rows,
        landlordRows,
        propertyRows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Property health report for admin
// @route  GET /api/admin/reports/property-health
// @access Admin
const getPropertyHealth = async (req, res, next) => {
  try {
    const [properties, maintenanceTickets] = await Promise.all([
      Property.find({ createdBy: { $exists: true, $ne: null } })
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .lean(),
      Maintenance.find({})
        .select('property status priority')
        .lean(),
    ]);

    const maintenanceByProperty = new Map();
    for (const ticket of maintenanceTickets) {
      const propertyId = String(ticket.property);
      const group = maintenanceByProperty.get(propertyId) || {
        total: 0,
        open: 0,
        inProgress: 0,
        urgent: 0,
      };
      group.total += 1;
      if (ticket.status === 'open') group.open += 1;
      if (ticket.status === 'in_progress') group.inProgress += 1;
      if (ticket.priority === 'urgent' && ['open', 'in_progress'].includes(ticket.status)) group.urgent += 1;
      maintenanceByProperty.set(propertyId, group);
    }

    const now = new Date();

    const rows = properties.map((property) => {
      const roomAllocations = Array.isArray(property.roomAllocations) ? property.roomAllocations : [];
      const totalRooms = Number(property.totalRooms || 0);
      const occupiedRooms = roomAllocations.filter((allocation) => allocation.roomNumber && (allocation.student || allocation.request)).length;
      const availableRooms = property.availableRooms != null ? Number(property.availableRooms) : null;
      const vacancyGap = totalRooms > 0 ? Math.max(0, totalRooms - occupiedRooms) : null;
      const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : null;
      const transport = property.transportation || {};
      const schedules = Array.isArray(transport.schedules) ? transport.schedules : [];
      const completeScheduleCount = schedules.filter((schedule) => {
        const days = Array.isArray(schedule.days) ? schedule.days.filter(Boolean) : [];
        return Boolean(
          schedule.routeName &&
          schedule.pickupFromResidence &&
          schedule.departureToCampus &&
          schedule.returnPickupFromCampus &&
          schedule.arrivalAtResidence &&
          days.length
        );
      }).length;

      const propertyMaintenance = maintenanceByProperty.get(String(property._id)) || {
        total: 0,
        open: 0,
        inProgress: 0,
        urgent: 0,
      };

      const missingImages = !Array.isArray(property.images) || property.images.length === 0;
      const missingDescription = !String(property.description || '').trim();
      const missingAmenities = !Array.isArray(property.amenities) || property.amenities.length === 0;
      const missingRules = !Array.isArray(property.rules) || property.rules.length === 0;
      const missingRoomTotals = !totalRooms;
      const roomCountMismatch = availableRooms !== null && totalRooms > 0 ? availableRooms !== vacancyGap : false;
      const transportIncomplete = Boolean(
        transport.enabled && (
          (['private', 'both'].includes(transport.mode) && (!transport.providerName || !transport.contact)) ||
          schedules.length === 0 ||
          completeScheduleCount < schedules.length
        )
      );
      const hasOpenMaintenance = propertyMaintenance.open > 0;
      const hasUrgentMaintenance = propertyMaintenance.urgent > 0;
      const lowOccupancy = occupancyRate !== null && totalRooms > 0 && occupancyRate < 50;

      let healthScore = 100;
      if (missingImages) healthScore -= 15;
      if (missingDescription) healthScore -= 10;
      if (missingAmenities) healthScore -= 10;
      if (missingRules) healthScore -= 5;
      if (missingRoomTotals) healthScore -= 20;
      if (roomCountMismatch) healthScore -= 15;
      if (transportIncomplete) healthScore -= 15;
      if (hasOpenMaintenance) healthScore -= 10;
      if (hasUrgentMaintenance) healthScore -= 10;
      if (lowOccupancy) healthScore -= 10;
      healthScore = Math.max(0, Math.min(100, healthScore));

      const healthStatus = healthScore >= 80 ? 'healthy' : healthScore >= 55 ? 'review' : 'critical';

      return {
        propertyId: property._id,
        propertyName: property.propertyName,
        city: property.city,
        universityNearby: property.universityNearby,
        landlord: property.createdBy
          ? {
              id: property.createdBy._id,
              name: property.createdBy.name,
              email: property.createdBy.email,
            }
          : null,
        availability: {
          isAvailable: Boolean(property.isAvailable),
          publishedAgeDays: Math.max(0, Math.floor((now.getTime() - new Date(property.createdAt).getTime()) / (1000 * 60 * 60 * 24))),
        },
        inventory: {
          roomType: property.roomType,
          totalRooms,
          occupiedRooms,
          availableRooms,
          vacancyGap,
          occupancyRate,
          roomCountMismatch,
          lowOccupancy,
        },
        content: {
          missingImages,
          missingDescription,
          missingAmenities,
          missingRules,
        },
        transport: {
          enabled: Boolean(transport.enabled),
          mode: transport.mode || 'none',
          scheduleCount: schedules.length,
          completeScheduleCount,
          incomplete: transportIncomplete,
        },
        maintenance: {
          total: propertyMaintenance.total,
          open: propertyMaintenance.open,
          inProgress: propertyMaintenance.inProgress,
          urgent: propertyMaintenance.urgent,
        },
        health: {
          score: healthScore,
          status: healthStatus,
        },
      };
    });

    const summary = {
      totalProperties: rows.length,
      healthyCount: rows.filter((row) => row.health.status === 'healthy').length,
      reviewCount: rows.filter((row) => row.health.status === 'review').length,
      criticalCount: rows.filter((row) => row.health.status === 'critical').length,
      missingRoomTotalsCount: rows.filter((row) => !row.inventory.totalRooms).length,
      roomCountMismatchCount: rows.filter((row) => row.inventory.roomCountMismatch).length,
      lowOccupancyCount: rows.filter((row) => row.inventory.lowOccupancy).length,
      transportIncompleteCount: rows.filter((row) => row.transport.incomplete).length,
      maintenanceOpenCount: rows.filter((row) => row.maintenance.open > 0).length,
      urgentMaintenanceCount: rows.filter((row) => row.maintenance.urgent > 0).length,
      incompleteContentCount: rows.filter((row) => row.content.missingImages || row.content.missingDescription || row.content.missingAmenities || row.content.missingRules).length,
    };

    res.json({
      data: {
        summary,
        rows,
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

module.exports = {
  getUsers,
  getUser,
  getLandlordOverview,
  getLandlordFilterOptions,
  toggleUser,
  deleteUser,
  getReports,
  getTransportOversight,
  getMaintenanceOversight,
  getPropertyHealth,
  getCollectionReport,
};
