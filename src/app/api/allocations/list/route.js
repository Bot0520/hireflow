// File: src/app/api/allocations/list/route.js
// IMPORTANT: This file MUST be in this exact path for the API to work
// Path: src/app/api/allocations/list/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Hire from '@/models/Hire';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * GET /api/allocations/list
 * 
 * Fetch driver allocations (hires with assigned vehicles)
 * Filters by status: accepted, in_progress, completed
 * 
 * Query Params:
 * - filter: 'all' | 'accepted' | 'in_progress' (default: 'all')
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
    
    let query = {
      organizationId: decoded.organizationId,
      vehicleId: { $exists: true, $ne: null }
    };
    
    if (filter === 'accepted') {
      query.status = 'accepted';
    } else if (filter === 'in_progress') {
      query.status = 'in_progress';
    } else if (filter === 'all') {
      query.status = { $in: ['accepted', 'in_progress', 'completed'] };
    }
    
    const allocations = await Hire.find(query)
      .populate('vehicleId', 'vehicleNumber vehicleType driverName driverPhone')
      .populate('createdBy', 'name email')
      .sort({ 'tripProgress.acceptedAt': -1 })
      .lean();
    
    return successResponse(allocations, 'Allocations fetched successfully');
    
  } catch (error) {
    console.error('Allocations Error:', error);
    return errorResponse('Server error', 500);
  }
}