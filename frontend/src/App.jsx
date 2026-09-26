import { useState } from 'react'
import {
  MapPin,
  Shield,
  Activity,
  CloudRain,
} from 'lucide-react'
import { AppShell } from '@/components/layout'
import { LocationSearch } from '@/components/location'
import { Dashboard } from '@/components/dashboard'
import { Badge, Card } from '@/components/ui'

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [isEditingLocation, setIsEditingLocation] = useState(false)

  const handleSelectLocation = (location) => {
    setSelectedLocation(location)
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
              {selectedLocation ? 'Telemetry Active' : 'Select Target'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
            Disaster risk intelligence and environmental awareness platform. Evaluates
            meteorological parameters, regional seismic activity, and deterministic risk indices.
          </p>
        </section>

        {/* Location Selection Controls */}
        <section aria-label="Location Selection Controls" className="space-y-4">
          {(!selectedLocation || isEditingLocation) && (
            <Card variant="elevated" className="p-4 sm:p-5 border-slate-700/80 bg-slate-900/90">
              <LocationSearch
                onSelectLocation={handleSelectLocation}
                autoFocus={isEditingLocation}
                placeholder="Search global coordinates by city, region, or address (e.g. Tokyo, Islamabad, San Francisco)..."
              />
              {isEditingLocation && selectedLocation && (
                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditingLocation(false)}
                    className="text-xs text-slate-400 hover:text-slate-200 transition-all duration-150 active:scale-95 cursor-pointer"
                  >
                    Cancel and keep current target ({selectedLocation.name})
                  </button>
                </div>
              )}
            </Card>
          )}
        </section>

        {/* Dashboard or Initial State */}
        {selectedLocation ? (
          <Dashboard
            location={selectedLocation}
            onChangeLocation={() => setIsEditingLocation(true)}
          />
        ) : (
          /* Empty / Initial Prompt State */
          <Card
            variant="default"
            className="p-8 sm:p-12 text-center border-dashed border-slate-700/80 bg-slate-900/30 space-y-4 animate-fade-in"
          >
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 w-fit mx-auto transition-transform duration-300 hover:scale-105">
              <MapPin className="w-8 h-8" aria-hidden="true" />
            </div>

            <div className="space-y-1 max-w-md mx-auto">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                No Target Location Selected
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Search and select a city or coordinate location above to initialize meteorological telemetry,
                USGS seismic feeds, and deterministic situational risk scoring.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto pt-2 text-left">
              <div className="group p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/70 hover:shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
                  <CloudRain className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
                  <span>Open-Meteo</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Atmospheric metrics, wind velocity, and precipitation conditions.
                </p>
              </div>

              <div className="group p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/70 hover:shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
                  <Activity className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
                  <span>USGS Feeds</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Seismic events (M ≥ 3.0) within a 250km radius over the past 30 days.
                </p>
              </div>

              <div className="group p-3 rounded-lg bg-slate-950/60 border border-slate-800 space-y-1 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900/70 hover:shadow-xs">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <Shield className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
                  <span>Risk Model</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                  Deterministic weighted composite scoring (0–100 index).
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  )
}

export default App
