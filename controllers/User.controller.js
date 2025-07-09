import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { USER_ROLES, HTTP_STATUS } from '../constants/roles.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Generate JWT token and set cookie
 * @param {Object} user - User object
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Response message
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );

  const options = {
    expires: new Date(Date.now() + (process.env.JWT_COOKIE_EXPIRE || 24) * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
};

/**
 * Register a new user
 * @route POST /api/users/register
 * @access Public
 */
export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorResponse('User already exists with this email. Please use a different email.', HTTP_STATUS.BAD_REQUEST));
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create new user
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || USER_ROLES.USER,
  });

  sendTokenResponse(newUser, HTTP_STATUS.CREATED, res, 'User registered successfully!');
});

/**
 * Login a user
 * @route POST /api/users/login
 * @access Public
 */
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
  }

  // Compare password
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    return next(new ErrorResponse('Invalid credentials', HTTP_STATUS.UNAUTHORIZED));
  }

  sendTokenResponse(user, HTTP_STATUS.OK, res, 'Logged in successfully');
});

/**
 * Logout user
 * @route POST /api/users/logout
 * @access Private
 */
export const logout = asyncHandler(async (req, res, next) => {
  res.clearCookie('token')
    .status(HTTP_STATUS.OK)
    .json({
      success: true,
      message: 'Logged out successfully'
    });
});

/**
 * Get current user profile
 * @route GET /api/users/profile
 * @access Private
 */
export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.userInfo.userId).select('-password');
  
  if (!user) {
    return next(new ErrorResponse('User not found', HTTP_STATUS.NOT_FOUND));
  }

  res.status(HTTP_STATUS.OK).json({
    success: true,
    user
  });
});