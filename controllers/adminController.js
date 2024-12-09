const { User, Recipe, Comment, Rating, Categories } = require('../models')
const { sequelize } = require('../models')
const { Op } = require('sequelize')

exports.getDashboardData = async (req, res) => {
  try {
    const totalUsers = await User.count()
    const totalRecipes = await Recipe.count()
    const totalComments = await Comment.count()
    const totalRatings = await Rating.count()

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
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data dashboard',
      error: error.message,
    })
  }
}

exports.getAllComments = async (req, res) => {
  try {
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
    res.json({ status: 'OK', data: comments })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: error.message })
  }
}

exports.deleteComment = async (req, res) => {
  const { id } = req.params

  try {
    const comment = await Comment.findByPk(id)

    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Komentar tidak ditemukan',
      })
    }

    await comment.destroy()

    res.status(200).json({
      status: 'success',
      message: 'Komentar berhasil dihapus',
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal menghapus komentar',
      error: error.message,
    })
  }
}

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],
        },
        {
          model: Categories, // Pastikan import Category model
          as: 'category',
          attributes: ['name'],
        },
      ],
      order: [['createdAt', 'DESC']], // Urutkan dari yang terbaru
    })
    res.json({ status: 'OK', data: recipes })
  } catch (error) {
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil daftar resep',
      error: error.message,
    })
  }
}

exports.deleteRecipe = async (req, res) => {
  const { id } = req.params

  // Gunakan transaction dari sequelize
  const transaction = await sequelize.transaction()

  try {
    // Mencari resep berdasarkan ID
    const recipe = await Recipe.findByPk(id)

    // Jika resep tidak ditemukan
    if (!recipe) {
      await transaction.rollback()
      return res.status(404).json({
        status: 'error',
        message: 'Resep tidak ditemukan',
      })
    }

    // Hapus terlebih dahulu komentar terkait
    await Comment.destroy({
      where: { recipe_id: id },
      transaction,
    })

    // Hapus rating terkait
    await Rating.destroy({
      where: { recipe_id: id },
      transaction,
    })

    // Kemudian hapus resep
    await recipe.destroy({ transaction })

    // Commit transaksi
    await transaction.commit()

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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      where: {
        roles: {
          [Op.ne]: 'admin',
        },
      },
      attributes: {
        exclude: ['password'],
      },
    })

    res.json({
      status: 'OK',
      data: users,
    })
  } catch (error) {
    console.error('Error Detail:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    })

    res.status(500).json({
      status: 'Error',
      message: 'Terjadi kesalahan internal',
      errorDetail: error.message,
    })
  }
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
