// FILE 2: src/models/CompanyOwner.js
// NEW: Company-specific owner assignment
// ==========================================

import mongoose from 'mongoose';

const CompanyOwnerSchema = new mongoose.Schema({
  // Which organization/hotel
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization ID is required']
  },
  
  // Link to global VehicleOwner by NIC (not _id!)
  ownerNic: {
    type: String,
    required: [true, 'Owner NIC is required'],
    uppercase: true,
    trim: true
  },
  
  // Company-level status (independent from global)
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  
  // When this company added this owner
  assignedAt: {
    type: Date,
    default: Date.now
  },
  
  // Which user assigned in this company
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Company-specific notes
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Unique per company (can't add same owner twice to same company)
CompanyOwnerSchema.index({ organizationId: 1, ownerNic: 1 }, { unique: true });
CompanyOwnerSchema.index({ organizationId: 1, status: 1 });

export default mongoose.models.CompanyOwner || 
  mongoose.model('CompanyOwner', CompanyOwnerSchema);