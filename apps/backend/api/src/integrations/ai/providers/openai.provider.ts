import type { AIProvider, AIAnalysisInput, AIAnalysisOutput } from '../ai.interface.js'
import { SYSTEM_PROMPT, buildAuditPrompt } from '../prompts/audit.prompt.js'
import { AppError } from '../../../utils/errors.js'
import { FairBillErrorCode } from '@fairbill/types'

export class OpenAIProvider implements AIProvider {
  readonly provider = 'openai'
  readonly model: string

  constructor(
    private readonly apiKey: string,
    model = 'gpt-4o-mini'
  ) {
    this.model = model
  }

  async analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: buildAuditPrompt(input) },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      throw new AppError(FairBillErrorCode.AI_FAILED, 'OpenAI analysis failed', 502)
    }

    const raw = await response.json() as { choices: Array<{ message: { content: string } }> }
    const parsed = JSON.parse(raw.choices[0]?.message.content ?? '{}') as AIAnalysisOutput
    parsed.rawResponse = raw
    return parsed
  }
}
