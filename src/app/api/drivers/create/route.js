// File: src/app/api/drivers/create/route.js
// Create a new driver

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Driver from '@/models/Driver';
import VehicleOwner from '@/models/VehicleOwner';
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
    
    const { ownerNic, fullName, phoneNumber, whatsappNumber, licenseNumber, licenseExpiry, notes } = await request.json();
    
    // Validation
    if (!ownerNic || !fullName || !phoneNumber) {
      return errorResponse('Owner NIC, full name, and phone number are required', 400);
    }
    
    // Verify owner exists
    const owner = await VehicleOwner.findOne({ 
      nicNumber: ownerNic.toUpperCase(),
      organizationId: decoded.organizationId
    });
    
    if (!owner) {
      return errorResponse('Owner not found in your organization', 404);
    }
    
    // Create driver
    const driver = await Driver.create({
      organizationId: decoded.organizationId,
      ownerNic: ownerNic.toUpperCase(),
      fullName,
      phoneNumber,
      whatsappNumber: whatsappNumber || phoneNumber,
      licenseNumber: licenseNumber || null,
      licenseExpiry: licenseExpiry || null,
      createdBy: decoded.userId,
      notes
    });
    
    return successResponse(driver, 'Driver created successfully', 201);
    
  } catch (error) {
    console.error('Create Driver Error:', error);
    return errorResponse('Failed to create driver', 500);
  }
}