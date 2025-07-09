import mongoose from "mongoose";
import { USER_ROLES } from '../constants/roles.js';

/**
 * User Schema
 * @typedef {Object} User
 * @property {String} name - User's name
 * @property {String} email - User's email (unique, lowercase)
 * @property {String} password - Hashed password
 * @property {String} role - User role ('user' or 'admin')
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */
const userSchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: [true, 'Name is required'], 
      trim: true,
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true, 
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: { 
      type: String, 
      enum: Object.values(USER_ROLES), 
      default: USER_ROLES.USER 
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);
export default User;