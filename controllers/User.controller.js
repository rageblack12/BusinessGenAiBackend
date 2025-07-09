import User from '../models/User.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Register a new user.
 * @route POST /api/users/register
 * @body { name: String, email: String, password: String, role?: String }
 * @returns { success: Boolean, accessToken: String, user: Object }
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email. Please use a different email.",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user document
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();

    // Generate JWT access token
    const accessToken = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '30m' }
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      accessToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      }
    });
  } catch (e) {
    console.error("Register Error:", e);
    return res.status(500).json({
      success: false,
      message: "An error occurred! Please try again.",
    });
  }
};

/**
 * Login a user and return JWT token.
 * @route POST /api/users/login
 * @body { email: String, password: String }
 * @returns { success: Boolean, accessToken: String, user: Object }
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist.",
      });
    }

    // Compare password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials!",
      });
    }

    // Generate JWT access token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "60m" }
    );

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      accessToken,
      user: {
        id: user._id,
        name: user.name, 
        email: user.email,
        role: user.role,
      }
    });
  } catch (e) {
    console.error("Login Error:", e);
    return res.status(500).json({
      success: false,
      message: "An error occurred! Please try again.",
    });
  }
};
