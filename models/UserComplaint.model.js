import mongoose from 'mongoose';
import { COMPLAINT_SEVERITY, COMPLAINT_STATUS } from '../constants/roles.js';

/**
 * UserComplaint Schema
 * @typedef {Object} UserComplaint
 * @property {String} orderId - Order identifier
 * @property {String} productType - Type of product
 * @property {String} description - Complaint description
 * @property {mongoose.Types.ObjectId} userId - Reference to User
 * @property {String} severity - Severity level (Moderate, High, Urgent)
 * @property {String} status - Complaint status (open, resolved)
 * @property {Array<mongoose.Types.ObjectId>} replies - References to ComplaintReply
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
const userComplaintSchema = new mongoose.Schema({
    orderId: { 
      type: String, 
      required: [true, 'Order ID is required'], 
      trim: true,
      maxlength: [50, 'Order ID cannot exceed 50 characters']
    },
    productType: { 
      type: String, 
      required: [true, 'Product type is required'], 
      trim: true,
      maxlength: [100, 'Product type cannot exceed 100 characters']
    },
    description: { 
      type: String, 
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    severity: {
      type: String,
      enum: Object.values(COMPLAINT_SEVERITY),
      default: COMPLAINT_SEVERITY.MODERATE
    },
    status: {
      type: String,
      enum: Object.values(COMPLAINT_STATUS),
      default: COMPLAINT_STATUS.OPEN
    },
    replies: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'ComplaintReply' 
    }],
}, {
  timestamps: true
});

const UserComplaint = mongoose.model('UserComplaint', userComplaintSchema);
export default UserComplaint;