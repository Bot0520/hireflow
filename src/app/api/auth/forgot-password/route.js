// File: src/app/api/auth/forgot-password/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { generateResetToken } from '@/lib/auth/password';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, orgId } = await request.json();
    
    if (!email || !orgId) {
      return errorResponse('Email and organization are required', 400);
    }
    
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      organizationId: orgId,
      status: 'active'
    });
    
    if (!user) {
      // Don't reveal if email exists
      return successResponse(
        null,
        'If the email exists, a reset link will be sent'
      );
    }
    
    // Generate reset token
    const { resetToken, hashedToken, expireTime } = generateResetToken();
    
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = expireTime;
    await user.save();
    
    // TODO: Send email with reset link
    // For now, return the token (in production, send via email)
    console.log('Reset Token:', resetToken);
    console.log('Reset URL:', `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`);
    
    return successResponse(
      { resetToken }, // Remove this in production
      'Password reset instructions sent to your email'
    );
    
  } catch (error) {
    console.error('Forgot Password Error:', error);
    return errorResponse('Server error', 500);
  }
}