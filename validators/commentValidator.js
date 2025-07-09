import { body } from 'express-validator';
import { handleValidationErrors } from './userValidator.js';

/**
 * Validation rules for creating a comment
 */
export const validateCreateComment = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Comment must be between 1 and 500 characters'),
  
  body('postId')
    .isMongoId()
    .withMessage('Invalid post ID'),
  
  handleValidationErrors
];

/**
 * Validation rules for creating a comment reply
 */
export const validateCreateCommentReply = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Reply must be between 1 and 500 characters'),
  
  body('commentId')
    .isMongoId()
    .withMessage('Invalid comment ID'),
  
  handleValidationErrors
];