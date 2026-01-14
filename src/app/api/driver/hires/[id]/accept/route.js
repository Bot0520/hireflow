// File: src/app/api/driver/hires/[id]/accept/route.js

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
    
    const hire = await Hire.findOne({
      _id: params.id,
      organizationId: decoded.organizationId,
      status: 'active'
    });
    
    if (!hire) {
      return errorResponse('Hire not found or already accepted', 404);
    }
    
    // Calculate commissions
    const managerCommission = hire.hirePrice * 0.10; // 10%
    const systemCommission = hire.hirePrice * 0.02; // 2%
    const driverEarnings = hire.hirePrice - managerCommission - systemCommission;
    
    // Update hire
    hire.status = 'accepted';
    hire.tripProgress = {
      acceptedAt: new Date(),
      acceptedBy: decoded.userId
    };
    hire.commission = {
      managerCommission,
      systemCommission,
      driverEarnings
    };
    
    await hire.save();
    
    // IMPORTANT: DO NOT UPDATE VEHICLE STATUS!
    // Vehicle should stay "available" so it can be used for multiple hires at different times
    // Time-based filtering handles conflict detection at API level
    // Vehicle remains visible in vehicles section
    
    return successResponse(hire, 'Hire accepted successfully');
    
  } catch (error) {
    console.error('Accept Hire Error:', error);
    return errorResponse('Server error', 500);
  }
}
