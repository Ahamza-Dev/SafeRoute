import { Navbar } from './Navbar'
import { cn } from '@/lib/utils'

export function AppShell({
  children,
  activeNav = 'overview',
  onNavChange,
  className,
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-slate-100 flex flex-col antialiased">
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-slate-950 focus:font-semibold focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-300"
      >
        Skip to main content
      </a>

      {/* Semantic Top Navigation */}
      <Navbar activeItem={activeNav} onNavItemClick={onNavChange} />

      {/* Semantic Main Content Container */}
      <main
        id="main-content"
        tabIndex={-1}
        className={cn(
          'flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 focus:outline-none',
          className
        )}
      >
        {children}
      </main>

      {/* Semantic Footer / Research Notice */}
      <footer
        role="contentinfo"
        className="w-full border-t border-[var(--border-subtle)] bg-slate-950/40 py-5 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">SafeRoute</span>
            <span>— Disaster Risk Intelligence Platform</span>
          </div>
          <p className="text-center sm:text-right text-[11px] text-slate-400">
            Prototype decision-support platform. Real-time meteorological & seismic integration framework.
          </p>
        </div>
      </footer>
    </div>
  )
}
