const Property = require('../models/Property');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all properties (public - only published)
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    const { minPrice, maxPrice, amenities, roomTypes, nsfasAccredited, sortBy, page = 1, limit = 10 } = req.query;

    // Build filter
    let filter = { published: true, isActive: true };

    if (minPrice || maxPrice) {
      filter['pricing.minRent'] = {};
      if (minPrice) filter['pricing.minRent'].$gte = parseInt(minPrice);
      if (maxPrice) filter['pricing.maxRent'] = filter['pricing.maxRent'] || {};
      if (maxPrice) filter['pricing.maxRent'].$lte = parseInt(maxPrice);
    }

    if (amenities) {
      const amenitiesArray = amenities.split(',');
      filter.amenities = { $in: amenitiesArray };
    }

    if (roomTypes) {
      const roomTypesArray = roomTypes.split(',');
      filter['roomTypes.type'] = { $in: roomTypesArray };
    }

    if (nsfasAccredited === 'true') {
      filter.nsfasAccreditation = true;
    }

    // Sorting
    let sortOption = {};
    if (sortBy === 'price-low') sortOption['pricing.minRent'] = 1;
    else if (sortBy === 'price-high') sortOption['pricing.minRent'] = -1;
    else if (sortBy === 'newest') sortOption.createdAt = -1;
    else sortOption.createdAt = -1;

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const properties = await Property.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate('owner', 'name email phone');

    const total = await Property.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: properties,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property (public)
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email phone');

    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    if (!property.published || !property.isActive) {
      return next(new ErrorResponse('Property not available', 404));
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new property
// @route   POST /api/properties
// @access  Private/Admin
exports.createProperty = async (req, res, next) => {
  try {
    const {
      name,
      description,
      address,
      city,
      postalCode,
      university,
      minRent,
      maxRent,
      deposit,
      totalRooms,
      availableRooms,
      amenities,
      nsfasAccreditation,
      images,
      roomTypes,
    } = req.body;

    // Validation
    if (
      !name ||
      !description ||
      !address ||
      !city ||
      !university ||
      !minRent ||
      !maxRent ||
      !deposit ||
      !totalRooms ||
      availableRooms === undefined
    ) {
      return next(new ErrorResponse('Please provide all required fields', 400));
    }

    if (availableRooms > totalRooms) {
      return next(new ErrorResponse('Available rooms cannot exceed total rooms', 400));
    }

    if (minRent > maxRent) {
      return next(new ErrorResponse('Minimum rent cannot be greater than maximum rent', 400));
    }

    // Create property
    const property = await Property.create({
      name,
      description,
      location: {
        address,
        city,
        postalCode: postalCode || '',
        university,
      },
      pricing: {
        minRent: parseInt(minRent),
        maxRent: parseInt(maxRent),
        deposit: parseInt(deposit),
      },
      rooms: {
        total: parseInt(totalRooms),
        available: parseInt(availableRooms),
      },
      roomTypes: roomTypes || [],
      amenities: amenities || [],
      images: images || [],
      nsfasAccreditation: nsfasAccreditation || false,
      published: false, // Default to draft
      owner: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Property created successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property for editing (admin only)
// @route   GET /api/admin/properties/:id
// @access  Private/Admin
exports.getPropertyForEdit = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to access this property', 401));
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private/Admin
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to update this property', 401));
    }

    const {
      name,
      description,
      address,
      city,
      postalCode,
      university,
      minRent,
      maxRent,
      deposit,
      totalRooms,
      availableRooms,
      amenities,
      nsfasAccreditation,
      images,
      isActive,
      published,
      roomTypes,
    } = req.body;

    // Validation
    if (availableRooms && totalRooms && availableRooms > totalRooms) {
      return next(new ErrorResponse('Available rooms cannot exceed total rooms', 400));
    }

    if (minRent && maxRent && minRent > maxRent) {
      return next(new ErrorResponse('Minimum rent cannot be greater than maximum rent', 400));
    }

    // Update property
    property = await Property.findByIdAndUpdate(
      req.params.id,
      {
        name: name || property.name,
        description: description || property.description,
        location: {
          address: address || property.location.address,
          city: city || property.location.city,
          postalCode: postalCode || property.location.postalCode,
          university: university || property.location.university,
        },
        pricing: {
          minRent: minRent ? parseInt(minRent) : property.pricing.minRent,
          maxRent: maxRent ? parseInt(maxRent) : property.pricing.maxRent,
          deposit: deposit ? parseInt(deposit) : property.pricing.deposit,
        },
        rooms: {
          total: totalRooms ? parseInt(totalRooms) : property.rooms.total,
          available: availableRooms ? parseInt(availableRooms) : property.rooms.available,
        },
        roomTypes: roomTypes !== undefined ? roomTypes : property.roomTypes,
        amenities: amenities || property.amenities,
        images: images || property.images,
        nsfasAccreditation:
          nsfasAccreditation !== undefined ? nsfasAccreditation : property.nsfasAccreditation,
        isActive: isActive !== undefined ? isActive : property.isActive,
        published: published !== undefined ? published : property.published,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Property updated successfully',
      data: property,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private/Admin
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to delete this property', 401));
    }

    await Property.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin's properties (admin only)
// @route   GET /api/admin/properties
// @access  Private/Admin
exports.getAdminProperties = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10, search } = req.query;

    let filter = { owner: req.user.id };

    if (status) {
      if (status === 'published') filter.published = true;
      else if (status === 'draft') filter.published = false;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Property.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: properties,
      total,
      pages: Math.ceil(total / limitNum),
      currentPage: pageNum,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish/Unpublish property
// @route   PATCH /api/admin/properties/:id/publish
// @access  Private/Admin
exports.togglePublish = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return next(new ErrorResponse('Property not found', 404));
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to modify this property', 401));
    }

    property.published = !property.published;
    await property.save();

    res.status(200).json({
      success: true,
      message: `Property ${property.published ? 'published' : 'unpublished'} successfully`,
      data: property,
    });
  } catch (error) {
    next(error);
  }
};
