# SafeRoute 🛡️

**SafeRoute** is a disaster risk intelligence and emergency awareness platform designed to aggregate meteorological and seismic data, perform deterministic risk assessments, and present clear, map-based situational awareness to users.

> ⚠️ **IMPORTANT DISCLAIMER**
> **SafeRoute is an academic/prototype awareness platform and NOT an official emergency alert system.**
> It must never replace official communications from government authorities, national meteorological services, or emergency response agencies. Official alerts and warnings always supersede information presented by SafeRoute.

---

## 🏗️ Architecture & Core Components

SafeRoute follows a decoupled client-server architecture:

1. **Frontend (`frontend/`):** React.js + Vite + Leaflet / OpenStreetMap.
   - User input & coordinate selection.
   - Interactive map visualization (seismic epicenters, weather alerts, emergency resources).
   - Clear distinction between official emergency notices and prototype risk indicators.
2. **Backend (`backend/`):** Python + FastAPI.
   - REST API endpoints for risk evaluation.
   - Asynchronous data aggregation from external public data sources (**Open-Meteo**, **USGS**).
   - Deterministic, rule-based Risk Engine.
   - Resiliency, input validation (Pydantic), and caching.
3. **Database (Planned):** PostgreSQL for caching queries, points of interest, and emergency resources.
4. **Documentation (`docs/`):** Architectural specifications and milestone tracking.

---

## 📂 Project Structure

```
SafeRoute/
├── .gitignore          # Rules for files excluded from version control
├── README.md           # Project overview and instructions
├── backend/            # FastAPI backend service
├── frontend/           # React + Vite frontend application
└── docs/               # Architecture documents and milestone logs
```

---

## 🚀 Development Roadmap

Development proceeds in structured, verified milestones. See [docs/milestones.md](file:///c:/Users/amirh/Desktop/SafeRoute/docs/milestones.md) for full details.
