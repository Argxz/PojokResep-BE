const { Ratings } = require('../models')

exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Ratings.findAll()
    res.json({ status: 'OK', data: ratings })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
