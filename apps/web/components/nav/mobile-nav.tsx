'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@fairbill/ui'

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/upload', label: 'New Audit', icon: '➕' },
  { href: '/audits', label: 'My Audits', icon: '📋' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname()

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute left-0 top-0 h-full w-64 bg-white shadow-xl dark:bg-gray-900">
        <div className="flex items-center justify-between border-b p-4">
          <span className="text-lg font-bold text-brand-600">FairBill</span>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {links.map(link => (
            <Link
              key={link.href}
              href={link.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
                pathname === link.href
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )}
            >
              <span>{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
