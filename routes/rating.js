const express = require('express')
const router = express.Router()
const ratingController = require('../controllers/ratingController')
const {
  authenticateToken,
  authorizeRole,
} = require('../middleware/authMiddleware')

router.get('/', authenticateToken, ratingController.getAllRatings)
router.get(
  '/recipes/:recipe_id',
  authenticateToken,
  ratingController.getRatingByRecipeId,
)
router.get(
  '/user/:recipe_id',
  authenticateToken,
  ratingController.getUserRatingForRecipe,
)
router.post('/', authenticateToken, ratingController.createRating)
router.put(
  '/recipe_id/:recipe_id',
  authenticateToken,
  ratingController.updateRatingByUser,
)
router.delete('/:id', authenticateToken, ratingController.deleteRating)

module.exports = router
