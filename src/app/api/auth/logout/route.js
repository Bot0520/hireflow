// File: src/app/api/auth/logout/route.js

import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/utils/response';

export async function POST(request) {
  const response = successResponse(null, 'Logged out successfully');
  
  // Clear auth cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0
  });
  
  return response;
}