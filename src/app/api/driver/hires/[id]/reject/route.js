// File: src/app/api/driver/hires/[id]/reject/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Hire from '@/models/Hire';
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
    
    const hire = await Hire.findOne({
      _id: params.id,
      organizationId: decoded.organizationId,
      status: 'active'
    });
    
    if (!hire) {
      return errorResponse('Hire not found', 404);
    }
    
    // Clear vehicle assignment so manager can reassign
    hire.vehicleId = null;
    hire.assignmentType = 'manual';
    
    await hire.save();
    
    // NOTE: Do NOT update vehicle status - vehicle stays "available"
    
    return successResponse(hire, 'Hire rejected - returned to manager');
    
  } catch (error) {
    console.error('Reject Hire Error:', error);
    return errorResponse('Server error', 500);
  }
}