const jwt = require('jsonwebtoken');
const Permission = require('../models/Permission');

// Verifies the JWT and attaches user info to req.user
exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, department }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Restricts route to specific roles, e.g. checkRole(['system_admin', 'department_head'])
exports.checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role permissions' });
    }
    next();
  };
};


// Attaches req.user if a valid token is present, but never blocks the request
exports.optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (err) {
      // invalid token - just proceed as anonymous, don't block
    }
  }
  next();
};

// Database-backed version of checkRole. Looks up the permission's current
// allowedRoles list from the database instead of a hardcoded array in the route file.
exports.checkPermission = (key) => {
  return async (req, res, next) => {
    try {
      const permission = await Permission.findOne({ key });
      if (!permission) {
        // Fail closed: if a permission key doesn't exist in the DB, deny access
        // rather than silently allowing everyone through.
        return res.status(500).json({ message: `Permission "${key}" is not configured.` });
      }
      if (!permission.allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: insufficient role permissions' });
      }
      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};
