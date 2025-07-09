import express from "express";
import { getCommentAIReply, getComplaintAIReply } from "../../controllers/AiResponse.controller.js";
import { validateAICommentReply, validateAIComplaintReply } from "../../validators/aiValidator.js";
import authMiddleware from "../../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route POST /api/ai/complaint-reply
 * @desc Generate AI-powered reply for a user complaint
 * @access Private
 */
router.post("/complaint-reply", authMiddleware, validateAIComplaintReply, getComplaintAIReply);

/**
 * @route POST /api/ai/comment-reply
 * @desc Generate AI-powered reply and sentiment for a comment
 * @access Private
 */
router.post("/comment-reply", authMiddleware, validateAICommentReply, getCommentAIReply);

export default router;