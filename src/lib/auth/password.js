// File: src/lib/auth/password.js

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Hash password
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// Compare password
export async function comparePassword(enteredPassword, hashedPassword) {
  return await bcrypt.compare(enteredPassword, hashedPassword);
}

// Generate reset token
export function generateResetToken() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set expire (10 minutes)
  const hashedToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  const expireTime = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return { resetToken, hashedToken, expireTime };
}

// Verify reset token
export function verifyResetToken(token) {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}