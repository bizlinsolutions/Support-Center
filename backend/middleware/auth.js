const jwt = require('jsonwebtoken');
const { User, Admin } = require('../data/userSchema');

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

if (!ACCESS_TOKEN_SECRET) {
  throw new Error('Missing ACCESS_TOKEN_SECRET in environment');
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    req.user = payload;

    const Model = payload.collection === 'Admin' ? Admin : User;
    const dbUser = await Model.findById(payload.userId);
    
    if (!dbUser) {
      return res.status(401).json({ error: 'User does not exist' });
    }
    if (!dbUser.isActive) {
      return res.status(401).json({ error: 'Account deactivated' });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired access token' });
  }
}

module.exports = { authenticateToken };
