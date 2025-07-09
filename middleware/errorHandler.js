import { HTTP_STATUS } from '../constants/roles.js';
import logger from '../utils/logger.js';

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    error.message = message;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.message = message;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.message = message;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.message = message;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error.statusCode = HTTP_STATUS.UNAUTHORIZED;
    error.message = message;
  }

  res.status(error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message || 'Server Error'
  });
};

export default errorHandler;