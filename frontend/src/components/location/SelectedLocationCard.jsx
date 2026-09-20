import { MapPin, Navigation, X, RefreshCw } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

/**
 * Format latitude and longitude coordinates into human-readable cardinal notation.
 */
function formatCoordinates(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return '—'
  const latDir = lat >= 0 ? 'N' : 'S'
  const lonDir = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`
}

export function SelectedLocationCard({
  location,
  onChangeLocation,
  onClearLocation,
  className,
}) {
  if (!location) return null

  const parts = location.display_name ? location.display_name.split(',').map((p) => p.trim()) : []
  const primaryName = location.name || parts[0] || 'Selected Target'
  const secondaryContext = parts.length > 1
    ? parts.slice(1).join(', ')
    : location.display_name || ''

  return (
    <Card
      variant="elevated"
      className={cn(
        'p-4 sm:p-5 border-cyan-500/30 bg-gradient-to-r from-slate-900/95 via-slate-900/90 to-cyan-950/20',
        className
      )}
      aria-label="Active Selected Target Location"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Location Identity */}
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
            <Navigation className="w-5 h-5" aria-hidden="true" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                Active Target Area
              </span>
              <Badge variant="info" size="sm">Selected</Badge>
              {location.source && (
                <span className="text-[10px] text-slate-400 font-mono">
                  via {location.source}
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
              {primaryName}
            </h2>

            {secondaryContext && (
              <p className="text-xs text-slate-400 line-clamp-1 leading-relaxed">
                {secondaryContext}
              </p>
            )}
          </div>
        </div>

        {/* Coordinates and Actions */}
        <div className="flex flex-wrap sm:flex-col items-end justify-between sm:justify-center gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/80">
          <div className="flex items-center gap-2 text-xs text-slate-300 font-tabular font-mono bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800/80">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span className="font-semibold text-white">
              {formatCoordinates(location.latitude, location.longitude)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onChangeLocation && (
              <Button
                variant="outline"
                size="sm"
                onClick={onChangeLocation}
                aria-label="Search another target location"
              >
                <RefreshCw className="w-3 h-3" />
                Change
              </Button>
            )}
            {onClearLocation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearLocation}
                aria-label="Clear active location target"
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
