const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const port = process.env.PORT || 3001
const routes = require('./routes')

app.use(cors())
app.use(morgan('combined'))
app.use(express.json())

app.get('/', (req, res) => {
  res.send({
    message: 'Hallo 👋',
    status: 'Server ready 🚀',
  })
})

app.use('/api/v1', routes)

app.listen(port, () => {
  console.log(`Server ready listening on http://localhost:${port}`)
})
