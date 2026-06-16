const pool = require('./db/index')
const { askMaritime } = require('./ai')
const { getMarineWeather } = require('./weather')

const calculateRiskScore = (vessel, maintenanceRecords, weather) => {
  let score = 0
  let reasons = []

  // Check for overdue maintenance
  const overdue = maintenanceRecords.filter(m => m.status === 'overdue')
  if (overdue.length > 0) {
    score += 40
    reasons.push(`${overdue.length} overdue maintenance task(s)`)
  }

  // Check for scheduled but not completed maintenance
  const scheduled = maintenanceRecords.filter(m => m.status === 'scheduled')
  if (scheduled.length > 0) {
    score += 20
    reasons.push(`${scheduled.length} upcoming maintenance task(s)`)
  }

  // Check if vessel has no maintenance records at all
  if (maintenanceRecords.length === 0) {
    score += 60
    reasons.push('No maintenance records found')
  }

  // Check last seen time
  const lastSeen = new Date(vessel.last_seen)
  const hoursAgo = (Date.now() - lastSeen) / (1000 * 60 * 60)
  if (hoursAgo > 24) {
    score += 20
    reasons.push(`No signal for ${Math.round(hoursAgo)} hours`)
  }

  // Factor in weather risk
  if (weather) {
    if (weather.risk_level === 'high') {
      score += 30
      reasons.push(`Severe weather: ${weather.weather}, wind ${weather.wind_speed}m/s`)
    } else if (weather.risk_level === 'medium') {
      score += 15
      reasons.push(`Adverse weather: ${weather.weather}, wind ${weather.wind_speed}m/s`)
    }
  }

  // Determine severity
  let severity = 'low'
  if (score >= 60) severity = 'high'
  else if (score >= 30) severity = 'medium'

  return { score, reasons, severity }
}

const generateAlerts = async () => {
  try {
    // Get all vessels
    const vessels = await pool.query('SELECT * FROM vessels')
    
    const alerts = []

    for (const vessel of vessels.rows) {
      // Get maintenance records for this vessel
      const maintenance = await pool.query(
        'SELECT * FROM maintenance WHERE vessel_id = $1',
        [vessel.id]
      )

      // Get weather at vessel's current position
      const weather = await getMarineWeather(vessel.lat, vessel.lon)

      const { score, reasons, severity } = calculateRiskScore(
        vessel,
        maintenance.rows,
        weather
      )
      // Only alert if there is actual risk
      if (score > 0) {
        // Ask AI to explain the risk and recommend action
        const aiExplanation = await askMaritime(
          `Vessel ${vessel.name} has a risk score of ${score}/100. 
           Issues found: ${reasons.join(', ')}. 
           In 2-3 sentences, explain the risk and recommend one specific action.`,
          { vessel, maintenance: maintenance.rows }
        )

        alerts.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          risk_score: score,
          severity,
          reasons,
          recommendation: aiExplanation,
          generated_at: new Date().toISOString()
        })
      }
    }

    // Sort by risk score highest first
    return alerts.sort((a, b) => b.risk_score - a.risk_score)

  } catch (error) {
    console.error('Prediction engine error:', error.message)
    throw error
  }
}

module.exports = { generateAlerts }