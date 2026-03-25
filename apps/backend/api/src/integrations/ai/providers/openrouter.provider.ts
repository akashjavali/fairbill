import type { AIProvider, AIAnalysisInput, AIAnalysisOutput } from '../ai.interface.js'
import { SYSTEM_PROMPT, buildAuditPrompt } from '../prompts/audit.prompt.js'
import { AppError } from '../../../utils/errors.js'
import { FairBillErrorCode } from '@fairbill/types'
import { logger } from '../../../utils/logger.js'

export class OpenRouterProvider implements AIProvider {
  readonly provider = 'openrouter'
  readonly model: string

  constructor(
    private readonly apiKey: string,
    model = 'anthropic/claude-3-haiku'
  ) {
    this.model = model
  }

  async analyze(input: AIAnalysisInput): Promise<AIAnalysisOutput> {
    const userPrompt = buildAuditPrompt(input)

    logger.debug({ provider: this.provider, model: this.model }, 'Running AI analysis')

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://fairbill.app',
        'X-Title': 'FairBill',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      logger.error({ status: response.status, body: text }, 'OpenRouter API error')
      throw new AppError(FairBillErrorCode.AI_FAILED, 'AI analysis failed', 502)
    }

    const raw = await response.json() as {
      choices: Array<{ message: { content: string } }>
    }

    let parsed: AIAnalysisOutput
    try {
      const content = raw.choices[0]?.message.content ?? '{}'
      parsed = JSON.parse(content) as AIAnalysisOutput
      parsed.rawResponse = raw
    } catch {
      throw new AppError(FairBillErrorCode.AI_FAILED, 'Failed to parse AI response', 502)
    }

    return parsed
  }
}
