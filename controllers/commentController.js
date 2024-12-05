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
  const { recipe_id, content } = req.body
  const user_id = req.user.id

  try {
    const newComment = await Comment.create({
      recipe_id,
      user_id,
      content,
    })

    const commentWithUser = await Comment.findByPk(newComment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profile_picture'],
        },
      ],
    })

    res.status(201).json({
      status: 'OK',
      data: commentWithUser,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal membuat komentar' })
  }
}

exports.getCommentsByRecipeId = async (req, res) => {
  const { recipe_id } = req.params

  try {
    const comments = await Comment.findAll({
      where: { recipe_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profile_picture'],
        },
      ],
      order: [['createdAt', 'DESC']],
    })

    res.status(200).json({
      status: 'OK',
      data: comments,
      message: comments.length === 0 ? 'Belum ada komentar' : null,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Gagal mengambil komentar' })
  }
}

exports.updateCommentContent = async (req, res) => {
  const { id } = req.params // ID dari komentar yang akan diupdate
  const { content, user_id } = req.body // Data baru untuk kolom 'content'

  try {
    // Validasi input menggunakan validasi yang sudah ada
    await commentValidation.validateUpdatePayload({ content })

    // Cari komentar berdasarkan ID
    const comment = await Comment.findByPk(id)

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }

    // Jika req.user ada (autentikasi aktif), gunakan id dari sana
    // Jika tidak, gunakan user_id dari body request
    const userId = req.user ? req.user.id : user_id

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Pastikan hanya pemilik komentar yang bisa update
    // Konversi kedua nilai ke string untuk perbandingan yang konsisten
    if (String(comment.user_id) !== String(userId)) {
      return res
        .status(403)
        .json({ error: 'Not authorized to update this comment' })
    }
    console.log(
      'comment.user_id:',
      comment.user_id,
      'type:',
      typeof comment.user_id,
    )
    console.log('userId:', userId, 'type:', typeof userId)

    // Perbarui hanya kolom 'content'
    comment.content = content
    await comment.save()

    res.status(200).json({
      status: 'OK',
      message: 'Comment updated successfully',
      data: comment,
    })
  } catch (error) {
    console.error(error)
    res.status(400).json({
      status: 'Error',
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

    // Jika req.user ada (autentikasi aktif), gunakan id dari sana
    // Jika tidak, gunakan user_id dari body request
    const userId = req.user ? req.user.id : req.body.user_id

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Pastikan hanya pemilik komentar yang bisa menghapus
    if (String(comment.user_id) !== String(userId)) {
      return res
        .status(403)
        .json({ error: 'Not authorized to delete this comment' })
    }

    // Hapus komentar
    await comment.destroy()

    // Kirim respons sukses
    res.status(200).json({
      status: 'OK',
      message: 'Comment deleted successfully',
      data: { id: comment.id, content: comment.content }, // Mengembalikan detail komentar yang dihapus
    })
  } catch (error) {
    console.error('Error deleting comment:', error)

    // Cek apakah error terkait constraint (misalnya foreign key)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        error: 'Cannot delete comment. It is being used by other records.',
      })
    }

    // Error umum
    res.status(500).json({
      status: 'Error',
      error: error.message || 'An error occurred while deleting the comment',
    })
  }
}
