// File: src/models/User.js

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: [true, 'Organization ID is required']
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    enum: ['super_admin', 'hire_manager', 'driver'],
    default: 'hire_manager'
  },
  phone: {
    type: String,
    trim: true
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date
}, {
  timestamps: true
});

// Index for faster queries
UserSchema.index({ organizationId: 1, email: 1 });
UserSchema.index({ organizationId: 1, username: 1 });
UserSchema.index({ organizationId: 1, role: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);