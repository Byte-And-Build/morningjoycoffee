// middleware/requireRole.js
function requireRole(roleArray) {
    return (req, res, next) => {
      if (!req.user || !roleArray.includes(req.user.role)) {
        return res.status(403).json({ error: "Access denied." });
      }
      next();
    };
  }
  
  module.exports = requireRole;  