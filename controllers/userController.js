const { User } = require('../models')

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
