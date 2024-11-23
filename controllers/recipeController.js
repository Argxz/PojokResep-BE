const { Recipe } = require('../models')

exports.getAllRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll()
    res.json({ status: 'OK', data: recipes })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
