require('dotenv').config()
const { User } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const fsPromises = require('fs').promises
const userValidation = require('../validations/user')

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
      return res.status(404).json({ message: 'Akun anda tidak ditemukan' })
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
    userValidation.validateCreatePayload(req.body)
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

  // Validasi email menggunakan regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    return res.status(400).json({ error: 'Email wajib diisi' })
  }

  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format email tidak valid' })
  }

  if (!password) {
    return res.status(400).json({ error: 'Password wajib diisi' })
  }

  try {
    // Cek apakah user dengan email tersebut ada
    const user = await User.findOne({
      where: { email },
    })

    if (!user) {
      console.log('Akun anda tidak ditemukan pada email:', email)
      return res.status(404).json({ error: 'Akun anda tidak ditemukan' })
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      console.log('Password anda salah pada email:', email)
      return res.status(401).json({ error: 'Password yang anda masukan salah' })
    }

    // Pastikan roles selalu ada
    const userRoles = user.roles || 'user'

    // Generate tokens
    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    // Simpan refresh token
    await user.update(
      { refreshToken },
      {
        hooks: true,
        validate: true,
      },
    )

    res.status(200).json({
      message: 'Login successful',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: userRoles, // Tambahkan roles di response
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
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
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
      return res.status(404).json({ message: 'Akun anda tidak ditemukan' })
    }

    res.status(200).json({
      username: user.username,
      email: user.email,
      profile_picture: user.profile_picture,
      roles: user.roles,
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// Update profil user
exports.updateUsernameEmail = async (req, res) => {
  try {
    // Validasi payload update
    await userValidation.validateUpdatePayload(req.body)

    const { username, email } = req.body
    const userId = req.user.id // Dari middleware authentication

    // Cari user
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ error: 'User tidak ditemukan' })
    }

    // Cek jika email sudah digunakan (jika diupdate)
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } })
      if (existingEmail) {
        return res.status(409).json({ error: 'Email sudah terdaftar' })
      }
    }

    // Cek jika username sudah digunakan (jika diupdate)
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } })
      if (existingUsername) {
        return res.status(409).json({ error: 'Username sudah digunakan' })
      }
    }

    // Update profil
    await user.update({
      ...(username && { username }),
      ...(email && { email }),
    })

    res.status(200).json({
      message: 'Profil berhasil diupdate',
      data: {
        username: user.username,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Update Profile Error:', error)

    // Cek apakah error dari validasi
    if (error.message.includes('Validation')) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.message,
      })
    }

    res.status(500).json({
      error: 'Gagal update profil',
      details: error.message,
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
  // Pastikan JWT_SECRET ada, jika tidak gunakan fallback
  const secret = process.env.JWT_SECRET

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles || 'user', // Pastikan selalu ada roles
    },
    secret, // Gunakan secret yang sudah dipastikan
    {
      expiresIn: '1h',
      algorithm: 'HS256', // Tambahkan algoritma enkripsi
    },
  )
}

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      roles: user.roles || 'user', // Pastikan selalu ada roles
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: '7d',
    },
  )
}

exports.deleteUser = async (req, res) => {
  const { id } = req.params

  // Mulai transaksi
  const transaction = await sequelize.transaction()

  try {
    // Cari user terlebih dahulu
    const user = await User.findByPk(id, { transaction })

    if (!user) {
      await transaction.rollback()
      return res.status(404).json({
        status: 'error',
        message: 'User tidak ditemukan',
      })
    }

    // Hapus semua data terkait user dalam transaksi
    await Recipe.destroy({
      where: { user_id: id },
      transaction,
    })

    await Comment.destroy({
      where: { user_id: id },
      transaction,
    })

    await Rating.destroy({
      where: { user_id: id },
      transaction,
    })

    // Hapus user
    await user.destroy({ transaction })

    // Commit transaksi
    await transaction.commit()

    res.status(200).json({
      status: 'success',
      message: 'User berhasil dihapus',
    })
  } catch (error) {
    // Rollback transaksi jika ada error
    await transaction.rollback()

    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus user',
      error: error.message,
    })
  }
}
