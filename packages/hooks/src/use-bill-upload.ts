'use client'

import { useState, useCallback } from 'react'
import type { BillDTO, BillType } from '@fairbill/types'

const API_URL = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'

interface UploadState {
  bill: BillDTO | null
  uploading: boolean
  progress: number
  error: string | null
}

export function useBillUpload() {
  const [state, setState] = useState<UploadState>({
    bill: null,
    uploading: false,
    progress: 0,
    error: null,
  })

  const upload = useCallback(async (file: File, billType: BillType, currency = 'INR'): Promise<BillDTO> => {
    setState({ bill: null, uploading: true, progress: 0, error: null })

    const formData = new FormData()
    formData.append('file', file)
    formData.append('billType', billType)
    formData.append('currency', currency)

    const xhr = new XMLHttpRequest()

    return new Promise((resolve, reject) => {
      xhr.upload.onprogress = e => {
        if (e.lengthComputable) {
          setState(s => ({ ...s, progress: Math.round((e.loaded / e.total) * 100) }))
        }
      }

      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText)
        if (xhr.status >= 200 && xhr.status < 300) {
          setState(s => ({ ...s, uploading: false, bill: data.data, progress: 100 }))
          resolve(data.data)
        } else {
          const msg = data.error?.message ?? 'Upload failed'
          setState(s => ({ ...s, uploading: false, error: msg, progress: 0 }))
          reject(new Error(msg))
        }
      }

      xhr.onerror = () => {
        setState(s => ({ ...s, uploading: false, error: 'Network error', progress: 0 }))
        reject(new Error('Network error'))
      }

      xhr.open('POST', `${API_URL}/api/bills/upload`)
      xhr.withCredentials = true
      xhr.send(formData)
    })
  }, [])

  const reset = useCallback(() => {
    setState({ bill: null, uploading: false, progress: 0, error: null })
  }, [])

  return { ...state, upload, reset }
}
