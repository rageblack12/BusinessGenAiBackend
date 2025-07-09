import CommentReply from "../models/CommentReply.model.js";
import Comment from "../models/Comment.model.js";
import { HTTP_STATUS } from '../constants/roles.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Create a reply for a specific comment thread
 * @route POST /api/comment-replies
 * @access Private
 */
export const createCommentReply = asyncHandler(async (req, res, next) => {
  const { content, commentId } = req.body;
  const userId = req.userInfo.userId;

  // Check if comment exists
  const comment = await Comment.findById(commentId);
  if (!comment) {
    return next(new ErrorResponse('Comment not found', HTTP_STATUS.NOT_FOUND));
  }

  // Create new reply
  const reply = await CommentReply.create({
    content,
    user: userId,
    comment: commentId,
  });

  // Add reply reference to the comment
  await Comment.findByIdAndUpdate(commentId, {
    $push: { replies: reply._id },
  });

  // Populate user info for response
  await reply.populate("user", "name");

  res.status(HTTP_STATUS.CREATED).json({ 
    success: true, 
    reply 
  });
});