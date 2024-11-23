const express = require('express')
const router = express.Router()

const userRoutes = require('./user')
const categoryRoutes = require('./categories')
const recipeRoutes = require('./recipe')

router.use('/users', userRoutes)
router.use('/categories', categoryRoutes)
router.use('/recipes', recipeRoutes)

module.exports = router
