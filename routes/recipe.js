const express = require('express')
const router = express.Router()
const recipeController = require('../controllers/recipeController')
const {
  authenticateToken,
  authorizeRole,
} = require('../middleware/authMiddleware')

router.get('/', authenticateToken, recipeController.getAllRecipes)
router.get('/:id', authenticateToken, recipeController.getRecipeById)
router.post('/', authenticateToken, recipeController.createRecipe)
router.put('/:id', authenticateToken, recipeController.updateRecipe)

router.delete(
  '/:id',
  authenticateToken,
  authorizeRole(['admin']),
  recipeController.deleteRecipe,
)

module.exports = router
