// FILE 3: src/app/api/vehicle-owners/create/route.js
// UPDATED: Create owner + add to company automatically
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
    
    const { 
      nicNumber, 
      fullName, 
      phoneNumber, 
      whatsappNumber, 
      vehicleTypes, 
      notes 
    } = await request.json();
    
    // Validation
    if (!nicNumber || !fullName || !phoneNumber) {
      return errorResponse('NIC, full name, and phone number are required', 400);
    }
    
    // Check if NIC already exists globally
    const existingOwner = await VehicleOwner.findOne({ 
      nicNumber: nicNumber.toUpperCase() 
    });
    
    if (existingOwner) {
      return errorResponse(
        'Owner with this NIC already exists in the system. Use "Add Existing Owner" to add to your company.',
        400
      );
    }
    
    // Create owner globally
    const owner = await VehicleOwner.create({
      nicNumber: nicNumber.toUpperCase(),
      fullName,
      phoneNumber,
      whatsappNumber: whatsappNumber || phoneNumber,
      vehicleTypes: vehicleTypes || [],
      systemStatus: 'active',
      createdByOrganizationId: decoded.organizationId,
      createdByUserId: decoded.userId,
      notes
    });
    
    // Automatically add to this company
    const companyOwner = await CompanyOwner.create({
      organizationId: decoded.organizationId,
      ownerNic: nicNumber.toUpperCase(),
      status: 'active',
      assignedBy: decoded.userId
    });
    
    return successResponse(
      {
        owner,
        companyOwner,
        message: 'Owner created and added to your company successfully'
      },
      'Vehicle owner created successfully',
      201
    );
    
  } catch (error) {
    console.error('Create Vehicle Owner Error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return errorResponse(messages.join(', '), 400);
    }
    return errorResponse('Failed to create vehicle owner', 500);
  }
}