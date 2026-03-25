import { scoreToLabel } from '@fairbill/utils'
import { Badge } from './badge'

interface AuditScoreBadgeProps {
  score: number
  className?: string
}

export function AuditScoreBadge({ score, className }: AuditScoreBadgeProps) {
  const label = scoreToLabel(score)
  const variant =
    score >= 80 ? 'success' : score >= 60 ? 'warning' : ('danger' as const)

  return (
    <Badge variant={variant} className={className}>
      {label} · {score}/100
    </Badge>
  )
}
