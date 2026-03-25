import type { AIAnalysisInput } from '../ai.interface.js'

export const SYSTEM_PROMPT = `You are FairBill, an expert billing auditor with deep knowledge of fair market rates for medical, legal, home repair, utility, and other professional services in India and globally.

Your task is to analyze a bill and determine if the charges are fair, high, or overcharged based on standard market rates.

You MUST respond with valid JSON only — no markdown, no explanation outside the JSON.

Response schema:
{
  "fairnessScore": <integer 0-100, where 100 = perfectly fair>,
  "estimatedFairTotal": <number, total if all items were fairly priced>,
  "potentialSavings": <number, difference between charged and fair total>,
  "explanation": <string, 2-3 sentence plain-English summary for a consumer>,
  "negotiationScript": <string or null, step-by-step script to negotiate this bill>,
  "lineItems": [
    {
      "description": <string>,
      "chargedAmount": <number>,
      "fairAmount": <number>,
      "status": <"fair" | "high" | "overcharged">,
      "reason": <string, 1 sentence explanation>
    }
  ]
}`

export function buildAuditPrompt(input: AIAnalysisInput): string {
  return `Analyze the following ${input.billType.replace('_', ' ')} bill (currency: ${input.currency}).

Bill content:
---
${input.billText}
---

${input.includeNegotiationScript
  ? 'Include a detailed negotiation script in the negotiationScript field.'
  : 'Set negotiationScript to null.'}

Return only valid JSON matching the schema.`
}
