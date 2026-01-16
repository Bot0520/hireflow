// FILE 2: src/app/api/allocations/[id]/accept/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Hire from '@/models/Hire';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * POST /api/allocations/[id]/accept
 * 
 * Manager/Owner accepts a hire
 * Changes status from 'pending' to 'accepted'
 * Records who accepted and when
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
    
    const hire = await Hire.findOne({
      _id: params.id,
      organizationId: decoded.organizationId,
      status: 'pending'
    });
    
    if (!hire) {
      return errorResponse('Hire not found or already accepted', 404);
    }
    
    // Calculate commissions
    const managerCommission = hire.hirePrice * 0.10; // 10%
    const systemCommission = hire.hirePrice * 0.02;  // 2%
    const driverEarnings = hire.hirePrice - managerCommission - systemCommission;
    
    // Update hire
    hire.status = 'accepted';
    hire.tripProgress = {
      acceptedAt: new Date(),
      acceptedBy: decoded.userId  // Manager/Owner who accepted
    };
    hire.commission = {
      managerCommission,
      systemCommission,
      driverEarnings
    };
    
    await hire.save();
    
    return successResponse(hire, 'Hire accepted successfully');
    
  } catch (error) {
    console.error('Accept Hire Error:', error);
    return errorResponse('Server error', 500);
  }
}