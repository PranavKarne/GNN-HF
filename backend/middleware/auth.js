import jwt from "jsonwebtoken";

/**
 * JWT Authentication Middleware
 * Verifies JWT token and attaches user data to request
 */
export const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Authorization required."
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user data to request
    req.user = {
      email: decoded.email,
      userId: decoded.userId,
      patientId: decoded.patientId
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Authentication error"
    });
  }
};

/**
 * Optional auth middleware - continues even if no token
 * Useful for endpoints that work for both authenticated and unauthenticated users
 */
export const optionalAuthMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        email: decoded.email,
        userId: decoded.userId,
        patientId: decoded.patientId
      };
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user data
    next();
  }
};
