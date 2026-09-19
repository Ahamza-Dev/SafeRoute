import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = {
  default: 'bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold shadow-sm shadow-cyan-500/20',
  secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700/80',
  outline: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700',
  ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white',
  destructive: 'bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30',
}

const buttonSizes = {
  sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-md',
  md: 'px-3.5 py-1.5 text-xs font-medium gap-2 rounded-lg',
  lg: 'px-4 py-2 text-sm font-medium gap-2.5 rounded-lg',
}

export const Button = forwardRef(function Button(
  {
    className,
    variant = 'secondary',
    size = 'md',
    type = 'button',
    disabled = false,
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center transition-colors select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950',
        'disabled:opacity-50 disabled:pointer-events-none cursor-pointer disabled:cursor-not-allowed',
        buttonVariants[variant] || buttonVariants.secondary,
        buttonSizes[size] || buttonSizes.md,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
