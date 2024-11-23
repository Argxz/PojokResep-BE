const { User } = require('../models')

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll()
    res.json({ status: 'OK', data: users })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
