// Import modul yang dibutuhkan
const express = require('express')
const router = express.Router()
const recipeController = require('../controllers/recipeController')
const { authenticateToken } = require('../middleware/authMiddleware')
const upload = require('../middleware/recipeMiddleware')

// Rute Manajemen Resep

/**
 * @route GET /recipes
 * @desc Mendapatkan semua resep
 * @access Private (Pengguna yang terautentikasi)
 */
router.get('/', authenticateToken, recipeController.getAllRecipes)

/**
 * @route GET /recipes/:id
 * @desc Mendapatkan detail resep berdasarkan ID
 * @access Private (Pengguna yang terautentikasi)
 */
router.get('/:id', authenticateToken, recipeController.getRecipeById)

/**
 * @route GET /recipes/user/:id
 * @desc Mendapatkan resep berdasarkan ID pengguna
 * @access Private (Pengguna yang terautentikasi)
 */
router.get('/user/:id', authenticateToken, recipeController.getRecipesByUserId)

/**
 * @route POST /recipes
 * @desc Membuat resep baru
 * @access Private (Pengguna yang terautentikasi)
 * @middleware Upload gambar resep
 */
router.post(
  '/',
  authenticateToken,
  upload.single('image'), // Middleware untuk upload gambar
  recipeController.createRecipe,
)

/**
 * @route PUT /recipes/:id
 * @desc Memperbarui resep berdasarkan ID
 * @access Private (Pengguna yang terautentikasi)
 * @middleware Upload gambar resep
 */
router.put(
  '/:id',
  authenticateToken,
  upload.single('image'), // Middleware untuk upload gambar
  recipeController.updateRecipe,
)

/**
 * @route DELETE /recipes/:id
 * @desc Menghapus resep berdasarkan ID
 * @access Private (Pengguna yang terautentikasi)
 */
router.delete('/:id', authenticateToken, recipeController.deleteRecipe)

// Ekspor router untuk digunakan di aplikasi utama
module.exports = router
