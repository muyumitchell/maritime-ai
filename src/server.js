const express = require('express')
const cors = require('cors')
require('dotenv').config()

const vesselRoutes = require('./routes/vessels')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Maritime AI system is running' })
})

app.use('/api/vessels', vesselRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})