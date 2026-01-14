// File: src/app/api/driver/hires/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import Hire from '@/models/Hire';
import Vehicle from '@/models/Vehicle';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { verifyToken } from '@/lib/auth/jwt';

// GET single hire
export async function GET(request, context) {
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
    
    const hire = await Hire.findOne({
      _id: params.id,
      organizationId: decoded.organizationId
    })
      .populate('vehicleId')
      .populate('createdBy', 'name email');
    
    if (!hire) {
      return errorResponse('Hire not found', 404);
    }
    
    return successResponse(hire, 'Hire fetched successfully');
    
  } catch (error) {
    console.error('Get Hire Error:', error);
    return errorResponse('Server error', 500);
  }
}

// PATCH - Update hire (edit details or status change)
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
    
    const body = await request.json();
    const params = await context.params;
    
    const hire = await Hire.findOne({
      _id: params.id,
      organizationId: decoded.organizationId
    });
    
    if (!hire) {
      return errorResponse('Hire not found', 404);
    }
    
    // List of fields that can be edited
    const editableFields = [
      'passengerName',
      'pickupLocation',
      'dropLocation',
      'dateTime',
      'numberOfPassengers',
      'hirePrice',
      'specialRequirements'
    ];
    
    // Update editable fields (only when hire is active/pending, not completed)
    if (hire.status !== 'completed' && hire.status !== 'in_progress') {
      editableFields.forEach(field => {
        if (body[field] !== undefined) {
          if (field === 'dateTime') {
            hire[field] = new Date(body[field]);
          } else {
            hire[field] = body[field];
          }
        }
      });
    }

    // Allow vehicle type and assignment changes ONLY if hire not yet accepted
    if (hire.status === 'active') {
      if (body.vehicleType !== undefined) {
        hire.vehicleType = body.vehicleType;
      }
      
      if (body.assignmentType !== undefined) {
        hire.assignmentType = body.assignmentType;
      }

      // Handle vehicle assignment for manual mode
      if (body.assignmentType === 'manual' || hire.assignmentType === 'manual') {
        // Clear old vehicle assignment if changing
        if (body.vehicleId && body.vehicleId !== hire.vehicleId?.toString()) {
          // Free up old vehicle if it was assigned
          if (hire.vehicleId) {
            await Vehicle.findByIdAndUpdate(hire.vehicleId, {
              status: 'available'
            });
          }
          hire.vehicleId = body.vehicleId;
        } else if (body.vehicleId === null) {
          // Clear vehicle assignment
          if (hire.vehicleId) {
            await Vehicle.findByIdAndUpdate(hire.vehicleId, {
              status: 'available'
            });
          }
          hire.vehicleId = null;
        }
      }
    }
    
    // Handle status changes
    if (body.status && body.status !== hire.status) {
      hire.status = body.status;
      
      // If cancelling, reason is required
      if (body.status === 'cancelled') {
        if (!body.cancellationReason) {
          return errorResponse('Cancellation reason is required', 400);
        }
        hire.cancellationReason = body.cancellationReason;
        
        // Free up vehicle if assigned
        if (hire.vehicleId) {
          await Vehicle.findByIdAndUpdate(hire.vehicleId, {
            status: 'available'
          });
        }
      }
      
      // If accepting hire, assign vehicle
      if (body.status === 'accepted' && body.vehicleId) {
        hire.vehicleId = body.vehicleId;
        await Vehicle.findByIdAndUpdate(body.vehicleId, {
          status: 'on_hire'
        });
      }
    }
    
    await hire.save();
    
    return successResponse(hire, 'Hire updated successfully');
    
  } catch (error) {
    console.error('Update Hire Error:', error);
    return errorResponse('Server error', 500);
  }
}

// DELETE hire
export async function DELETE(request, context) {
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
    
    const hire = await Hire.findOneAndDelete({
      _id: params.id,
      organizationId: decoded.organizationId
    });
    
    if (!hire) {
      return errorResponse('Hire not found', 404);
    }
    
    // Free up vehicle if assigned
    if (hire.vehicleId) {
      await Vehicle.findByIdAndUpdate(hire.vehicleId, {
        status: 'available'
      });
    }
    
    return successResponse(null, 'Hire deleted successfully');
    
  } catch (error) {
    console.error('Delete Hire Error:', error);
    return errorResponse('Server error', 500);
  }
}