// File: src/app/api/driver/hires/by-org/route.js
// Get all hires for current driver grouped by organization

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Hire from '@/models/Hire';
import Organization from '@/models/Organization';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * GET /api/driver/hires/by-org
 * 
 * Fetch all hires for the logged-in driver
 * Grouped by organization/hotel name
 * 
 * Returns:
 * {
 *   hiresByOrg: {
 *     "Hotel Name": [ hires ],
 *     "Another Hotel": [ hires ]
 *   },
 *   stats: {
 *     pending, active, completed, earnings
 *   }
 * }
 */
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
    
    // Only drivers can access this endpoint
    if (decoded.role !== 'driver') {
      return errorResponse('Only drivers can access this endpoint', 403);
    }
    
    // Get all hires where vehicleId matches this driver
    // Note: In a real multi-org scenario, drivers would have org assignments
    // For now, we get all hires for this organization
    const hires = await Hire.find({
      organizationId: decoded.organizationId,
      status: { $in: ['active', 'accepted', 'in_progress', 'completed'] }
    })
      .populate('vehicleId', 'vehicleNumber vehicleType driverName driverPhone')
      .sort({ createdAt: -1 })
      .lean();
    
    // Get organization name
    const org = await Organization.findById(decoded.organizationId).select('name').lean();
    
    // Group hires by organization (for future multi-org support)
    const hiresByOrg = {};
    const orgName = org?.name || 'Organization';
    
    hiresByOrg[orgName] = hires;
    
    // Calculate stats
    const stats = {
      pending: hires.filter(h => h.status === 'active').length,
      active: hires.filter(h => h.status === 'accepted').length,
      completed: hires.filter(h => h.status === 'completed').length,
      earnings: hires
        .filter(h => h.status === 'completed' && h.commission)
        .reduce((sum, h) => sum + (h.commission.driverEarnings || 0), 0)
    };
    
    return successResponse({
      hiresByOrg,
      stats
    }, 'Hires fetched successfully');
    
  } catch (error) {
    console.error('Get Driver Hires by Org Error:', error);
    return errorResponse('Server error', 500);
  }
}