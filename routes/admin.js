// Import modul yang dibutuhkan
const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const {
  authenticateToken,
  authorizeRole,
} = require('../middleware/authMiddleware')

// Middleware untuk memastikan hanya admin yang bisa mengakses rute-rute berikut

// Rute untuk dashboard admin
/**
 * @route GET /admin/dashboard
 * @desc Mendapatkan data dashboard admin
 * @access Private (Hanya admin)
 */
router.get(
  '/dashboard',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.getDashboardData,
)

// Rute untuk manajemen komentar
/**
 * @route GET /admin/comments
 * @desc Mendapatkan semua komentar
 * @access Private (Hanya admin)
 */
router.get(
  '/comments',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.getAllComments,
)

/**
 * @route DELETE /admin/comments/:id
 * @desc Menghapus komentar berdasarkan ID
 * @access Private (Hanya admin)
 */
router.delete(
  '/comments/:id',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.deleteComment,
)

// Rute untuk manajemen resep
/**
 * @route GET /admin/recipes
 * @desc Mendapatkan semua resep
 * @access Private (Hanya admin)
 */
router.get(
  '/recipes',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.getAllRecipes,
)

/**
 * @route DELETE /admin/recipes/:id
 * @desc Menghapus resep berdasarkan ID
 * @access Private (Hanya admin)
 */
router.delete(
  '/recipes/:id',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.deleteRecipe,
)

// Rute untuk manajemen pengguna
/**
 * @route GET /admin/users
 * @desc Mendapatkan semua pengguna
 * @access Private (Hanya admin)
 */
router.get(
  '/users',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.getAllUsers,
)

/**
 * @route DELETE /admin/users/:id
 * @desc Menghapus pengguna berdasarkan ID
 * @access Private (Hanya admin)
 */
router.delete(
  '/users/:id',
  authenticateToken,
  authorizeRole(['admin']),
  adminController.deleteUser,
)

// Ekspor router untuk digunakan di aplikasi utama
module.exports = router
