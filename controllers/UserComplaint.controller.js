import UserComplaint from "../models/UserComplaint.model.js";
import { COMPLAINT_SEVERITY, COMPLAINT_STATUS, HTTP_STATUS } from '../constants/roles.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import fetch from "node-fetch";

/**
 * Helper to classify complaint severity using Hugging Face Inference API
 * @param {string} description - Complaint description
 * @returns {Promise<string>} - Severity label
 */
const classifySeverity = async (description) => {
  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/joeddav/xlm-roberta-large-xnli",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: description,
          parameters: {
            candidate_labels: [COMPLAINT_SEVERITY.MODERATE, COMPLAINT_SEVERITY.HIGH, COMPLAINT_SEVERITY.URGENT],
          },
        }),
      }
    );

    const result = await response.json();
    return result?.labels?.[0] || COMPLAINT_SEVERITY.MODERATE;
  } catch (error) {
    console.error("Severity classification error:", error);
    return COMPLAINT_SEVERITY.MODERATE;
  }
};

/**
 * Raise a new user complaint
 * @route POST /api/complaints
 * @access Private
 */
export const raiseComplaint = asyncHandler(async (req, res, next) => {
  const { orderId, productType, description } = req.body;
  const userId = req.userInfo.userId;

  // For now using dummy severity, uncomment below for AI classification
  // const severity = await classifySeverity(description);
  const severity = COMPLAINT_SEVERITY.HIGH;

  // Create new complaint
  const complaint = await UserComplaint.create({
    orderId,
    productType,
    description,
    userId,
    severity,
  });

  res.status(HTTP_STATUS.CREATED).json({ 
    success: true,
    message: 'Complaint raised successfully', 
    complaint 
  });
});

/**
 * Get paginated complaints for the current user
 * @route GET /api/complaints/user
 * @access Private
 */
export const getUserComplaints = asyncHandler(async (req, res, next) => {
  const userId = req.userInfo.userId;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const totalComplaints = await UserComplaint.countDocuments({ userId });
  const complaints = await UserComplaint.find({ userId })
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .populate({
      path: "replies",
      populate: { path: "user", select: "name" },
    });

  res.status(HTTP_STATUS.OK).json({
    success: true,
    complaints,
    pagination: {
      totalPages: Math.ceil(totalComplaints / limit),
      currentPage: page,
      totalComplaints,
      hasNextPage: page < Math.ceil(totalComplaints / limit),
      hasPrevPage: page > 1
    }
  });
});

/**
 * Close a complaint (set status to resolved)
 * @route PATCH /api/complaints/:id/close
 * @access Private
 */
export const closeComplaint = asyncHandler(async (req, res, next) => {
  const complaintId = req.params.id;
  const userId = req.userInfo.userId;

  const complaint = await UserComplaint.findById(complaintId);
  if (!complaint) {
    return next(new ErrorResponse('Complaint not found', HTTP_STATUS.NOT_FOUND));
  }

  if (complaint.userId.toString() !== userId) {
    return next(new ErrorResponse('Unauthorized to close this complaint', HTTP_STATUS.FORBIDDEN));
  }

  if (complaint.status === COMPLAINT_STATUS.RESOLVED) {
    return next(new ErrorResponse('Complaint is already resolved', HTTP_STATUS.BAD_REQUEST));
  }

  complaint.status = COMPLAINT_STATUS.RESOLVED;
  await complaint.save();

  res.status(HTTP_STATUS.OK).json({ 
    success: true, 
    message: "Complaint closed successfully", 
    complaint 
  });
});

/**
 * Get all user complaints (admin view)
 * @route GET /api/complaints
 * @access Private/Admin
 */
export const getAllUserComplaints = asyncHandler(async (req, res, next) => {
  const complaints = await UserComplaint.find()
    .populate({
      path: "userId",
      select: "name email",
    })
    .populate({
      path: "replies",
      populate: {
        path: "user",
        select: "name",
      },
    })
    .sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({ 
    success: true, 
    count: complaints.length,
    complaints 
  });
});