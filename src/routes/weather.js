const express = require('express')
const router = express.Router()
const pool = require('../db/index')
const { getMarineWeather } = require('../weather')

// GET weather for a specific vessel by ID
router.get('/vessel/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Get vessel position from database
    const result = await pool.query(
      'SELECT * FROM vessels WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Vessel not found' 
      })
    }

    const vessel = result.rows[0]

    // Fetch weather at vessel's current position
    const weather = await getMarineWeather(vessel.lat, vessel.lon)

    if (!weather) {
      return res.status(500).json({ 
        success: false, 
        message: 'Could not fetch weather data' 
      })
    }

    res.json({
      success: true,
      vessel: {
        id: vessel.id,
        name: vessel.name,
        lat: vessel.lat,
        lon: vessel.lon
      },
      weather
    })

  } catch (error) {
    console.error('Weather route error:', error.message)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

// GET weather for all vessels at once
router.get('/fleet', async (req, res) => {
  try {
    const vessels = await pool.query('SELECT * FROM vessels')
    
    const fleetWeather = await Promise.all(
      vessels.rows.map(async (vessel) => {
        const weather = await getMarineWeather(vessel.lat, vessel.lon)
        return {
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          lat: vessel.lat,
          lon: vessel.lon,
          weather
        }
      })
    )

    res.json({
      success: true,
      count: fleetWeather.length,
      fleet_weather: fleetWeather
    })

  } catch (error) {
    console.error('Fleet weather error:', error.message)
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    })
  }
})

module.exports = router