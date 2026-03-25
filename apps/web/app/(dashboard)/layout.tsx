import type { Metadata } from 'next'
import Navbar from '@/components/nav/navbar'
import Sidebar from '@/components/nav/sidebar'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="flex flex-1">
        {/* Sidebar — hidden on mobile */}
        <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 md:block">
          <Sidebar />
        </aside>
        {/* Main content */}
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
