import mongoose from "mongoose";

/**
 * Validate MongoDB ObjectId
 * Prevents NoSQL injection attacks
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName} format`
      });
    }
    
    next();
  };
};

/**
 * Validate email format
 */
export const validateEmail = (req, res, next) => {
  const email = req.body.email || req.query.email;
  
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format"
    });
  }
  
  next();
};

/**
 * Sanitize user input
 * Rejects requests containing MongoDB operator characters in keys or string values.
 * Does not mutate req objects to avoid breaking read-only props.
 */
export const sanitizeInput = (req, res, next) => {
  const hasUnsafe = (value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return /[$.]/.test(value);
    if (typeof value === 'object') {
      for (const key in value) {
        if (/[$.]/.test(key)) return true;
        if (hasUnsafe(value[key])) return true;
      }
    }
    return false;
  };

  if (hasUnsafe(req.body) || hasUnsafe(req.query) || hasUnsafe(req.params)) {
    return res.status(400).json({
      success: false,
      message: "Input contains forbidden characters"
    });
  }

  next();
};
