import { useState, useEffect, useRef, useCallback } from 'react'
import { Search, MapPin, X, Loader2 } from 'lucide-react'
import { searchLocations } from '@/services/api'
import { SearchResults } from './SearchResults'
import { cn } from '@/lib/utils'

export function LocationSearch({
  onSelectLocation,
  placeholder = 'Search by city, region, or address (e.g. Tokyo, Islamabad, San Francisco)...',
  className,
  autoFocus = false,
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const abortControllerRef = useRef(null)
  const debounceTimerRef = useRef(null)
  const requestSeqRef = useRef(0)

  // Execute geocoding search with request-sequence guard and cancellation
  const executeSearch = useCallback(async (searchQuery) => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 2) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }

    // Cancel any previous in-flight search request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const controller = new AbortController()
    abortControllerRef.current = controller
    const currentSeq = ++requestSeqRef.current

    setLoading(true)
    setError(null)

    try {
      const response = await searchLocations(trimmed, controller.signal)
      // Check if another search was triggered while this was resolving
      if (currentSeq !== requestSeqRef.current) {
        return
      }
      setResults(response.results || [])
      setIsOpen(true)
      setSelectedIndex(-1)
    } catch (err) {
      if (err.name === 'AbortError' || currentSeq !== requestSeqRef.current) {
        return
      }
      setError(err.message || 'Unable to retrieve location suggestions. Please try again.')
      setResults([])
      setIsOpen(true)
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setLoading(false)
      }
    }
  }, [])

  // Debounced input change handler
  const handleInputChange = (e) => {
    const newQuery = e.target.value
    setQuery(newQuery)

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    if (!newQuery.trim()) {
      setResults([])
      setIsOpen(false)
      setError(null)
      setLoading(false)
      return
    }

    debounceTimerRef.current = setTimeout(() => {
      executeSearch(newQuery)
    }, 300)
  }

  // Handle keyboard navigation within suggestions
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && (results.length > 0 || query.trim().length >= 2)) {
        setIsOpen(true)
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex])
      } else if (results.length > 0) {
        handleSelect(results[0])
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }

  // Handle location selection
  const handleSelect = (location) => {
    setIsOpen(false)
    setSelectedIndex(-1)
    setQuery(location.name || location.display_name.split(',')[0])
    if (onSelectLocation) {
      onSelectLocation(location)
    }
  }

  // Handle clear input button
  const handleClear = () => {
    setQuery('')
    setResults([])
    setError(null)
    setIsOpen(false)
    setSelectedIndex(-1)
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  // Cleanup pending timer and requests on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {/* Accessible Label */}
      <label
        htmlFor="location-search-input"
        className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5"
      >
        <MapPin className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
        <span>Target Location Search</span>
      </label>

      {/* Input Container */}
      <div className="relative flex items-center">
        {/* Leading Search Icon */}
        <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
          <Search className="w-4 h-4" aria-hidden="true" />
        </div>

        {/* Search Input Field */}
        <input
          ref={inputRef}
          id="location-search-input"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={isOpen && results.length > 0 ? 'location-search-listbox' : undefined}
          aria-activedescendant={
            isOpen && selectedIndex >= 0 ? `location-option-${selectedIndex}` : undefined
          }
          aria-label="Search for a target location by city, address, or region"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (results.length > 0 || query.trim().length >= 2) {
              setIsOpen(true)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          autoFocus={autoFocus}
          className={cn(
            'w-full pl-10 pr-10 py-2.5 text-sm bg-slate-900/90 text-slate-100 placeholder-slate-500',
            'border border-slate-700 rounded-xl transition-all',
            'focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/30',
            'hover:border-slate-600'
          )}
        />

        {/* Trailing Controls (Spinner / Clear Button) */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {loading && (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" aria-hidden="true" />
          )}

          {!loading && query && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear location search input"
              className="p-1 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Floating Suggestions Listbox */}
      <SearchResults
        results={results}
        query={query}
        loading={loading}
        error={error}
        selectedIndex={selectedIndex}
        onSelectLocation={handleSelect}
        onHoverIndex={setSelectedIndex}
        isOpen={isOpen}
      />
    </div>
  )
}
