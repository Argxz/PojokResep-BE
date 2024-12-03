const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/categoryController')
const {
  authenticateToken,
  authorizeRole,
} = require('../middleware/authMiddleware')

router.get('/', authenticateToken, categoryController.getAllCategories)
router.get('/:id', categoryController.getCategoryById)
router.post('/', categoryController.createCategory)
router.put('/:id', categoryController.updateCategory)
router.delete('/:id', categoryController.deleteCategory)

module.exports = router
