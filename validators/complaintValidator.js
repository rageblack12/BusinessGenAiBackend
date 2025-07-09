import { body } from 'express-validator';
import { handleValidationErrors } from './userValidator.js';

/**
 * Validation rules for raising a complaint
 */
export const validateRaiseComplaint = [
  body('orderId')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Order ID must be between 3 and 50 characters'),
  
  body('productType')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product type must be between 2 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  handleValidationErrors
];

/**
 * Validation rules for creating a complaint reply
 */
export const validateCreateComplaintReply = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reply must be between 1 and 500 characters'),
  
  body('complaintId')
    .isMongoId()
    .withMessage('Invalid complaint ID'),
  
  handleValidationErrors
];