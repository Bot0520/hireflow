// File: src/models/Organization.js

import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Organization name is required'],
    trim: true
  },
  orgCode: {
    type: String,
    required: [true, 'Organization code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    minlength: 4,
    maxlength: 10
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  settings: {
    defaultPickupLocations: [{
      type: String,
      trim: true
    }],
    defaultDropLocations: [{
      type: String,
      trim: true
    }],
    autoAssignment: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Prevent model recompilation in development
export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);