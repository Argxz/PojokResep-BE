// Import model-model yang diperlukan
const { User, Recipe, Comment, Rating, Categories } = require('../models')
const { sequelize } = require('../models')
const { Op } = require('sequelize')

/**
 * Mengambil data statistik dashboard
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.getDashboardData = async (req, res) => {
  try {
    // Hitung total pengguna, resep, komentar, dan rating
    const totalUsers = await User.count()
    const totalRecipes = await Recipe.count()
    const totalComments = await Comment.count()
    const totalRatings = await Rating.count()

    // Kirim response dengan data dashboard
    res.status(200).json({
      status: 'success',
      data: {
        totalUsers,
        totalRecipes,
        totalComments,
        totalRatings,
      },
    })
  } catch (error) {
    // Tangani error dan kirim response error
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data dashboard',
      error: error.message,
    })
  }
}

/**
 * Mengambil semua komentar dengan informasi terkait
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.getAllComments = async (req, res) => {
  try {
    // Ambil semua komentar dengan relasi resep dan user
    const comments = await Comment.findAll({
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
      order: [['createdAt', 'DESC']], // Urutkan dari yang terbaru
    })

    // Kirim response dengan data komentar
    res.json({ status: 'OK', data: comments })
  } catch (error) {
    // Tangani error
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

/**
 * Menghapus komentar berdasarkan ID
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.deleteComment = async (req, res) => {
  const { id } = req.params

  try {
    // Cari komentar berdasarkan primary key
    const comment = await Comment.findByPk(id)

    // Jika komentar tidak ditemukan
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Komentar tidak ditemukan',
      })
    }

    // Hapus komentar
    await comment.destroy()

    // Kirim response sukses
    res.status(200).json({
      status: 'success',
      message: 'Komentar berhasil dihapus',
    })
  } catch (error) {
    // Tangani error
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus komentar',
      error: error.message,
    })
  }
}

/**
 * Mengambil semua resep dengan informasi terkait
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.getAllRecipes = async (req, res) => {
  try {
    // Ambil semua resep dengan relasi user dan kategori
    const recipes = await Recipe.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],
        },
        {
          model: Categories,
          as: 'category',
          attributes: ['name'],
        },
      ],
      order: [['createdAt', 'DESC']], // Urutkan dari yang terbaru
    })

    // Kirim response dengan data resep
    res.json({ status: 'OK', data: recipes })
  } catch (error) {
    // Tangani error
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil daftar resep',
      error: error.message,
    })
  }
}

/**
 * Menghapus resep beserta data terkait menggunakan transaksi
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.deleteRecipe = async (req, res) => {
  const { id } = req.params
  const transaction = await sequelize.transaction()

  try {
    // Cari resep berdasarkan primary key
    const recipe = await Recipe.findByPk(id)

    // Jika resep tidak ditemukan
    if (!recipe) {
      await transaction.rollback()
      return res.status(404).json({
        status: 'error',
        message: 'Resep tidak ditemukan',
      })
    }

    // Hapus komentar terkait
    await Comment.destroy({
      where: { recipe_id: id },
      transaction,
    })

    // Hapus rating terkait
    await Rating.destroy({
      where: { recipe_id: id },
      transaction,
    })

    // Hapus resep
    await recipe.destroy({ transaction })

    // Commit transaksi
    await transaction.commit()

    // Kirim response sukses
    return res.status(200).json({
      status: 'success',
      message: 'Resep berhasil dihapus',
    })
  } catch (error) {
    // Rollback transaksi jika terjadi kesalahan
    await transaction.rollback()
    console.error(error)
    return res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus resep',
      error: error.message,
    })
  }
}

/**
 * Mengambil semua pengguna kecuali admin
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Ambil semua user kecuali admin
    const users = await User.findAll({
      where: {
        roles: {
          [Op.ne]: 'admin', // Tidak sama dengan admin
        },
      },
      attributes: {
        exclude: ['password'], // Sembunyikan password
      },
    })

    // Kirim response dengan data user
    res.json({
      status: 'OK',
      data: users,
    })
  } catch (error) {
    // Log detail error
    console.error('Error Detail:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    // Kirim response error
    res.status(500).json({
      status: 'Error',
      message: 'Terjadi kesalahan internal',
      errorDetail: error.message,
    })
  }
}

/**
 * Menghapus pengguna beserta data terkait menggunakan transaksi
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.deleteUser = async (req, res) => {
  const { id } = req.params
  const transaction = await sequelize.transaction()

  try {
    // Cari user berdasarkan primary key
    const user = await User.findByPk(id, { transaction })

    // Jika user tidak ditemukan
    if (!user) {
      await transaction.rollback()
      return res.status(404).json({
        status: 'error',
        message: 'User  tidak ditemukan',
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

    // Kirim response sukses
    res.status(200).json({
      status: 'success',
      message: 'User  berhasil dihapus',
    })
  } catch (error) {
    // Rollback transaksi jika ada error
    await transaction.rollback()

    // Tangani error
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus user',
      error: error.message,
    })
  }
}
