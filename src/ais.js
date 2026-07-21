const WebSocket = require('ws')
const pool = require('./db/index')
require('dotenv').config()

// Bounding box around Kenya's coast / Mombasa port area
// [latitude, longitude] pairs - covers Mombasa to Dar es Salaam region
const KENYA_COAST_BOX = [
  [-15.0, 35.0],
  [15.0, 55.0]
]
const connectToAIS = () => {
  const ws = new WebSocket('wss://stream.aisstream.io/v0/stream')

  ws.on('open', () => {
    console.log('Connected to AIS stream')

    const subscriptionMessage = {
      APIKey: process.env.AISSTREAM_API_KEY,
      BoundingBoxes: [KENYA_COAST_BOX],
      FilterMessageTypes: ['PositionReport']
    }

    ws.send(JSON.stringify(subscriptionMessage))
    console.log('AIS subscription sent successfully')
  })

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data)
      console.log('Message type received:', message.MessageType)

      if (message.MessageType === 'PositionReport') {
        const report = message.Message.PositionReport
        const meta = message.MetaData

        const mmsi = meta.MMSI.toString()
        const name = meta.ShipName ? meta.ShipName.trim() : `Vessel ${mmsi}`
        const lat = report.Latitude
        const lon = report.Longitude
        const speed = report.Sog // Speed over ground

       console.log(`Received update: ${name} (${mmsi}) at ${lat}, ${lon}, speed ${speed}`)

        // Data validation - reject impossible values
        const isValidSpeed = speed >= 0 && speed <= 50
        const isValidPosition = lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180

        if (!isValidSpeed || !isValidPosition) {
          console.log(`Skipped ${name} - invalid data (speed: ${speed}, lat: ${lat}, lon: ${lon})`)
          return
        }

       // Insert or update vessel in database
        const updateResult = await pool.query(
          `INSERT INTO vessels (name, mmsi, type, lat, lon, speed, status, last_seen)
           VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
           ON CONFLICT (mmsi) 
           DO UPDATE SET 
             lat = $4, 
             lon = $5, 
             speed = $6, 
             status = $7,
             last_seen = NOW()
           RETURNING *`,
          [name, mmsi, 'Unknown', lat, lon, speed, speed > 0.5 ? 'Underway' : 'At anchor']
        )

        // Push live update to all connected frontends instantly
        if (global.io && updateResult.rows[0]) {
          global.io.emit('vessel_update', updateResult.rows[0])
          console.log(`Live update pushed: ${name}`)
        }
      }
    } catch (error) {
      console.error('Error processing AIS message:', error.message)
    }
  })

let reconnectDelay = 5000
const maxDelay = 300000 // 5 minutes maximum

ws.on('close', (code, reason) => {
    console.log(`AIS connection closed. Code: ${code} — reconnecting in ${reconnectDelay/1000}s`)
    setTimeout(() => {
      reconnectDelay = Math.min(reconnectDelay * 2, maxDelay)
      connectToAIS()
    }, reconnectDelay)
})

  ws.on('error', (error) => {
    console.error('AIS connection error:', error.message)
  })
}

module.exports = { connectToAIS }