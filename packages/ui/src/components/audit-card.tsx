import { formatCurrency, formatRelativeTime, toTitleCase } from '@fairbill/utils'
import type { AuditSummaryDTO } from '@fairbill/types'
import { AuditScoreBadge } from './audit-score-badge'
import { Skeleton } from './skeleton'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card'
import { cn } from '../lib/utils'

interface AuditCardProps {
  audit: AuditSummaryDTO
  onClick?: () => void
  className?: string
}

export function AuditCard({ audit, onClick, className }: AuditCardProps) {
  const isPending = audit.status === 'pending' || audit.status === 'processing'

  return (
    <Card
      className={cn('cursor-pointer transition-shadow hover:shadow-md', className)}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="truncate text-base">
            {audit.originalFilename ?? 'Untitled Bill'}
          </CardTitle>
          {audit.fairnessScore !== null && !isPending ? (
            <AuditScoreBadge score={audit.fairnessScore} />
          ) : (
            <span className="shrink-0 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
              {isPending ? 'Analyzing...' : 'Failed'}
            </span>
          )}
        </div>
        <CardDescription>
          {audit.billType ? toTitleCase(audit.billType) : 'Bill'} ·{' '}
          {formatRelativeTime(audit.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isPending ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="text-gray-500">Potential savings</p>
              <p className="font-semibold text-success-600">
                {audit.potentialSavings != null
                  ? formatCurrency(audit.potentialSavings)
                  : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-gray-500">Fair total</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                {audit.estimatedFairTotal != null
                  ? formatCurrency(audit.estimatedFairTotal)
                  : '—'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
