const { Rating, Recipe, User } = require('../models')

/**
 * Mengambil semua rating dengan informasi resep dan pengguna
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.getAllRatings = async (req, res) => {
  try {
    // Ambil semua rating dengan relasi resep dan pengguna
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

    // Kirim response dengan data rating
    res.json({ status: 'OK', data: ratings })
  } catch (error) {
    // Tangani error
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil rating',
      error: error.message,
    })
  }
}

/**
 * Mengambil rating berdasarkan ID resep
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.getRatingByRecipeId = async (req, res) => {
  try {
    const { recipe_id } = req.params

    // Validasi input
    if (!recipe_id) {
      return res.status(400).json({
        status: 'error',
        message: 'recipe_id diperlukan',
      })
    }

    // Ambil rating berdasarkan recipe_id
    const ratings = await Rating.findAll({
      where: { recipe_id },
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

    // Jika tidak ada ratings
    if (ratings.length === 0) {
      return res.status(200).json({
        status: 'OK',
        data: [],
        message: 'Tidak ada rating untuk resep ini',
        averageRating: 0,
      })
    }

    const averageRating =
      ratings.reduce((sum, rating) => sum + rating.value, 0) / ratings.length

    // Kembalikan data rating
    res.status(200).json({
      status: 'OK',
      data: ratings.map((rating) => ({
        id: rating.id,
        value: rating.value,
        recipe_id: rating.recipe_id,
        user_id: rating.user_id,
        createdAt: rating.createdAt,
        updatedAt: rating.updatedAt,
      })),
      averageRating: averageRating.toFixed(2),
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil rating',
      error: error.message,
    })
  }
}

/**
 * Membuat atau memperbarui rating
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.createRating = async (req, res) => {
  const { recipe_id, value } = req.body
  const user_id = req.user.id

  try {
    // Cek apakah user adalah pemilik resep
    const recipe = await Recipe.findByPk(recipe_id)
    if (recipe.user_id === user_id) {
      return res.status(403).json({
        status: 'error',
        message: 'Anda tidak dapat memberi rating pada resep sendiri',
      })
    }

    // Validasi nilai rating
    if (value < 1 || value > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Nilai rating harus antara 1 dan 5',
      })
    }

    // Cari rating yang sudah ada
    const existingRating = await Rating.findOne({
      where: { recipe_id, user_id },
    })

    if (existingRating) {
      // Update rating yang sudah ada
      existingRating.value = value
      await existingRating.save()

      return res.status(200).json({
        status: 'OK',
        message: 'Rating berhasil diperbarui',
        data: existingRating,
      })
    }

    // Buat rating baru
    const newRating = await Rating.create({
      recipe_id,
      user_id,
      value,
    })

    res.status(201).json({
      status: 'OK',
      message: 'Rating berhasil dibuat',
      data: newRating,
    })
  } catch (error) {
    // Tangani error
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat rating',
      error: error.message,
    })
  }
}

/**
 * Mengambil rating pengguna untuk resep tertentu
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.getUserRatingForRecipe = async (req, res) => {
  try {
    const { recipe_id } = req.params
    const user_id = req.user.id

    // Cari rating spesifik user untuk recipe ini
    const userRating = await Rating.findOne({
      where: {
        recipe_id,
        user_id,
      },
      attributes: ['value'],
    })

    // Kembalikan rating pengguna
    return res.status(200).json({
      status: 'OK',
      userRating: userRating ? userRating.value : null,
      message: userRating ? 'Rating ditemukan' : 'Tidak ada rating',
    })
  } catch (error) {
    // Tangani error
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil rating pengguna',
      error: error.message,
    })
  }
}

/**
 * Memperbarui rating pengguna
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.updateRatingByUser = async (req, res) => {
  try {
    const { recipe_id } = req.params
    const { user_id, value } = req.body

    // Validasi input
    if (!recipe_id || !user_id || value === undefined) {
      return res.status(400).json({
        status: 'error',
        message: 'recipe_id, user_id, dan value diperlukan',
      })
    }

    // Validasi nilai rating
    if (value < 1 || value > 5) {
      return res.status(400).json({
        status: 'error',
        message: 'Nilai rating harus antara 1 dan 5',
      })
    }

    // Cari rating berdasarkan recipe_id dan user_id
    const rating = await Rating.findOne({
      where: { recipe_id, user_id },
    })

    if (!rating) {
      return res.status(404).json({
        status: 'error',
        message: 'Rating tidak ditemukan atau Anda tidak memiliki otorisasi',
      })
    }

    // Update hanya value
    rating.value = value
    await rating.save()

    return res.status(200).json({
      status: 'OK',
      message: 'Rating berhasil diperbarui',
      data: rating,
    })
  } catch (error) {
    // Tangani error
    console.error(error)
    return res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui rating',
      error: error.message,
    })
  }
}

/**
 * Menghapus rating
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.deleteRating = async (req, res) => {
  const { id } = req.params

  try {
    // Cari rating berdasarkan ID
    const rating = await Rating.findByPk(id)

    // Jika rating tidak ditemukan
    if (!rating) {
      return res.status(404).json({
        status: 'error',
        message: 'Rating tidak ditemukan',
      })
    }

    // Hapus rating
    await rating.destroy()

    // Kirim respons sukses
    res.status(200).json({
      status: 'OK',
      message: 'Rating berhasil dihapus',
      data: rating,
    })
  } catch (error) {
    // Tangani error
    console.error('Error menghapus rating:', error)

    // Cek apakah error terkait constraint
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        status: 'error',
        message:
          'Tidak dapat menghapus rating. Sedang digunakan oleh catatan lain.',
      })
    }

    // Error umum
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus rating',
      error: error.message,
    })
  }
}
