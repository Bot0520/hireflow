// FILE 4: src/app/api/vehicle-owners/search/route.js
// UPDATED: Check if already in company + show creator
// ==========================================

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import VehicleOwner from '@/models/VehicleOwner';
import CompanyOwner from '@/models/CompanyOwner';
import Organization from '@/models/Organization';
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
    const nic = searchParams.get('nic');
    
    if (!nic) {
      return errorResponse('NIC is required', 400);
    }
    
    // Search for owner globally
    const owner = await VehicleOwner.findOne({ 
      nicNumber: nic.toUpperCase() 
    }).lean();
    
    if (!owner) {
      return successResponse(
        { found: false },
        'Owner not found'
      );
    }
    
    // Check if already added to this company
    const companyOwner = await CompanyOwner.findOne({
      organizationId: decoded.organizationId,
      ownerNic: nic.toUpperCase()
    }).lean();
    
    // Get creator organization name
    const creatorOrg = await Organization.findById(owner.createdByOrganizationId).select('name').lean();
    
    return successResponse({
      found: true,
      owner,
      alreadyInCompany: !!companyOwner,
      createdByOrg: creatorOrg?.name || 'Unknown',
      companyOwnerStatus: companyOwner?.status || null
    });
    
  } catch (error) {
    console.error('Search Vehicle Owner Error:', error);
    return errorResponse('Server error', 500);
  }
}