const express = require('express')
const morgan = require('morgan')
const app = express()
const port = process.env.PORT || 3001
const bodyParser = require('body-parser')

const { User } = require('./models')
const { Categories } = require('./models')
const { Recipe } = require('./models')

app.use(morgan('combined'))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send({
    message: 'Hallo 👋',
    status: 'Server ready 🚀',
  })
})

// Contoh endpoint untuk mendapatkan semua data
app.get('/api/v1/users', async (req, res) => {
  try {
    const users = await User.findAll()
    res.json({ status: 'OK', data: users })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/v1/categories', async (req, res) => {
  try {
    const categories = await Categories.findAll()
    res.json({ status: 'OK', data: categories })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get('/api/v1/recipes', async (req, res) => {
  try {
    const recipes = await Recipe.findAll()
    res.json({ status: 'OK', data: recipes })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/v1/categories', async (req, res) => {
  const { name, desc } = req.body

  // Validasi input
  if (!name) {
    return res.status(400).json({ error: 'Name is required' })
  }

  try {
    // Simpan ke database
    const categories = await Categories.create({
      name: name,
      desc: desc,
    })

    // Response sukses
    res.status(201).json({
      message: 'Category created successfully',
      data: categories,
    })
  } catch (error) {
    console.error('Error creating category:', error)
    res.status(500).json({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`Server ready listening on http://localhost:${port}`)
})
