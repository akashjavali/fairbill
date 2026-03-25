'use client'

import { useState } from 'react'
import { Button } from '@fairbill/ui'
import { api } from '@/lib/api'
import type { APIResponse } from '@fairbill/types'

export default function ShareButton({ auditId }: { auditId: string }) {
  const [copying, setCopying] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    setCopying(true)
    try {
      const res = await api.post<APIResponse<{ shareUrl: string }>>(`/api/audits/${auditId}/share`, {})
      const shareUrl = res.data?.shareUrl
      if (!shareUrl) return

      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } finally {
      setCopying(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare} loading={copying}>
      {copied ? '✓ Copied!' : '🔗 Share Link'}
    </Button>
  )
}
