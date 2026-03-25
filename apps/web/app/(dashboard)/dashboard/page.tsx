'use client'

import Link from 'next/link'
import { useAuth } from '@fairbill/hooks'
import { useAuditList } from '@fairbill/hooks'
import { useUsageLimit } from '@fairbill/hooks'
import { Button, AuditCard, Skeleton } from '@fairbill/ui'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const { user } = useAuth()
  const { audits, loading } = useAuditList()
  const { usage } = useUsageLimit()
  const router = useRouter()

  const recentAudits = audits.slice(0, 6)

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}
          </h1>
          <p className="mt-1 text-sm text-gray-500">Here&apos;s an overview of your bill audits</p>
        </div>
        <Link href="/upload">
          <Button className="w-full sm:w-auto">+ Audit New Bill</Button>
        </Link>
      </div>

      {/* Usage card */}
      {usage && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Monthly Audits Used</p>
              <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                {usage.auditsUsedThisMonth}
                <span className="text-lg font-normal text-gray-400">
                  /{usage.plan === 'pro' ? '∞' : usage.auditsLimit}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                usage.plan === 'pro'
                  ? 'bg-brand-50 text-brand-700'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {usage.plan === 'pro' ? '⭐ Pro' : 'Free Plan'}
              </span>
              {usage.plan === 'free' && (
                <Link href="/settings">
                  <Button size="sm" variant="outline">Upgrade to Pro</Button>
                </Link>
              )}
            </div>
          </div>
          {usage.plan === 'free' && (
            <div className="mt-4 h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-2 rounded-full bg-brand-500 transition-all"
                style={{ width: `${Math.min(100, (usage.auditsUsedThisMonth / usage.auditsLimit) * 100)}%` }}
              />
            </div>
          )}
        </div>
      )}

      {/* Recent audits */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Audits</h2>
          {audits.length > 6 && (
            <Link href="/audits" className="text-sm text-brand-600 hover:underline">View all →</Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : recentAudits.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center dark:border-gray-700">
            <p className="text-gray-500">No audits yet. Upload your first bill to get started.</p>
            <Link href="/upload" className="mt-4 inline-block">
              <Button size="sm">Upload a Bill</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentAudits.map(audit => (
              <AuditCard
                key={audit.id}
                audit={audit}
                onClick={() => router.push(`/audits/${audit.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
