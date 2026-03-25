import { formatCurrency, lineItemStatusToColorClass } from '@fairbill/utils'
import type { LineItemDTO } from '@fairbill/types'
import { Badge } from './badge'
import { cn } from '../lib/utils'

interface LineItemRowProps {
  item: LineItemDTO
  currency?: string
  className?: string
}

export function LineItemRow({ item, currency = 'INR', className }: LineItemRowProps) {
  const statusVariant =
    item.status === 'fair' ? 'success' : item.status === 'high' ? 'warning' : ('danger' as const)

  return (
    // Mobile: stacked card layout
    // Desktop: table-row-like horizontal layout
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border border-gray-100 p-4 dark:border-gray-800',
        'md:flex-row md:items-center md:gap-4',
        className
      )}
    >
      {/* Description */}
      <div className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">
        {item.description}
      </div>

      {/* Amounts */}
      <div className="flex items-center gap-4 text-sm md:gap-6">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Charged</span>
          <span className="font-semibold text-gray-800 dark:text-gray-200 line-through">
            {formatCurrency(item.chargedAmount, currency)}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Fair</span>
          <span className="font-semibold text-success-600">
            {formatCurrency(item.fairAmount, currency)}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <Badge variant={statusVariant} className="w-fit capitalize">
        {item.status}
      </Badge>

      {/* Reason */}
      {item.reason && (
        <p className="text-xs text-gray-500 md:hidden">{item.reason}</p>
      )}
    </div>
  )
}
