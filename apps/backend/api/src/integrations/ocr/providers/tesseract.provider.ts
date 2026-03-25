import Tesseract from 'tesseract.js'
import type { OCRProvider, OCRResult } from '../ocr.interface.js'
import { logger } from '../../../utils/logger.js'

export class TesseractProvider implements OCRProvider {
  readonly supportedMimeTypes = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/tiff',
    'application/pdf',
  ]

  async extractText(buffer: Buffer, _mimeType: string): Promise<OCRResult> {
    logger.debug('Running Tesseract OCR')
    const { data } = await Tesseract.recognize(buffer, 'eng', {
      logger: m => {
        if (m.status === 'recognizing text') {
          logger.debug({ progress: m.progress }, 'OCR progress')
        }
      },
    })

    return {
      text: data.text.trim(),
      confidence: data.confidence / 100,
      pages: 1,
    }
  }
}
