import { randomBytes } from 'crypto'

export function truncateText(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text
  return `${text.slice(0, maxLen - 3)}...`
}

export function generatePublicToken(): string {
  return randomBytes(16).toString('hex')
}

export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function toTitleCase(str: string): string {
  return str
    .replace(/[-_]/g, ' ')
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
}
