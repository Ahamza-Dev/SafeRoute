import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const MetricDisplay = forwardRef(function MetricDisplay(
  {
    label,
    value,
    unit,
    icon: Icon,
    iconColor = 'text-cyan-400',
    subtext,
    className,
    ...props
  },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        'group bg-slate-950/60 p-2.5 sm:p-3 rounded-lg border border-slate-800/80 flex flex-col justify-between space-y-1',
        'transition-all duration-200 hover:border-slate-700/90 hover:bg-slate-900/80',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-1.5">
        <span className="text-xs font-medium text-slate-400 truncate group-hover:text-slate-300 transition-colors">{label}</span>
        {Icon && <Icon className={cn('w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:scale-110', iconColor)} aria-hidden="true" />}
      </div>
      <div className="flex items-baseline gap-1 font-tabular">
        <span className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
          {value !== null && value !== undefined ? value : '—'}
        </span>
        {unit && <span className="text-xs font-normal text-slate-400">{unit}</span>}
      </div>
      {subtext && <div className="text-[11px] text-slate-500 truncate">{subtext}</div>}
    </div>
  )
})
