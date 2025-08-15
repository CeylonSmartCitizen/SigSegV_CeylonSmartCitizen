// Simple authentication middleware for demonstration
module.exports = function (req, res, next) {
  // Example: Check for an auth token in headers
  const token = req.headers['authorization'];
  if (!token || token !== 'hackathon-demo-token') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};
