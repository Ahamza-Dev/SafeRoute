import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const cardVariants = {
  default: 'bg-slate-900/90 border border-slate-800/90 rounded-xl',
  elevated: 'bg-slate-900/95 border border-slate-700/60 rounded-xl shadow-lg shadow-black/40',
  glass: 'bg-slate-900/70 backdrop-blur-md border border-white/10 rounded-xl',
  overlay: 'bg-slate-950/85 backdrop-blur-md border border-slate-800/80 rounded-lg shadow-xl',
}

export const Card = forwardRef(function Card(
  { className, variant = 'default', children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn('text-slate-100 transition-all duration-200', cardVariants[variant] || cardVariants.default, className)}
      {...props}
    >
      {children}
    </div>
  )
})

export const CardHeader = forwardRef(function CardHeader(
  { className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn('flex flex-col space-y-1.5 p-4 sm:p-5', className)}
      {...props}
    >
      {children}
    </div>
  )
})

export const CardTitle = forwardRef(function CardTitle(
  { className, children, ...props },
  ref
) {
  return (
    <h3
      ref={ref}
      className={cn('text-sm font-semibold tracking-wide text-white flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </h3>
  )
})

export const CardDescription = forwardRef(function CardDescription(
  { className, children, ...props },
  ref
) {
  return (
    <p
      ref={ref}
      className={cn('text-xs text-slate-400 leading-relaxed', className)}
      {...props}
    >
      {children}
    </p>
  )
})

export const CardContent = forwardRef(function CardContent(
  { className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn('p-4 sm:p-5 pt-0', className)}
      {...props}
    >
      {children}
    </div>
  )
})

export const CardFooter = forwardRef(function CardFooter(
  { className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn('flex items-center p-4 sm:p-5 pt-0 border-t border-slate-800/60 mt-4', className)}
      {...props}
    >
      {children}
    </div>
  )
})
