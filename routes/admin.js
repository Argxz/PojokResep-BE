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

//comments
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

//recipes
router.get(
  '/recipes',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.getAllRecipes,
)

router.delete(
  '/recipes/:id',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.deleteRecipe,
)

//users
router.get(
  '/users',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.getAllUsers,
)

router.delete(
  '/users/:id',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.deleteUser,
)

module.exports = router
