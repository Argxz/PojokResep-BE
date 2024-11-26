const { Comment, Recipe, User } = require('../models')
const commentValidation = require('../validations/comment') // Pastikan Anda mengimpor validasi yang sudah dibuat

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

exports.createComment = async (req, res) => {
  const createData = req.body

  try {
    // Validasi payload menggunakan Joi
    await commentValidation.validateCreatePayload(createData)

    const comment = await Comment.create(createData)
    res.status(201).json({
      message: 'Comment created successfully',
      data: comment,
    })
  } catch (error) {
    console.error(error)
    res.status(400).json({ error: error.message || 'Failed to create comment' })
  }
}

exports.getCommentsByRecipeId = async (req, res) => {
  const { recipe_id } = req.params

  try {
    // Validasi input
    if (!recipe_id) {
      return res.status(400).json({ error: 'recipe_id is required' })
    }

    // Cari komentar berdasarkan recipe_id
    const comments = await Comment.findAll({
      where: { recipe_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username'],
        },
      ],
    })

    // Jika tidak ada komentar
    if (comments.length === 0) {
      return res
        .status(404)
        .json({ message: 'No comments found for this recipe' })
    }

    // Kembalikan data komentar
    res.status(200).json({ status: 'OK', data: comments })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'An error occurred while fetching comments' })
  }
}

exports.updateCommentContent = async (req, res) => {
  const { id } = req.params // ID dari komentar yang akan diupdate
  const { content } = req.body // Data baru untuk kolom 'content'

  try {
    // Validasi input
    await commentValidation.validateUpdatePayload({ content })

    // Cari komentar berdasarkan ID
    const comment = await Comment.findByPk(id)

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // Pastikan hanya pemilik komentar yang bisa update
    // if (comment.user_id !== req.user.id) {
    //   return res
    //     .status(403)
    //     .json({ error: 'Not authorized to update this comment' })
    // }

    // Perbarui hanya kolom 'content'
    comment.content = content
    await comment.save()

    res.status(200).json({ message: 'Comment updated successfully', comment })
  } catch (error) {
    console.error(error)
    res.status(400).json({
      error: error.message || 'An error occurred while updating the comment',
    })
  }
}

exports.deleteComment = async (req, res) => {
  const { id } = req.params // Ambil id dari parameter URL

  try {
    // Cari komentar berdasarkan ID
    const comment = await Comment.findByPk(id)

    // Jika komentar tidak ditemukan
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // Pastikan hanya pemilik komentar yang bisa menghapus
    // if (comment.user_id !== req.user.id) {
    //   return res
    //     .status(403)
    //     .json({ error: 'Not authorized to delete this comment' })
    // }

    // Hapus komentar
    await comment.destroy()

    // Kirim respons sukses
    res.status(200).json({
      message: 'Comment deleted successfully',
      data: comment, // Jika ingin mengembalikan detail komentar yang dihapus
    })
  } catch (error) {
    console.error('Error deleting comment:', error)

    // Cek apakah error terkait constraint (misalnya foreign key)
    if (error.name === ' SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'Cannot delete comment. It is being used by other records.',
      })
    }

    // Error umum
    res.status(500).json({
      error: 'An error occurred while deleting the comment',
    })
  }
}
