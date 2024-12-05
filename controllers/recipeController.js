const { Recipe, User, Categories, Comment } = require('../models')
const { sequelize } = require('../models')
const recipeValidation = require('../validations/recipe')
const fsPromises = require('fs').promises

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'profile_picture'],
        },
        {
          model: Categories,
          as: 'category',
          attributes: ['name'],
        },
      ],
      order: [['createdAt', 'DESC']], // Urutkan dari yang terbaru
    })
    res.json({ status: 'OK', data: recipes })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

exports.getRecipeById = async (req, res) => {
  const { id } = req.params
  try {
    const recipes = await Recipe.findOne({
      where: { id }, // Menentukan ID yang dicari
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'profile_picture'], // Mengambil hanya atribut username
        },
        {
          model: Categories,
          as: 'category',
          attributes: ['name'], // Mengambil hanya atribut name
        },
      ],
    })
    if (!recipes) {
      return res.status(404).json({ error: 'recipes not found' })
    }
    return res.status(200).json(recipes)
  } catch (error) {
    res
      .status(500)
      .json({ error: 'An error occurred while retrieving the recipes' })
  }
}

exports.getRecipesByUserId = async (req, res) => {
  const { userId } = req.params
  try {
    const recipes = await Recipe.findAll({
      where: { user_id: userId }, // Menentukan resep milik user tertentu
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'profile_picture'], // Mengambil hanya atribut username
        },
        {
          model: Categories,
          as: 'category',
          attributes: ['name'], // Mengambil hanya atribut name
        },
      ],
      order: [['createdAt', 'DESC']], // Urutkan dari yang terbaru
    })

    if (!recipes || recipes.length === 0) {
      return res.status(404).json({ error: 'No recipes found for this user' })
    }

    return res.status(200).json(recipes)
  } catch (error) {
    console.error('Error retrieving user recipes:', error)
    return res.status(500).json({
      error: 'An error occurred while retrieving user recipes',
      details: error.message,
    })
  }
}

exports.createRecipe = async (req, res) => {
  try {
    // Konversi tipe data sebelum validasi
    const recipeData = {
      ...req.body,
      user_id: req.user.id,
      cooking_time: parseInt(req.body.cooking_time),
      serving_size: parseInt(req.body.serving_size),
    }

    // Tambahkan logika untuk image upload
    if (req.file) {
      // Konstruksi path relatif untuk disimpan di database
      recipeData.image_url = `/uploads/recipes/${req.file.filename}`
    }

    console.log('Received Recipe Data:', recipeData)
    // Validasi payload sebelum proses lebih lanjut
    await recipeValidation.validateCreatePayload(recipeData)

    const recipe = await Recipe.create(recipeData)
    res.status(201).json({
      message: 'Recipe created successfully',
      data: recipe,
    })
  } catch (error) {
    // Hapus file yang sudah terupload jika terjadi error
    if (req.file) {
      await fsPromises.unlink(req.file.path)
    }

    console.error('Create Recipe Error:', error)

    if (error.isJoi) {
      return res.status(400).json({
        message: 'Validation Error',
        errors: error.details.map((detail) => detail.message),
      })
    }

    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    })
  }
}

exports.updateRecipe = async (req, res) => {
  const { id } = req.params

  console.log('Incoming Update Request:')
  console.log('Body:', req.body)
  console.log('File:', req.file)

  // Konversi tipe data
  const updateData = {
    ...req.body,
    ...(req.file
      ? {
          image_url: `/uploads/recipes/${req.file.filename}`,
        }
      : {}),
  }

  // Filter out empty or undefined values
  const filteredUpdateData = Object.fromEntries(
    Object.entries(updateData).filter(
      ([_, v]) => v !== undefined && v !== null && v !== '',
    ),
  )

  console.log('Filtered Update Data:', filteredUpdateData)

  try {
    // Validasi payload update
    await recipeValidation.validateUpdatePayload(filteredUpdateData)

    // Cek apakah ada data yang akan diupdate
    if (Object.keys(filteredUpdateData).length === 0) {
      return res.status(400).json({
        error: 'No update data provided',
      })
    }

    // Mencari Recipe berdasarkan ID
    const recipe = await Recipe.findByPk(id)

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' })
    }

    // Update Recipe
    await recipe.update(filteredUpdateData)

    return res.status(200).json({
      message: 'Recipe updated successfully',
      data: {
        ...recipe.toJSON(),
        image_url: filteredUpdateData.image_url || recipe.image_url,
      },
    })
  } catch (error) {
    console.error('Full Update Error:', error)
    return res.status(400).json({
      error: error.message || 'An error occurred while updating the recipe',
      fullError: process.env.NODE_ENV === 'development' ? error : undefined,
    })
  }
}

exports.deleteRecipe = async (req, res) => {
  const { id } = req.params
  const userId = req.user.id

  // Gunakan transaction dari sequelize
  const transaction = await sequelize.transaction()

  try {
    // Mencari resep berdasarkan ID
    const recipe = await Recipe.findByPk(id)

    // Jika resep tidak ditemukan
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' })
    }

    // Pastikan hanya pemilik yang dapat menghapus
    if (recipe.user_id !== userId) {
      return res
        .status(403)
        .json({ error: 'Not authorized to delete this recipe' })
    }

    // Hapus terlebih dahulu komentar terkait
    await Comment.destroy({
      where: { recipe_id: id },
      transaction,
    })

    // Kemudian hapus resep
    await recipe.destroy({ transaction })

    // Commit transaksi
    await transaction.commit()

    return res.status(200).json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    // Rollback transaksi jika terjadi kesalahan
    await transaction.rollback()
    console.error(error)
    return res.status(500).json({
      error: error.message || 'An error occurred while deleting the recipe',
    })
  }
}
