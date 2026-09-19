import { useEffect, useState } from 'react'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  CloudRain,
  MapPin,
  RefreshCw,
  Shield,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  MetricDisplay,
  RiskBadge,
} from '@/components/ui'
import { fetchLocationData } from '@/services/api'

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
    let ignore = false
    async function init() {
      try {
        const result = await fetchLocationData(TEST_LATITUDE, TEST_LONGITUDE)
        if (!ignore) {
          setData(result)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'An unexpected error occurred while connecting to SafeRoute backend.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }
    init()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-[var(--bg-app)] text-slate-100 p-4 md:p-8 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full space-y-6">
        {/* Header with Design System Branding */}
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  SafeRoute Data Integration
                </h1>
                <Badge variant="info" size="sm">Milestone 8B</Badge>
              </div>
              <p className="text-xs text-slate-400">
                Design System Foundation ⇄ Live Backend Verification (Port 8001)
              </p>
            </div>
          </div>
          <Button
            onClick={loadData}
            disabled={loading}
            variant="secondary"
            size="md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
        </header>

        {/* Loading State */}
        {loading && (
          <Card variant="glass" className="p-12 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm font-medium text-slate-300">Fetching live location data from backend...</p>
            <p className="text-xs text-slate-500">Connecting to http://127.0.0.1:8001/api/location</p>
          </Card>
        )}

        {/* Error State */}
        {!loading && error && (
          <Card variant="default" className="border-red-500/30 bg-red-500/10 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-red-400 font-semibold text-sm">
              <AlertCircle className="w-5 h-5" />
              Failed to connect to backend
            </div>
            <p className="text-xs text-slate-300 bg-slate-950/80 p-3 rounded-lg font-mono border border-slate-800">
              {error}
            </p>
            <div className="text-xs text-slate-400">
              Make sure FastAPI is running on port 8001 with CORS enabled.
            </div>
          </Card>
        )}

        {/* Success / Real Data Render */}
        {!loading && !error && data && (
          <div className="space-y-6">
            {/* Top Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Location Card */}
              <Card variant="elevated" className="p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  Target Coordinates
                </div>
                <div className="text-lg font-bold text-white font-tabular">
                  {data.location?.latitude}° N, {data.location?.longitude}° E
                </div>
                <div className="text-xs text-slate-500">Validated Input Coordinates</div>
              </Card>

              {/* Overall Risk Card */}
              <Card variant="elevated" className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <Activity className="w-4 h-4 text-amber-400" />
                    Overall Risk Score
                  </span>
                  <RiskBadge level={data.risk_assessment?.overall_level || 'Low'} />
                </div>
                <div className="text-2xl font-bold text-white font-tabular">
                  {data.risk_assessment?.overall_score} <span className="text-sm font-normal text-slate-400">/ 100</span>
                </div>
                <div className="text-xs text-slate-500">Deterministic Composite Index</div>
              </Card>

              {/* Seismic Events Card */}
              <Card variant="elevated" className="p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <Activity className="w-4 h-4 text-orange-400" />
                  Recent Earthquakes
                </div>
                <div className="text-lg font-bold text-white font-tabular">
                  {data.earthquakes?.events?.length || 0} Events
                </div>
                <div className="text-xs text-slate-500">
                  Within {data.earthquakes?.search_radius_km || 250} km (Past 30 Days)
                </div>
              </Card>
            </div>

            {/* Weather Metrics Grid using MetricDisplay Primitives */}
            <Card variant="default">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white">
                  <CloudRain className="w-4 h-4 text-cyan-400" />
                  Live Meteorological Conditions (Open-Meteo)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <MetricDisplay
                    label="Temperature"
                    value={data.weather?.temperature}
                    unit={data.weather?.temperature_unit}
                  />
                  <MetricDisplay
                    label="Wind Speed"
                    value={data.weather?.wind_speed}
                    unit={data.weather?.wind_speed_unit}
                  />
                  <MetricDisplay
                    label="Wind Gusts"
                    value={data.weather?.wind_gusts}
                    unit={data.weather?.wind_gusts_unit}
                  />
                  <MetricDisplay
                    label="Precipitation"
                    value={data.weather?.precipitation}
                    unit={data.weather?.precipitation_unit}
                  />
                  <MetricDisplay
                    label="Rain Prob."
                    value={data.weather?.precipitation_probability}
                    unit={data.weather?.precipitation_probability_unit}
                  />
                  <MetricDisplay
                    label="WMO Code"
                    value={data.weather?.weather_code}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Risk Factor Breakdown */}
            <Card variant="default">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  Deterministic Risk Factors Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-tabular">
                      <span>Earthquake (40%)</span>
                      <span className="font-bold text-white">{data.risk_assessment?.factors?.earthquake?.score} / 100</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {data.risk_assessment?.factors?.earthquake?.explanation}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-tabular">
                      <span>Wind (25%)</span>
                      <span className="font-bold text-white">{data.risk_assessment?.factors?.wind?.score} / 100</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {data.risk_assessment?.factors?.wind?.explanation}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-tabular">
                      <span>Precipitation (20%)</span>
                      <span className="font-bold text-white">{data.risk_assessment?.factors?.precipitation?.score} / 100</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {data.risk_assessment?.factors?.precipitation?.explanation}
                    </p>
                  </div>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-tabular">
                      <span>Severe Weather (15%)</span>
                      <span className="font-bold text-white">{data.risk_assessment?.factors?.severe_weather?.score} / 100</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {data.risk_assessment?.factors?.severe_weather?.explanation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimer Banner */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-semibold text-amber-300">Prototype Disclaimer Notice</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {data.risk_assessment?.disclaimer || 'SafeRoute is an academic/prototype awareness platform and NOT an official emergency alert system.'}
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
