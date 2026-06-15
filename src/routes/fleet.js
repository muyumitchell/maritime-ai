const express = require('express')
const router = express.Router()
const pool = require('../db/index')
const { generateAlerts } = require('../prediction')
const { askMaritime } = require('../ai')

router.get('/summary', async (req, res) => {
  try {
    // Get all vessels
    const vessels = await pool.query('SELECT * FROM vessels')

    // Get active routes with vessel names
    const routes = await pool.query(
      `SELECT r.*, v.name as vessel_name 
       FROM routes r 
       JOIN vessels v ON r.vessel_id = v.id 
       WHERE r.status != 'completed'`
    )

    // Get alerts from prediction engine
    const alerts = await generateAlerts()

    // Count vessels by status
    const statusCounts = {}
    vessels.rows.forEach(v => {
      statusCounts[v.status] = (statusCounts[v.status] || 0) + 1
    })

    // Build fleet overview data
    const fleetData = {
      total_vessels: vessels.rows.length,
      status_breakdown: statusCounts,
      active_voyages: routes.rows.length,
      total_alerts: alerts.length,
      high_risk_vessels: alerts.filter(a => a.severity === 'high').length
    }

    // Ask AI for an executive summary
    const aiSummary = await askMaritime(
      `Give a brief 2-3 sentence executive summary of the current fleet status 
       for a fleet manager starting their day. Be direct and highlight what 
       needs attention first.`,
      { fleet: fleetData, vessels: vessels.rows, alerts, routes: routes.rows }
    )

    res.json({
      success: true,
      fleet_overview: fleetData,
      executive_summary: aiSummary,
      vessels: vessels.rows,
      active_voyages: routes.rows,
      alerts
    })

  } catch (error) {
    console.error('Fleet summary error:', error.message)
    res.status(500).json({ 
      success: false, 
      message: 'Could not generate fleet summary' 
    })
  }
})

module.exports = router