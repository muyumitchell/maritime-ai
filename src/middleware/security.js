const rateLimit = require('express-rate-limit')
const helmet = require('helmet')

// General rate limiter — 100 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// Strict limiter for AI endpoints — 20 requests per 15 minutes
// AI calls are expensive so we protect them more
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'AI request limit reached. Please try again in 15 minutes.'
  },
  standardHeaders: true,
  legacyHeaders: false
})

// API Key authentication middleware
const requireApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key']

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key required. Include x-api-key in your request headers.'
    })
  }

  if (apiKey !== process.env.API_SECRET_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Invalid API key.'
    })
  }

  next()
}

module.exports = { generalLimiter, aiLimiter, requireApiKey, helmet }