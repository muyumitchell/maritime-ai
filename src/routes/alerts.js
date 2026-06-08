const express = require('express')
const router = express.Router()
const { generateAlerts } = require('../prediction')

// GET all current alerts and risks
router.get('/', async (req, res) => {
  try {
    console.log('Generating fleet alerts...')
    const alerts = await generateAlerts()

    const summary = {
      total_alerts: alerts.length,
      high_risk: alerts.filter(a => a.severity === 'high').length,
      medium_risk: alerts.filter(a => a.severity === 'medium').length,
      low_risk: alerts.filter(a => a.severity === 'low').length
    }

    res.json({
      success: true,
      summary,
      alerts
    })

  } catch (error) {
    console.error('Alerts error:', error.message)
    res.status(500).json({ 
      success: false, 
      message: 'Could not generate alerts' 
    })
  }
})

module.exports = router