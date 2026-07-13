const swaggerJsdoc = require('swagger-jsdoc')

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Maritime AI Platform API',
      version: '1.0.0',
      description: `
# Maritime AI Platform

An AI-powered maritime fleet management system built by Mitchell Muyu.

## Features
- 🚢 **Live vessel tracking** via AIS stream
- 🤖 **AI-powered intelligence** using LLaMA 3.3 70B
- ⚠️  **Predictive maintenance alerts** with risk scoring
- 🌍 **Geofencing** with piracy zone detection
- 🌤️  **Live weather** at vessel coordinates
- ⛽ **Fuel analytics** with cost optimization
- 🗺️  **Route optimization** with GO/CAUTION/NO-GO ratings
- 📊 **Unified intelligence** endpoint for dashboards

## Authentication
Protected endpoints require an API key in the request header:
\`\`\`
x-api-key: your_api_key
\`\`\`

## Live URL
\`https://maritime-ai-production-8e3a.up.railway.app\`
      `,
      contact: {
        name: 'Mitchell Muyu',
        url: 'https://github.com/muyumitchell/maritime-ai'
      }
    },
    servers: [
      {
        url: 'https://maritime-ai-production-8e3a.up.railway.app',
        description: 'Production server'
      },
      {
        url: 'http://localhost:8080',
        description: 'Local development'
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key'
        }
      }
    }
  },
  apis: ['./src/swagger/*.js']
}

const swaggerSpec = swaggerJsdoc(options)
module.exports = swaggerSpec