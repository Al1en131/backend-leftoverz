// src/middlewares/roleMiddleware.js
const roleMiddleware = (allowedRole) => {
    return (req, res, next) => {
      const user = req.user; // dari authMiddleware
  
      if (!user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
  
      if (user.role !== allowedRole) {
        return res.status(403).json({ message: 'Forbidden: You do not have access' });
      }
  
      next();
    };
  };
  
  module.exports = roleMiddleware;
  