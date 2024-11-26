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
  // Validasi payload sebelum proses lebih lanjut
  recipeValidation.validateCreatePayload(req.body)

  try {
    const recipes = await Recipe.create(req.body)
    res.status(201).json({
      message: 'Recipe created successfully',
      data: recipes,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
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

    // Pastikan hanya pemilik yang bisa update (opsional)
    // if (recipe.user_id !== req.user.id) {
    //   return res
    //     .status(403)
    //     .json({ error: 'Not authorized to update this recipe' })
    // }

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
  const userId = req.user.id // Asumsikan Anda memiliki middleware autentikasi

  try {
    // Validasi ID
    RecipeValidation.validateDeletePayload({ id: Number(id) })

    // Mencari Recipe berdasarkan ID dan user_id
    const recipe = await Recipe.findOne({
      where: {
        id: id,
        user_id: userId, // Pastikan yang menghapus adalah pemilik recipe
      },
    })

    if (!recipe) {
      return res.status(404).json({
        error:
          'Recipe not found or you are not authorized to delete this recipe',
      })
    }

    // Menghapus Recipe
    await recipe.destroy()

    return res.status(200).json({ message: 'Recipe deleted successfully' })
  } catch (error) {
    console.error(error)
    return res.status(400).json({
      error: error.message || 'An error occurred while deleting the recipe',
    })
  }
}
