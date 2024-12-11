const { Comment, Recipe, User } = require('../models')
const commentValidation = require('../validations/comment')

/**
 * Mengambil semua komentar dengan informasi resep dan pengguna
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.getAllComments = async (req, res) => {
  try {
    // Ambil semua komentar dengan relasi resep dan pengguna
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

    // Kirim response dengan data komentar
    res.json({ status: 'OK', data: comments })
  } catch (error) {
    // Tangani error
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil komentar',
      error: error.message,
    })
  }
}

/**
 * Membuat komentar baru
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.createComment = async (req, res) => {
  const { recipe_id, content } = req.body
  const user_id = req.user.id

  try {
    // Buat komentar baru
    const newComment = await Comment.create({
      recipe_id,
      user_id,
      content,
    })

    // Ambil komentar dengan informasi pengguna
    const commentWithUser = await Comment.findByPk(newComment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'profile_picture'],
        },
      ],
    })

    // Kirim response dengan data komentar
    res.status(201).json({
      status: 'OK',
      data: commentWithUser,
    })
  } catch (error) {
    // Tangani error
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat komentar',
      error: error.message,
    })
  }
}

/**
 * Mengambil komentar berdasarkan ID resep
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.getCommentsByRecipeId = async (req, res) => {
  const { recipe_id } = req.params

  try {
    // Ambil komentar berdasarkan ID resep
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

    // Kirim response dengan data komentar
    res.status(200).json({
      status: 'OK',
      data: comments,
      message: comments.length === 0 ? 'Belum ada komentar' : null,
    })
  } catch (error) {
    // Tangani error
    console.error(error)
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil komentar',
      error: error.message,
    })
  }
}

/**
 * Memperbarui konten komentar
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.updateCommentContent = async (req, res) => {
  const { id } = req.params
  const { content, user_id } = req.body

  try {
    // Validasi input
    await commentValidation.validateUpdatePayload({ content })

    // Cari komentar berdasarkan ID
    const comment = await Comment.findByPk(id)

    // Jika komentar tidak ditemukan
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Komentar tidak ditemukan',
      })
    }

    // Tentukan user ID
    const userId = req.user ? req.user.id : user_id

    // Validasi user ID
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID diperlukan',
      })
    }

    // Pastikan hanya pemilik komentar yang bisa update
    if (String(comment.user_id) !== String(userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Tidak diizinkan untuk mengupdate komentar ini',
      })
    }

    // Perbarui konten komentar
    comment.content = content
    await comment.save()

    // Kirim response sukses
    res.status(200).json({
      status: 'OK',
      message: 'Komentar berhasil diperbarui',
      data: comment,
    })
  } catch (error) {
    // Tangani error
    console.error(error)
    res.status(400).json({
      status: 'error',
      message: error.message || 'Terjadi kesalahan saat memperbarui komentar',
    })
  }
}

/**
 * Menghapus komentar
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.deleteComment = async (req, res) => {
  const { id } = req.params

  try {
    // Cari komentar berdasarkan ID
    const comment = await Comment.findByPk(id)

    // Jika komentar tidak ditemukan
    if (!comment) {
      return res.status(404).json({
        status: 'error',
        message: 'Komentar tidak ditemukan',
      })
    }

    // Tentukan user ID
    const userId = req.user ? req.user.id : req.body.user_id

    // Validasi user ID
    if (!userId) {
      return res.status(400).json({
        status: 'error',
        message: 'User ID diperlukan',
      })
    }

    // Pastikan hanya pemilik komentar yang bisa menghapus
    if (String(comment.user_id) !== String(userId)) {
      return res.status(403).json({
        status: 'error',
        message: 'Tidak diizinkan untuk menghapus komentar ini',
      })
    }

    // Hapus komentar
    await comment.destroy()

    // Kirim respons sukses
    res.status(200).json({
      status: 'OK',
      message: 'Komentar berhasil dihapus',
      data: { id: comment.id, content: comment.content },
    })
  } catch (error) {
    // Tangani error
    console.error('Error menghapus komentar:', error)

    // Cek apakah error terkait constraint
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        status: 'error',
        message:
          'Tidak dapat menghapus komentar. Sedang digunakan oleh catatan lain.',
      })
    }

    // Error umum
    res.status(500).json({
      status: 'error',
      message: error.message || 'Terjadi kesalahan saat menghapus komentar',
    })
  }
}
