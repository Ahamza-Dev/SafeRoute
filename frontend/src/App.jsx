import { useState } from 'react'
import {
  Compass,
  Layers,
  MapPin,
  Activity,
  CloudSun,
  ShieldAlert,
} from 'lucide-react'
import { AppShell } from '@/components/layout'
import { Badge, Card } from '@/components/ui'

function App() {
  const [activeNav, setActiveNav] = useState('overview')

  return (
    <AppShell activeNav={activeNav} onNavChange={setActiveNav}>
      <div className="space-y-6">
        {/* Frame Identification Header */}
        <section aria-labelledby="frame-heading" className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 id="frame-heading" className="text-xl font-bold tracking-tight text-white">
              Situational Intelligence Workspace
            </h1>
            <Badge variant="info" size="sm">Shell Active</Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            SafeRoute application shell frame initialized. Designated structural frame prepared for location search,
            main dashboard telemetry, and interactive geospatial risk layers in subsequent milestones.
          </p>
        </section>

        {/* Structural Frame Placeholder Grid */}
        <div className="space-y-6">
          {/* Top Control Bar Slot (Target for Milestone 8C: Location & Search Experience) */}
          <Card
            variant="default"
            className="p-4 sm:p-5 border-dashed border-slate-700/60 bg-slate-900/40"
            aria-label="Location Search Container Placeholder"
          >
            <div className="flex items-center gap-3 text-slate-400">
              <div className="p-2 rounded-lg bg-slate-800/80 text-cyan-400 border border-slate-700/60">
                <MapPin className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Location Query & Coordinate Controls (Milestone 8C)
                </h2>
                <p className="text-xs text-slate-500">
                  Designated container for search experience, geocoding input, and coordinate filters.
                </p>
              </div>
            </div>
          </Card>

          {/* Primary Viewport & Dashboard Telemetry Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Geospatial Map Container Slot (Target for Milestone 8E: Interactive Map) */}
            <div className="lg:col-span-8">
              <Card
                variant="default"
                className="h-[420px] sm:h-[480px] flex flex-col items-center justify-center p-6 text-center border-dashed border-slate-700/60 bg-slate-900/30"
                aria-label="Interactive Map Viewport Placeholder"
              >
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3">
                  <Compass className="w-8 h-8" aria-hidden="true" />
                </div>
                <h2 className="text-sm font-semibold text-slate-200 tracking-wide mb-1">
                  Interactive Geospatial Map Viewport (Milestone 8E)
                </h2>
                <p className="text-xs text-slate-400 max-w-md leading-relaxed">
                  Designated mounting canvas for Leaflet interactive map, epicenter overlays,
                  and environmental hazard layers.
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <Badge variant="secondary" size="sm">Seismic Layer</Badge>
                  <Badge variant="secondary" size="sm">Weather Radar</Badge>
                  <Badge variant="secondary" size="sm">Risk Isoline Overlay</Badge>
                </div>
              </Card>
            </div>

            {/* Main Dashboard Telemetry Slot (Target for Milestone 8D: Main Dashboard) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Risk Assessment Card Slot */}
              <Card
                variant="default"
                className="p-4 border-dashed border-slate-700/60 bg-slate-900/30 space-y-2"
                aria-label="Composite Risk Index Placeholder"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <ShieldAlert className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  <span>Risk Assessment (Milestone 8D / 8H)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Designated container for deterministic composite risk index and weighted factor breakdown.
                </p>
              </Card>

              {/* Meteorological Telemetry Slot */}
              <Card
                variant="default"
                className="p-4 border-dashed border-slate-700/60 bg-slate-900/30 space-y-2"
                aria-label="Weather Telemetry Placeholder"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <CloudSun className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  <span>Weather Telemetry (Milestone 8D / 8F)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Designated container for atmospheric metrics, wind velocity, and precipitation conditions.
                </p>
              </Card>

              {/* Seismic Hazard Feed Slot */}
              <Card
                variant="default"
                className="p-4 border-dashed border-slate-700/60 bg-slate-900/30 space-y-2"
                aria-label="Seismic Hazard Telemetry Placeholder"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Activity className="w-4 h-4 text-orange-400" aria-hidden="true" />
                  <span>Seismic Telemetry (Milestone 8D / 8G)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Designated container for USGS earthquake feeds within search radius and magnitude classifications.
                </p>
              </Card>

              {/* Shell Structural Status Details */}
              <Card
                variant="default"
                className="p-4 border-dashed border-slate-700/60 bg-slate-900/30 space-y-2"
                aria-label="Architecture Status Placeholder"
              >
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Layers className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  <span>Application Shell (Milestone 8B)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Structural layout frame verified. Clean component boundaries established for layout and future features.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default App
