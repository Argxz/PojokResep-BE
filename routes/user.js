const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

const { authenticateToken } = require('../middleware/authMiddleware')

// Rute publik (tidak memerlukan autentikasi)
router.post('/register', userController.register)
router.post('/login', userController.login)
router.post('/refresh-token', userController.refreshToken)

// Rute yang memerlukan autentikasi token
router.get('/', authenticateToken, userController.getAllUsers)
router.post('/', authenticateToken, userController.createUser)
router.delete('/id', authenticateToken, userController.deleteUser)
router.post(
  '/upload-profile-picture',
  authenticateToken,
  userController.handleProfilePictureUpload,
)
router.post('/logout', authenticateToken, userController.logout)

// Rute verifikasi token
router.get('/verify-token', authenticateToken, userController.verifyToken)

// Rute untuk mendapatkan profil user yang sedang login
router.get('/profile', authenticateToken, userController.getUserProfile)

// Rute update profil
router.put('/profile', authenticateToken, userController.updateUsernameEmail)

module.exports = router
