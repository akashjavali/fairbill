'use client'

import { useState, useEffect, useCallback } from 'react'
import type { UserDTO } from '@fairbill/types'

interface AuthState {
  user: UserDTO | null
  loading: boolean
  error: string | null
}

interface UseAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({ user: null, loading: true, error: null })

  const refreshUser = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
      if (!res.ok) {
        setState({ user: null, loading: false, error: null })
        return
      }
      const data = await res.json()
      setState({ user: data.data, loading: false, error: null })
    } catch {
      setState({ user: null, loading: false, error: null })
    }
  }, [])

  useEffect(() => {
    void refreshUser()
  }, [refreshUser])

  const login = useCallback(async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }))
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) {
      setState(s => ({ ...s, loading: false, error: data.error?.message ?? 'Login failed' }))
      throw new Error(data.error?.message ?? 'Login failed')
    }
    await refreshUser()
  }, [refreshUser])

  const logout = useCallback(async () => {
    await fetch(`${API_URL}/api/auth/logout`, { method: 'POST', credentials: 'include' })
    setState({ user: null, loading: false, error: null })
  }, [])

  return { ...state, login, logout, refreshUser }
}
