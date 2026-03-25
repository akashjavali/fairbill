'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { useBillUpload, useUsageLimit, useAudit } from '@fairbill/hooks'
import { UploadDropzone, Button, Card, CardContent, CardHeader, CardTitle } from '@fairbill/ui'
import type { BillType } from '@fairbill/types'
import Link from 'next/link'

const BILL_TYPES: { value: BillType; label: string }[] = [
  { value: 'medical', label: '🏥 Medical' },
  { value: 'legal', label: '⚖️ Legal' },
  { value: 'home_repair', label: '🔧 Home Repair' },
  { value: 'utility', label: '💡 Utility' },
  { value: 'other', label: '📄 Other' },
]

export default function UploadPage() {
  const router = useRouter()
  const { upload, uploading, progress, error: uploadError } = useBillUpload()
  const { createAudit } = useAudit()
  const { isAtLimit, usage } = useUsageLimit()
  const [billType, setBillType] = useState<BillType>('medical')
  const [step, setStep] = useState<'upload' | 'processing'>('upload')

  if (isAtLimit) {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Limit Reached</h1>
        <p className="mt-3 text-gray-500">
          You&apos;ve used all {usage?.auditsLimit} free audits this month.
          Upgrade to Pro for unlimited audits.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Link href="/settings"><Button>Upgrade to Pro — ₹499/month</Button></Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">Go to Dashboard</Link>
        </div>
      </div>
    )
  }

  const handleFileSelect = async (file: File) => {
    setStep('processing')
    try {
      const bill = await upload(file, billType)
      // Trigger audit immediately
      const audit = await createAudit({ billId: bill.id })
      router.push(`/audits/${audit.id}`)
    } catch {
      setStep('upload')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit a New Bill</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your bill and our AI will analyze it in seconds
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Bill Type</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Bill type selector — responsive grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {BILL_TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setBillType(t.value)}
                className={`rounded-lg border p-3 text-center text-sm font-medium transition-colors ${
                  billType === t.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                    : 'border-gray-200 hover:border-gray-300 dark:border-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Bill</CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'processing' ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {progress < 100 ? `Uploading... ${progress}%` : 'Analyzing with AI...'}
              </p>
              <p className="text-xs text-gray-400">This takes 15–30 seconds</p>
            </div>
          ) : (
            <>
              <UploadDropzone onFileSelect={handleFileSelect} loading={uploading} />
              {uploadError && (
                <p className="mt-2 text-sm text-danger-500">{uploadError}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
