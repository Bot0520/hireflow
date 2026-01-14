// File: src/app/api/vehicles/[id]/route.js
// UPDATED: Update and Delete vehicle with owner/driver handling

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vehicle from '@/models/Vehicle';
import Hire from '@/models/Hire';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

// GET single vehicle
export async function GET(request, context) {
  try {
    await connectDB();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse('Invalid token', 401);
    }
    
    const params = await context.params;
    
    const vehicle = await Vehicle.findOne({
      _id: params.id,
      organizationId: decoded.organizationId
    });
    
    if (!vehicle) {
      return errorResponse('Vehicle not found', 404);
    }
    
    return successResponse(vehicle, 'Vehicle fetched successfully');
    
  } catch (error) {
    console.error('Get Vehicle Error:', error);
    return errorResponse('Server error', 500);
  }
}

// PATCH - Update vehicle
export async function PATCH(request, context) {
  try {
    await connectDB();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse('Invalid token', 401);
    }
    
    const params = await context.params;
    const body = await request.json();
    
    const vehicle = await Vehicle.findOne({
      _id: params.id,
      organizationId: decoded.organizationId
    });
    
    if (!vehicle) {
      return errorResponse('Vehicle not found', 404);
    }
    
    // Update fields
    const updatableFields = ['vehicleType', 'capacity', 'status', 'driverNic'];
    updatableFields.forEach(field => {
      if (body[field] !== undefined) {
        vehicle[field] = body[field];
      }
    });
    
    await vehicle.save();
    
    return successResponse(vehicle, 'Vehicle updated successfully');
    
  } catch (error) {
    console.error('Update Vehicle Error:', error);
    return errorResponse('Server error', 500);
  }
}

// DELETE vehicle - WITH HIRE VALIDATION
export async function DELETE(request, context) {
  try {
    await connectDB();
    
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse('Invalid token', 401);
    }
    
    const params = await context.params;
    
    const vehicle = await Vehicle.findOne({
      _id: params.id,
      organizationId: decoded.organizationId
    });
    
    if (!vehicle) {
      return errorResponse('Vehicle not found', 404);
    }
    
    // CHECK FOR ACTIVE HIRES
    const activeHireCount = await Hire.countDocuments({
      organizationId: decoded.organizationId,
      vehicleId: params.id,
      status: { $in: ['pending', 'accepted', 'in_progress'] }
    });
    
    if (activeHireCount > 0) {
      return errorResponse(
        `Cannot delete vehicle. ${activeHireCount} active hire(s) assigned. Mark as "Inactive" instead.`,
        400
      );
    }
    
    // Delete vehicle
    await Vehicle.findByIdAndDelete(params.id);
    
    return successResponse(null, 'Vehicle deleted successfully');
    
  } catch (error) {
    console.error('Delete Vehicle Error:', error);
    return errorResponse('Server error', 500);
  }
}