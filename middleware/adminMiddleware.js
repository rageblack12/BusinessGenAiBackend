import { USER_ROLES, HTTP_STATUS } from '../constants/roles.js';
import ErrorResponse from '../utils/ErrorResponse.js';

/**
 * Admin authorization middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const isAdminUser = (req, res, next) => {
  if (req.userInfo.role !== USER_ROLES.ADMIN) {
    return next(new ErrorResponse('Access denied! Admin rights required.', HTTP_STATUS.FORBIDDEN));
  }
  next();
};

export default isAdminUser;