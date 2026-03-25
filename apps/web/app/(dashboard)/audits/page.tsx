'use client'

import { useRouter } from 'next/navigation'
import { useAuditList } from '@fairbill/hooks'
import { AuditCard, Skeleton } from '@fairbill/ui'
import Link from 'next/link'
import { Button } from '@fairbill/ui'

export default function AuditsPage() {
  const { audits, loading } = useAuditList()
  const router = useRouter()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Audits</h1>
        <Link href="/upload"><Button size="sm">+ New Audit</Button></Link>
      </div>

      {loading ? (
        // Responsive skeleton grid
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-44" />)}
        </div>
      ) : audits.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-16 text-center dark:border-gray-700">
          <p className="text-gray-500">No audits yet</p>
          <Link href="/upload" className="mt-4 inline-block">
            <Button size="sm">Upload Your First Bill</Button>
          </Link>
        </div>
      ) : (
        // 1 col mobile → 2 col sm → 3 col lg
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audits.map(audit => (
            <AuditCard
              key={audit.id}
              audit={audit}
              onClick={() => router.push(`/audits/${audit.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
