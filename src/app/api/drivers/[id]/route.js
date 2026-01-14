// File: src/app/api/drivers/[id]/route.js
// Get, Update, and Delete driver

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Driver from '@/models/Driver';
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
    
    const driver = await Driver.findOne({
      _id: params.id,
      organizationId: decoded.organizationId
    });
    
    if (!driver) {
      return errorResponse('Driver not found', 404);
    }
    
    return successResponse(driver, 'Driver fetched successfully');
    
  } catch (error) {
    console.error('Get Driver Error:', error);
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
    
    const driver = await Driver.findOne({
      _id: params.id,
      organizationId: decoded.organizationId
    });
    
    if (!driver) {
      return errorResponse('Driver not found', 404);
    }
    
    // Update fields
    const updatableFields = ['fullName', 'phoneNumber', 'whatsappNumber', 'licenseNumber', 'licenseExpiry', 'status', 'notes'];
    
    updatableFields.forEach(field => {
      if (body[field] !== undefined) {
        driver[field] = body[field];
      }
    });
    
    await driver.save();
    
    return successResponse(driver, 'Driver updated successfully');
    
  } catch (error) {
    console.error('Update Driver Error:', error);
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
    
    // Check if driver is assigned to vehicles
    const Vehicle = (await import('@/models/Vehicle')).default;
    const vehicleCount = await Vehicle.countDocuments({ 
      driverNic: { $exists: true }
    });
    
    if (vehicleCount > 0) {
      return errorResponse('Cannot delete driver assigned to vehicles. Unassign from vehicles first.', 400);
    }
    
    const driver = await Driver.findOneAndDelete({
      _id: params.id,
      organizationId: decoded.organizationId
    });
    
    if (!driver) {
      return errorResponse('Driver not found', 404);
    }
    
    return successResponse(null, 'Driver deleted successfully');
    
  } catch (error) {
    console.error('Delete Driver Error:', error);
    return errorResponse('Server error', 500);
  }
}