/**
 * Authentication Middleware
 * 
 * Protects routes by checking if the user has an active session.
 * If not authenticated, returns a 401 Unauthorized response.
 */

const requireAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'You must be logged in to access this resource' });
};

module.exports = requireAuth;
