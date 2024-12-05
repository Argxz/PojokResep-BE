const { User } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const fsPromises = require('fs').promises

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Gunakan fs biasa untuk pengecekan
    const uploadPath = path.join(__dirname, '../uploads/profile_pictures')

    // Buat folder jika belum ada
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    cb(null, uploadPath)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(
      null,
      `profile-${req.user.id}-${uniqueSuffix}${path.extname(
        file.originalname,
      )}`,
    )
  },
})

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB maks
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(
        new Error('Invalid file type. Only JPEG, PNG, and JPG are allowed.'),
        false,
      )
    }
  },
})

// Middleware untuk handle upload
const uploadProfilePicture = async (req, res) => {
  try {
    // Pastikan file terupload
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' })
    }

    // Cari user
    const user = await User.findByPk(req.user.id)
    if (!user) {
      // Hapus file yang baru diupload jika user tidak ditemukan
      await fsPromises.unlink(req.file.path)
      return res.status(404).json({ message: 'User not found' })
    }

    // Hapus foto profil lama jika ada
    if (user.profile_picture) {
      try {
        const oldFilePath = path.join(
          __dirname,
          '../uploads/profile_pictures',
          user.profile_picture,
        )
        await fsPromises.unlink(oldFilePath)
      } catch (error) {
        console.log('Old profile picture not found or already deleted')
      }
    }

    // Update profile picture
    user.profile_picture = req.file.filename
    await user.save()

    res.status(200).json({
      message: 'Profile picture uploaded successfully',
      profile_picture: user.profile_picture,
    })
  } catch (error) {
    console.error('Upload error:', error)
    // Hapus file yang baru diupload jika terjadi error
    if (req.file) {
      await fsPromises.unlink(req.file.path)
    }
    res.status(500).json({
      message: 'Server error',
      error: error.message,
    })
  }
}
exports.handleProfilePictureUpload = [
  upload.single('profile_picture'),
  uploadProfilePicture,
]

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll()
    res.json({ status: 'OK', data: users })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.createUser = async (req, res) => {
  const { username, email, password, profile_picture } = req.body

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Username, email, and password are required' })
  }

  try {
    const existingUser = await User.findOne({ where: { email } })

    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    const users = await User.create({
      username,
      email,
      password,
      profile_picture,
    })

    res.status(201).json({
      message: 'User created successfully',
      data: users,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.register = async (req, res) => {
  const { username, email, password } = req.body

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: 'Username, email, and password are required' })
  }

  try {
    // Cek email
    const existingEmail = await User.findOne({ where: { email } })
    if (existingEmail) {
      return res.status(409).json({ error: 'Email sudah terdaftar' })
    }

    // Cek username (opsional)
    const existingUsername = await User.findOne({ where: { username } })
    if (existingUsername) {
      return res.status(409).json({ error: 'Username sudah digunakan' })
    }

    // Proses registrasi normal
    const newUser = await User.create({
      username,
      email,
      password,
    })

    const accessToken = generateAccessToken(newUser)
    const refreshToken = generateRefreshToken(newUser)

    // Simpan refresh token di database
    await newUser.update({ refreshToken })

    res.status(201).json({
      message: 'Registration successful',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred' })
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  try {
    // Cek apakah user dengan email tersebut ada
    const user = await User.findOne({ where: { email } })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // Simpan refresh token DENGAN BENAR
    await user.update(
      {
        refreshToken: refreshToken,
      },
      {
        // Pastikan update berhasil
        hooks: true,
        validate: true,
      },
    )

    // Log untuk debugging
    console.log('Login - Tokens Generated:', {
      accessToken,
      refreshToken,
      userId: user.id,
    })

    res.status(200).json({
      message: 'Login successful',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        accessToken,
        refreshToken,
      },
    })
  } catch (error) {
    console.error('Login Error:', error)
    res.status(500).json({
      message: 'Login failed',
      error: error.message,
    })
  }
}

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    // Check if refreshToken is provided
    if (!refreshToken) {
      return res.status(400).json({ message: 'No refresh token provided' })
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET || 'your-secret-key',
    )
    console.log('Decoded Token:', decoded)

    // Find the user by ID from the decoded token
    const user = await User.findByPk(decoded.id)

    if (!user) {
      return res.status(403).json({ message: 'User not found' })
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)

    // Update refresh token in the database
    await user.update({ refreshToken: newRefreshToken })

    return res.json({
      valid: true,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    return res.status(500).json({
      valid: false,
      message: 'Server error during token refresh',
      error: error.message,
    })
  }
}

exports.logout = async (req, res) => {
  try {
    // Ambil user dari request (setelah melalui middleware autentikasi)
    const userId = req.user.id

    // Hapus refresh token dari database
    await User.update({ refreshToken: null }, { where: { id: userId } })

    res.status(200).json({
      valid: true,
      message: 'Logout successful',
    })
  } catch (error) {
    res.status(500).json({
      valid: false,
      message: 'Error during logout',
      error: error.message,
    })
  }
}

// Dapatkan profil user yang sedang login
exports.getUserProfile = async (req, res) => {
  try {
    // req.user berasal dari middleware authenticateToken
    const userId = req.user.id

    // Ambil data user dari database, hindari mengembalikan password
    const user = await User.findByPk(userId, {
      attributes: {
        exclude: ['password'], // Hindari mengembalikan password
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      profile_picture: user.profile_picture,
      // Tambahkan field lain sesuai kebutuhan
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Update profil user
exports.updateUserProfile = async (req, res) => {
  try {
    const { username, profile_picture } = req.body

    const user = await User.findByPk(req.user.id)

    if (!user) {
      return res.status(404).json({
        message: 'User tidak ditemukan',
      })
    }

    // Update field yang diizinkan
    user.username = username || user.username
    user.profile_picture = profile_picture || user.profile_picture

    await user.save()

    res.status(200).json({
      message: 'Profil berhasil diupdate',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
      },
    })
  } catch (error) {
    res.status(500).json({
      message: 'Gagal update profil',
      error: error.message,
    })
  }
}

// Contoh rute admin (membutuhkan role admin)
exports.getAdminData = async (req, res) => {
  try {
    // Hanya bisa diakses oleh admin
    res.status(200).json({
      message: 'Selamat datang admin',
      data: {
        adminOnly: 'Data rahasia admin',
      },
    })
  } catch (error) {
    res.status(500).json({
      message: 'Gagal mengambil data admin',
      error: error.message,
    })
  }
}

// Verifikasi token (sudah ada di implementasi sebelumnya)
exports.verifyToken = async (req, res) => {
  try {
    // User sudah di-attach oleh middleware
    const user = req.user

    res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
      },
    })
  } catch (error) {
    res.status(500).json({
      valid: false,
      message: 'Gagal verifikasi token',
      error: error.message,
    })
  }
}

const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET || 'your_secret_key',
    { expiresIn: '1h' },
  )
}

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
    },
    process.env.REFRESH_TOKEN_SECRET || 'your_secret_key',
    {
      expiresIn: '7d',
    },
  )
}
