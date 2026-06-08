const express = require('express')
const router = express.Router()
const pool = require('../db/index')
const { askMaritime } = require('../ai')

router.post('/', async (req, res) => {
  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a question' 
      })
    }

    // Fetch current data from database to give AI context
    const vessels = await pool.query('SELECT * FROM vessels')
    const maintenance = await pool.query(
      'SELECT m.*, v.name as vessel_name FROM maintenance m JOIN vessels v ON m.vessel_id = v.id'
    )
    const routes = await pool.query(
      'SELECT r.*, v.name as vessel_name FROM routes r JOIN vessels v ON r.vessel_id = v.id'
    )

    // Build context for the AI
    const context = {
      vessels: vessels.rows,
      maintenance: maintenance.rows,
      routes: routes.rows
    }

    // Ask the AI
    const answer = await askMaritime(question, context)

    res.json({
      success: true,
      question,
      answer
    })

  } catch (error) {
    console.error('AI error:', error.message)
    res.status(500).json({ 
      success: false, 
      message: 'AI service error' 
    })
  }
})

module.exports = router