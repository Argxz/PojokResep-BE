const express = require('express')
const router = express.Router()
const commentController = require('../controllers/commentController')
const {
  authenticateToken,
  authorizeRole,
} = require('../middleware/authMiddleware')

router.get('/', authenticateToken, commentController.getAllComments)
router.get(
  '/recipes/:recipe_id',
  authenticateToken,
  commentController.getCommentsByRecipeId,
)
router.post('/', authenticateToken, commentController.createComment)
router.put('/:id', authenticateToken, commentController.updateCommentContent)
router.delete('/:id', authenticateToken, commentController.deleteComment)

module.exports = router
