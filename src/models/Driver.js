// File: src/models/Driver.js
// Driver Model
// Drivers are assigned to Vehicle Owners

import mongoose from 'mongoose';

const DriverSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization ID is required']
  },
  
  // Reference to owner
  ownerNic: {
    type: String,
    required: [true, 'Owner NIC is required'],
    uppercase: true,
    trim: true
  },
  
  // Driver details
  fullName: {
    type: String,
    required: [true, 'Driver full name is required'],
    trim: true
  },
  
  phoneNumber: {
    type: String,
    required: [true, 'Driver phone number is required'],
    trim: true
  },
  
  whatsappNumber: {
    type: String,
    trim: true
  },
  
  // Driver's license info (optional)
  licenseNumber: {
    type: String,
    trim: true
  },
  
  licenseExpiry: {
    type: Date
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  
  // Audit trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
DriverSchema.index({ organizationId: 1, ownerNic: 1 });
DriverSchema.index({ status: 1 });

export default mongoose.models.Driver || mongoose.model('Driver', DriverSchema);