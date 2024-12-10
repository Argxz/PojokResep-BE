// Import modul yang dibutuhkan
const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const {
  authenticateToken,
  authorizeRole,
} = require('../middleware/authMiddleware')

// Rute Manajemen Kategori

/**
 * @route GET /categories
 * @desc Mendapatkan semua kategori
 * @access Private (Pengguna yang terautentikasi)
 */
router.get('/', authenticateToken, categoryController.getAllCategories)

/**
 * @route GET /categories/:id
 * @desc Mendapatkan detail kategori berdasarkan ID
 * @access Public
 */
router.get('/:id', categoryController.getCategoryById)

/**
 * @route POST /categories
 * @desc Membuat kategori baru
 * @access Private (Admin)
 */
router.post(
  '/',
  authenticateToken,
  authorizeRole('admin'),
  categoryController.createCategory,
)

/**
 * @route PUT /categories/:id
 * @desc Memperbarui kategori berdasarkan ID
 * @access Private (Admin)
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRole('admin'),
  categoryController.updateCategory,
)

/**
 * @route DELETE /categories/:id
 * @desc Menghapus kategori berdasarkan ID
 * @access Private (Admin)
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRole('admin'),
  categoryController.deleteCategory,
)

// Ekspor router untuk digunakan di aplikasi utama
module.exports = router
