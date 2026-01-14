// File: src/app/api/drivers/list/route.js
// List all drivers for current organization

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
    const status = searchParams.get('status');
    
    let query = { organizationId: decoded.organizationId };
    
    if (status) {
      query.status = status;
    }
    
    const drivers = await Driver.find(query)
      .select('ownerNic fullName phoneNumber whatsappNumber licenseNumber licenseExpiry status createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    return successResponse(drivers, 'Drivers fetched successfully');
    
  } catch (error) {
    console.error('List Drivers Error:', error);
    return errorResponse('Server error', 500);
  }
}