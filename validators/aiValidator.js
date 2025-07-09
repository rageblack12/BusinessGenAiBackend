import { body } from 'express-validator';
import { handleValidationErrors } from './userValidator.js';

/**
 * Validation rules for AI comment reply
 */
export const validateAICommentReply = [
  body('sentiment')
    .isIn(['Positive', 'Neutral', 'Negative'])
    .withMessage('Sentiment must be Positive, Neutral, or Negative'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description must be between 1 and 500 characters'),
  
  handleValidationErrors
];

/**
 * Validation rules for AI complaint reply
 */
export const validateAIComplaintReply = [
  body('severity')
    .isIn(['Moderate', 'High', 'Urgent'])
    .withMessage('Severity must be Moderate, High, or Urgent'),
  
  body('description')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  
  handleValidationErrors
];