const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next)  => {

    let token;

    //if token exist in headers

    if (
        req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token) {
        return res.status(401).json({error: 'Not authorized: no token'});
    }

      try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database, minus the password
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ error: 'Not authorized, token failed' });
  };

};

const authorize = (...roles) => {
    return (req, res, next) => {
        if(!req.user) {
            return res.status(401).json({ error: 'not authenticated'});
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'forbidden'});
        }

        next();
    };
};

module.exports = { protect, authorize };