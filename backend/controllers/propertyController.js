const Property = require('../models/Property');
const User = require('../models/User');

const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeRoomTypeQuery = (value = '') => {
  const normalized = String(value).trim().toLowerCase().replace(/[-_\s]+/g, '');
  if (!normalized) return '';
  if (normalized === 'single' || normalized === 'singleroom') return 'Single';
  if (normalized === 'sharing' || normalized === 'shared' || normalized === 'sharedroom') return 'Sharing';
  if (normalized === 'ensuite' || normalized === 'en-suite' || normalized === 'ensuiteroom') return 'Ensuite';
  if (normalized === 'bachelor' || normalized === 'studio' || normalized === 'bachelorflat') return 'Bachelor';
  return '';
};

const getLandlordIds = async () => User.find({ role: 'landlord' }).distinct('_id');

// @desc   Get properties shown in the landlord property management platform
// @route  GET /api/properties/mine
// @access Private/Admin
const getMyProperties = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'landlord') {
      return res.json({ data: [], total: 0, pages: 0, currentPage: Number(req.query.page || 1) });
    }

    const { search, page = 1, limit = 50 } = req.query;
    const filter = { createdBy: req.user._id };
    if (search) {
      filter.$or = [
        { propertyName: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ data: properties, total, pages: Math.ceil(total / Number(limit)), currentPage: Number(page) });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all properties (with filtering & pagination)
// @route  GET /api/properties
// @access Public
const getProperties = async (req, res, next) => {
  try {
    const {
      city,
      university,
      universityNearby,
      fundingType,
      nsfasAccredited,
      status,
      roomType,
      minPrice,
      maxPrice,
      maxDistance,
      page = 1,
      limit = 12,
      search,
    } = req.query;

    const filter = {};
    const landlordIds = await getLandlordIds();
    filter.createdBy = { $in: landlordIds };

    if (status === 'published' || status === 'available') {
      filter.isAvailable = true;
    }
    if (status === 'unpublished' || status === 'unavailable') {
      filter.isAvailable = false;
    }

    if (city) filter.city = new RegExp(escapeRegex(city), 'i');
    if (university || universityNearby) {
      filter.universityNearby = new RegExp(escapeRegex(university || universityNearby), 'i');
    }
    if (fundingType === 'nsfas') filter.nsfasAccredited = true;
    if (nsfasAccredited !== undefined) filter.nsfasAccredited = nsfasAccredited === 'true';
    if (roomType) {
      const canonicalRoomType = normalizeRoomTypeQuery(roomType);
      if (canonicalRoomType) {
        filter.roomType = canonicalRoomType;
      } else {
        filter.roomType = new RegExp(`^${escapeRegex(String(roomType).trim())}$`, 'i');
      }
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (maxDistance) filter.distanceFromCampus = { $lte: Number(maxDistance) };
    if (search) {
      filter.$or = [
        { propertyName: new RegExp(search, 'i') },
        { city: new RegExp(search, 'i') },
        { address: new RegExp(search, 'i') },
        { universityNearby: new RegExp(search, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(filter);
    const properties = await Property.find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    res.json({
      properties,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get single property
// @route  GET /api/properties/:id
// @access Public
const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'createdBy',
      'name email avatar role'
    ).populate('roomAllocations.student', 'name email avatar university course').populate('roomAllocations.request', 'status moveInDate leaseDuration createdAt');
    if (!property || property.createdBy?.role !== 'landlord') {
      res.statusCode = 404;
      throw new Error('Property not found');
    }
    res.json(property);
  } catch (error) {
    next(error);
  }
};

// @desc   Create property
// @route  POST /api/properties
// @access Private/Admin
const createProperty = async (req, res, next) => {
  try {
    const property = await Property.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(property);
  } catch (error) {
    next(error);
  }
};

// @desc   Update property
// @route  PUT /api/properties/:id
// @access Private/Admin
const updateProperty = async (req, res, next) => {
  try {
    const existing = await Property.findById(req.params.id);
    if (!existing) {
      res.statusCode = 404;
      throw new Error('Property not found');
    }
    const property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!property) {
      res.statusCode = 404;
      throw new Error('Property not found');
    }
    res.json(property);
  } catch (error) {
    next(error);
  }
};

// @desc   Delete property
// @route  DELETE /api/properties/:id
// @access Private/Admin
const deleteProperty = async (req, res, next) => {
  try {
    const existing = await Property.findById(req.params.id);
    if (!existing) {
      res.statusCode = 404;
      throw new Error('Property not found');
    }
    const property = await Property.findByIdAndDelete(req.params.id);
    if (!property) {
      res.statusCode = 404;
      throw new Error('Property not found');
    }
    res.json({ message: 'Property removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyProperties,
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
};
