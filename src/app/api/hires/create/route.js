// File: src/app/api/hires/create/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Hire from '@/models/Hire';
import Vehicle from '@/models/Vehicle';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request) {
  try {
    await connectDB();
    
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse('Invalid token', 401);
    }
    
    const body = await request.json();
    const {
      passengerName,
      pickupLocation,
      dropLocation,
      dateTime,
      numberOfPassengers,
      hirePrice,
      specialRequirements,
      vehicleType,
      assignmentType,
      vehicleId
    } = body;
    
    // Validation
    if (!passengerName || !pickupLocation || !dropLocation || !dateTime || !numberOfPassengers || !hirePrice) {
      return errorResponse('All required fields must be filled', 400);
    }
    
    // Create hire using new + save (so pre-save hook runs before validation)
    const hire = new Hire({
      organizationId: decoded.organizationId,
      passengerName,
      pickupLocation,
      dropLocation,
      dateTime: new Date(dateTime),
      numberOfPassengers,
      hirePrice,
      specialRequirements: specialRequirements || '',
      vehicleType: vehicleType || null,
      vehicleId: vehicleId || null,
      assignmentType: assignmentType || 'auto',
      status: 'active',
      createdBy: decoded.userId
    });
    
    await hire.save();
    
    // IMPORTANT: DO NOT UPDATE VEHICLE STATUS!
    // Vehicle should stay "available" so it can be used for multiple hires at different times
    // Time-based filtering at API level prevents double-booking automatically
    // Vehicles are always visible in the vehicles section
    
    // TODO: Send notifications to drivers (will implement later)
    
    return successResponse(hire, 'Hire created successfully', 201);
    
  } catch (error) {
    console.error('Create Hire Error:', error);
    return errorResponse('Server error', 500);
  }
}