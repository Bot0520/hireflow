// File: src/app/api/auth/login/route.js

import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import Organization from '@/models/Organization';
import { comparePassword } from '@/lib/auth/password';
import { generateToken } from '@/lib/auth/jwt';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function POST(request) {
  try {
    await connectDB();
    
    const { orgId, username, password } = await request.json();
    
    // Validation
    if (!orgId || !username || !password) {
      return errorResponse('All fields are required', 400);
    }
    
    // Check if organization exists
    const organization = await Organization.findById(orgId);
    if (!organization) {
      return errorResponse('Organization not found', 404);
    }
    
    // Find user
    const user = await User.findOne({ 
      organizationId: orgId,
      username: username.toLowerCase(),
      status: 'active'
    });
    
    if (!user) {
      return errorResponse('Invalid credentials', 401);
    }
    
    // Check password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return errorResponse('Invalid credentials', 401);
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate token
    const token = generateToken({
      userId: user._id,
      organizationId: user.organizationId,
      role: user.role
    });
    
    // Set cookie
    const response = successResponse(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          organizationId: user.organizationId,
          organizationName: organization.name
        },
        token
      },
      'Login successful'
    );
    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });
    
    return response;
    
  } catch (error) {
    console.error('Login Error:', error);
    return errorResponse('Server error', 500);
  }
}