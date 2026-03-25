'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@fairbill/ui'
import { useAuth } from '@fairbill/hooks'
import MobileNav from './mobile-nav'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
        {/* Left: mobile hamburger + logo */}
        <div className="flex items-center gap-3">
          <button
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/dashboard" className="text-lg font-bold text-brand-600">FairBill</Link>
        </div>

        {/* Right: user info */}
        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-gray-500 sm:block truncate max-w-[160px]">{user.email}</span>
          )}
          <Button variant="ghost" size="sm" onClick={() => void logout()}>Sign out</Button>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
