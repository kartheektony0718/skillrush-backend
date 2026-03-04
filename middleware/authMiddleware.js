const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // 1. Get the token from the request header
  const token = req.header('Authorization')?.split(' ')[1];

  // 2. If there is no token, deny access
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  // 3. Verify the token is real
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the user's ID to the request
    next(); // Move on to the next step
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};