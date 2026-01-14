// FILE 5: src/app/api/company-owners/add/route.js
// NEW: Add existing owner to company
// ==========================================

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import VehicleOwner from '@/models/VehicleOwner';
import CompanyOwner from '@/models/CompanyOwner';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

export async function POST(request) {
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
    
    const { ownerNic } = await request.json();
    
    if (!ownerNic) {
      return errorResponse('Owner NIC is required', 400);
    }
    
    // Verify owner exists globally
    const owner = await VehicleOwner.findOne({ 
      nicNumber: ownerNic.toUpperCase() 
    });
    
    if (!owner) {
      return errorResponse('Owner not found in the system', 404);
    }
    
    // Check if already added to this company
    const existing = await CompanyOwner.findOne({
      organizationId: decoded.organizationId,
      ownerNic: ownerNic.toUpperCase()
    });
    
    if (existing) {
      return errorResponse('Owner already added to your company', 400);
    }
    
    // Add owner to company
    const companyOwner = await CompanyOwner.create({
      organizationId: decoded.organizationId,
      ownerNic: ownerNic.toUpperCase(),
      status: 'active',
      assignedBy: decoded.userId
    });
    
    return successResponse(
      {
        ...companyOwner.toObject(),
        ownerDetails: owner
      },
      'Owner added to your company successfully',
      201
    );
    
  } catch (error) {
    console.error('Add Company Owner Error:', error);
    if (error.code === 11000) {
      return errorResponse('Owner already added to your company', 400);
    }
    return errorResponse('Failed to add owner to company', 500);
  }
}