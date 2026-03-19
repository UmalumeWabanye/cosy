const Property = require('../models/Property');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create a new property
// @route   POST /api/admin/properties
// @access  Private
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
      roomTypes,
      amenities,
      nsfasAccreditation,
      images,
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

    // Validate room types if provided
    let processedRoomTypes = [];
    if (roomTypes && roomTypes.length > 0) {
      const totalRoomTypesQty = roomTypes.reduce((sum, rt) => sum + rt.quantity, 0);
      
      if (totalRoomTypesQty !== parseInt(totalRooms)) {
        return next(
          new ErrorResponse(
            `Total room types quantity (${totalRoomTypesQty}) must equal total rooms (${totalRooms})`,
            400
          )
        );
      }

      processedRoomTypes = roomTypes.map((rt) => ({
        type: rt.type,
        quantity: parseInt(rt.quantity),
        availableQuantity: parseInt(rt.availableQuantity),
        pricePerMonth: parseInt(rt.pricePerMonth),
        description: rt.description || '',
      }));
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
      roomTypes: processedRoomTypes,
      rooms: {
        total: parseInt(totalRooms),
        available: parseInt(availableRooms),
      },
      amenities: amenities || [],
      images: images || [],
      nsfasAccreditation: nsfasAccreditation || false,
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

// @desc    Get single property for editing
// @route   GET /api/admin/properties/:id
// @access  Private
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
// @route   PUT /api/admin/properties/:id
// @access  Private
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
      roomTypes,
      amenities,
      nsfasAccreditation,
      images,
      isActive,
    } = req.body;

    // Validation
    if (availableRooms && totalRooms && availableRooms > totalRooms) {
      return next(new ErrorResponse('Available rooms cannot exceed total rooms', 400));
    }

    if (minRent && maxRent && minRent > maxRent) {
      return next(new ErrorResponse('Minimum rent cannot be greater than maximum rent', 400));
    }

    // Validate room types if provided
    let processedRoomTypes = property.roomTypes;
    if (roomTypes && roomTypes.length > 0) {
      const totalRoomTypesQty = roomTypes.reduce((sum, rt) => sum + rt.quantity, 0);
      const newTotalRooms = totalRooms ? parseInt(totalRooms) : property.rooms.total;
      
      if (totalRoomTypesQty !== newTotalRooms) {
        return next(
          new ErrorResponse(
            `Total room types quantity (${totalRoomTypesQty}) must equal total rooms (${newTotalRooms})`,
            400
          )
        );
      }

      processedRoomTypes = roomTypes.map((rt) => ({
        type: rt.type,
        quantity: parseInt(rt.quantity),
        availableQuantity: parseInt(rt.availableQuantity),
        pricePerMonth: parseInt(rt.pricePerMonth),
        description: rt.description || '',
      }));
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
        roomTypes: processedRoomTypes,
        rooms: {
          total: totalRooms ? parseInt(totalRooms) : property.rooms.total,
          available: availableRooms ? parseInt(availableRooms) : property.rooms.available,
        },
        amenities: amenities || property.amenities,
        images: images || property.images,
        nsfasAccreditation:
          nsfasAccreditation !== undefined ? nsfasAccreditation : property.nsfasAccreditation,
        isActive: isActive !== undefined ? isActive : property.isActive,
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