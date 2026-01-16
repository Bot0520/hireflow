// File: src/app/api/admin/reset-db/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Hire from '@/models/Hire';
import Vehicle from '@/models/Vehicle';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * ADMIN ONLY: Reset database - clear all hires and vehicles
 * Keep: Organizations, Users (intact for future hires/vehicles)
 * Delete: All Hires, All Vehicles
 * 
 * Usage: POST /api/admin/reset-db
 * Header: auth-token (must be super_admin)
 * Body: { confirmReset: true, organizationId: "org_id" }
 */
export async function POST(request) {
  try {
    await connectDB();
    
    // Get and verify token
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return errorResponse('Unauthorized', 401);
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return errorResponse('Invalid token', 401);
    }
    
    // Only super_admin can reset database
    if (decoded.role !== 'super_admin') {
      return errorResponse('Only super admin can reset database', 403);
    }
    
    const body = await request.json();
    const { confirmReset, organizationId } = body;
    
    // Safety check - require explicit confirmation
    if (confirmReset !== true) {
      return errorResponse('Please confirm reset with confirmReset: true', 400);
    }
    
    // If organizationId provided, only reset that org's data
    // If not provided, reset current user's org only (safer)
    const targetOrgId = organizationId || decoded.organizationId;
    
    // Delete all hires for the organization
    const deleteHiresResult = await Hire.deleteMany({
      organizationId: targetOrgId
    });
    
    // Delete all vehicles for the organization
    const deleteVehiclesResult = await Vehicle.deleteMany({
      organizationId: targetOrgId
    });
    
    return successResponse({
      message: 'Database reset successful',
      deletedHires: deleteHiresResult.deletedCount,
      deletedVehicles: deleteVehiclesResult.deletedCount,
      organizationId: targetOrgId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Reset DB Error:', error);
    return errorResponse('Failed to reset database: ' + error.message, 500);
  }
}


// File: src/app/api/admin/reset-db-confirm/route.js
// This is a safer two-step reset that asks for confirmation first

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

/**
 * Get reset confirmation details before actually resetting
 * 
 * Usage: GET /api/admin/reset-db-confirm?organizationId=org_id
 * Header: auth-token (must be super_admin)
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
    
    if (decoded.role !== 'super_admin') {
      return errorResponse('Only super admin can access this', 403);
    }
    
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId') || decoded.organizationId;
    
    const Hire = (await import('@/models/Hire')).default;
    const Vehicle = (await import('@/models/Vehicle')).default;
    
    const hireCount = await Hire.countDocuments({ organizationId });
    const vehicleCount = await Vehicle.countDocuments({ organizationId });
    
    return successResponse({
      confirmationRequired: true,
      message: `This will delete ${hireCount} hires and ${vehicleCount} vehicles. This action cannot be undone.`,
      stats: {
        totalHires: hireCount,
        totalVehicles: vehicleCount,
        organizationId
      },
      resetInstructions: 'To proceed, send POST request to /api/admin/reset-db with confirmReset: true'
    });
    
  } catch (error) {
    console.error('Confirmation Check Error:', error);
    return errorResponse('Server error', 500);
  }
}