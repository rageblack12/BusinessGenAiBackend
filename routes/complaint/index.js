import express from 'express';
import { 
  getUserComplaints, 
  raiseComplaint, 
  closeComplaint, 
  getAllUserComplaints 
} from '../../controllers/UserComplaint.controller.js';
import { createComplaintReply } from '../../controllers/ComplaintReply.controller.js';
import { validateRaiseComplaint, validateCreateComplaintReply } from '../../validators/complaintValidator.js';
import authMiddleware from '../../middleware/authMiddleware.js';
import adminMiddleware from '../../middleware/adminMiddleware.js';

const router = express.Router();

/**
 * @route POST /api/complaints
 * @desc Raise a new complaint
 * @access Private
 */
router.post('/', authMiddleware, validateRaiseComplaint, raiseComplaint);

/**
 * @route GET /api/complaints/user
 * @desc Fetch complaints for the logged-in user
 * @access Private
 */
router.get('/user', authMiddleware, getUserComplaints);

/**
 * @route GET /api/complaints/all
 * @desc Get all complaints (admin only)
 * @access Private/Admin
 */
router.get('/all', authMiddleware, adminMiddleware, getAllUserComplaints);

/**
 * @route PATCH /api/complaints/:id/close
 * @desc Close a complaint by ID
 * @access Private
 */
router.patch('/:id/close', authMiddleware, closeComplaint);

/**
 * @route POST /api/complaints/replies
 * @desc Create a reply for a user complaint
 * @access Private
 */
router.post('/replies', authMiddleware, validateCreateComplaintReply, createComplaintReply);

export default router;