const pool = require('./db/index')
const { askMaritime } = require('./ai')

// Haversine formula — calculates distance between two GPS coordinates
// Returns distance in kilometres
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371 // Earth's radius in kilometres
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

const checkVesselZones = async (vessel) => {
  try {
    // Get all active zones
    const zones = await pool.query('SELECT * FROM zones WHERE active = true')
    
    const zoneAlerts = []

    for (const zone of zones.rows) {
      const distance = calculateDistance(
        parseFloat(vessel.lat),
        parseFloat(vessel.lon),
        parseFloat(zone.center_lat),
        parseFloat(zone.center_lon)
      )

      // Check if vessel is inside this zone
      if (distance <= zone.radius_km) {
        // Ask AI to explain what this means
        const explanation = await askMaritime(
          `Vessel ${vessel.name} has entered the ${zone.name} (${zone.type} zone, risk: ${zone.risk_level}). 
           Distance from zone center: ${distance.toFixed(2)}km.
           Zone description: ${zone.description}
           In 2 sentences, explain what this means and what action to take.`,
          { vessel, zone }
        )

        zoneAlerts.push({
          vessel_id: vessel.id,
          vessel_name: vessel.name,
          zone_id: zone.id,
          zone_name: zone.name,
          zone_type: zone.type,
          risk_level: zone.risk_level,
          distance_from_center_km: parseFloat(distance.toFixed(2)),
          explanation,
          detected_at: new Date().toISOString()
        })
      }
    }

    return zoneAlerts

  } catch (error) {
    console.error('Geofence error:', error.message)
    throw error
  }
}

const checkFleetZones = async () => {
  try {
    const vessels = await pool.query('SELECT * FROM vessels')
    const allAlerts = []

    for (const vessel of vessels.rows) {
      const vesselAlerts = await checkVesselZones(vessel)
      allAlerts.push(...vesselAlerts)
    }

    return allAlerts

  } catch (error) {
    console.error('Fleet geofence error:', error.message)
    throw error
  }
}

module.exports = { checkVesselZones, checkFleetZones, calculateDistance }