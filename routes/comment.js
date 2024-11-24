const express = require('express')
const router = express.Router()
const commentController = require('../controllers/commentController')

router.get('/', commentController.getAllComments)
router.get('/recipe_id/:recipe_id', commentController.getCommentsByRecipeId)
router.post('/', commentController.createComment)
router.put('/:id', commentController.updateCommentContent)
router.delete('/:id', commentController.deleteComment)

module.exports = router
