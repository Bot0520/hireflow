// FILE 1: src/app/api/allocations/list-by-owner/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Hire from '@/models/Hire';
import VehicleOwner from '@/models/VehicleOwner';
import CompanyOwner from '@/models/CompanyOwner';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * GET /api/allocations/list-by-owner
 * 
 * Get hires grouped by vehicle owner (not driver-based)
 * Only shows hires for this organization
 * Only shows hires assigned to vehicles
 * 
 * Query Params:
 * - filter: 'all' | 'pending' | 'accepted' | 'in_progress' (default: 'all')
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
    
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';
    
    // Build query for hires
    let hireQuery = {
      organizationId: decoded.organizationId,
      vehicleId: { $exists: true, $ne: null }  // Only assigned to vehicles
    };
    
    if (filter !== 'all') {
      hireQuery.status = filter;
    } else {
      // Show: pending, accepted, in_progress, completed
      hireQuery.status = { $in: ['pending', 'accepted', 'in_progress', 'completed'] };
    }
    
    // Get all matching hires
    const hires = await Hire.find(hireQuery)
      .populate('vehicleId', 'vehicleNumber vehicleType ownerNic capacity driverNic')
      .sort({ createdAt: -1 })
      .lean();
    
    // Group by owner NIC
    const groupedByOwner = {};
    
    for (const hire of hires) {
      const ownerNic = hire.vehicleId?.ownerNic;
      
      if (!ownerNic) continue;
      
      // Get owner details
      const vehicleOwner = await VehicleOwner.findOne({ nicNumber: ownerNic }).select('fullName phoneNumber whatsappNumber').lean();
      
      if (!groupedByOwner[ownerNic]) {
        groupedByOwner[ownerNic] = {
          ownerNic,
          ownerName: vehicleOwner?.fullName || 'Unknown',
          ownerPhone: vehicleOwner?.phoneNumber || '-',
          vehicles: {}
        };
      }
      
      // Group by vehicle within owner
      const vehicleNumber = hire.vehicleId?.vehicleNumber;
      if (!groupedByOwner[ownerNic].vehicles[vehicleNumber]) {
        groupedByOwner[ownerNic].vehicles[vehicleNumber] = {
          vehicleNumber,
          vehicleType: hire.vehicleId?.vehicleType,
          capacity: hire.vehicleId?.capacity,
          hires: []
        };
      }
      
      // Add hire
      groupedByOwner[ownerNic].vehicles[vehicleNumber].hires.push({
        _id: hire._id,
        hireId: hire.hireId,
        passengerName: hire.passengerName,
        pickupLocation: hire.pickupLocation,
        dropLocation: hire.dropLocation,
        dateTime: hire.dateTime,
        numberOfPassengers: hire.numberOfPassengers,
        hirePrice: hire.hirePrice,
        status: hire.status,
        specialRequirements: hire.specialRequirements,
        commission: hire.commission,
        tripProgress: hire.tripProgress
      });
    }
    
    // Convert vehicles object to array
    const formattedData = Object.values(groupedByOwner).map((owner) => ({
      ...owner,
      vehicles: Object.values(owner.vehicles)
    }));
    
    return successResponse(formattedData, 'Allocations grouped by owner fetched successfully');
    
  } catch (error) {
    console.error('Get Allocations by Owner Error:', error);
    return errorResponse('Server error', 500);
  }
}