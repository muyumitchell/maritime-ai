const express = require('express')
const cors = require('cors')
const http = require('http')
const { Server } = require('socket.io')
require('dotenv').config()

const vesselRoutes = require('./routes/vessels')
const aiRoutes = require('./routes/ai')
const alertRoutes = require('./routes/alerts')
const fleetRoutes = require('./routes/fleet')
const weatherRoutes = require('./routes/weather')
const queryRoutes = require('./routes/query')
const zoneRoutes = require('./routes/zones')
const intelligenceRoutes = require('./routes/intelligence')
const logsRoutes = require('./routes/logs')
const optimizeRoutes = require('./routes/optimize')
const fuelRoutes = require('./routes/fuel')
const { connectToAIS } = require('./ais')
const { startScheduler } = require('./scheduler')
const pool = require('./db/index')

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())
app.use(express.static('src'))

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
app.use('/api/intelligence', intelligenceRoutes)
app.use('/api/logs', logsRoutes)
app.use('/api/optimize', optimizeRoutes)
app.use('/api/fuel', fuelRoutes)

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('Frontend connected via Socket.io:', socket.id)

  // Send current vessel positions immediately on connect
  pool.query('SELECT * FROM vessels').then((result) => {
    socket.emit('vessel_positions', result.rows)
  })

  socket.on('disconnect', () => {
    console.log('Frontend disconnected:', socket.id)
  })
})

// Make io available globally so AIS can use it
global.io = io

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  connectToAIS()
  startScheduler(30)
})