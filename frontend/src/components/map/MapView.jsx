import { useRef, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, CircleMarker, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Compass, MapPin, Activity, Clock } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { formatCoordinates, calculateHaversineDistance, cn } from '@/lib/utils'

/**
 * Custom vector icon for the selected location target.
 * Completely immune to asset bundling path issues in Vite.
 */
function createSelectedLocationIcon() {
  return L.divIcon({
    className: 'custom-selected-pin',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 32px; height: 32px;">
        <div style="position: absolute; width: 32px; height: 32px; border-radius: 50%; background: rgba(14, 165, 233, 0.3); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: #0ea5e9; border: 2.5px solid #ffffff; box-shadow: 0 0 14px rgba(14, 165, 233, 0.8), 0 2px 6px rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #060913;"></div>
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  })
}

/**
 * Format ISO timestamp into human-readable UTC string.
 */
function formatEventTime(isoString) {
  if (!isoString) return null
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    return d.toUTCString().replace('GMT', 'UTC')
  } catch {
    return isoString
  }
}

/**
 * Color and border styling based on earthquake magnitude.
 */
function getEarthquakeMarkerStyle(mag) {
  if (mag >= 5.0) {
    return {
      color: '#f87171',
      fillColor: '#ef4444',
      fillOpacity: 0.85,
      weight: 2,
    }
  }
  if (mag >= 4.0) {
    return {
      color: '#fb923c',
      fillColor: '#f97316',
      fillOpacity: 0.8,
      weight: 1.5,
    }
  }
  return {
    color: '#facc15',
    fillColor: '#eab308',
    fillOpacity: 0.75,
    weight: 1.5,
  }
}

/**
 * Synchronizes map viewport when coordinates change without interfering
 * with manual user pan/zoom exploration.
 */
function MapRecenter({ center, zoom = 11 }) {
  const map = useMap()
  const prevCenterRef = useRef(center)

  useEffect(() => {
    if (!center || typeof center[0] !== 'number' || typeof center[1] !== 'number') return
    const [prevLat, prevLon] = prevCenterRef.current || []
    const [lat, lon] = center

    if (prevLat !== lat || prevLon !== lon) {
      prevCenterRef.current = center
      map.flyTo(center, zoom, {
        duration: 1.2,
        easeLinearity: 0.25,
      })
    }
  }, [center, zoom, map])

  return null
}

export function MapView({
  location,
  earthquakes,
  zoom = 11,
}) {
  const markerIcon = useMemo(() => createSelectedLocationIcon(), [])

  // Safely extract and validate earthquake events from telemetry payload
  const validEarthquakes = useMemo(() => {
    if (!earthquakes || earthquakes.status === 'unavailable' || !Array.isArray(earthquakes.events)) {
      return []
    }
    return earthquakes.events.filter((e) => {
      if (!e || typeof e !== 'object') return false
      const lat = e.latitude
      const lon = e.longitude
      return (
        typeof lat === 'number' &&
        typeof lon === 'number' &&
        !isNaN(lat) &&
        !isNaN(lon) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180
      )
    })
  }, [earthquakes])

  if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
    return (
      <Card variant="default" className="overflow-hidden border-slate-700/80">
        <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/40">
          <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            <span>Geospatial Map Viewport</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center text-xs text-slate-500">
          Geospatial coordinates are unavailable for map rendering.
        </CardContent>
      </Card>
    )
  }

  const centerCoordinates = [location.latitude, location.longitude]
  const parts = location.display_name ? location.display_name.split(',').map((p) => p.trim()) : []
  const primaryName = location.name || parts[0] || 'Target Location'
  const secondaryContext = parts.length > 1
    ? parts.slice(1, 3).join(', ')
    : location.display_name || ''

  return (
    <Card variant="default" className="overflow-hidden border-slate-700/80">
      <CardHeader className="pb-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>Geospatial Map Viewport</span>
            </CardTitle>
            <Badge variant="secondary" size="sm">250 km Monitoring Zone</Badge>
            {validEarthquakes.length > 0 && (
              <Badge variant="warning" size="sm">
                {validEarthquakes.length} Seismic Event{validEarthquakes.length === 1 ? '' : 's'}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono font-tabular">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span>{formatCoordinates(location.latitude, location.longitude)}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="h-[320px] sm:h-[400px] md:h-[460px] w-full relative">
          <MapContainer
            center={centerCoordinates}
            zoom={zoom}
            scrollWheelZoom={true}
            className="h-full w-full"
            aria-label={`Geospatial map centered on ${primaryName} with 250km seismic monitoring perimeter`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            <MapRecenter center={centerCoordinates} zoom={zoom} />

            {/* 250 km USGS Seismic Search & Monitoring Radius Perimeter (250,000 meters) */}
            <Circle
              center={centerCoordinates}
              radius={250000}
              pathOptions={{
                color: '#0ea5e9',
                fillColor: '#0ea5e9',
                fillOpacity: 0.04,
                weight: 1.5,
                dashArray: '6, 6',
              }}
            />

            {/* Recent Earthquake Epicenter Markers with Magnitude Visual Scaling */}
            {validEarthquakes.map((event) => {
              const mag = typeof event.magnitude === 'number' && !isNaN(event.magnitude) ? event.magnitude : 3.0
              const markerRadius = Math.max(5, Math.min(14, 5 + (mag - 3) * 2.5))
              const style = getEarthquakeMarkerStyle(mag)
              const distKm =
                typeof event.distance_km === 'number' && !isNaN(event.distance_km)
                  ? event.distance_km
                  : calculateHaversineDistance(location.latitude, location.longitude, event.latitude, event.longitude)
              const formattedTime = formatEventTime(event.time)
              const eventKey = event.id || `eq-${event.latitude}-${event.longitude}-${event.time || ''}`

              return (
                <CircleMarker
                  key={eventKey}
                  center={[event.latitude, event.longitude]}
                  radius={markerRadius}
                  pathOptions={style}
                >
                  <Popup>
                    <div className="p-1 space-y-1.5 text-slate-100 min-w-[200px]">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-700/60 pb-1">
                        <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-orange-400">
                          <Activity className="w-3.5 h-3.5 text-orange-400" aria-hidden="true" />
                          <span>Seismic Event</span>
                        </span>
                        <span
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[10px] font-bold font-tabular border',
                            mag >= 5.0
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : mag >= 4.0
                              ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          )}
                        >
                          M {mag.toFixed(1)}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-white leading-tight">
                        {event.place || 'Seismic Event'}
                      </div>

                      <div className="space-y-0.5 text-[11px] text-slate-300 font-mono font-tabular pt-0.5">
                        {distKm !== null && distKm !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Distance:</span>
                            <span className="font-semibold text-slate-200">{distKm} km from target</span>
                          </div>
                        )}
                        {typeof event.depth_km === 'number' && !isNaN(event.depth_km) && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Focal Depth:</span>
                            <span className="font-semibold text-slate-200">{event.depth_km} km</span>
                          </div>
                        )}
                        {formattedTime && (
                          <div className="flex items-center gap-1 pt-1 border-t border-slate-700/60 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{formattedTime}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Popup>
                </CircleMarker>
              )
            })}

            {/* Selected Location Target Pin Marker */}
            <Marker position={centerCoordinates} icon={markerIcon}>
              <Popup>
                <div className="p-1 space-y-1 text-slate-100 min-w-[180px]">
                  <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Target Location</span>
                  </div>
                  <div className="text-sm font-bold text-white">
                    {primaryName}
                  </div>
                  {secondaryContext && (
                    <div className="text-xs text-slate-300">
                      {secondaryContext}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400 font-mono font-tabular pt-1 border-t border-slate-700/60">
                    {formatCoordinates(location.latitude, location.longitude)}
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}
