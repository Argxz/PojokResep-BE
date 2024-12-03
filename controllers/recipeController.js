const { Recipe, User, Categories } = require('../models')
const recipeValidation = require('../validations/recipe')

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
          model: Categories,
          as: 'category',
          attributes: ['name'],
        },
      ],
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
          attributes: ['username'], // Mengambil hanya atribut username
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

exports.createRecipe = async (req, res) => {
  try {
    // Konversi tipe data sebelum validasi
    const recipeData = {
      ...req.body,
      user_id: req.user.id,
      cooking_time: parseInt(req.body.cooking_time),
      serving_size: parseInt(req.body.serving_size),
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
    console.error('Create Recipe Error:', error)

    // Tambahkan penanganan error yang lebih spesifik
    if (error.isJoi) {
      // Error validasi Joi
      return res.status(400).json({
        message: 'Validation Error',
        errors: error.details.map((detail) => detail.message),
      })
    }

    // Error umum
    res.status(500).json({
      message: 'Internal Server Error',
      error: error.message,
    })
  }
}

exports.updateRecipe = async (req, res) => {
  const { id } = req.params
  const updateData = req.body

  try {
    // Validasi payload update (tambahkan await)
    await recipeValidation.validateUpdatePayload(updateData)

    // Mencari Recipe berdasarkan ID
    const recipe = await Recipe.findByPk(id)

    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' })
    }

    // Jika req.user ada (autentikasi aktif), gunakan id dari sana
    const userId = req.user ? req.user.id : updateData.user_id

    // Pastikan hanya pemilik yang bisa update
    if (String(recipe.user_id) !== String(userId)) {
      return res
        .status(403)
        .json({ error: 'Not authorized to update this recipe' })
    }

    // Update Recipe
    await recipe.update(updateData)

    return res.status(200).json({
      message: 'Recipe updated successfully',
      recipe,
    })
  } catch (error) {
    console.error(error)
    return res.status(400).json({
      error: error.message || 'An error occurred while updating the recipe',
    })
  }
}

exports.deleteRecipe = async (req, res) => {
  const { id } = req.params
  const userId = req.body.user_id // Ambil user_id dari body permintaan

  try {
    // Validasi ID dan user_id
    await recipeValidation.validateDeletePayload({
      id: Number(id),
      user_id: userId,
    })

    // Mencari resep berdasarkan ID
    const recipe = await Recipe.findByPk(id)

    // Jika resep tidak ditemukan
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' })
    }

    // Pastikan user_id ada
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    // Pastikan hanya pemilik yang dapat menghapus
    if (String(recipe.user_id) !== String(userId)) {
      return res
        .status(403)
        .json({ error: 'Not authorized to delete this recipe' })
    }

    // Menghapus resep
    await recipe.destroy()

    return res.status(200).json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    console.error(error)

    // Cek apakah error adalah kesalahan validasi
    if (error.isJoi) {
      return res.status(400).json({ error: error.message })
    }

    return res.status(400).json({
      error: error.message || 'An error occurred while deleting the recipe',
    })
  }
}
