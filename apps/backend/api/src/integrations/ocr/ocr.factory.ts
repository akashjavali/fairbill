import type { OCRProvider } from './ocr.interface.js'
import { TesseractProvider } from './providers/tesseract.provider.js'
import { GoogleVisionProvider } from './providers/google-vision.provider.js'
import { env } from '../../config/env.js'

let instance: OCRProvider | null = null

export function getOCRProvider(): OCRProvider {
  if (instance) return instance

  switch (env.OCR_PROVIDER) {
    case 'google-vision':
      instance = new GoogleVisionProvider()
      break
    case 'tesseract':
    default:
      instance = new TesseractProvider()
  }

  return instance
}
