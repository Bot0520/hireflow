// File: src/app/api/driver/hires/[id]/complete/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Hire from '@/models/Hire';
import Vehicle from '@/models/Vehicle';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request, context) {
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
    const { notes } = await request.json();
    
    const hire = await Hire.findOne({
      _id: params.id,
      organizationId: decoded.organizationId,
      status: 'in_progress'
    });
    
    if (!hire) {
      return errorResponse('Hire not found or not in progress', 404);
    }
    
    hire.status = 'completed';
    hire.tripProgress.completedAt = new Date();
    hire.tripProgress.driverNotes = notes || '';
    
    await hire.save();
    
    // IMPORTANT: DO NOT UPDATE VEHICLE STATUS!
    // Vehicle stays "available" for future hires at different times
    // Time-based filtering prevents double-booking automatically
    // Vehicle remains visible in vehicles section
    
    return successResponse(hire, 'Trip completed successfully');
    
  } catch (error) {
    console.error('Complete Trip Error:', error);
    return errorResponse('Server error', 500);
  }
}