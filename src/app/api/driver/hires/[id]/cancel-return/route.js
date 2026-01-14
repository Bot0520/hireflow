// File: src/app/api/driver/hires/[id]/cancel-return/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Hire from '@/models/Hire';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * POST /api/driver/hires/[id]/cancel-return
 * 
 * Driver cancels an accepted/in_progress hire and returns it to active status
 * Only drivers can use this endpoint
 * Hire goes back to 'active' status for manager to reassign
 * 
 * Request Body:
 * {
 *   reason: string (required) - reason for returning to manager
 * }
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
    
    // Only drivers can use this endpoint
    if (decoded.role !== 'driver') {
      return errorResponse('Only drivers can return hires to manager', 403);
    }
    
    const params = await context.params;
    const { reason } = await request.json();
    
    if (!reason || !reason.trim()) {
      return errorResponse('Return reason is required', 400);
    }
    
    const hire = await Hire.findOne({
      _id: params.id,
      organizationId: decoded.organizationId,
      status: { $in: ['accepted', 'in_progress'] }
    });
    
    if (!hire) {
      return errorResponse('Hire not found or cannot be returned', 404);
    }
    
    // Return hire to active status for manager to reassign
    hire.status = 'active';
    hire.cancellationReason = `Driver returned: ${reason}`;
    hire.vehicleId = null; // Clear vehicle assignment
    hire.assignmentType = 'manual'; // Force manual reassignment
    hire.tripProgress = {}; // Clear progress
    hire.commission = {}; // Clear commission
    
    await hire.save();
    
    return successResponse(hire, 'Hire returned to manager for reassignment');
    
  } catch (error) {
    console.error('Driver Cancel-Return Error:', error);
    return errorResponse('Server error', 500);
  }
}