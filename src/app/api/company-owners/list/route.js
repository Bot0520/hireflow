// FILE 6: src/app/api/company-owners/list/route.js
// NEW: Get company's owners (filtered by organizationId)
// ==========================================

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import CompanyOwner from '@/models/CompanyOwner';
import VehicleOwner from '@/models/VehicleOwner';
import Vehicle from '@/models/Vehicle';
import Driver from '@/models/Driver';
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
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // Build query
    let query = { organizationId: decoded.organizationId };
    if (status) {
      query.status = status;
    }
    
    // Get company owners
    const companyOwners = await CompanyOwner.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    // Enrich with owner details and stats
    const enriched = await Promise.all(
      companyOwners.map(async (co) => {
        const vehicleOwner = await VehicleOwner.findOne({ 
          nicNumber: co.ownerNic 
        }).select('fullName phoneNumber whatsappNumber vehicleTypes systemStatus').lean();
        
        const vehicleCount = await Vehicle.countDocuments({
          organizationId: decoded.organizationId,
          ownerNic: co.ownerNic
        });
        
        const driverCount = await Driver.countDocuments({
          organizationId: decoded.organizationId,
          ownerNic: co.ownerNic
        });
        
        const hireCount = await Hire.countDocuments({
          organizationId: decoded.organizationId,
          ownerNic: co.ownerNic
        });
        
        return {
          ...co,
          ownerName: vehicleOwner?.fullName,
          ownerPhone: vehicleOwner?.phoneNumber,
          ownerWhatsapp: vehicleOwner?.whatsappNumber,
          vehicleTypes: vehicleOwner?.vehicleTypes || [],
          systemStatus: vehicleOwner?.systemStatus,
          vehicleCount,
          driverCount,
          hireCount
        };
      })
    );
    
    return successResponse(enriched, 'Company owners fetched successfully');
    
  } catch (error) {
    console.error('List Company Owners Error:', error);
    return errorResponse('Server error', 500);
  }
}