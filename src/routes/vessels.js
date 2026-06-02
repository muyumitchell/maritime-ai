const express = require('express')
const router = express.Router()
const pool = require('../db/index')

// GET all vessels from database
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vessels ORDER BY created_at DESC')
    res.json({
      success: true,
      count: result.rows.length,
      vessels: result.rows
    })
  } catch (error) {
    console.error('Error fetching vessels:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET single vessel by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query('SELECT * FROM vessels WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Vessel not found' })
    }
    res.json({ success: true, vessel: result.rows[0] })
  } catch (error) {
    console.error('Error fetching vessel:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

// GET vessel with its maintenance records
router.get('/:id/maintenance', async (req, res) => {
  try {
    const { id } = req.params
    const result = await pool.query(
      'SELECT * FROM maintenance WHERE vessel_id = $1 ORDER BY scheduled_date DESC',
      [id]
    )
    res.json({
      success: true,
      vessel_id: id,
      maintenance: result.rows
    })
  } catch (error) {
    console.error('Error fetching maintenance:', error.message)
    res.status(500).json({ success: false, message: 'Server error' })
  }
})

module.exports = router