'use client'

import { scoreToLabel, scoreToColorClass } from '@fairbill/utils'
import { cn } from '../lib/utils'

interface AuditScoreRingProps {
  score: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: { svg: 80, r: 28, stroke: 6, fontSize: 'text-lg' },
  md: { svg: 120, r: 44, stroke: 8, fontSize: 'text-2xl' },
  lg: { svg: 160, r: 60, stroke: 10, fontSize: 'text-4xl' },
}

export function AuditScoreRing({ score, size = 'md', className }: AuditScoreRingProps) {
  const { svg, r, stroke, fontSize } = sizeMap[size]
  const center = svg / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const colorClass = scoreToColorClass(score)
  const label = scoreToLabel(score)

  // Determine stroke color based on score
  const strokeColor =
    score >= 80 ? '#16a34a' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444'

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <svg width={svg} height={svg} className="-rotate-90">
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="-mt-2 flex flex-col items-center" style={{ marginTop: -(svg / 2 + 8) }}>
        {/* Score number positioned in center of SVG */}
      </div>
      {/* Overlay score text */}
      <div className={cn('font-bold tabular-nums', fontSize, colorClass)}>{score}</div>
      <span className="text-sm font-medium text-gray-500">{label}</span>
    </div>
  )
}
