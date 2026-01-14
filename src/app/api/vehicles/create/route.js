// File: src/app/api/vehicles/create/route.js
// UPDATED: Create vehicle linked to owner and optional driver

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vehicle from '@/models/Vehicle';
import VehicleOwner from '@/models/VehicleOwner';
import Driver from '@/models/Driver';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request) {
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
    
    const {
      ownerNic,
      driverNic,
      vehicleNumber,
      vehicleType,
      capacity
    } = await request.json();
    
    // Validation
    if (!ownerNic || !vehicleNumber || !vehicleType || !capacity) {
      return errorResponse('Owner NIC, vehicle number, type, and capacity are required', 400);
    }
    
    // Verify owner exists
    const owner = await VehicleOwner.findOne({
      nicNumber: ownerNic.toUpperCase(),
      organizationId: decoded.organizationId
    });
    
    if (!owner) {
      return errorResponse('Owner not found in your organization', 404);
    }
    
    // Verify driver if provided
    let driver = null;
    if (driverNic) {
      driver = await Driver.findOne({
        ownerNic: driverNic.toUpperCase(),
        organizationId: decoded.organizationId,
        status: 'active'
      });
      
      if (!driver) {
        return errorResponse('Driver not found or inactive', 404);
      }
    }
    
    // Check if vehicle number already exists
    const existingVehicle = await Vehicle.findOne({
      organizationId: decoded.organizationId,
      vehicleNumber: vehicleNumber.toUpperCase()
    });
    
    if (existingVehicle) {
      return errorResponse('Vehicle number already exists in your organization', 400);
    }
    
    // Create vehicle
    const vehicle = await Vehicle.create({
      organizationId: decoded.organizationId,
      ownerNic: ownerNic.toUpperCase(),
      driverNic: driverNic ? driverNic.toUpperCase() : null,
      vehicleNumber: vehicleNumber.toUpperCase(),
      vehicleType,
      capacity: parseInt(capacity),
      status: 'available',
      
      // Denormalized owner data
      ownerName: owner.fullName,
      ownerPhone: owner.phoneNumber,
      ownerWhatsapp: owner.whatsappNumber,
      
      // Denormalized driver data
      driverName: driver ? driver.fullName : null,
      driverPhone: driver ? driver.phoneNumber : null,
      driverWhatsapp: driver ? driver.whatsappNumber : null
    });
    
    return successResponse(vehicle, 'Vehicle created successfully', 201);
    
  } catch (error) {
    console.error('Create Vehicle Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return errorResponse(messages.join(', '), 400);
    }
    return errorResponse('Failed to create vehicle', 500);
  }
}
