// File: src/app/api/driver/hires/[id]/cancel/route.js

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
    const { reason } = await request.json();
    
    if (!reason || !reason.trim()) {
      return errorResponse('Cancellation reason is required', 400);
    }
    
    const hire = await Hire.findOne({
      _id: params.id,
      organizationId: decoded.organizationId,
      status: { $in: ['accepted', 'in_progress'] }
    });
    
    if (!hire) {
      return errorResponse('Hire not found or cannot be cancelled', 404);
    }
    
    // Return hire to active status for manager to reassign
    hire.status = 'active';
    hire.cancellationReason = `Driver cancelled: ${reason}`;
    hire.vehicleId = null; // Clear vehicle assignment
    hire.assignmentType = 'manual'; // Force manual reassignment
    hire.tripProgress = {}; // Clear progress
    hire.commission = {}; // Clear commission
    
    await hire.save();
    
    // NOTE: Do NOT update vehicle status - vehicle stays "available"
    // Time-based filtering prevents conflicts automatically
    
    return successResponse(hire, 'Hire cancelled and returned to manager for reassignment');
    
  } catch (error) {
    console.error('Driver Cancel Error:', error);
    return errorResponse('Server error', 500);
  }
}