// File: src/models/Vehicle.js
// UPDATED: Added owner and driver linking

import mongoose from 'mongoose';

const VehicleSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  
  // NEW: Link to Vehicle Owner
  ownerNic: {
    type: String,
    required: [true, 'Owner NIC is required'],
    uppercase: true,
    trim: true
  },
  
  // NEW: Link to Driver (optional)
  driverNic: {
    type: String,
    uppercase: true,
    trim: true
  },
  
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    uppercase: true,
    trim: true
  },
  
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['Car', 'Van', 'SUV', 'Bus', 'Other']
  },
  
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1
  },
  
  status: {
    type: String,
    enum: ['available', 'on_hire', 'maintenance', 'inactive'],
    default: 'available'
  },
  
  // NEW: Denormalized owner data (for quick display)
  ownerName: {
    type: String,
    trim: true
  },
  
  ownerPhone: {
    type: String,
    trim: true
  },
  
  ownerWhatsapp: {
    type: String,
    trim: true
  },
  
  // NEW: Denormalized driver data (for quick display)
  driverName: {
    type: String,
    trim: true
  },
  
  driverPhone: {
    type: String,
    trim: true
  },
  
  driverWhatsapp: {
    type: String,
    trim: true
  },
  
  // KEEP: Old fields for backward compatibility
  driverWhatsApp: {
    type: String,
    trim: true
  },
  
  ownerName: {
    type: String,
    trim: true
  },
  
  ownerPhone: {
    type: String,
    trim: true
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
VehicleSchema.index({ organizationId: 1, status: 1 });
VehicleSchema.index({ organizationId: 1, vehicleType: 1 });
VehicleSchema.index({ ownerNic: 1 });
VehicleSchema.index({ driverNic: 1 });

export default mongoose.models.Vehicle || mongoose.model('Vehicle', VehicleSchema);