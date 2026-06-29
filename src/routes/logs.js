const express = require('express')
const router = express.Router()
const pool = require('../db/index')

// GET all alerts log
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM alerts_log 
       ORDER BY created_at DESC 
       LIMIT 50`
    )

    res.json({
      success: true,
      count: result.rows.length,
      logs: result.rows
    })

  } catch (error) {
    console.error('Logs error:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET logs for a specific vessel
router.get('/vessel/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      `SELECT * FROM alerts_log 
       WHERE vessel_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [id]
    )

    res.json({
      success: true,
      vessel_id: id,
      count: result.rows.length,
      logs: result.rows
    })

  } catch (error) {
    console.error('Vessel logs error:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET only unacknowledged high risk alerts
router.get('/urgent', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM alerts_log 
       WHERE severity = 'high' 
       AND acknowledged = false 
       ORDER BY created_at DESC`
    )

    res.json({
      success: true,
      count: result.rows.length,
      urgent_alerts: result.rows
    })

  } catch (error) {
    console.error('Urgent logs error:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// PATCH acknowledge an alert
router.patch('/:id/acknowledge', async (req, res) => {
  try {
    const { id } = req.params
    await pool.query(
      `UPDATE alerts_log SET acknowledged = true WHERE id = $1`,
      [id]
    )

    res.json({
      success: true,
      message: `Alert ${id} acknowledged`
    })

  } catch (error) {
    console.error('Acknowledge error:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router