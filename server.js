require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const port = process.env.PORT
const routes = require('./routes')
const path = require('path')

app.use(
  cors({
    origin: ['http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
)
app.use(morgan('combined'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send({
    message: 'Hallo 👋',
    status: 'API Pojok Resep Siap Digunakan !🚀',
  })
})

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/v1', routes)

app.listen(port, () => {
  console.log(`Server ready listening on http://localhost:${port}`)
})
