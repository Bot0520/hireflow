// File: src/lib/utils/response.js

import { NextResponse } from 'next/server';

// Success response
export function successResponse(data, message = 'Success', statusCode = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data
    },
    { status: statusCode }
  );
}

// Error response
export function errorResponse(message = 'Something went wrong', statusCode = 500, errors = null) {
  return NextResponse.json(
    {
      success: false,
      message,
      errors
    },
    { status: statusCode }
  );
}

// Validation error response
export function validationError(errors) {
  return errorResponse('Validation failed', 400, errors);
}

// Unauthorized response
export function unauthorizedResponse(message = 'Unauthorized access') {
  return errorResponse(message, 401);
}

// Not found response
export function notFoundResponse(message = 'Resource not found') {
  return errorResponse(message, 404);
}