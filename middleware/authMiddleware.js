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

      // Gabungkan decoded token dengan data user
      req.user = {
        ...user.toJSON(),
        roles: decoded.roles || 'user', // Pastikan roles selalu ada
      }
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

// Update authorize role middleware
exports.authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles || 'user'

    if (!allowedRoles.includes(userRoles)) {
      return res.status(403).json({
        message: 'Akses ditolak',
        userRole: userRoles,
        allowedRoles: allowedRoles,
      })
    }
    next()
  }
}
