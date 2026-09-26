import { CloudRain, Wind, Thermometer, CloudSun, Compass } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, MetricDisplay, Badge } from '@/components/ui'
import { getWmoWeatherDescription } from '@/lib/utils'
import { WeatherForecastChart } from './WeatherForecastChart'

export function WeatherTelemetry({
  weather,
  loading = false,
}) {
  const hasData = Boolean(weather && Object.keys(weather).length > 0)

  return (
    <Card variant="default" className="overflow-hidden border-slate-700/80">
      <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-white">
            <CloudRain className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>Meteorological Telemetry</span>
          </CardTitle>
          <Badge variant="secondary" size="sm">Open-Meteo</Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {!hasData && !loading ? (
          <div className="flex items-start gap-3 p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400">
            <CloudRain className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">Meteorological Telemetry Unavailable</p>
              <p className="text-slate-400 leading-relaxed">
                Atmospheric readings and hourly forecasts are temporarily unavailable from Open-Meteo feeds.
                SafeRoute will evaluate other available environmental and seismic vectors.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Condition Banner */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 transition-all duration-200 hover:border-slate-700/80 hover:bg-slate-900/80">
              <div className="flex items-center gap-2.5">
                <CloudSun className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                <span className="text-xs font-semibold text-slate-200">
                  {getWmoWeatherDescription(weather?.weather_code)}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono font-tabular">
                WMO Code: {weather?.weather_code !== undefined && weather?.weather_code !== null ? weather.weather_code : '—'}
              </div>
            </div>

            {/* Metric Displays Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <MetricDisplay
                label="Temperature"
                value={weather?.temperature}
                unit={weather?.temperature_unit || '°C'}
                icon={Thermometer}
                iconColor="text-amber-400"
              />
              <MetricDisplay
                label="Sustained Wind"
                value={weather?.wind_speed}
                unit={weather?.wind_speed_unit || 'km/h'}
                icon={Wind}
                iconColor="text-cyan-400"
              />
              <MetricDisplay
                label="Peak Gusts"
                value={weather?.wind_gusts}
                unit={weather?.wind_gusts_unit || 'km/h'}
                icon={Compass}
                iconColor="text-teal-400"
              />
              <MetricDisplay
                label="Precipitation"
                value={weather?.precipitation}
                unit={weather?.precipitation_unit || 'mm'}
                icon={CloudRain}
                iconColor="text-blue-400"
              />
              <MetricDisplay
                label="Rain Probability"
                value={weather?.precipitation_probability}
                unit={weather?.precipitation_probability_unit || '%'}
                icon={CloudRain}
                iconColor="text-indigo-400"
              />
              <MetricDisplay
                label="Telemetry Status"
                value={hasData ? 'Active' : 'Awaiting'}
                icon={CloudSun}
                iconColor="text-emerald-400"
              />
            </div>

            {/* 24-Hour Hourly Forecast Visualization (Milestone 8F) */}
            <WeatherForecastChart forecast={weather?.hourly_forecast} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
