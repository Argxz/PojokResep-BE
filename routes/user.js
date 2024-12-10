// Import modul yang dibutuhkan
const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const { authenticateToken } = require('../middleware/authMiddleware')

// Rute Autentikasi Publik (Tidak Memerlukan Token)
/**
 * @route POST /users/register
 * @desc Registrasi pengguna baru
 * @access Public
 */
router.post('/register', userController.register)

/**
 * @route POST /users/login
 * @desc Proses login pengguna
 * @access Public
 */
router.post('/login', userController.login)

/**
 * @route POST /users/refresh-token
 * @desc Mendapatkan token baru
 * @access Public
 */
router.post('/refresh-token', userController.refreshToken)

// Rute Manajemen Pengguna (Memerlukan Autentikasi)
/**
 * @route GET /users
 * @desc Mendapatkan semua pengguna
 * @access Private
 */
router.get('/', authenticateToken, userController.getAllUsers)

/**
 * @route POST /users
 * @desc Membuat pengguna baru (admin)
 * @access Private
 */
router.post('/', authenticateToken, userController.createUser)

/**
 * @route DELETE /users/id
 * @desc Menghapus pengguna
 * @access Private
 */
router.delete('/id', authenticateToken, userController.deleteUser)

/**
 * @route POST /users/upload-profile-picture
 * @desc Mengunggah foto profil
 * @access Private
 */
router.post(
  '/upload-profile-picture',
  authenticateToken,
  userController.handleProfilePictureUpload,
)

/**
 * @route POST /users/logout
 * @desc Proses logout pengguna
 * @access Private
 */
router.post('/logout', authenticateToken, userController.logout)

// Rute Verifikasi dan Profil
/**
 * @route GET /users/verify-token
 * @desc Memverifikasi validitas token
 * @access Private
 */
router.get('/verify-token', authenticateToken, userController.verifyToken)

/**
 * @route GET /users/profile
 * @desc Mendapatkan profil pengguna yang sedang login
 * @access Private
 */
router.get('/profile', authenticateToken, userController.getUserProfile)

/**
 * @route PUT /users/profile
 * @desc Memperbarui username dan email
 * @access Private
 */
router.put('/profile', authenticateToken, userController.updateUsernameEmail)

// Ekspor router untuk digunakan di aplikasi utama
module.exports = router
