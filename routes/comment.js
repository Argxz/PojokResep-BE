// Import modul yang dibutuhkan
const express = require('express')
const router = express.Router()
const commentController = require('../controllers/commentController')
const { authenticateToken } = require('../middleware/authMiddleware')

// Rute untuk manajemen komentar

/**
 * @route GET /comments
 * @desc Mendapatkan semua komentar
 * @access Private (Pengguna yang terautentikasi)
 */
router.get('/', authenticateToken, commentController.getAllComments)

/**
 * @route GET /comments/recipes/:recipe_id
 * @desc Mendapatkan komentar berdasarkan ID resep
 * @access Private (Pengguna yang terautentikasi)
 */
router.get(
  '/recipes/:recipe_id',
  authenticateToken,
  commentController.getCommentsByRecipeId,
)

/**
 * @route POST /comments
 * @desc Membuat komentar baru
 * @access Private (Pengguna yang terautentikasi)
 */
router.post('/', authenticateToken, commentController.createComment)

/**
 * @route PUT /comments/:id
 * @desc Memperbarui konten komentar
 * @access Private (Pengguna yang terautentikasi)
 */
router.put('/:id', authenticateToken, commentController.updateCommentContent)

/**
 * @route DELETE /comments/:id
 * @desc Menghapus komentar berdasarkan ID
 * @access Private (Pengguna yang terautentikasi)
 */
router.delete('/:id', authenticateToken, commentController.deleteComment)

// Ekspor router untuk digunakan di aplikasi utama
module.exports = router
