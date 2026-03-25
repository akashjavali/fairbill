export interface OCRResult {
  text: string
  confidence: number
  pages: number
}

export interface OCRProvider {
  extractText(buffer: Buffer, mimeType: string): Promise<OCRResult>
  readonly supportedMimeTypes: string[]
}
