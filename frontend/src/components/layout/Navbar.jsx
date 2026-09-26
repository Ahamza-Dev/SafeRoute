import { Shield } from 'lucide-react'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/utils'

/**
 * Navigation destination items for SafeRoute.
 * Minimal and honest: Only contains active routes for current milestones.
 */
const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', href: '#overview' },
]

export function Navbar({ activeItem = 'overview', onNavItemClick, className }) {
  const handleNavClick = (e, item) => {
    e.preventDefault()
    if (onNavItemClick) {
      onNavItemClick(item.id)
    }
  }

  return (
    <header className={cn('sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-slate-950/80 backdrop-blur-md', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <div className="flex items-center gap-3">
            <a
              href="#overview"
              className="group flex items-center gap-2.5 rounded-lg p-1 -m-1 transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="SafeRoute Home"
            >
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 transition-all duration-200 group-hover:border-cyan-500/40 group-hover:bg-cyan-500/15 group-hover:shadow-xs group-hover:shadow-cyan-500/20">
                <Shield className="w-5 h-5 transition-transform duration-200 group-hover:scale-105" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base tracking-tight text-white group-hover:text-cyan-100 transition-colors">SafeRoute</span>
                  <Badge variant="info" size="sm" className="hidden sm:inline-flex">Intelligence</Badge>
                </div>
                <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase hidden sm:block">
                  Disaster Risk Platform
                </span>
              </div>
            </a>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Main Navigation"
            className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-lg border border-slate-800/80"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = (activeItem || 'overview') === item.id
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ease-out select-none active:scale-[0.98]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-950',
                    isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-xs border border-slate-700/60'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 hover:border-slate-700/40'
                  )}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}
