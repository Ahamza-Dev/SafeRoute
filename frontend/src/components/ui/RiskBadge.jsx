import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const riskStyles = {
  Low: {
    container: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    indicator: 'bg-emerald-400',
    label: 'Low Risk',
  },
  Moderate: {
    container: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    indicator: 'bg-amber-400',
    label: 'Moderate Risk',
  },
  Elevated: {
    container: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    indicator: 'bg-orange-400',
    label: 'Elevated Risk',
  },
  High: {
    container: 'bg-red-500/10 text-red-400 border-red-500/30',
    indicator: 'bg-red-400',
    label: 'High Risk',
  },
  Default: {
    container: 'bg-slate-800 text-slate-300 border-slate-700',
    indicator: 'bg-slate-400',
    label: 'Unknown Risk',
  },
}

export const RiskBadge = forwardRef(function RiskBadge(
  { level = 'Low', showDot = true, showFullLabel = false, className, ...props },
  ref
) {
  const style = riskStyles[level] || riskStyles.Default
  const displayLabel = showFullLabel ? style.label : level

  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold border tracking-wide select-none',
        'transition-all duration-200 ease-out',
        style.container,
        className
      )}
      aria-label={`Risk Level: ${style.label}`}
      {...props}
    >
      {showDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-200', style.indicator)}
          aria-hidden="true"
        />
      )}
      <span>{displayLabel}</span>
    </span>
  )
})
