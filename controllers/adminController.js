const { User, Recipe, Comment, Rating } = require('../models')
const { sequelize } = require('../models')

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
