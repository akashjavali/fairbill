import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AuditScoreRing, AuditScoreBadge, LineItemRow, Card, CardContent, CardHeader, CardTitle } from '@fairbill/ui'
import { formatCurrency } from '@fairbill/utils'
import type { AuditDTO, APIResponse } from '@fairbill/types'
import Link from 'next/link'

interface Props {
  params: { token: string }
}

async function fetchPublicAudit(token: string): Promise<AuditDTO | null> {
  try {
    const res = await fetch(
      `${process.env['API_URL'] ?? 'http://localhost:4000'}/api/audits/public/${token}`,
      { next: { revalidate: 60 } }
    )
    const data = await res.json() as APIResponse<AuditDTO>
    return data.data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const audit = await fetchPublicAudit(params.token)
  if (!audit) return { title: 'Audit Not Found' }
  return {
    title: `Bill Audit — ${audit.fairnessScore}/100 Fairness Score`,
    description: audit.explanation ?? 'AI-powered bill audit by FairBill',
    openGraph: {
      title: `This bill scored ${audit.fairnessScore}/100 on FairBill`,
      description: audit.explanation ?? '',
    },
  }
}

export default async function PublicAuditPage({ params }: Props) {
  const audit = await fetchPublicAudit(params.token)
  if (!audit) notFound()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="border-b bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-lg font-bold text-brand-600">FairBill</Link>
          <Link href="/register" className="text-sm text-brand-600 hover:underline">Try free →</Link>
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bill Audit Report</h1>
          <p className="mt-1 text-sm text-gray-500">Powered by FairBill AI</p>
        </div>

        {/* Score */}
        <Card className="flex flex-col items-center p-8">
          {audit.fairnessScore !== null && (
            <>
              <AuditScoreRing score={audit.fairnessScore} size="lg" />
              <AuditScoreBadge score={audit.fairnessScore} className="mt-4" />
            </>
          )}
          <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
            {audit.estimatedFairTotal !== null && (
              <div className="text-center">
                <p className="text-xs text-gray-500">Fair Total</p>
                <p className="font-bold text-brand-600">{formatCurrency(audit.estimatedFairTotal)}</p>
              </div>
            )}
            {audit.potentialSavings !== null && (
              <div className="text-center">
                <p className="text-xs text-gray-500">Potential Savings</p>
                <p className="font-bold text-success-600">{formatCurrency(audit.potentialSavings)}</p>
              </div>
            )}
          </div>
        </Card>

        {audit.explanation && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">{audit.explanation}</p>
            </CardContent>
          </Card>
        )}

        {/* Line items */}
        {audit.lineItems.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Line-by-Line Breakdown</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {audit.lineItems.map(item => (
                <LineItemRow key={item.id} item={item} />
              ))}
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="rounded-xl bg-brand-600 p-8 text-center text-white">
          <h3 className="text-lg font-bold">Audit your own bill for free</h3>
          <p className="mt-2 text-sm text-brand-100">2 free audits per month. No credit card required.</p>
          <Link href="/register" className="mt-4 inline-block rounded-lg bg-white px-6 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50">
            Get Started Free →
          </Link>
        </div>
      </div>
    </div>
  )
}
