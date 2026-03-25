'use client'

import * as React from 'react'
import { cn } from '../lib/utils'

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSizeMB?: number
  loading?: boolean
  className?: string
}

export function UploadDropzone({
  onFileSelect,
  accept = '.pdf,.png,.jpg,.jpeg,.webp',
  maxSizeMB = 10,
  loading,
  className,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const validateAndSelect = (file: File) => {
    setError(null)
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Max size: ${maxSizeMB}MB`)
      return
    }
    onFileSelect(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) validateAndSelect(file)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) validateAndSelect(file)
  }

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => !loading && inputRef.current?.click()}
        onKeyDown={e => e.key === 'Enter' && !loading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          isDragging
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950'
            : 'border-gray-300 hover:border-brand-400 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800',
          loading && 'pointer-events-none opacity-60'
        )}
      >
        {/* Upload icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-950">
          <svg className="h-7 w-7 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {loading ? 'Uploading...' : 'Drop your bill here or tap to browse'}
          </p>
          <p className="mt-1 text-xs text-gray-500">PDF, PNG, JPG, WEBP up to {maxSizeMB}MB</p>
        </div>
      </div>
      {error && <p className="text-xs text-danger-500">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  )
}
