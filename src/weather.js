const axios = require('axios')
require('dotenv').config()

const getMarineWeather = async (lat, lon) => {
  try {
    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/weather',
      {
        params: {
          lat,
          lon,
          appid: process.env.OPENWEATHER_API_KEY,
          units: 'metric'
        }
      }
    )

    const data = response.data

    return {
      location: data.name || 'At sea',
      temperature: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      wind_direction: data.wind.deg,
      weather: data.weather[0].description,
      visibility: data.visibility,
      pressure: data.main.pressure,
      risk_level: calculateWeatherRisk(data.wind.speed, data.visibility)
    }

  } catch (error) {
    console.error('Weather API error:', error.message)
    return null
  }
}

const calculateWeatherRisk = (windSpeed, visibility) => {
  // Wind speed in m/s — Beaufort scale reference
  // Visibility in metres
  let risk = 'low'

  if (windSpeed > 17) risk = 'high'        // Storm force winds
  else if (windSpeed > 10) risk = 'medium' // Strong winds
  
  if (visibility < 1000) risk = 'high'     // Poor visibility overrides

  return risk
}

module.exports = { getMarineWeather }