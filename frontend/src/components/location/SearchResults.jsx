import { MapPin, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SearchResults({
  results = [],
  query = '',
  loading = false,
  error = null,
  selectedIndex = -1,
  onSelectLocation,
  onHoverIndex,
  isOpen = false,
}) {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        'absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden',
        'bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl shadow-black/60',
        'max-h-80 overflow-y-auto animate-fade-in'
      )}
    >
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center gap-2.5 py-6 px-4 text-xs text-slate-400">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" aria-hidden="true" />
          <span>Searching geographic databases...</span>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex items-start gap-2.5 p-4 text-xs text-red-300 bg-red-950/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-0.5">
            <p className="font-semibold text-red-200">Search Unavailable</p>
            <p className="text-slate-400 leading-relaxed">
              {typeof error === 'string' ? error : 'Unable to retrieve location suggestions. Please try again.'}
            </p>
          </div>
        </div>
      )}

      {/* Empty Results State */}
      {!loading && !error && query.trim().length >= 2 && results.length === 0 && (
        <div className="py-6 px-4 text-center text-xs text-slate-400">
          <p className="font-medium text-slate-300">No locations found</p>
          <p className="text-slate-500 mt-0.5">
            No matching coordinates found for &ldquo;<span className="text-slate-300">{query}</span>&rdquo;. Try searching by city, district, or region.
          </p>
        </div>
      )}

      {/* Short Query Prompt State */}
      {!loading && !error && query.trim().length < 2 && (
        <div className="py-4 px-4 text-center text-xs text-slate-500">
          Type at least 2 characters to search for locations.
        </div>
      )}

      {/* Results Listbox */}
      {!loading && !error && results.length > 0 && (
        <ul
          id="location-search-listbox"
          role="listbox"
          aria-label="Location search suggestions"
          className="p-1.5 space-y-1"
        >
          {results.map((item, index) => {
            const isSelected = selectedIndex === index
            const optionId = `location-option-${index}`

            // Split display_name to extract primary place name and secondary administrative context
            const parts = item.display_name ? item.display_name.split(',').map((p) => p.trim()) : []
            const primaryName = item.name || parts[0] || 'Unknown Location'
            const secondaryContext = parts.length > 1
              ? parts.slice(1).join(', ')
              : (item.display_name || '')

            return (
              <li
                key={`${item.latitude}-${item.longitude}-${index}`}
                id={optionId}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => onHoverIndex && onHoverIndex(index)}
                onMouseDown={(e) => {
                  // Use onMouseDown to trigger selection before input blur / click-outside fires
                  e.preventDefault()
                  if (onSelectLocation) {
                    onSelectLocation(item)
                  }
                }}
                className={cn(
                  'group flex items-start gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 ease-out select-none',
                  isSelected
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                )}
              >
                <div
                  className={cn(
                    'p-1.5 rounded-md mt-0.5 shrink-0 transition-all duration-150',
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800 text-slate-400 group-hover:text-cyan-400 group-hover:scale-105'
                  )}
                >
                  <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="text-xs font-semibold text-slate-100 truncate">
                    {primaryName}
                  </div>
                  {secondaryContext && (
                    <div className="text-[11px] text-slate-400 truncate leading-relaxed">
                      {secondaryContext}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
