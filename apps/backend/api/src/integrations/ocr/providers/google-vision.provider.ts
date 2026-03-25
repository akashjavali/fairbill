import type { OCRProvider, OCRResult } from '../ocr.interface.js'

export class GoogleVisionProvider implements OCRProvider {
  readonly supportedMimeTypes = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/tiff',
  ]

  async extractText(buffer: Buffer, mimeType: string): Promise<OCRResult> {
    // Google Cloud Vision implementation
    // Requires GOOGLE_CLOUD_CREDENTIALS env var
    throw new Error('GoogleVisionProvider not yet configured. Set GOOGLE_CLOUD_CREDENTIALS.')
  }
}
