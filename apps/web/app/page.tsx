import Link from 'next/link'
import { Button } from '@fairbill/ui'

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between border-b px-4 py-4 sm:px-6 lg:px-8">
        <span className="text-xl font-bold text-brand-600">FairBill</span>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Login</Link>
          <Link href="/register"><Button size="sm">Get Started Free</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-950">
            AI-Powered Bill Auditing
          </span>
          <h1 className="mt-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Are you being{' '}
            <span className="text-brand-600">overcharged?</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 sm:text-xl">
            Upload any bill — medical, legal, home repair — and get an instant AI audit.
            Know exactly what's fair, what's inflated, and how to negotiate.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/register"><Button size="lg" className="w-full sm:w-auto">Audit My Bill Free →</Button></Link>
            <Link href="/share/demo" className="text-sm text-gray-500 underline underline-offset-4 hover:text-gray-700">See a sample report</Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">Free plan: 2 audits/month. No credit card required.</p>
        </div>

        {/* Feature grid */}
        <div className="mt-24 grid w-full max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(f => (
            <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        © 2026 FairBill · India-first · Powered by AI
      </footer>
    </div>
  )
}

const features = [
  { icon: '🔍', title: 'Line-by-Line Audit', desc: 'Every charge analyzed against market rates. Fair, High, or Overcharged — instantly.' },
  { icon: '📊', title: 'Fairness Score', desc: 'A clear 0–100 score tells you at a glance how fair your bill is.' },
  { icon: '💰', title: 'Potential Savings', desc: 'See exactly how much you could save and what the fair price should be.' },
  { icon: '🗣️', title: 'Negotiation Script', desc: 'Get a word-for-word script to negotiate your bill down. Pro feature.' },
  { icon: '📄', title: 'PDF Report', desc: 'Download a professional report to dispute or share with others.' },
  { icon: '🔗', title: 'Shareable Link', desc: 'Share your audit via a public link — perfect for WhatsApp.' },
]
