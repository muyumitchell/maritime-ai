const express = require('express')
const router = express.Router()
const pool = require('../db/index')
const { checkFleetZones, checkVesselZones } = require('../geofence')

// GET all zones
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM zones WHERE active = true ORDER BY risk_level DESC')
    res.json({
      success: true,
      count: result.rows.length,
      zones: result.rows
    })
  } catch (error) {
    console.error('Zones error:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET zone alerts for entire fleet
router.get('/alerts', async (req, res) => {
  try {
    console.log('Checking fleet zone alerts...')
    const alerts = await checkFleetZones()

    res.json({
      success: true,
      total_zone_alerts: alerts.length,
      high_risk: alerts.filter(a => a.risk_level === 'high').length,
      medium_risk: alerts.filter(a => a.risk_level === 'medium').length,
      low_risk: alerts.filter(a => a.risk_level === 'low').length,
      alerts
    })

  } catch (error) {
    console.error('Zone alerts error:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET zone alerts for a specific vessel
router.get('/vessel/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM vessels WHERE id = $1', [id])

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vessel not found' })
    }

    const vessel = result.rows[0]
    const alerts = await checkVesselZones(vessel)

    res.json({
      success: true,
      vessel_name: vessel.name,
      zones_detected: alerts.length,
      alerts
    })

  } catch (error) {
    console.error('Vessel zone error:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router