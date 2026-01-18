const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  location: {
    address: String,
    city: String,
    state: String,
    country: { type: String, default: 'Ethiopia' },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  images: [{
    url: String,
    publicId: String,
    caption: String
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  category: {
    type: String,
    enum: ['apartment', 'house', 'villa', 'land', 'commercial'],
    default: 'apartment'
  },
  bedrooms: Number,
  bathrooms: Number,
  area: Number,
  amenities: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  publishedAt: Date
}, {
  timestamps: true
});

// Basic Indexes for performance
propertySchema.index({ owner: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ price: 1 });

// Method to publish
propertySchema.methods.publish = function() {
  this.status = 'published';
  this.publishedAt = Date.now();
  return this.save();
};

// Method to soft delete
propertySchema.methods.softDelete = function() {
  this.isActive = false;
  this.status = 'archived';
  return this.save();
};

module.exports = mongoose.model('Property', propertySchema);