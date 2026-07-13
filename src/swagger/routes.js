/**
 * @swagger
 * /api/vessels:
 *   get:
 *     summary: Get all vessels
 *     description: Returns all vessels currently tracked in the system
 *     tags: [Vessels]
 *     responses:
 *       200:
 *         description: List of all vessels
 *
 * /api/vessels/{id}:
 *   get:
 *     summary: Get single vessel
 *     tags: [Vessels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vessel details
 *       404:
 *         description: Vessel not found
 *
 * /api/vessels/{id}/maintenance:
 *   get:
 *     summary: Get vessel maintenance history
 *     tags: [Vessels]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Maintenance records for vessel
 *
 * /api/alerts:
 *   get:
 *     summary: Get fleet risk alerts
 *     description: AI-generated maintenance risk alerts for all vessels
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: Risk alerts with AI recommendations
 *
 * /api/logs:
 *   get:
 *     summary: Get alerts history log
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: Historical alerts log
 *
 * /api/logs/urgent:
 *   get:
 *     summary: Get unacknowledged high risk alerts
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: Urgent unacknowledged alerts
 *
 * /api/logs/{id}/acknowledge:
 *   patch:
 *     summary: Acknowledge an alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Alert acknowledged
 *
 * /api/weather/vessel/{id}:
 *   get:
 *     summary: Get weather at vessel position
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Live weather at vessel coordinates
 *
 * /api/weather/fleet:
 *   get:
 *     summary: Get weather for entire fleet
 *     tags: [Weather]
 *     responses:
 *       200:
 *         description: Weather conditions for all vessels
 *
 * /api/zones:
 *   get:
 *     summary: Get all maritime zones
 *     tags: [Zones]
 *     responses:
 *       200:
 *         description: All active maritime zones
 *
 * /api/zones/alerts:
 *   get:
 *     summary: Get zone alerts for fleet
 *     tags: [Zones]
 *     responses:
 *       200:
 *         description: Zone entry alerts for all vessels
 *
 * /api/zones/vessel/{id}:
 *   get:
 *     summary: Get zone alerts for specific vessel
 *     tags: [Zones]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Zone alerts for vessel
 *
 * /api/ask:
 *   post:
 *     summary: Ask AI a question in plain English
 *     description: Natural language Q&A about your fleet
 *     tags: [AI]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: Which vessels need urgent maintenance?
 *     responses:
 *       200:
 *         description: AI answer with reasoning
 *       401:
 *         description: API key required
 *
 * /api/query:
 *   post:
 *     summary: Natural language to SQL query
 *     description: Ask questions that get translated to database queries
 *     tags: [AI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 example: Show me all vessels at anchor
 *     responses:
 *       200:
 *         description: Query results with SQL and AI explanation
 *
 * /api/intelligence:
 *   get:
 *     summary: Get unified fleet intelligence report
 *     description: Complete operational picture combining all data sources
 *     tags: [AI]
 *     security:
 *       - ApiKeyAuth: []
 *     responses:
 *       200:
 *         description: Full intelligence report with AI briefing
 *       401:
 *         description: API key required
 *
 * /api/fleet/summary:
 *   get:
 *     summary: Get fleet summary
 *     tags: [Fleet]
 *     responses:
 *       200:
 *         description: Fleet overview with AI executive summary
 *
 * /api/fuel/analytics:
 *   get:
 *     summary: Get fleet fuel analytics
 *     tags: [Fleet]
 *     responses:
 *       200:
 *         description: Fuel consumption analytics with AI insights
 *
 * /api/fuel/vessel/{id}:
 *   get:
 *     summary: Get fuel report for specific vessel
 *     tags: [Fleet]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Vessel fuel consumption report
 *
 * /api/optimize/ports:
 *   get:
 *     summary: Get available ports
 *     tags: [Route Optimization]
 *     responses:
 *       200:
 *         description: List of available ports with coordinates
 *
 * /api/optimize/route:
 *   post:
 *     summary: Optimize route between two ports
 *     description: AI route optimization with weather and piracy zone analysis
 *     tags: [Route Optimization]
 *     security:
 *       - ApiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               origin:
 *                 type: string
 *                 example: mombasa
 *               destination:
 *                 type: string
 *                 example: dar es salaam
 *     responses:
 *       200:
 *         description: Route recommendation with GO/CAUTION/NO-GO rating
 *       401:
 *         description: API key required
 */