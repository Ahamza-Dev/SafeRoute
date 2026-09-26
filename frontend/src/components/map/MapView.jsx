import { useRef, useEffect, useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Compass, MapPin } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui'
import { formatCoordinates } from '@/lib/utils'

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
  zoom = 11,
}) {
  const markerIcon = useMemo(() => createSelectedLocationIcon(), [])

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
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>Geospatial Map Viewport</span>
            </CardTitle>
            <Badge variant="secondary" size="sm">OpenStreetMap Base</Badge>
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
            aria-label={`Geospatial map centered on ${primaryName}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            <MapRecenter center={centerCoordinates} zoom={zoom} />

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
