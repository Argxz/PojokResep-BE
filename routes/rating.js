// Import modul yang dibutuhkan
const express = require('express')
const router = express.Router()
const ratingController = require('../controllers/ratingController')
const { authenticateToken } = require('../middleware/authMiddleware')

// Rute Manajemen Rating

/**
 * @route GET /ratings
 * @desc Mendapatkan semua rating
 * @access Private (Pengguna yang terautentikasi)
 */
router.get('/', authenticateToken, ratingController.getAllRatings)

/**
 * @route GET /ratings/recipes/:recipe_id
 * @desc Mendapatkan rating berdasarkan ID resep
 * @access Private (Pengguna yang terautentikasi)
 */
router.get(
  '/recipes/:recipe_id',
  authenticateToken,
  ratingController.getRatingByRecipeId,
)

/**
 * @route GET /ratings/user/:recipe_id
 * @desc Mendapatkan rating pengguna untuk resep tertentu
 * @access Private (Pengguna yang terautentikasi)
 */
router.get(
  '/user/:recipe_id',
  authenticateToken,
  ratingController.getUserRatingForRecipe,
)

/**
 * @route POST /ratings
 * @desc Membuat rating baru
 * @access Private (Pengguna yang terautentikasi)
 */
router.post('/', authenticateToken, ratingController.createRating)

/**
 * @route PUT /ratings/recipe_id/:recipe_id
 * @desc Memperbarui rating yang dibuat pengguna untuk resep
 * @access Private (Pengguna yang terautentikasi)
 */
router.put(
  '/recipe_id/:recipe_id',
  authenticateToken,
  ratingController.updateRatingByUser,
)

/**
 * @route DELETE /ratings/:id
 * @desc Menghapus rating berdasarkan ID
 * @access Private (Pengguna yang terautentikasi)
 */
router.delete('/:id', authenticateToken, ratingController.deleteRating)

// Ekspor router untuk digunakan di aplikasi utama
module.exports = router
