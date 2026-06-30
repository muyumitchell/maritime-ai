const express = require('express')
const router = express.Router()
const pool = require('../db/index')
const { askMaritime } = require('../ai')
const { getMarineWeather } = require('../weather')
const { calculateDistance } = require('../geofence')

// Known East African ports with coordinates
const PORTS = {
  'mombasa': { name: 'Mombasa', lat: -4.0435, lon: 39.6682, country: 'Kenya' },
  'dar es salaam': { name: 'Dar es Salaam', lat: -6.8235, lon: 39.2895, country: 'Tanzania' },
  'zanzibar': { name: 'Zanzibar', lat: -6.1659, lon: 39.1989, country: 'Tanzania' },
  'mogadishu': { name: 'Mogadishu', lat: 2.0469, lon: 45.3182, country: 'Somalia' },
  'djibouti': { name: 'Djibouti', lat: 11.5720, lon: 43.1450, country: 'Djibouti' },
  'aden': { name: 'Aden', lat: 12.7855, lon: 44.9789, country: 'Yemen' },
  'berbera': { name: 'Berbera', lat: 10.4390, lon: 45.0143, country: 'Somalia' },
  'lamu': { name: 'Lamu', lat: -2.2686, lon: 40.9020, country: 'Kenya' }
}

// POST /api/optimize/route
router.post('/route', async (req, res) => {
  try {
    const { origin, destination, vessel_id } = req.body

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Please provide origin and destination ports'
      })
    }

    // Find port coordinates
    const originPort = PORTS[origin.toLowerCase()]
    const destPort = PORTS[destination.toLowerCase()]

    if (!originPort || !destPort) {
      return res.status(404).json({
        success: false,
        message: 'Port not found. Available ports: ' + Object.keys(PORTS).join(', ')
      })
    }

    // Calculate direct distance
    const directDistance = calculateDistance(
      originPort.lat, originPort.lon,
      destPort.lat, destPort.lon
    )

    // Get weather at origin, midpoint, and destination
    const midLat = (originPort.lat + destPort.lat) / 2
    const midLon = (originPort.lon + destPort.lon) / 2

    const [originWeather, midWeather, destWeather] = await Promise.all([
      getMarineWeather(originPort.lat, originPort.lon),
      getMarineWeather(midLat, midLon),
      getMarineWeather(destPort.lat, destPort.lon)
    ])

    // Get all active zones for context
    const zones = await pool.query('SELECT * FROM zones WHERE active = true')

    // Get vessel info if provided
    let vessel = null
    if (vessel_id) {
      const vesselResult = await pool.query(
        'SELECT * FROM vessels WHERE id = $1', [vessel_id]
      )
      vessel = vesselResult.rows[0] || null
    }

    // Estimate fuel consumption (simplified formula)
    // Average cargo ship burns ~30 tonnes/day at 12 knots
    const avgSpeedKnots = 12
    const avgSpeedKmH = avgSpeedKnots * 1.852
    const estimatedHours = directDistance / avgSpeedKmH
    const estimatedFuelTonnes = (estimatedHours / 24) * 30

    // Build route context for AI
    const routeContext = {
      origin: originPort,
      destination: destPort,
      direct_distance_km: parseFloat(directDistance.toFixed(2)),
      estimated_hours: parseFloat(estimatedHours.toFixed(2)),
      estimated_fuel_tonnes: parseFloat(estimatedFuelTonnes.toFixed(2)),
      weather: {
        at_origin: originWeather,
        at_midpoint: midWeather,
        at_destination: destWeather
      },
      maritime_zones: zones.rows,
      vessel
    }

    // Ask AI for route recommendation
    const recommendation = await askMaritime(
      `You are a maritime route optimization expert. 
       Analyze this route and provide a detailed recommendation:
       
       Route: ${originPort.name} → ${destPort.name}
       Direct distance: ${directDistance.toFixed(2)} km
       Estimated travel time: ${estimatedHours.toFixed(1)} hours at 12 knots
       Estimated fuel: ${estimatedFuelTonnes.toFixed(1)} tonnes
       
       Consider:
       1. Weather conditions along the route
       2. Piracy risk zones in the area
       3. Fuel efficiency recommendations
       4. Any suggested waypoints to avoid risks
       5. Overall safety rating (Safe / Caution / High Risk)
       
       Be specific and actionable. Give a clear GO or CAUTION or NO-GO recommendation.`,
      routeContext
    )

    res.json({
      success: true,
      route: {
        origin: originPort,
        destination: destPort,
        direct_distance_km: parseFloat(directDistance.toFixed(2)),
        estimated_hours: parseFloat(estimatedHours.toFixed(2)),
        estimated_days: parseFloat((estimatedHours / 24).toFixed(1)),
        estimated_fuel_tonnes: parseFloat(estimatedFuelTonnes.toFixed(2))
      },
      weather_along_route: {
        origin: originWeather,
        midpoint: midWeather,
        destination: destWeather
      },
      ai_recommendation: recommendation
    })

  } catch (error) {
    console.error('Route optimization error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Could not optimize route'
    })
  }
})

// GET available ports
router.get('/ports', (req, res) => {
  res.json({
    success: true,
    count: Object.keys(PORTS).length,
    ports: Object.values(PORTS)
  })
})

module.exports = router