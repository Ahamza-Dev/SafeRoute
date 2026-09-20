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
import { LocationSearch, SelectedLocationCard } from '@/components/location'
import { Badge, Card } from '@/components/ui'

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isEditingLocation, setIsEditingLocation] = useState(false)

  const handleSelectLocation = (location) => {
    setSelectedLocation(location)
    setIsEditingLocation(false)
  }

  const handleClearLocation = () => {
    setSelectedLocation(null)
    setIsEditingLocation(false)
  }

  return (
    <AppShell activeNav="overview">
      <div className="space-y-6">
        {/* Workspace Identification Header */}
        <section aria-labelledby="workspace-heading" className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 id="workspace-heading" className="text-xl font-bold tracking-tight text-white">
              Situational Intelligence Workspace
            </h1>
            <Badge variant="info" size="sm">
              {selectedLocation ? 'Target Active' : 'Select Target'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Location-based disaster risk intelligence platform. Search and select a target location
            to prepare spatial query boundaries, meteorological telemetry, and seismic overlays.
          </p>
        </section>

        {/* Location Selection Section (Milestone 8C) */}
        <section aria-label="Location Selection Controls" className="space-y-4">
          {/* Active Target Card or Search Input */}
          {selectedLocation && !isEditingLocation ? (
            <SelectedLocationCard
              location={selectedLocation}
              onChangeLocation={() => setIsEditingLocation(true)}
              onClearLocation={handleClearLocation}
            />
          ) : (
            <Card variant="elevated" className="p-4 sm:p-5 border-slate-700/80 bg-slate-900/90">
              <LocationSearch
                onSelectLocation={handleSelectLocation}
                autoFocus={isEditingLocation}
                placeholder="Search global coordinates by city, region, or address (e.g. Tokyo, Islamabad, San Francisco)..."
              />
              {isEditingLocation && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingLocation(false)}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel and keep current target ({selectedLocation.name})
                  </button>
                </div>
              )}
            </Card>
          )}
        </section>

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
                {selectedLocation ? (
                  <>
                    Target locked for <span className="text-cyan-300 font-semibold">{selectedLocation.name}</span>{' '}
                    at <span className="font-mono text-slate-300 font-tabular">{selectedLocation.latitude.toFixed(4)}°, {selectedLocation.longitude.toFixed(4)}°</span>.
                    Interactive map, epicenter markers, and risk radius overlays will render here in Milestone 8E.
                  </>
                ) : (
                  'Search and select a target location above to activate coordinate bounds, seismic radii, and environmental map layers.'
                )}
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
            {/* Target Coordinate Telemetry Card */}
            <Card
              variant="default"
              className="p-4 border-dashed border-slate-700/60 bg-slate-900/30 space-y-2"
              aria-label="Target Coordinates State Placeholder"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <MapPin className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                <span>Target Coordinate State (Milestone 8C)</span>
              </div>
              <div className="text-xs text-slate-300 font-mono font-tabular">
                {selectedLocation ? (
                  <div className="space-y-1">
                    <p className="text-slate-200 font-semibold">{selectedLocation.display_name}</p>
                    <p className="text-cyan-400">
                      Lat: {selectedLocation.latitude.toFixed(6)} | Lon: {selectedLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">No target location selected.</p>
                )}
              </div>
            </Card>

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
                {selectedLocation
                  ? `Deterministic composite risk calculation prepared for ${selectedLocation.name}.`
                  : 'Awaiting target location selection...'}
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
                {selectedLocation
                  ? `Live Open-Meteo atmospheric metrics prepared for ${selectedLocation.name}.`
                  : 'Awaiting target location selection...'}
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
                {selectedLocation
                  ? `USGS 250km radius earthquake query prepared for ${selectedLocation.name}.`
                  : 'Awaiting target location selection...'}
              </p>
            </Card>

            {/* Architecture Status Details */}
            <Card
              variant="default"
              className="p-4 border-dashed border-slate-700/60 bg-slate-900/30 space-y-2"
              aria-label="Architecture Status Details"
            >
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Layers className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>Architecture Status (Milestone 8C)</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Location search state active. Selected coordinates ready for dashboard & map telemetry ingestion.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

export default App
