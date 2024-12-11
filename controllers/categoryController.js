const { Categories } = require('../models')

/**
 * Mengambil semua kategori
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.getAllCategories = async (req, res) => {
  try {
    // Ambil semua kategori dari database
    const categories = await Categories.findAll()

    // Kirim response dengan data kategori
    res.json({ status: 'OK', data: categories })
  } catch (error) {
    // Tangani error
    res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil kategori',
      error: error.message,
    })
  }
}

/**
 * Mengambil kategori berdasarkan ID
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.getCategoryById = async (req, res) => {
  const { id } = req.params

  try {
    // Cari kategori berdasarkan primary key
    const category = await Categories.findByPk(id)

    // Jika kategori tidak ditemukan
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Kategori tidak ditemukan',
      })
    }

    // Kirim response dengan data kategori
    return res.status(200).json({
      status: 'OK',
      data: category,
    })
  } catch (error) {
    // Tangani error
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat mengambil kategori',
      error: error.message,
    })
  }
}

/**
 * Membuat kategori baru
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.createCategory = async (req, res) => {
  const { name, desc } = req.body

  // Validasi input
  if (!name) {
    return res.status(400).json({
      status: 'error',
      message: 'Nama kategori wajib diisi',
    })
  }

  try {
    // Buat kategori baru
    const category = await Categories.create(req.body)

    // Kirim response sukses
    res.status(201).json({
      status: 'success',
      message: 'Kategori berhasil dibuat',
      data: category,
    })
  } catch (error) {
    // Tangani error
    res.status(500).json({
      status: 'error',
      message: 'Gagal membuat kategori',
      error: error.message,
    })
  }
}

/**
 * Memperbarui kategori
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.updateCategory = async (req, res) => {
  const { id } = req.params
  const { name, desc } = req.body

  try {
    // Cari kategori berdasarkan primary key
    const category = await Categories.findByPk(id)

    // Jika kategori tidak ditemukan
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Kategori tidak ditemukan',
      })
    }

    // Validasi input
    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Nama kategori wajib diisi',
      })
    }

    // Perbarui kategori
    await category.update({ name, desc })
    await category.reload()

    // Kirim response sukses
    res.status(200).json({
      status: 'success',
      message: 'Kategori berhasil diperbarui',
      data: category,
    })
  } catch (error) {
    // Tangani error
    res.status(500).json({
      status: 'error',
      message: 'Gagal memperbarui kategori',
      error: error.message,
    })
  }
}

/**
 * Menghapus kategori
 * @param {Object} req - Objek request
 * @param {Object} res - Objek response
 */
exports.deleteCategory = async (req, res) => {
  const { id } = req.params

  try {
    // Cari kategori berdasarkan primary key
    const category = await Categories.findByPk(id)

    // Jika kategori tidak ditemukan
    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Kategori tidak ditemukan',
      })
    }

    // Hapus kategori
    await category.destroy()

    // Kirim respons sukses
    res.status(200).json({
      status: 'success',
      message: 'Kategori berhasil dihapus',
      data: category,
    })
  } catch (error) {
    // Log error untuk debugging
    console.error('Error deleting category:', error)

    // Cek apakah error terkait constraint (misalnya foreign key)
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        status: 'error',
        message: 'Tidak dapat menghapus kategori. Kategori sedang digunakan.',
      })
    }

    // Error umum
    res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan saat menghapus kategori',
      error: error.message,
    })
  }
}
