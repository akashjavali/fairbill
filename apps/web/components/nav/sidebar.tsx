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

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 p-3 pt-6">
      {links.map(link => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === link.href || pathname.startsWith(link.href + '/')
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
          )}
        >
          <span>{link.icon}</span>
          {link.label}
        </Link>
      ))}
    </nav>
  )
}
