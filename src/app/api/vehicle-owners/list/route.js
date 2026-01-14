// File: src/app/api/vehicle-owners/list/route.js
// List all vehicle owners for current organization

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import VehicleOwner from '@/models/VehicleOwner';
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
    
    const owners = await VehicleOwner.find(query)
      .select('nicNumber fullName phoneNumber whatsappNumber vehicleTypes status createdAt')
      .sort({ createdAt: -1 })
      .lean();
    
    return successResponse(owners, 'Vehicle owners fetched successfully');
    
  } catch (error) {
    console.error('List Vehicle Owners Error:', error);
    return errorResponse('Server error', 500);
  }
}