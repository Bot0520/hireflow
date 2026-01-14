// File: src/app/api/vehicles/list/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Vehicle from '@/models/Vehicle';
import Hire from '@/models/Hire';
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
    
    // Get query params
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const vehicleType = searchParams.get('vehicleType');
    const hireDateTime = searchParams.get('hireDateTime');
    
    // Build base query - Always show only 'available' vehicles
    // (on_hire vehicles should not be shown for new hires at all)
    let query = { 
      organizationId: decoded.organizationId,
      status: 'available' // Always filter to only available vehicles
    };
    
    if (vehicleType) {
      query.vehicleType = vehicleType;
    }
    
    // Get all available vehicles
    let vehicles = await Vehicle.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // If hireDateTime provided, filter out vehicles with time conflicts
    if (hireDateTime) {
      const hireDate = new Date(hireDateTime);
      
      // Find all active hires (that have conflicting time)
      const oneHourBefore = new Date(hireDate.getTime() - 60 * 60 * 1000);
      const oneHourAfter = new Date(hireDate.getTime() + 60 * 60 * 1000);
      
      const conflictingHires = await Hire.find({
        organizationId: decoded.organizationId,
        status: { $in: ['active', 'accepted', 'in_progress'] },
        vehicleId: { $exists: true, $ne: null },
        dateTime: {
          $gte: oneHourBefore,
          $lte: oneHourAfter
        }
      }).select('vehicleId').lean();
      
      // Get vehicle IDs that have conflicts
      const conflictingVehicleIds = conflictingHires.map(h => h.vehicleId?.toString());
      
      // Filter out conflicting vehicles
      vehicles = vehicles.filter(v => !conflictingVehicleIds.includes(v._id.toString()));
    }
    
    return successResponse(vehicles, 'Vehicles fetched successfully');
    
  } catch (error) {
    console.error('List Vehicles Error:', error);
    return errorResponse('Server error', 500);
  }
}