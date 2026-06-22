const express = require('express')
const cors = require('cors')
require('dotenv').config()

const vesselRoutes = require('./routes/vessels')
const aiRoutes = require('./routes/ai')
const alertRoutes = require('./routes/alerts')
const fleetRoutes = require('./routes/fleet')
const weatherRoutes = require('./routes/weather')
const queryRoutes = require('./routes/query')
const zoneRoutes = require('./routes/zones')
const { connectToAIS } = require('./ais')

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({ message: 'Maritime AI system is running' })
})

app.use('/api/vessels', vesselRoutes)
app.use('/api/ask', aiRoutes)
app.use('/api/alerts', alertRoutes)
app.use('/api/fleet', fleetRoutes)
app.use('/api/weather', weatherRoutes)
app.use('/api/query', queryRoutes)
app.use('/api/zones', zoneRoutes)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  connectToAIS()
})