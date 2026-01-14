// File: src/app/api/vehicle-owners/[id]/route.js
// Get, Update, Delete vehicle owner

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import VehicleOwner from '@/models/VehicleOwner';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

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
    
    const owner = await VehicleOwner.findOne({
      _id: params.id,
      organizationId: decoded.organizationId
    });
    
    if (!owner) {
      return errorResponse('Owner not found', 404);
    }
    
    return successResponse(owner, 'Owner fetched successfully');
    
  } catch (error) {
    console.error('Get Owner Error:', error);
    return errorResponse('Server error', 500);
  }
}

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
    
    const owner = await VehicleOwner.findOne({
      _id: params.id,
      organizationId: decoded.organizationId
    });
    
    if (!owner) {
      return errorResponse('Owner not found', 404);
    }
    
    // Update fields
    const updatableFields = ['fullName', 'phoneNumber', 'whatsappNumber', 'vehicleTypes', 'status', 'notes'];
    
    updatableFields.forEach(field => {
      if (body[field] !== undefined) {
        owner[field] = body[field];
      }
    });
    
    await owner.save();
    
    return successResponse(owner, 'Owner updated successfully');
    
  } catch (error) {
    console.error('Update Owner Error:', error);
    return errorResponse('Server error', 500);
  }
}

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
    
    // Check if owner has vehicles
    const Vehicle = (await import('@/models/Vehicle')).default;
    const vehicleCount = await Vehicle.countDocuments({ ownerNic: { $exists: true } });
    
    if (vehicleCount > 0) {
      return errorResponse('Cannot delete owner with vehicles. Delete vehicles first.', 400);
    }
    
    const owner = await VehicleOwner.findOneAndDelete({
      _id: params.id,
      organizationId: decoded.organizationId
    });
    
    if (!owner) {
      return errorResponse('Owner not found', 404);
    }
    
    return successResponse(null, 'Owner deleted successfully');
    
  } catch (error) {
    console.error('Delete Owner Error:', error);
    return errorResponse('Server error', 500);
  }
}