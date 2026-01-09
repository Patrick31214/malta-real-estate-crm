const { verifyAccessToken } = require('../utils/jwt');
const User = require('../models/User');

// Define role-based permissions
const ROLE_PERMISSIONS = {
  admin: [
    'users:read', 'users:write', 'users:delete',
    'properties:read', 'properties:write', 'properties:delete',
    'agents:read', 'agents:write', 'agents:delete',
    'system:configure'
  ],
  agent: [
    'properties:read', 'properties:write',
    'clients:read', 'clients:write',
    'leads:read', 'leads:write'
  ],
  owner: [
    'properties:read',
    'profile:read', 'profile:write'
  ],
  system: [
    'system:read', 'system:write', 'system:execute'
  ]
};

/**
 * Get permissions for a given role
 */
const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Middleware to authenticate requests using JWT
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.'
      });
    }

    // Get user from database
    const user = await User.findByPk(decoded.userId);
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive.'
      });
    }

    // Attach user to request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: getPermissionsForRole(user.role)
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

/**
 * Middleware to check if user has required role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.'
      });
    }

    next();
  };
};

/**
 * Middleware to check if user has required permissions
 */
const checkPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.every(permission => 
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to access this resource.'
      });
    }

    next();
  };
};

module.exports = { authenticate, authorize, checkPermission, getPermissionsForRole };
