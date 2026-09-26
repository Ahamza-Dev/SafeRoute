import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = {
  default: 'bg-slate-800 text-slate-200 border-slate-700',
  secondary: 'bg-slate-900/90 text-slate-400 border-slate-800',
  outline: 'bg-transparent text-slate-300 border-slate-700',
  info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  error: 'bg-red-500/10 text-red-400 border-red-500/30',
}

const badgeSizes = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-2.5 py-0.5 text-xs',
}

export const Badge = forwardRef(function Badge(
  { className, variant = 'default', size = 'md', children, ...props },
  ref
) {
  return (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded border tracking-wide uppercase font-tabular select-none',
        'transition-all duration-200 ease-out',
        badgeVariants[variant] || badgeVariants.default,
        badgeSizes[size] || badgeSizes.md,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
})
