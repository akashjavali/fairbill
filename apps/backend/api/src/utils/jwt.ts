import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from '../config/constants.js'

export interface JWTPayload {
  userId: string
  email: string
}

export function signAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN })
}

export function signRefreshToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN })
}

export function verifyAccessToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_SECRET) as JWTPayload
}

export function verifyRefreshToken(token: string): JWTPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as JWTPayload
}
