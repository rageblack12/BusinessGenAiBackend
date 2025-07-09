import mongoose from 'mongoose';
import { SENTIMENT_TYPES } from '../constants/roles.js';

/**
 * Comment Schema
 * @typedef {Object} Comment
 * @property {String} content - The comment text
 * @property {String} sentiment - Sentiment label (Positive, Neutral, Negative)
 * @property {mongoose.Types.ObjectId} user - Reference to User
 * @property {mongoose.Types.ObjectId} post - Reference to Post
 * @property {Array<mongoose.Types.ObjectId>} replies - References to CommentReply
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
const commentSchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: [true, 'Comment content is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  sentiment: { 
    type: String, 
    enum: Object.values(SENTIMENT_TYPES), 
    required: true 
  },
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  post: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Post', 
    required: true 
  },
  replies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CommentReply' 
  }],
}, {
  timestamps: true,
});

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;