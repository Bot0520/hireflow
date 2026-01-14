// File: src/app/api/stats/route.js

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
    
    // Get stats
    const [totalHires, activeHires, completedHires, totalVehicles] = await Promise.all([
      Hire.countDocuments({ organizationId: decoded.organizationId }),
      Hire.countDocuments({ 
        organizationId: decoded.organizationId,
        status: { $in: ['active', 'pending', 'accepted'] }
      }),
      Hire.countDocuments({ 
        organizationId: decoded.organizationId,
        status: 'completed'
      }),
      Vehicle.countDocuments({ organizationId: decoded.organizationId })
    ]);
    
    return successResponse({
      totalHires,
      activeHires,
      completedHires,
      totalVehicles
    });
    
  } catch (error) {
    console.error('Stats Error:', error);
    return errorResponse('Server error', 500);
  }
}