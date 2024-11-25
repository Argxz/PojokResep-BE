const express = require('express')
const router = express.Router()
const ratingController = require('../controllers/ratingController')

router.get('/', ratingController.getAllRatings)
router.get('/recipe_id/:recipe_id', ratingController.getRatingByRecipeId)
router.post('/', ratingController.createRating)
router.put('/recipe_id/:recipe_id', ratingController.updateRatingByUser)
router.delete('/:id', ratingController.deleteRating)

module.exports = router
