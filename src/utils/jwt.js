const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

// Ensure JWT secrets are provided
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables');
}

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE || '15m';
const JWT_REFRESH_EXPIRE = process.env.JWT_REFRESH_EXPIRE || '7d';
const EMAIL_VERIFICATION_EXPIRE = '24h';
const PASSWORD_RESET_EXPIRE = '1h';

/**
 * Generate access token
 */
const generateAccessToken = (userId, email, role) => {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

/**
 * Generate refresh token
 */
const generateRefreshToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRE }
  );
};

/**
 * Verify access token
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Generate email verification token (short-lived JWT)
 */
const generateEmailVerificationToken = (userId, email) => {
  return jwt.sign(
    { userId, email, type: 'email_verification' },
    JWT_SECRET,
    { expiresIn: EMAIL_VERIFICATION_EXPIRE }
  );
};

/**
 * Generate password reset token (short-lived JWT)
 */
const generatePasswordResetToken = (userId, email) => {
  return jwt.sign(
    { userId, email, type: 'password_reset' },
    JWT_SECRET,
    { expiresIn: PASSWORD_RESET_EXPIRE }
  );
};

/**
 * Verify email verification token
 */
const verifyEmailVerificationToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type === 'email_verification') {
      return decoded;
    }
    return null;
  } catch (error) {
    return null;
  }
};

/**
 * Verify password reset token
 */
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.type === 'password_reset') {
      return decoded;
    }
    return null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateEmailVerificationToken,
  generatePasswordResetToken,
  verifyEmailVerificationToken,
  verifyPasswordResetToken
};
