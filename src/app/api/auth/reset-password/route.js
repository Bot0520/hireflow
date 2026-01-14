// File: src/app/api/auth/reset-password/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { verifyResetToken, hashPassword } from '@/lib/auth/password';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST(request) {
  try {
    await connectDB();
    
    const { token, newPassword } = await request.json();
    
    if (!token || !newPassword) {
      return errorResponse('Token and new password are required', 400);
    }
    
    if (newPassword.length < 6) {
      return errorResponse('Password must be at least 6 characters', 400);
    }
    
    // Hash the token to match stored token
    const hashedToken = verifyResetToken(token);
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return errorResponse('Invalid or expired reset token', 400);
    }
    
    // Update password
    user.password = await hashPassword(newPassword);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    
    return successResponse(
      null,
      'Password reset successful. You can now login with your new password'
    );
    
  } catch (error) {
    console.error('Reset Password Error:', error);
    return errorResponse('Server error', 500);
  }
}