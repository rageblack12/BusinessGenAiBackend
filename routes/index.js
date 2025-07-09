import express from 'express';
import userRoutes from './user/index.js';
import postRoutes from './post/index.js';
import commentRoutes from './comment/index.js';
import complaintRoutes from './complaint/index.js';
import aiRoutes from './ai/index.js';

const router = express.Router();

// Mount route modules
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/comments', commentRoutes);
router.use('/complaints', complaintRoutes);
router.use('/ai', aiRoutes);

export default router;