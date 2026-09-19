import { useEffect, useState } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  MapPin,
  RefreshCw,
  Shield,
  Wind,
} from 'lucide-react'
import { fetchLocationData } from './services/api'

function App() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const TEST_LATITUDE = 34.91
  const TEST_LONGITUDE = 73.65

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchLocationData(TEST_LATITUDE, TEST_LONGITUDE)
      setData(result)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred while connecting to SafeRoute backend.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const getRiskBadgeColor = (level) => {
    switch (level) {
      case 'High':
        return 'bg-red-500/10 text-red-400 border-red-500/30'
      case 'Elevated':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
      case 'Moderate':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
      default:
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full space-y-6">
        {/* Header */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                SafeRoute Data Integration
              </h1>
              <p className="text-xs text-slate-400">
                Live Backend Verification: React (Port 5173) ⇄ FastAPI (Port 8001)
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </header>

        {/* Loading State */}
        {loading && (
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-300">Fetching live location data from backend...</p>
            <p className="text-xs text-slate-500">Connecting to http://127.0.0.1:8001/api/location</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-red-400 font-semibold text-sm">
              <AlertCircle className="w-5 h-5" />
              Failed to connect to backend
            </div>
            <p className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg font-mono border border-slate-800">
              {error}
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <span>Make sure FastAPI is running on port 8001 with CORS enabled.</span>
            </div>
          </div>
        )}

        {/* Success / Real Data Render */}
        {!loading && !error && data && (
          <div className="space-y-6">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location Card */}
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  Target Coordinates
                </div>
                <div className="text-lg font-bold text-white">
                  {data.location?.latitude}° N, {data.location?.longitude}° E
                </div>
                <div className="text-xs text-slate-500">Validated Input Coordinates</div>
              </div>

              {/* Overall Risk Card */}
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Overall Risk Score
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getRiskBadgeColor(data.risk_assessment?.overall_level)}`}>
                    {data.risk_assessment?.overall_level}
                  </span>
                </div>
                <div className="text-2xl font-bold text-white">
                  {data.risk_assessment?.overall_score} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
                <div className="text-xs text-slate-500">Deterministic Composite Index</div>
              </div>

              {/* Seismic Events Card */}
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Activity className="w-4 h-4 text-orange-400" />
                  Recent Earthquakes
                </div>
                <div className="text-lg font-bold text-white">
                  {data.earthquakes?.events?.length || 0} Events
                </div>
                <div className="text-xs text-slate-500">
                  Within {data.earthquakes?.search_radius_km || 250} km (Past 30 Days)
                </div>
              </div>
            </div>

            {/* Weather Metrics Grid */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-white">
                <CloudRain className="w-4 h-4 text-cyan-400" />
                Live Meteorological Conditions (Open-Meteo)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-xs text-slate-400">Temperature</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {data.weather?.temperature} {data.weather?.temperature_unit}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-xs text-slate-400">Wind Speed</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {data.weather?.wind_speed} {data.weather?.wind_speed_unit}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-xs text-slate-400">Wind Gusts</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {data.weather?.wind_gusts} {data.weather?.wind_gusts_unit}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-xs text-slate-400">Precipitation</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {data.weather?.precipitation} {data.weather?.precipitation_unit}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-xs text-slate-400">Rain Probability</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {data.weather?.precipitation_probability} {data.weather?.precipitation_probability_unit}
                  </div>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                  <div className="text-xs text-slate-400">WMO Code</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {data.weather?.weather_code}
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Factor Breakdown */}
            <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Deterministic Risk Factors Breakdown
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Earthquake (40%)</span>
                    <span className="font-bold text-white">{data.risk_assessment?.factors?.earthquake?.score} / 100</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {data.risk_assessment?.factors?.earthquake?.explanation}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Wind (25%)</span>
                    <span className="font-bold text-white">{data.risk_assessment?.factors?.wind?.score} / 100</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {data.risk_assessment?.factors?.wind?.explanation}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Precipitation (20%)</span>
                    <span className="font-bold text-white">{data.risk_assessment?.factors?.precipitation?.score} / 100</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {data.risk_assessment?.factors?.precipitation?.explanation}
                  </p>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Severe Weather (15%)</span>
                    <span className="font-bold text-white">{data.risk_assessment?.factors?.severe_weather?.score} / 100</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {data.risk_assessment?.factors?.severe_weather?.explanation}
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer Banner */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-semibold text-amber-300">Prototype Disclaimer Notice</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {data.risk_assessment?.disclaimer || "SafeRoute is an academic/prototype awareness platform and NOT an official emergency alert system."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default App
