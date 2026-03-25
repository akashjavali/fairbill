import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'
import { ValidationError } from '../utils/errors.js'

type Target = 'body' | 'params' | 'query'

export function validate(schema: ZodSchema, target: Target = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target])
    if (!result.success) {
      throw new ValidationError('Validation failed', result.error.flatten().fieldErrors)
    }
    req[target] = result.data
    next()
  }
}
