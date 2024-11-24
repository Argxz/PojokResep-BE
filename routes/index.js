const express = require('express')
const router = express.Router()

const userRoutes = require('./user')
const categoryRoutes = require('./categories')
const recipeRoutes = require('./recipe')
const commentRoutes = require('./comment')
const ratingRoutes = require('./rating')

router.use('/users', userRoutes)
router.use('/categories', categoryRoutes)
router.use('/recipes', recipeRoutes)
router.use('/comments', commentRoutes)
router.use('/ratings', ratingRoutes)

module.exports = router
