const { User } = require('../models')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

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
    const existingUser = await User.findOne({ where: { email } })

    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' })
    }

    const newUser = await User.create({
      username,
      email,
      password,
    })

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '1d' },
    )

    res.status(201).json({
      message: 'Registration successful',
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        token,
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

    console.log('Provided password:', password)
    console.log('Hashed password:', user.password)
    console.log('Is password valid:', isPasswordValid)

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '1d' }, // Token berlaku selama 1 hari
    )

    // Kirim respons dengan data user dan token
    res.status(200).json({
      message: 'Login successful',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        profile_picture: user.profile_picture,
        token,
      },
    })
  } catch (error) {
    res.status(500).json({ error: error.message || 'An error occurred' })
  }
}
