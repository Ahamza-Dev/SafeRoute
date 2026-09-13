# SafeRoute System Architecture

This document describes the high-level architecture, component responsibilities, data flow, and design boundaries of the SafeRoute platform.

---

## 1. High-Level Diagram

```
                  ┌─────────────────────────────────────────┐
                  │              CLIENT LAYER               │
                  │   React (Vite) + Leaflet / OSM Maps     │
                  └────────────────────┬────────────────────┘
                                       │ HTTP REST (JSON)
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │             APPLICATION LAYER           │
                  │              FastAPI (Python)           │
                  │  ┌───────────────────────────────────┐  │
                  │  │ • API Routing & Validation        │  │
                  │  │ • Orchestration & Data Aggregator │  │
                  │  │ • Deterministic Risk Engine       │  │
                  │  │ • In-Memory / DB Caching Layer    │  │
                  │  └─────────────────┬─────────────────┘  │
                  └────────────────────┼────────────────────┘
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 ▼                                           ▼
  ┌──────────────────────────────┐            ┌──────────────────────────────┐
  │     EXTERNAL DATA SOURCES    │            │       PERSISTENCE LAYER      │
  │ • Open-Meteo (Weather API)   │            │ • PostgreSQL (Future)        │
  │ • USGS (Earthquake GeoJSON)  │            │   (Cached queries, shelters, │
  │ • Geocoding (Nominatim/OSM)  │            │    user bookmarks, logs)     │
  └──────────────────────────────┘            └──────────────────────────────┘
                 │
                 ▼ (Future Phase)
  ┌──────────────────────────────┐
  │     AI EXPLANATION LAYER     │
  │ • LLM Natural Language Summary│
  │   (Interprets structured data│
  │    with strict safety guards)│
  └──────────────────────────────┘
```

---

## 2. Component Responsibilities

### A. Frontend (React + Vite)
- **Role:** Presentation and user interaction.
- **Responsibilities:**
  - Provides a search bar (city, address, coordinates) and interactive Leaflet map.
  - Renders risk score gauges, hazard factor breakdowns, and nearby resources.
  - Prominently displays safety disclaimers distinguishing prototype analytics from official government alerts.
- **Boundary:** Never contacts USGS or Open-Meteo directly; never calculates risk metrics on the client.

### B. Backend (FastAPI + Python)
- **Role:** API Gateway, aggregator, and computation engine.
- **Responsibilities:**
  - Validates all incoming requests via typed Pydantic models.
  - Asynchronously queries external data sources with non-blocking HTTP clients (`httpx`).
  - Implements the deterministic **Risk Engine** to produce normalized risk scores (0–100).
  - Handles external API failures, timeouts, and caching to protect rate limits.

### C. External Data Sources
- **Open-Meteo:** Keyless, high-resolution global weather forecasts (precipitation, wind, severe indices).
- **USGS (United States Geological Survey):** Real-time and historical global seismic data feeds.
- **Nominatim / OpenStreetMap:** Forward and reverse geocoding.

### D. Database Layer (PostgreSQL - Planned)
- **Role:** Persistent caching and reference data store.
- **Responsibilities:** Caching coordinate evaluations, managing emergency shelter points of interest (POI), and tracking historical queries.

### E. Map Layer (Leaflet + OpenStreetMap)
- **Role:** Spatial visualization.
- **Responsibilities:** Visualizing user location, seismic epicenters (with magnitude/depth radius rings), weather severity overlays, and evacuation/shelter pins.

### F. AI Explanation Layer (Future Phase)
- **Role:** Natural language synthesis and translation.
- **Boundary:** Takes the *already computed, structured JSON* from the Risk Engine and explains it in clear, non-technical language. The AI **never** calculates risk scores and **never** invents emergency declarations.

---

## 3. Data Lifecycle & Request Flow

1. **User Action:** User inputs a location or clicks on the Leaflet map in React.
2. **Request:** React sends `GET /api/v1/risk-assessment?lat={lat}&lon={lon}` to FastAPI.
3. **Validation:** FastAPI validates latitude/longitude boundaries.
4. **Aggregation:** FastAPI asynchronously dispatches requests to Open-Meteo and USGS.
5. **Computation:** The Risk Engine evaluates seismic proximity, precipitation, and wind thresholds to calculate an overall risk index and factor breakdown.
6. **Response:** FastAPI responds with structured JSON containing risk score, hazard details, emergency resources, and an official disclaimer.
7. **Rendering:** React updates the dashboard and plots map indicators.
