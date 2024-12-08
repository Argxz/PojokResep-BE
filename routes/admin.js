const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const {
  authenticateToken,
  authorizeRole,
} = require('../middleware/authMiddleware')

// Route untuk mendapatkan data dashboard admin
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.getDashboardData,
)

router.get(
  '/comments',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.getAllComments,
)

router.delete(
  '/comments/:id',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.deleteComment,
)

module.exports = router
