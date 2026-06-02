const express = require('express')
const router = express.Router()

const mockVessels = [
  {
    id: 1,
    name: 'MV Mombasa Star',
    mmsi: '636092123',
    type: 'Cargo',
    lat: -4.0435,
    lon: 39.6682,
    speed: 12.4,
    status: 'Underway',
    last_seen: new Date().toISOString()
  },
  {
    id: 2,
    name: 'MT Indian Pioneer',
    mmsi: '636091045',
    type: 'Tanker',
    lat: -1.2921,
    lon: 36.8219,
    speed: 0,
    status: 'At anchor',
    last_seen: new Date().toISOString()
  }
]

router.get('/', (req, res) => {
  res.json({
    success: true,
    count: mockVessels.length,
    vessels: mockVessels
  })
})

router.get('/:id', (req, res) => {
  const vessel = mockVessels.find(v => v.id === parseInt(req.params.id))
  if (!vessel) {
    return res.status(404).json({ success: false, message: 'Vessel not found' })
  }
  res.json({ success: true, vessel })
})

module.exports = router