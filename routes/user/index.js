import express from 'express';
import { register, login, logout, getProfile } from '../../controllers/User.controller.js';
import { validateRegister, validateLogin, handleValidationErrors } from '../../validators/userValidator.js';
import authMiddleware from '../../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateRegister, handleValidationErrors, register);

/**
 * @route   POST /api/users/login
 * @desc    Login a user
 * @access  Public
 */
router.post('/login', validateLogin, handleValidationErrors, login);

/**
 * @route   POST /api/users/logout
 * @desc    Logout a user
 * @access  Private
 */
router.post('/logout', authMiddleware, logout);

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authMiddleware, getProfile);

export default router;