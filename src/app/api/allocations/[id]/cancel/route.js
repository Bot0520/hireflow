// FILE 3: src/app/api/allocations/[id]/cancel/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Hire from '@/models/Hire';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * POST /api/allocations/[id]/cancel
 * 
 * Manager/Owner cancels a hire
 * Requires cancellation reason
 */
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
    const { reason } = await request.json();
    
    if (!reason || !reason.trim()) {
      return errorResponse('Cancellation reason is required', 400);
    }
    
    const hire = await Hire.findOne({
      _id: params.id,
      organizationId: decoded.organizationId,
      status: { $in: ['pending', 'accepted', 'in_progress'] }
    });
    
    if (!hire) {
      return errorResponse('Hire not found or cannot be cancelled', 404);
    }
    
    // Cancel the hire
    hire.status = 'cancelled';
    hire.cancellationReason = reason;
    hire.vehicleId = null;  // Remove vehicle assignment
    hire.tripProgress = {};
    hire.commission = {};
    
    await hire.save();
    
    return successResponse(hire, 'Hire cancelled successfully');
    
  } catch (error) {
    console.error('Cancel Hire Error:', error);
    return errorResponse('Server error', 500);
  }
}