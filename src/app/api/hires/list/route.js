// File: src/app/api/hires/list/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Hire from '@/models/Hire';
import Vehicle from '@/models/Vehicle';
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
    
    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const view = searchParams.get('view'); // active or completed
    
    // Build query
    let query = { organizationId: decoded.organizationId };
    
    if (view === 'completed') {
      // Completed view shows: completed hires AND cancelled hires
      query.status = { $in: ['completed', 'cancelled'] };
    } else if (view === 'active') {
      // Active view shows: active, pending, accepted, in_progress hires
      query.status = { $in: ['active', 'pending', 'accepted', 'in_progress'] };
    } else if (status) {
      // Specific status filter
      query.status = status;
    }
    
    // Get hires with vehicle details
    const hires = await Hire.find(query)
      .populate('vehicleId', 'vehicleNumber vehicleType driverName driverPhone')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();
    
    return successResponse(hires, 'Hires fetched successfully');
    
  } catch (error) {
    console.error('List Hires Error:', error);
    return errorResponse('Server error', 500);
  }
}