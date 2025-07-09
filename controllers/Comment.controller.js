import Post from '../models/Post.model.js';
import Comment from '../models/Comment.model.js';
import { HTTP_STATUS } from '../constants/roles.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import fetch from 'node-fetch';

/**
 * Helper function to classify sentiment of a customer comment using Hugging Face Inference API
 * @param {string} customerComment - The comment text to analyze
 * @returns {Promise<string>} - Returns 'Positive', 'Neutral', 'Negative', or 'Unknown'
 */
async function classifySentiment(customerComment) {
  try {
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/cardiffnlp/twitter-roberta-base-sentiment",
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ inputs: customerComment }),
      }
    );

    let result = await response.json();
    result = result[0] ? result[0] : [];

    // Handle API error or unexpected response
    if (!Array.isArray(result) || !result[0]?.label) {
      console.error("Invalid response:", result);
      return "Unknown";
    }

    // Extract top label from API response
    const topLabel = result[0].label;

    // Map Hugging Face label to human-readable sentiment
    const labelMap = {
      "LABEL_0": "Negative",
      "LABEL_1": "Neutral",
      "LABEL_2": "Positive"
    };
    
    return labelMap[topLabel] || "Unknown";
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return "Unknown";
  }
}

/**
 * Create a new comment on a post with automatic sentiment classification
 * @route POST /api/comments
 * @access Private
 */
export const createComment = asyncHandler(async (req, res, next) => {
  const { content, postId } = req.body;
  const userId = req.userInfo.userId;

  // Check if post exists
  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorResponse('Post not found', HTTP_STATUS.NOT_FOUND));
  }

  // Classify sentiment using helper
  const sentiment = await classifySentiment(content);

  // Create new comment
  const newComment = await Comment.create({
    content,
    sentiment,
    user: userId,
    post: postId,
  });

  // Add comment reference to the post
  await Post.findByIdAndUpdate(postId, {
    $push: { comments: newComment._id },
  });

  // Populate user info for response
  await newComment.populate('user', 'name');

  res.status(HTTP_STATUS.CREATED).json({ 
    success: true, 
    comment: newComment 
  });
});