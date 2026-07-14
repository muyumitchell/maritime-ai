# 🚢 Maritime AI Platform

> An AI-powered maritime fleet management system with real-time vessel tracking, predictive maintenance alerts, geofencing, route optimization, and natural language intelligence.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://maritime-ai-production-8e3a.up.railway.app)
[![API Docs](https://img.shields.io/badge/API-Docs-blue)](https://maritime-ai-production-8e3a.up.railway.app/api/docs)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-black)](https://github.com/muyumitchell/maritime-ai)

---

## 🌐 Live Links

| Resource | URL |
|---------|-----|
| **Live API** | https://maritime-ai-production-8e3a.up.railway.app |
| **API Docs** | https://maritime-ai-production-8e3a.up.railway.app/api/docs |
| **GitHub** | https://github.com/muyumitchell/maritime-ai |

---

## 🧠 What It Does

Maritime AI Platform gives fleet managers, port operators, and shipping companies real-time intelligence about their vessels.

**Ask it anything in plain English:**
> *"Which vessels need urgent maintenance and why?"*
> *"Find the safest route from Mombasa to Aden"*
> *"Show me all vessels currently underway"*

The AI fetches real data from the database, reasons about it, and responds with specific, actionable answers.

---

## ✨ Features

- 🚢 **Live vessel tracking** — real-time AIS data stream, positions update automatically
- 🤖 **Natural language Q&A** — ask questions, AI queries the database and explains results
- ⚠️ **Predictive maintenance** — automated risk scoring (0-100) with AI recommendations
- 🌍 **Geofencing** — detects vessels entering piracy zones, port areas, restricted channels
- 🌤️ **Weather intelligence** — live marine weather at every vessel's GPS coordinates
- ⛽ **Fuel analytics** — cost analysis with projected annual savings
- 🗺️ **Route optimization** — GO / CAUTION / NO-GO ratings with piracy zone detection
- 📊 **Unified intelligence** — one endpoint combining everything for dashboard home screens
- 🔒 **Production security** — API key auth, rate limiting, helmet, centralized logging

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js 20 |
| **Framework** | Express.js |
| **Database** | PostgreSQL |
| **AI Model** | LLaMA 3.3 70B (Groq API) |
| **Real-time** | Socket.io + WebSocket |
| **AIS Data** | aisstream.io |
| **Weather** | OpenWeather API |
| **Security** | Helmet + express-rate-limit |
| **Docs** | Swagger / OpenAPI 3.0 |
| **Deployment** | Railway + Docker |

---

## 📡 API Endpoints (21 total)
GET  /api/vessels                 → All vessels
GET  /api/vessels/:id/maintenance → Maintenance history
POST /api/ask                     → Natural language Q&A 🔒
POST /api/query                   → Natural language to SQL
GET  /api/intelligence            → Unified intelligence report 🔒
GET  /api/alerts                  → AI risk predictions
GET  /api/logs/urgent             → Unacknowledged high risk alerts
GET  /api/weather/fleet           → Weather for entire fleet
GET  /api/zones/alerts            → Geofencing alerts
GET  /api/fleet/summary           → Fleet dashboard data
GET  /api/fuel/analytics          → Fuel cost analysis
POST /api/optimize/route          → Route optimization 🔒
GET  /api/docs                    → Interactive API documentation

---

## 👨‍💻 Built By

**Mitchell Muyu** — AI Engineer & Full-Stack Developer

- 🌍 Nairobi, Kenya
- 💼 [GitHub](https://github.com/muyumitchell)
- 🔗 [Portfolio](https://muyumitchell.github.io/Mitchell_muyu/)

---

*Built over 4 weeks as a portfolio project demonstrating AI engineering, data pipelines, geospatial intelligence, and production deployment.*