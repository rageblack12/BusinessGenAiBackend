import express from 'express';
import { createComment } from '../../controllers/Comment.controller.js';
import { createCommentReply } from '../../controllers/CommentReply.controller.js';
import { validateCreateComment, validateCreateCommentReply } from '../../validators/commentValidator.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/comments
 * @desc    Create a comment on a specific post
 * @access  Private
 */
router.post('/', authMiddleware, validateCreateComment, createComment);

/**
 * @route POST /api/comments/replies
 * @desc Create a reply for a specific comment
 * @access Private
 */
router.post('/replies', authMiddleware, validateCreateCommentReply, createCommentReply);

export default router;