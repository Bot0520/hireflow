// File: src/app/api/notifications/list/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
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
    
    // Get recent hire activities for manager
    const recentActivities = await Hire.find({
      organizationId: decoded.organizationId,
      updatedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
      .populate('vehicleId', 'vehicleNumber driverName')
      .sort({ updatedAt: -1 })
      .limit(20)
      .lean();
    
    // Format notifications
    const notifications = recentActivities.map(hire => {
      let type = 'info';
      let message = '';
      
      if (hire.status === 'accepted') {
        type = 'success';
        message = `Hire #${hire.hireId} accepted by ${hire.vehicleId?.driverName || 'driver'}`;
      } else if (hire.status === 'in_progress') {
        type = 'info';
        message = `Hire #${hire.hireId} trip started`;
      } else if (hire.status === 'completed') {
        type = 'success';
        message = `Hire #${hire.hireId} completed successfully`;
      } else if (hire.status === 'cancelled') {
        type = 'error';
        message = `Hire #${hire.hireId} was cancelled`;
      } else if (hire.status === 'active' && hire.vehicleId) {
        type = 'warning';
        message = `Hire #${hire.hireId} assigned to ${hire.vehicleId?.vehicleNumber}`;
      }
      
      return {
        id: hire._id,
        type,
        message,
        hireId: hire.hireId,
        time: hire.updatedAt,
        read: false
      };
    });
    
    return successResponse(notifications);
    
  } catch (error) {
    console.error('Notifications Error:', error);
    return errorResponse('Server error', 500);
  }
}