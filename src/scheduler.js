const pool = require('./db/index')
const { generateAlerts } = require('./prediction')
const { checkFleetZones } = require('./geofence')

const runScheduledIntelligence = async () => {
  const timestamp = new Date().toISOString()
  console.log(`\n========================================`)
  console.log(`SCHEDULED INTELLIGENCE RUN — ${timestamp}`)
  console.log(`========================================`)

  try {
    // Run maintenance alerts and zone checks simultaneously
    const [maintenanceAlerts, zoneAlerts] = await Promise.all([
      generateAlerts(),
      checkFleetZones()
    ])

    console.log(`\n📊 FLEET SUMMARY:`)
    console.log(`   Maintenance alerts: ${maintenanceAlerts.length}`)
    console.log(`   Zone alerts: ${zoneAlerts.length}`)
    console.log(`   High risk vessels: ${maintenanceAlerts.filter(a => a.severity === 'high').length}`)

    // Save maintenance alerts to database
    for (const alert of maintenanceAlerts) {
      await pool.query(
        `INSERT INTO alerts_log 
         (alert_type, vessel_id, vessel_name, severity, risk_score, message, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'maintenance',
          alert.vessel_id,
          alert.vessel_name,
          alert.severity,
          alert.risk_score,
          alert.recommendation,
          JSON.stringify(alert)
        ]
      )

      const icon = alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🟢'
      console.log(`\n${icon} ${alert.vessel_name} — Risk Score: ${alert.risk_score}/100`)
      console.log(`   Severity: ${alert.severity.toUpperCase()}`)
      console.log(`   Reasons: ${alert.reasons.join(', ')}`)
    }

    // Save zone alerts to database
    for (const alert of zoneAlerts) {
      await pool.query(
        `INSERT INTO alerts_log 
         (alert_type, vessel_id, vessel_name, severity, message, details)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          'zone',
          alert.vessel_id,
          alert.vessel_name,
          alert.risk_level,
          alert.explanation,
          JSON.stringify(alert)
        ]
      )

      const icon = alert.risk_level === 'high' ? '🔴' : alert.risk_level === 'medium' ? '🟡' : '🟢'
      console.log(`\n${icon} ZONE ALERT: ${alert.vessel_name} — ${alert.zone_name}`)
      console.log(`   Risk level: ${alert.risk_level.toUpperCase()}`)
    }

    console.log(`\n✅ Intelligence run complete — ${new Date().toISOString()}`)
    console.log(`========================================\n`)

  } catch (error) {
    console.error('Scheduled intelligence error:', error.message)
  }
}

const startScheduler = (intervalMinutes = 30) => {
  console.log(`⏰ Scheduler started — running every ${intervalMinutes} minutes`)
  
  // Run immediately on startup
  runScheduledIntelligence()
  
  // Then run every X minutes
  setInterval(runScheduledIntelligence, intervalMinutes * 60 * 1000)
}

module.exports = { startScheduler, runScheduledIntelligence }