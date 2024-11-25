const { Rating, Recipe, User } = require('../models')

exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.findAll({
      include: [
        {
          model: Recipe,
          as: 'recipe',
          attributes: ['title'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['username'],
        },
      ],
    })
    res.json({ status: 'OK', data: ratings })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getRatingByRecipeId = async (req, res) => {
  try {
    const { recipe_id } = req.params

    // Validasi input
    if (!recipe_id) {
      return res.status(400).json({ error: 'recipe_id is required' })
    }

    // Cari komentar berdasarkan recipe_id
    const ratings = await Rating.findAll({
      where: { recipe_id },
      include: [
        {
          model: Recipe,
          as: 'recipe',
          attributes: ['title'], // Hanya mengambil atribut "title"
        },
        {
          model: User,
          as: 'user',
          attributes: ['username'], // Hanya mengambil atribut "username"
        },
      ], // Sequelize akan otomatis memetakan
    })

    // Jika tidak ada komentar
    if (ratings.length === 0) {
      return res
        .status(404)
        .json({ message: 'No ratings found for this recipe' })
    }

    // Kembalikan data komentar
    res.status(200).json(ratings)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'An error occurred while fetching ratings' })
  }
}

exports.createRating = async (req, res) => {
  const { recipe_id, user_id, value } = req.body

  // Validasi input
  if (!recipe_id || !user_id || value === undefined) {
    return res
      .status(400)
      .json({ error: 'All required fields must be provided' })
  }

  if (value < 1 || value > 5) {
    return res
      .status(400)
      .json({ error: 'Rating value must be between 1 and 5' })
  }

  try {
    const ratings = await Rating.create({ recipe_id, user_id, value })
    res.status(201).json({
      message: 'Rating created successfully',
      data: ratings,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.updateRatingByUser = async (req, res) => {
  try {
    const { recipe_id } = req.params // Mendapatkan recipe_id dari parameter
    const { user_id, value } = req.body // Mendapatkan user_id dan value dari body

    // Validasi input
    if (!recipe_id || !user_id || value === undefined) {
      return res
        .status(400)
        .json({ error: 'recipe_id, user_id, and value are required' })
    }

    if (value < 1 || value > 5) {
      return res
        .status(400)
        .json({ error: 'Rating value must be between 1 and 5' })
    }

    // Cari rating berdasarkan recipe_id dan user_id
    const ratings = await Rating.findOne({
      where: { recipe_id, user_id },
    })

    if (!ratings) {
      return res.status(404).json({
        error: 'Rating not found or you are not authorized to update it',
      })
    }

    // Update hanya value
    ratings.value = value
    await ratings.save()

    return res.status(200).json({
      message: 'Rating updated successfully',
      data: ratings,
    })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ error: 'An error occurred while updating the rating' })
  }
}

exports.deleteRating = async (req, res) => {
  const { id } = req.params // Ambil id dari parameter URL

  try {
    // Cari komentar berdasarkan ID
    const ratings = await Rating.findByPk(id)

    // Jika komentar tidak ditemukan
    if (!ratings) {
      return res.status(404).json({ error: 'ratings not found' })
    }

    // Hapus komentar
    await ratings.destroy()

    // Kirim respons sukses
    res.status(200).json({
      message: 'ratings deleted successfully',
      data: ratings, // Jika ingin mengembalikan detail komentar yang dihapus
    })
  } catch (error) {
    console.error('Error deleting ratings:', error)

    // Cek apakah error terkait constraint (misalnya foreign key)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'Cannot delete ratings. It is being used by other records.',
      })
    }

    // Error umum
    res.status(500).json({
      error: 'An error occurred while deleting the ratings',
    })
  }
}
