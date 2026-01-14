// ==========================================
// FILE 1: src/models/VehicleOwner.js
// UPDATED: Add createdByOrganizationId, createdByUserId, systemStatus
// ==========================================

import mongoose from 'mongoose';

const VehicleOwnerSchema = new mongoose.Schema({
  // Primary Key - Unique across entire system
  nicNumber: {
    type: String,
    required: [true, 'NIC number is required'],
    unique: true,
    uppercase: true,
    trim: true,
    match: [/^[a-z0-9\-]{5,20}$/i, 'Please provide a valid NIC number']
  },
  
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  
  whatsappNumber: {
    type: String,
    trim: true
  },
  
  // Vehicle types this owner can operate
  vehicleTypes: {
    type: [String],
    enum: ['Car', 'Van', 'SUV', 'Bus', 'Other'],
    default: []
  },
  
  // Global status - only admin can change
  systemStatus: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  
  // Track who created this owner first
  createdByOrganizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  
  createdByUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for fast queries
VehicleOwnerSchema.index({ nicNumber: 1 });
VehicleOwnerSchema.index({ systemStatus: 1 });
VehicleOwnerSchema.index({ createdByOrganizationId: 1 });

export default mongoose.models.VehicleOwner || 
  mongoose.model('VehicleOwner', VehicleOwnerSchema);