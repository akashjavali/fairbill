'use client'

import { useParams } from 'next/navigation'
import { useAudit } from '@fairbill/hooks'
import { AuditScoreRing, AuditScoreBadge, LineItemRow, Button, Skeleton, Card, CardContent, CardHeader, CardTitle } from '@fairbill/ui'
import { formatCurrency } from '@fairbill/utils'
import ShareButton from '@/components/audit/share-button'
import Link from 'next/link'

export default function AuditDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { audit, loading, error } = useAudit(id)

  if (loading) return <AuditDetailSkeleton />
  if (error) return <div className="py-12 text-center text-danger-500">{error}</div>
  if (!audit) return null

  const isPending = audit.status === 'pending' || audit.status === 'processing'
  const isFailed = audit.status === 'failed'

  if (isPending) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Analyzing Your Bill...</h2>
        <p className="mt-2 text-gray-500">Our AI is reviewing every line item. This takes 15–30 seconds.</p>
      </div>
    )
  }

  if (isFailed) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <p className="text-danger-500">Analysis failed. Please try again.</p>
        <Link href="/upload" className="mt-4 inline-block"><Button>Try Again</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link href="/audits" className="text-sm text-gray-500 hover:text-gray-700">← My Audits</Link>
          <h1 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">Audit Report</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <ShareButton auditId={audit.id} />
        </div>
      </div>

      {/* Score + summary — stacked on mobile, side-by-side on md+ */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Score ring */}
        <Card className="flex flex-col items-center p-8 md:w-56 md:shrink-0">
          {audit.fairnessScore !== null && (
            <AuditScoreRing score={audit.fairnessScore} size="lg" />
          )}
          <p className="mt-4 text-xs text-gray-500">Fairness Score</p>
        </Card>

        {/* Stats */}
        <Card className="flex-1">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Stat label="Charged" value={audit.estimatedFairTotal !== null ? formatCurrency(audit.estimatedFairTotal + (audit.potentialSavings ?? 0)) : '—'} />
              <Stat label="Fair Total" value={audit.estimatedFairTotal !== null ? formatCurrency(audit.estimatedFairTotal) : '—'} highlight />
              <Stat label="Potential Savings" value={audit.potentialSavings !== null ? formatCurrency(audit.potentialSavings) : '—'} savings />
            </div>
            {audit.explanation && (
              <div className="mt-6">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Summary</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{audit.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line items */}
      <Card>
        <CardHeader>
          <CardTitle>Line-by-Line Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {audit.lineItems.map(item => (
            <LineItemRow key={item.id} item={item} />
          ))}
        </CardContent>
      </Card>

      {/* Negotiation script (pro) */}
      {audit.negotiationScript && (
        <Card>
          <CardHeader>
            <CardTitle>Negotiation Script</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{audit.negotiationScript}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function Stat({ label, value, highlight, savings }: { label: string; value: string; highlight?: boolean; savings?: boolean }) {
  return (
    <div className="flex flex-col">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-xl font-bold ${savings ? 'text-success-600' : highlight ? 'text-brand-600' : 'text-gray-900 dark:text-white'}`}>
        {value}
      </p>
    </div>
  )
}

function AuditDetailSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="flex flex-col gap-6 md:flex-row">
        <Skeleton className="h-48 md:w-56" />
        <Skeleton className="h-48 flex-1" />
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}
