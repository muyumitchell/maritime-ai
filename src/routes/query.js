const express = require('express')
const router = express.Router()
const pool = require('../db/index')
const { askMaritime } = require('../ai')

// Database schema description — tells the AI what tables and columns exist
const DB_SCHEMA = `
You have access to a PostgreSQL database with these tables:

1. vessels (id, name, mmsi, type, lat, lon, speed, status, last_seen, created_at)
   - status values: 'Underway', 'At anchor'
   - speed is in knots
   - lat/lon are coordinates

2. maintenance (id, vessel_id, type, status, scheduled_date, completed_date, notes, created_at)
   - status values: 'scheduled', 'completed', 'overdue'
   - vessel_id links to vessels.id

3. routes (id, vessel_id, origin, destination, departure_time, eta, actual_arrival, distance_km, fuel_consumed, status, created_at)
   - status values: 'planned', 'underway', 'completed', 'delayed'
   - vessel_id links to vessels.id
`

router.post('/', async (req, res) => {
  try {
    const { question } = req.body

    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question'
      })
    }

    // Step 1 — Ask AI to write the SQL query
    const sqlPrompt = `
      ${DB_SCHEMA}
      
      The user asked: "${question}"
      
      Write a single PostgreSQL SELECT query to answer this question.
      Rules:
      - Return ONLY the SQL query, nothing else
      - No explanations, no markdown, no backticks
      - Only SELECT queries (no INSERT, UPDATE, DELETE)
      - Use proper JOIN syntax when needed
      - Keep it simple and accurate
    `

    const sqlResponse = await askMaritime(sqlPrompt, {})
    const sqlQuery = sqlResponse.trim()

    console.log('Generated SQL:', sqlQuery)

    // Step 2 — Safety check: only allow SELECT queries
    if (!sqlQuery.toLowerCase().startsWith('select')) {
      return res.status(400).json({
        success: false,
        message: 'Only SELECT queries are allowed'
      })
    }

    // Step 3 — Run the query against your database
    const result = await pool.query(sqlQuery)

    // Step 4 — Ask AI to explain the results in plain English
    const explanationPrompt = `
      The user asked: "${question}"
      The database returned ${result.rows.length} results: 
      ${JSON.stringify(result.rows, null, 2)}
      
      In 2-3 sentences, summarize what these results mean for the fleet manager.
      Be specific and actionable.
    `

    const explanation = await askMaritime(explanationPrompt, {})

    res.json({
      success: true,
      question,
      sql_used: sqlQuery,
      results: result.rows,
      count: result.rows.length,
      explanation
    })

  } catch (error) {
    console.error('Query error:', error.message)
    res.status(500).json({
      success: false,
      message: 'Could not process query',
      error: error.message
    })
  }
})

module.exports = router