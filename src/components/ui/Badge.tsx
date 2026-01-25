import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground',
        secondary:
          'border-transparent bg-muted text-muted-foreground',
        outline: 'text-foreground',
        success:
          'border-transparent bg-success text-white',
        warning:
          'border-transparent bg-warning text-white',
        danger:
          'border-transparent bg-danger text-white',
        daca:
          'border-transparent bg-status-daca text-white',
        h1b:
          'border-transparent bg-status-h1b text-white',
        asylum:
          'border-transparent bg-status-asylum text-white',
        greencard:
          'border-transparent bg-status-greencard text-white',
        pending:
          'border-transparent bg-status-pending text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
