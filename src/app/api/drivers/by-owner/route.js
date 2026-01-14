// File: src/app/api/drivers/by-owner/route.js
// Get drivers for a specific owner

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Driver from '@/models/Driver';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

export async function GET(request) {
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
    
    const { searchParams } = new URL(request.url);
    const ownerNic = searchParams.get('ownerNic');
    
    if (!ownerNic) {
      return errorResponse('Owner NIC is required', 400);
    }
    
    const drivers = await Driver.find({
      organizationId: decoded.organizationId,
      ownerNic: ownerNic.toUpperCase(),
      status: 'active'
    })
      .select('_id fullName phoneNumber whatsappNumber licenseNumber licenseExpiry')
      .lean();
    
    return successResponse(drivers, 'Drivers fetched successfully');
    
  } catch (error) {
    console.error('Get Drivers by Owner Error:', error);
    return errorResponse('Server error', 500);
  }
}