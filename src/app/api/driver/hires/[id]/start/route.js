// File: src/app/api/driver/hires/[id]/start/route.js

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
      status: 'accepted'
    });
    
    if (!hire) {
      return errorResponse('Hire not found or not accepted', 404);
    }
    
    hire.status = 'in_progress';
    hire.tripProgress.startedAt = new Date();
    
    await hire.save();
    
    return successResponse(hire, 'Trip started');
    
  } catch (error) {
    console.error('Start Trip Error:', error);
    return errorResponse('Server error', 500);
  }
}