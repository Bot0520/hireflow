// File: src/app/api/auth/verify-org/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Organization from '@/models/Organization';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST(request) {
  try {
    await connectDB();
    
    const { orgCode } = await request.json();
    
    if (!orgCode) {
      return errorResponse('Organization code is required', 400);
    }
    
    const organization = await Organization.findOne({ 
      orgCode: orgCode.toUpperCase(),
      status: 'active'
    });
    
    if (!organization) {
      return errorResponse('Invalid organization code', 404);
    }
    
    return successResponse(
      {
        orgId: organization._id,
        orgName: organization.name,
        orgCode: organization.orgCode
      },
      'Organization verified successfully'
    );
    
  } catch (error) {
    console.error('Verify Org Error:', error);
    return errorResponse('Server error', 500);
  }
}