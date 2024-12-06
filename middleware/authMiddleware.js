require('dotenv').config()
const jwt = require('jsonwebtoken')
const { User } = require('../models')

exports.authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({
        valid: false,
        message: 'No token provided',
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
      })

      if (!user) {
        return res.status(404).json({
          valid: false,
          message: 'User not found',
        })
      }

      req.user = user.toJSON()
      next()
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        // Token expired, client should use refresh token
        return res.status(401).json({
          valid: false,
          message: 'Token expired',
          needRefresh: true,
        })
      }

      throw error
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        valid: false,
        message: 'Invalid token',
      })
    }

    res.status(500).json({
      valid: false,
      message: 'Server error during authentication',
      error: error.message,
    })
  }
}

// Middleware untuk otorisasi role
exports.authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Akses ditolak',
      })
    }
    next()
  }
}
