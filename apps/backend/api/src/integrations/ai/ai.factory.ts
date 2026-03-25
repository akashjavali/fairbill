import type { AIProvider } from './ai.interface.js'
import { OpenRouterProvider } from './providers/openrouter.provider.js'
import { OpenAIProvider } from './providers/openai.provider.js'
import { env } from '../../config/env.js'
import { AppError } from '../../utils/errors.js'
import { FairBillErrorCode } from '@fairbill/types'

let instance: AIProvider | null = null

export function getAIProvider(): AIProvider {
  if (instance) return instance

  switch (env.AI_PROVIDER) {
    case 'openai':
      if (!env.OPENAI_API_KEY) throw new AppError(FairBillErrorCode.AI_FAILED, 'OPENAI_API_KEY not configured', 500)
      instance = new OpenAIProvider(env.OPENAI_API_KEY, env.AI_MODEL)
      break
    case 'openrouter':
    default:
      if (!env.OPENROUTER_API_KEY) throw new AppError(FairBillErrorCode.AI_FAILED, 'OPENROUTER_API_KEY not configured', 500)
      instance = new OpenRouterProvider(env.OPENROUTER_API_KEY, env.AI_MODEL)
  }

  return instance
}
