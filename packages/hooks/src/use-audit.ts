'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { AuditDTO, AuditSummaryDTO, CreateAuditRequest } from '@fairbill/types'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'

export function useAudit(auditId?: string) {
  const [audit, setAudit] = useState<AuditDTO | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchAudit = useCallback(async (id: string) => {
    const res = await fetch(`${API_URL}/api/audits/${id}`, { credentials: 'include' })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message ?? 'Failed to fetch audit')
    return data.data as AuditDTO
  }, [])

  useEffect(() => {
    if (!auditId) return
    setLoading(true)
    fetchAudit(auditId)
      .then(a => {
        setAudit(a)
        setLoading(false)
        // Start polling if still processing
        if (a.status === 'pending' || a.status === 'processing') {
          pollRef.current = setInterval(async () => {
            const updated = await fetchAudit(auditId)
            setAudit(updated)
            if (updated.status === 'completed' || updated.status === 'failed') {
              if (pollRef.current) clearInterval(pollRef.current)
            }
          }, 3000)
        }
      })
      .catch(e => {
        setError(e instanceof Error ? e.message : 'Error')
        setLoading(false)
      })

    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [auditId, fetchAudit])

  const createAudit = useCallback(async (req: CreateAuditRequest): Promise<AuditDTO> => {
    setLoading(true)
    const res = await fetch(`${API_URL}/api/audits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(req),
    })
    const data = await res.json()
    if (!res.ok) {
      setLoading(false)
      throw new Error(data.error?.message ?? 'Failed to create audit')
    }
    setAudit(data.data)
    setLoading(false)
    return data.data
  }, [])

  return { audit, loading, error, createAudit }
}

export function useAuditList() {
  const [audits, setAudits] = useState<AuditSummaryDTO[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAudits = useCallback(async (page = 1) => {
    setLoading(true)
    const res = await fetch(`${API_URL}/api/audits?page=${page}&limit=20`, { credentials: 'include' })
    const data = await res.json()
    setAudits(data.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { void fetchAudits() }, [fetchAudits])

  return { audits, loading, refetch: fetchAudits }
}
