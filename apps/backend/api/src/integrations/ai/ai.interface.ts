export interface AIAnalysisInput {
  billText: string
  billType: string
  currency: string
  includeNegotiationScript: boolean
}

export interface AILineItem {
  description: string
  chargedAmount: number
  fairAmount: number
  status: 'fair' | 'high' | 'overcharged'
  reason: string
}

export interface AIAnalysisOutput {
  fairnessScore: number
  estimatedFairTotal: number
  potentialSavings: number
  explanation: string
  negotiationScript?: string
  lineItems: AILineItem[]
  rawResponse: unknown
}

export interface AIProvider {
  analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput>
  readonly provider: string
  readonly model: string
}
