import Post from '../models/Post.model.js';
import Image from '../models/Image.model.js';
import { uploadToCloudinary } from '../helpers/cloudinaryHelper.js';
import { HTTP_STATUS } from '../constants/roles.js';
import ErrorResponse from '../utils/ErrorResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import fs from 'fs';
import cloudinary from '../config/cloudinary.js';

/**
 * Create a new post with optional image upload
 * @route POST /api/posts
 * @access Private/Admin
 */
export const createPost = asyncHandler(async (req, res, next) => {
  const { title, description } = req.body;
  const userId = req.userInfo.userId;

  let imageDoc = null;

  // Handle image upload if provided
  if (req.file) {
    const { url, publicId } = await uploadToCloudinary(req.file.path);
    imageDoc = await Image.create({ url, publicId, uploadedBy: userId });
    fs.unlinkSync(req.file.path);
  }

  // Create new post
  const post = await Post.create({
    title,
    description,
    author: userId,
    image: imageDoc?._id || null,
  });
  
  // Populate image fields for response
  const populatedPost = await Post.findById(post._id).populate({
    path: 'image',
    select: 'url publicId -_id',
  });

  res.status(HTTP_STATUS.CREATED).json({ 
    success: true, 
    post: populatedPost 
  });
});

/**
 * Get all posts with author, image, comments, and replies populated
 * @route GET /api/posts
 * @access Private
 */
export const getAllPosts = asyncHandler(async (req, res, next) => {
  const posts = await Post.find()
    .populate('author', 'name')
    .populate('image')
    .populate({
      path: 'comments',
      populate: [
        { path: 'user', select: 'name' },
        {
          path: 'replies',
          populate: { path: 'user', select: 'name' }
        }
      ]
    })
    .sort({ createdAt: -1 });

  res.status(HTTP_STATUS.OK).json({ 
    success: true, 
    count: posts.length,
    posts 
  });
});

/**
 * Get a single post by ID with all relations populated
 * @route GET /api/posts/:id
 * @access Private
 */
export const getPostById = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "name")
    .populate("image")
    .populate({
      path: "comments",
      populate: [
        { path: "user", select: "name" },
        {
          path: "replies",
          populate: { path: "user", select: "name" }
        }
      ]
    });

  if (!post) {
    return next(new ErrorResponse('Post not found', HTTP_STATUS.NOT_FOUND));
  }

  res.status(HTTP_STATUS.OK).json({ 
    success: true, 
    post 
  });
});

/**
 * Update a post's title, description, and optionally image
 * @route PUT /api/posts/:id
 * @access Private/Admin
 */
export const updatePost = asyncHandler(async (req, res, next) => {
  const postId = req.params.id;
  const { title, description } = req.body;
  const userId = req.userInfo.userId;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorResponse('Post not found', HTTP_STATUS.NOT_FOUND));
  }

  if (post.author.toString() !== userId) {
    return next(new ErrorResponse('Not authorized to update this post', HTTP_STATUS.FORBIDDEN));
  }

  // Handle new image upload
  let newImageDoc = null;
  if (req.file) {
    // Delete old image if exists
    if (post.image) {
      const oldImage = await Image.findById(post.image);
      if (oldImage) {
        await cloudinary.uploader.destroy(oldImage.publicId);
        await Image.findByIdAndDelete(post.image);
      }
    }

    // Upload new image
    const { url, publicId } = await uploadToCloudinary(req.file.path);
    newImageDoc = await Image.create({ url, publicId, uploadedBy: userId });
    fs.unlinkSync(req.file.path);
  }

  // Update post fields
  post.title = title || post.title;
  post.description = description || post.description;
  if (newImageDoc) post.image = newImageDoc._id;

  await post.save();

  res.status(HTTP_STATUS.OK).json({ 
    success: true, 
    message: "Post updated successfully", 
    post 
  });
});

/**
 * Delete a post and its associated image
 * @route DELETE /api/posts/:id
 * @access Private/Admin
 */
export const deletePost = asyncHandler(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.userInfo.userId;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorResponse('Post not found', HTTP_STATUS.NOT_FOUND));
  }

  if (post.author.toString() !== userId) {
    return next(new ErrorResponse('Not authorized to delete this post', HTTP_STATUS.FORBIDDEN));
  }

  // Delete associated image
  if (post.image) {
    const img = await Image.findById(post.image);
    if (img) {
      await cloudinary.uploader.destroy(img.publicId);
      await Image.findByIdAndDelete(post.image);
    }
  }

  await Post.findByIdAndDelete(postId);

  res.status(HTTP_STATUS.OK).json({ 
    success: true, 
    message: "Post deleted successfully" 
  });
});

/**
 * Toggle like/unlike for a post by the current user
 * @route POST /api/posts/:id/like
 * @access Private
 */
export const likePost = asyncHandler(async (req, res, next) => {
  const postId = req.params.id;
  const userId = req.userInfo.userId;

  const post = await Post.findById(postId);
  if (!post) {
    return next(new ErrorResponse('Post not found', HTTP_STATUS.NOT_FOUND));
  }

  const hasLiked = post.likedBy.includes(userId);

  if (hasLiked) {
    post.likes -= 1;
    post.likedBy.pull(userId);
  } else {
    post.likes += 1;
    post.likedBy.push(userId);
  }

  await post.save();

  res.status(HTTP_STATUS.OK).json({ 
    success: true, 
    liked: !hasLiked, 
    likes: post.likes 
  });
});