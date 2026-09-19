import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Divider = forwardRef(function Divider(
  { orientation = 'horizontal', className, ...props },
  ref
) {
  if (orientation === 'vertical') {
    return (
      <div
        ref={ref}
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px self-stretch bg-slate-800/80', className)}
        {...props}
      />
    )
  }

  return (
    <hr
      ref={ref}
      role="separator"
      aria-orientation="horizontal"
      className={cn('border-0 border-t border-slate-800/80 my-4 w-full', className)}
      {...props}
    />
  )
})
