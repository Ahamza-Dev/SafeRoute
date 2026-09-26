import { useState, useMemo } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { Thermometer, CloudRain, Wind, Clock, TrendingUp } from 'lucide-react'
import { Badge } from '@/components/ui'
import { getWmoWeatherDescription } from '@/lib/utils'

/**
 * Custom dark glassmorphic tooltip for the forecast chart.
 */
function ForecastCustomTooltip({
  active,
  payload,
  temperatureUnit = '°C',
  precipitationProbabilityUnit = '%',
  precipitationUnit = 'mm',
  windSpeedUnit = 'km/h',
}) {
  if (!active || !payload || !payload.length) {
    return null
  }

  const data = payload[0].payload
  if (!data) return null

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[190px] pointer-events-none z-50">
      <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 gap-2">
        <div className="flex items-center gap-1.5 font-semibold text-white">
          <Clock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
          <span>{data.fullTime}</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          {data.displayTime}
        </span>
      </div>

      <div className="text-[11px] font-medium text-cyan-300">
        {data.conditionDescription}
      </div>

      <div className="space-y-1 pt-0.5 text-slate-300 font-mono font-tabular text-[11px]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-amber-400">
            <Thermometer className="w-3 h-3" />
            Temp:
          </span>
          <span className="font-bold text-white">
            {data.temperature !== null && data.temperature !== undefined ? `${data.temperature} ${temperatureUnit}` : '—'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-indigo-400">
            <CloudRain className="w-3 h-3" />
            Rain Prob:
          </span>
          <span className="font-bold text-white">
            {data.precipitationProbability !== null ? `${data.precipitationProbability}${precipitationProbabilityUnit}` : `0${precipitationProbabilityUnit}`}
          </span>
        </div>

        {data.precipitation > 0 && (
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-blue-400">
              <CloudRain className="w-3 h-3" />
              Precip:
            </span>
            <span className="font-bold text-white">
              {data.precipitation} {precipitationUnit}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-teal-400">
            <Wind className="w-3 h-3" />
            Wind:
          </span>
          <span className="font-bold text-white">
            {data.windSpeed !== null ? `${data.windSpeed} ${windSpeedUnit}` : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

export function WeatherForecastChart({
  forecast,
  className = '',
}) {
  const [activeMetric, setActiveMetric] = useState('temperature') // 'temperature' | 'precipitationProbability'

  const temperatureUnit = forecast?.temperature_unit || '°C'
  const precipitationProbabilityUnit = forecast?.precipitation_probability_unit || '%'
  const precipitationUnit = forecast?.precipitation_unit || 'mm'
  const windSpeedUnit = forecast?.wind_speed_unit || 'km/h'

  const chartData = useMemo(() => {
    if (!forecast || !Array.isArray(forecast.time) || forecast.time.length === 0) {
      return []
    }

    return forecast.time.map((timeStr, idx) => {
      const temp = forecast.temperature?.[idx]
      const precipProb = forecast.precipitation_probability?.[idx] ?? 0
      const precip = forecast.precipitation?.[idx] ?? 0
      const windSpeed = forecast.wind_speed?.[idx] ?? 0
      const code = forecast.weather_code?.[idx]

      let displayTime = ''
      let fullTime = ''
      try {
        const date = new Date(timeStr)
        if (isNaN(date.getTime())) {
          displayTime = timeStr.slice(11, 16) || timeStr
          fullTime = timeStr
        } else {
          const hours = String(date.getHours()).padStart(2, '0')
          const minutes = String(date.getMinutes()).padStart(2, '0')
          displayTime = idx === 0 ? 'Now' : `${hours}:${minutes}`
          const dayName = date.toLocaleDateString([], { weekday: 'short' })
          fullTime = `${dayName} ${hours}:${minutes}`
        }
      } catch {
        displayTime = idx === 0 ? 'Now' : timeStr.slice(11, 16)
        fullTime = timeStr
      }

      return {
        index: idx,
        rawTime: timeStr,
        displayTime,
        fullTime,
        temperature: typeof temp === 'number' ? Number(temp.toFixed(1)) : null,
        precipitationProbability: precipProb,
        precipitation: precip,
        windSpeed: windSpeed,
        weatherCode: code,
        conditionDescription: getWmoWeatherDescription(code),
      }
    })
  }, [forecast])

  // Summary statistics
  const stats = useMemo(() => {
    if (!chartData.length) return null

    const validTemps = chartData
      .map((d) => d.temperature)
      .filter((t) => typeof t === 'number')

    const minTemp = validTemps.length ? Math.min(...validTemps) : null
    const maxTemp = validTemps.length ? Math.max(...validTemps) : null

    const maxPrecipProb = Math.max(
      ...chartData.map((d) => d.precipitationProbability || 0)
    )

    return {
      minTemp,
      maxTemp,
      maxPrecipProb,
      pointCount: chartData.length,
    }
  }, [chartData])

  if (!chartData.length) {
    return (
      <div className="py-6 text-center text-xs text-slate-500 rounded-lg bg-slate-950/40 border border-slate-800/80">
        Hourly atmospheric forecast data is currently unavailable.
      </div>
    )
  }

  // Calculate Y-axis domain padding
  const yDomain = activeMetric === 'temperature'
    ? [
        Math.floor((stats?.minTemp ?? 0) - 2),
        Math.ceil((stats?.maxTemp ?? 30) + 2),
      ]
    : [0, 100]

  return (
    <div
      className={`space-y-3 pt-3 border-t border-slate-800/80 ${className}`}
      aria-label="24-Hour hourly meteorological forecast trend"
    >
      {/* Section Header with Summary & Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span>24-Hour Forecast Trend</span>
          </div>
          {stats && (
            <Badge variant="secondary" size="sm" className="font-mono text-[10px]">
              {stats.pointCount}h Projection
            </Badge>
          )}
        </div>

        {/* Metric Switcher & Summary Badges */}
        <div className="flex items-center gap-1.5">
          <div className="inline-flex rounded-md p-0.5 bg-slate-950 border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveMetric('temperature')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                activeMetric === 'temperature'
                  ? 'bg-cyan-500/20 text-cyan-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-pressed={activeMetric === 'temperature'}
            >
              Temp ({temperatureUnit})
            </button>
            <button
              type="button"
              onClick={() => setActiveMetric('precipitationProbability')}
              className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                activeMetric === 'precipitationProbability'
                  ? 'bg-indigo-500/20 text-indigo-300 font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-pressed={activeMetric === 'precipitationProbability'}
            >
              Rain Prob ({precipitationProbabilityUnit})
            </button>
          </div>
        </div>
      </div>

      {/* Screen reader summary */}
      <div className="sr-only">
        {stats && (
          <p>
            24-hour hourly forecast. Temperature ranges from {stats.minTemp} {temperatureUnit} to {stats.maxTemp} {temperatureUnit}.
            Peak precipitation probability is {stats.maxPrecipProb} percent.
          </p>
        )}
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono font-tabular px-1">
        {stats?.minTemp !== null && stats?.maxTemp !== null && (
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Range:</span>
            <span className="text-slate-200 font-semibold">
              {stats.minTemp}{temperatureUnit} — {stats.maxTemp}{temperatureUnit}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="text-slate-500">Peak Rain Prob:</span>
          <span className={`font-semibold ${stats?.maxPrecipProb > 50 ? 'text-indigo-400' : 'text-slate-300'}`}>
            {stats?.maxPrecipProb}%
          </span>
        </div>
      </div>

      {/* Responsive Chart Canvas */}
      <div className="h-[175px] sm:h-[195px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          {activeMetric === 'temperature' ? (
            <AreaChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
            >
              <defs>
                <linearGradient id="temperatureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.06)"
                vertical={false}
              />

              <XAxis
                dataKey="displayTime"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                interval="preserveStartEnd"
                minTickGap={24}
              />

              <YAxis
                domain={yDomain}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={38}
                unit={temperatureUnit}
              />

              <Tooltip
                content={
                  <ForecastCustomTooltip
                    temperatureUnit={temperatureUnit}
                    precipitationProbabilityUnit={precipitationProbabilityUnit}
                    precipitationUnit={precipitationUnit}
                    windSpeedUnit={windSpeedUnit}
                  />
                }
              />

              <Area
                type="monotone"
                dataKey="temperature"
                stroke="#38bdf8"
                strokeWidth={2.2}
                fillOpacity={1}
                fill="url(#temperatureGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          ) : (
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255, 255, 255, 0.06)"
                vertical={false}
              />

              <XAxis
                dataKey="displayTime"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
                interval="preserveStartEnd"
                minTickGap={24}
              />

              <YAxis
                domain={[0, 100]}
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={38}
                unit={precipitationProbabilityUnit}
              />

              <Tooltip
                content={
                  <ForecastCustomTooltip
                    temperatureUnit={temperatureUnit}
                    precipitationProbabilityUnit={precipitationProbabilityUnit}
                    precipitationUnit={precipitationUnit}
                    windSpeedUnit={windSpeedUnit}
                  />
                }
              />

              <Bar
                dataKey="precipitationProbability"
                fill="#6366f1"
                radius={[3, 3, 0, 0]}
                isAnimationActive={false}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
