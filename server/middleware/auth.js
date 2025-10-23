import db from '../database.js';
import { verifyToken } from '../config/jwt.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = verifyToken(token);
    
    const userData = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    if (!userData) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      profilePicture: userData.profile_picture,
      workingHours: {
        start: userData.working_hours_start || '09:00',
        end: userData.working_hours_end || '17:00',
        daysOfWeek: userData.working_days ? JSON.parse(userData.working_days) : [1, 2, 3, 4, 5]
      }
    };
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    
    const userData = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    if (userData) {
      req.user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        profilePicture: userData.profile_picture,
        workingHours: {
          start: userData.working_hours_start || '09:00',
          end: userData.working_hours_end || '17:00',
          daysOfWeek: userData.working_days ? JSON.parse(userData.working_days) : [1, 2, 3, 4, 5]
        }
      };
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }
  
  next();
};
