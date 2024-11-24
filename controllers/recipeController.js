const { Recipe, User, Categories } = require('../models')

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
    const recipes = await Recipe.findByPk(id)
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
  const {
    user_id,
    title,
    description,
    ingredients,
    instructions,
    cooking_time,
    serving_size,
    difficulty_level,
    category_id,
  } = req.body

  if (
    !user_id ||
    !title ||
    !description ||
    !ingredients ||
    !instructions ||
    !cooking_time ||
    !serving_size ||
    !difficulty_level ||
    !category_id
  ) {
    return res
      .status(400)
      .json({ error: 'All required fields must be provided' })
  }

  try {
    const recipe = await Recipe.create(req.body)
    res.status(201).json({
      message: 'Recipe created successfully',
      data: recipe,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
