import jwt from 'jsonwebtoken';
import { HTTP_STATUS } from '../constants/roles.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Authentication middleware to verify JWT token from cookies
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authMiddleware = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies first, then in Authorization header
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Access denied. No token provided. Please login to continue', HTTP_STATUS.UNAUTHORIZED));
  }

  try {
    const decodedTokenInfo = jwt.verify(token, process.env.JWT_SECRET);
    req.userInfo = decodedTokenInfo;
    next();
  } catch (error) {
    return next(new ErrorResponse('Access denied. Invalid token. Please login again', HTTP_STATUS.UNAUTHORIZED));
  }
});

export default authMiddleware;