// FILE 7: src/app/api/company-owners/[id]/status/route.js
// NEW: Update company owner status (deactivate/activate)
// ==========================================

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import CompanyOwner from '@/models/CompanyOwner';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

export async function PATCH(request, context) {
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
    const { status } = await request.json();
    
    if (!status || !['active', 'inactive'].includes(status)) {
      return errorResponse('Valid status (active/inactive) is required', 400);
    }
    
    const companyOwner = await CompanyOwner.findOne({
      _id: params.id,
      organizationId: decoded.organizationId
    });
    
    if (!companyOwner) {
      return errorResponse('Owner not found in your company', 404);
    }
    
    // Update status
    companyOwner.status = status;
    await companyOwner.save();
    
    return successResponse(
      companyOwner,
      `Owner ${status === 'active' ? 'activated' : 'deactivated'} successfully`
    );
    
  } catch (error) {
    console.error('Update Company Owner Status Error:', error);
    return errorResponse('Failed to update owner status', 500);
  }
}