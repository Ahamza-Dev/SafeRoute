import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Skeleton = forwardRef(function Skeleton(
  { className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      className={cn('animate-pulse rounded-md bg-slate-800/60', className)}
      aria-hidden="true"
      {...props}
    />
  )
})
