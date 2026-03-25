import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-600 text-white',
        secondary: 'border-transparent bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        success: 'border-transparent bg-success-50 text-success-700',
        warning: 'border-transparent bg-warning-50 text-warning-700',
        danger: 'border-transparent bg-danger-50 text-danger-600',
        outline: 'text-gray-700 dark:text-gray-300',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
