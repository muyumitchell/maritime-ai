const express = require('express')
const router = express.Router()
const pool = require('../db/index')
const { generateAlerts } = require('../prediction')
const { checkFleetZones } = require('../geofence')
const { getMarineWeather } = require('../weather')
const { askMaritime } = require('../ai')

router.get('/', async (req, res) => {
  try {
    console.log('Generating unified intelligence report...')

    // Run all intelligence gathering in parallel for speed
    const [
      vesselsResult,
      routesResult,
      maintenanceAlerts,
      zoneAlerts
    ] = await Promise.all([
      pool.query('SELECT * FROM vessels'),
      pool.query(`SELECT r.*, v.name as vessel_name 
                  FROM routes r 
                  JOIN vessels v ON r.vessel_id = v.id 
                  WHERE r.status != 'completed'`),
      generateAlerts(),
      checkFleetZones()
    ])

    // Get weather for all vessels
    const weatherData = await Promise.all(
      vesselsResult.rows.map(async (vessel) => {
        const weather = await getMarineWeather(vessel.lat, vessel.lon)
        return {
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          weather
        }
      })
    )

    // Build unified picture
    const intelligence = {
      fleet: {
        total_vessels: vesselsResult.rows.length,
        underway: vesselsResult.rows.filter(v => v.status === 'Underway').length,
        at_anchor: vesselsResult.rows.filter(v => v.status === 'At anchor').length,
        active_voyages: routesResult.rows.length
      },
      risk_summary: {
        maintenance_alerts: maintenanceAlerts.length,
        high_risk_vessels: maintenanceAlerts.filter(a => a.severity === 'high').length,
        zone_alerts: zoneAlerts.length,
        high_risk_zones: zoneAlerts.filter(a => a.risk_level === 'high').length
      },
      vessels: vesselsResult.rows,
      active_voyages: routesResult.rows,
      maintenance_alerts: maintenanceAlerts,
      zone_alerts: zoneAlerts,
      weather: weatherData
    }

    // Ask AI for a unified operational briefing
    const briefing = await askMaritime(
      `You are a maritime operations AI. Generate a concise operational 
       briefing for the fleet manager. Cover:
       1. Overall fleet status
       2. Most urgent issues requiring immediate attention
       3. Weather concerns
       4. Zone alerts
       5. One key recommendation
       
       Be direct, specific, and prioritize by urgency.`,
      intelligence
    )

    res.json({
      success: true,
      generated_at: new Date().toISOString(),
      operational_briefing: briefing,
      intelligence
    })

  } catch (error) {
    console.error('Intelligence error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Could not generate intelligence report'
    })
  }
})

module.exports = router