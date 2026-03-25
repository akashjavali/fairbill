import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@fairbill/ui'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'FairBill — AI Bill Auditing', template: '%s | FairBill' },
  description: 'Upload any bill and instantly find out if you are being overcharged. AI-powered bill auditing for everyone.',
  keywords: ['bill audit', 'overcharged', 'medical bill', 'legal invoice', 'India'],
  openGraph: {
    type: 'website',
    siteName: 'FairBill',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider defaultTheme="system" storageKey="fairbill-theme">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
