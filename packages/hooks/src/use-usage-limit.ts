'use client'

import { useState, useEffect } from 'react'
import type { UserUsageDTO } from '@fairbill/types'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'

export function useUsageLimit() {
  const [usage, setUsage] = useState<UserUsageDTO | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API_URL}/api/users/me/usage`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => setUsage(d.data))
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  const isAtLimit =
    usage !== null &&
    usage.plan === 'free' &&
    usage.auditsUsedThisMonth >= usage.auditsLimit

  return { usage, loading, isAtLimit }
}
