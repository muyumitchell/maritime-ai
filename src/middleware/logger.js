const winston = require('winston')
const morgan = require('morgan')
const path = require('path')

// Create logs directory if it doesn't exist
const fs = require('fs')
const logsDir = path.join(process.cwd(), 'logs')
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir)
}

// Winston logger — saves logs to files and console
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Save all errors to error.log
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error'
    }),
    // Save all logs to combined.log
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log')
    }),
    // Also print to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
})

// Morgan HTTP request logger
const httpLogger = morgan((tokens, req, res) => {
  const log = {
    method: tokens.method(req, res),
    url: tokens.url(req, res).split('?')[0], // Strip query parameters
    status: tokens.status(req, res),
    responseTime: `${tokens['response-time'](req, res)}ms`,
    timestamp: new Date().toISOString()
  }
  
  // Log errors separately
  if (parseInt(tokens.status(req, res)) >= 400) {
    logger.error('HTTP Error', log)
  } else {
    logger.info('HTTP Request', log)
  }

  return null // Don't print to stdout — winston handles it
})

// Centralized error handler middleware
const errorHandler = (err, req, res, next) => {
  logger.error('Unhandled error', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  // Don't expose internal errors to users
  const statusCode = err.statusCode || 500
  const message = statusCode === 500
    ? 'An internal server error occurred. Our team has been notified.'
    : err.message

  res.status(statusCode).json({
    success: false,
    message,
    timestamp: new Date().toISOString()
  })
}

// Not found handler
const notFoundHandler = (req, res) => {
  logger.warn('Route not found', {
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  })

  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`,
    timestamp: new Date().toISOString()
  })
}

module.exports = { logger, httpLogger, errorHandler, notFoundHandler }