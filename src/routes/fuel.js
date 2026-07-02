const express = require('express')
const router = express.Router()
const pool = require('../db/index')
const { askMaritime } = require('../ai')

// GET fuel analytics for entire fleet
router.get('/analytics', async (req, res) => {
  try {
    // Get all completed routes with fuel data
    const routesResult = await pool.query(`
      SELECT 
        r.*,
        v.name as vessel_name,
        v.type as vessel_type,
        CASE 
          WHEN r.actual_arrival IS NOT NULL AND r.departure_time IS NOT NULL
          THEN EXTRACT(EPOCH FROM (r.actual_arrival - r.departure_time)) / 3600
          ELSE NULL
        END as actual_hours,
        CASE
          WHEN r.distance_km > 0 AND r.fuel_consumed > 0
          THEN r.fuel_consumed / r.distance_km * 100
          ELSE NULL
        END as fuel_per_100km
      FROM routes r
      JOIN vessels v ON r.vessel_id = v.id
      WHERE r.fuel_consumed IS NOT NULL
      ORDER BY r.created_at DESC
    `)

    // Get per vessel fuel summary
    const vesselSummary = await pool.query(`
      SELECT 
        v.id,
        v.name,
        v.type,
        COUNT(r.id) as total_voyages,
        SUM(r.fuel_consumed) as total_fuel,
        SUM(r.distance_km) as total_distance,
        AVG(r.fuel_consumed) as avg_fuel_per_voyage,
        CASE
          WHEN SUM(r.distance_km) > 0
          THEN SUM(r.fuel_consumed) / SUM(r.distance_km) * 100
          ELSE 0
        END as avg_fuel_per_100km
      FROM vessels v
      LEFT JOIN routes r ON v.id = r.vessel_id AND r.fuel_consumed IS NOT NULL
      GROUP BY v.id, v.name, v.type
      ORDER BY total_fuel DESC NULLS LAST
    `)

    // Overall fleet stats
    const fleetStats = await pool.query(`
      SELECT
        COUNT(r.id) as total_completed_voyages,
        SUM(r.fuel_consumed) as total_fuel_consumed,
        SUM(r.distance_km) as total_distance_covered,
        AVG(r.fuel_consumed) as avg_fuel_per_voyage,
        MAX(r.fuel_consumed) as highest_fuel_voyage,
        MIN(r.fuel_consumed) as lowest_fuel_voyage
      FROM routes r
      WHERE r.fuel_consumed IS NOT NULL
    `)

    const stats = fleetStats.rows[0]

    // Build analytics context
    const analyticsContext = {
      fleet_stats: stats,
      vessel_summary: vesselSummary.rows,
      recent_voyages: routesResult.rows
    }

    // Ask AI for fuel insights and recommendations
    const insights = await askMaritime(
      `You are a maritime fuel efficiency expert. Analyze this fleet fuel data 
       and provide:
       1. Which vessel is most fuel efficient and why
       2. Which voyage was most wasteful and what could have been done better
       3. Estimated monthly fuel cost (assume $600 per tonne of marine fuel)
       4. Top 3 specific recommendations to reduce fuel costs
       5. Projected savings if recommendations are followed
       
       Be specific with numbers. Fleet managers respond to dollar amounts.`,
      analyticsContext
    )

    res.json({
      success: true,
      fleet_stats: {
        total_voyages: parseInt(stats.total_completed_voyages),
        total_fuel_consumed_tonnes: parseFloat(parseFloat(stats.total_fuel_consumed).toFixed(2)),
        total_distance_km: parseFloat(parseFloat(stats.total_distance_covered).toFixed(2)),
        avg_fuel_per_voyage_tonnes: parseFloat(parseFloat(stats.avg_fuel_per_voyage).toFixed(2)),
        estimated_fuel_cost_usd: parseFloat((stats.total_fuel_consumed * 600).toFixed(2))
      },
      vessel_breakdown: vesselSummary.rows,
      recent_voyages: routesResult.rows,
      ai_insights: insights
    })

  } catch (error) {
    console.error('Fuel analytics error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Could not generate fuel analytics'
    })
  }
})

// GET fuel report for specific vessel
router.get('/vessel/:id', async (req, res) => {
  try {
    const { id } = req.params

    const vessel = await pool.query('SELECT * FROM vessels WHERE id = $1', [id])
    if (vessel.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vessel not found' })
    }

    const routes = await pool.query(`
      SELECT *,
        CASE
          WHEN distance_km > 0 AND fuel_consumed > 0
          THEN fuel_consumed / distance_km * 100
          ELSE NULL
        END as fuel_per_100km
      FROM routes 
      WHERE vessel_id = $1 AND fuel_consumed IS NOT NULL
      ORDER BY created_at DESC
    `, [id])

    const summary = await pool.query(`
      SELECT
        COUNT(id) as total_voyages,
        SUM(fuel_consumed) as total_fuel,
        SUM(distance_km) as total_distance,
        AVG(fuel_consumed) as avg_fuel
      FROM routes
      WHERE vessel_id = $1 AND fuel_consumed IS NOT NULL
    `, [id])

    const stats = summary.rows[0]

    res.json({
      success: true,
      vessel: vessel.rows[0],
      fuel_summary: {
        total_voyages: parseInt(stats.total_voyages),
        total_fuel_tonnes: parseFloat(parseFloat(stats.total_fuel).toFixed(2)),
        total_distance_km: parseFloat(parseFloat(stats.total_distance).toFixed(2)),
        avg_fuel_per_voyage: parseFloat(parseFloat(stats.avg_fuel).toFixed(2)),
        estimated_cost_usd: parseFloat((stats.total_fuel * 600).toFixed(2))
      },
      voyages: routes.rows
    })

  } catch (error) {
    console.error('Vessel fuel error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Could not get vessel fuel data'
    })
  }
})

module.exports = router