const Property = require('../models/Property');
const Favorite = require('../models/Favorite');
const { AppError } = require('../utils/errorHandler');
const { propertySchema } = require('../utils/validators');

// @desc    Get all properties (with filters)
// @route   GET /api/properties
// @access  Public (only published properties though)
const getProperties = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'published',
      minPrice,
      maxPrice,
      location,
      category,
      bedrooms,
      bathrooms
    } = req.query;

    // Build filter object
    const filter = { status };
    
    // Only show published properties for non-owners
    if (!req.user || req.user.role !== 'owner') {
      filter.status = 'published';
    } else if (req.user.role === 'owner') {
      // Owners can see their own draft properties
      if (status === 'draft') {
        filter.owner = req.user.id;
      }
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Other filters
    if (location) {
      filter['location.city'] = new RegExp(location, 'i');
    }
    if (category) filter.category = category;
    if (bedrooms) filter.bedrooms = Number(bedrooms);
    if (bathrooms) filter.bathrooms = Number(bathrooms);

    // Calculate pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const total = await Property.countDocuments(filter);

    // Execute query with pagination
    const properties = await Property.find(filter)
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(startIndex);

    // Check favorites for authenticated users
    let propertiesWithFavorites = properties;
    if (req.user) {
      const favorites = await Favorite.find({
        user: req.user.id,
        property: { $in: properties.map(p => p._id) }
      });

      const favoriteIds = favorites.map(f => f.property.toString());
      
      propertiesWithFavorites = properties.map(property => ({
        ...property.toObject(),
        isFavorite: favoriteIds.includes(property._id.toString())
      }));
    }

    // Send response
    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: propertiesWithFavorites
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public (if published), Private (if draft for owner)
const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email');

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    // Check access permissions
    if (property.status !== 'published') {
      if (!req.user || req.user.id !== property.owner._id.toString()) {
        throw new AppError('Not authorized to access this property', 403);
      }
    }

    // Check if favorite for authenticated user
    let isFavorite = false;
    if (req.user) {
      const favorite = await Favorite.findOne({
        user: req.user.id,
        property: property._id
      });
      isFavorite = !!favorite;
    }

    const propertyData = {
      ...property.toObject(),
      isFavorite
    };

    res.status(200).json({
      success: true,
      data: propertyData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create property
// @route   POST /api/properties
// @access  Private (owners only)
const createProperty = async (req, res, next) => {
  try {
    // Only owners can create properties
    if (req.user.role !== 'owner') {
      throw new AppError('Only property owners can create listings', 403);
    }

    // Validate request body
    const { error } = propertySchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    // Create property
    const property = await Property.create({
      ...req.body,
      owner: req.user.id
    });

    res.status(201).json({
      success: true,
      data: property,
      message: 'Property created successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (owners only)
const updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id) {
      throw new AppError('Not authorized to update this property', 403);
    }

    // Cannot edit published properties
    if (property.status === 'published') {
      throw new AppError('Cannot edit published properties', 400);
    }

    // Update property
    property = await Property.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: property,
      message: 'Property updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property (soft delete)
// @route   DELETE /api/properties/:id
// @access  Private (owners and admin)
const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    // Check permissions
    const isOwner = property.owner.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      throw new AppError('Not authorized to delete this property', 403);
    }

    // Soft delete
    await property.softDelete();

    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Publish property
// @route   PUT /api/properties/:id/publish
// @access  Private (owners only)
const publishProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    // Check ownership
    if (property.owner.toString() !== req.user.id) {
      throw new AppError('Not authorized to publish this property', 403);
    }

    // Validate required fields for publishing
    const requiredFields = ['title', 'description', 'location', 'price', 'images'];
    for (const field of requiredFields) {
      if (!property[field] || (Array.isArray(property[field]) && property[field].length === 0)) {
        throw new AppError(`Cannot publish: ${field} is required`, 400);
      }
    }

    // Publish property
    await property.publish();

    res.status(200).json({
      success: true,
      data: property,
      message: 'Property published successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's properties
// @route   GET /api/properties/my-properties
// @access  Private (owners only)
const getMyProperties = async (req, res, next) => {
  try {
    if (req.user.role !== 'owner') {
      throw new AppError('Only property owners can view their listings', 403);
    }

    const { status } = req.query;
    const filter = { owner: req.user.id };
    
    if (status) {
      filter.status = status;
    }

    const properties = await Property.find(filter)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  publishProperty,
  getMyProperties
};