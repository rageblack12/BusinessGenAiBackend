import ComplaintReply from '../models/ComplaintRelpy.model.js';
import UserComplaint from '../models/UserComplaint.model.js';
import { HTTP_STATUS } from '../constants/roles.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Create a reply for a specific user complaint
 * @route POST /api/complaint-replies
 * @access Private
 */
export const createComplaintReply = asyncHandler(async (req, res, next) => {
  const { content, complaintId } = req.body;
  const userId = req.userInfo.userId;

  // Check if complaint exists
  const complaint = await UserComplaint.findById(complaintId);
  if (!complaint) {
    return next(new ErrorResponse('Complaint not found', HTTP_STATUS.NOT_FOUND));
  }

  // Create new complaint reply
  const reply = await ComplaintReply.create({
    content,
    userId,
    complaintId
  });

  // Add reply reference to the complaint
  await UserComplaint.findByIdAndUpdate(complaintId, {
    $push: { replies: reply._id }
  });

  // Populate user info for response
  await reply.populate('userId', 'name');

  res.status(HTTP_STATUS.CREATED).json({ 
    success: true, 
    reply 
  });
});