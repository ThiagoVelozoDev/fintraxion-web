import type { ReactNode } from 'react'

export type StatVariant = 'accent' | 'cyan' | 'green' | 'red' | 'amber' | 'purple'

type StatCardProps = {
  label: string
  value: string
  trend?: string
  icon: ReactNode
  variant?: StatVariant
}

function trendClass(trend: string): string {
  if (trend.startsWith('+')) return 'stat-trend stat-trend-up'
  if (trend.startsWith('-')) return 'stat-trend stat-trend-down'
  return 'stat-trend stat-trend-neutral'
}

function trendArrow(trend: string): string {
  if (trend.startsWith('+')) return '↑'
  if (trend.startsWith('-')) return '↓'
  return '→'
}

export function StatCard({ label, value, trend, icon, variant = 'accent' }: StatCardProps) {
  return (
    <article className="card stat-card">
      <div className="stat-card-header">
        <div className={`stat-icon stat-icon-${variant}`}>{icon}</div>
        {trend && (
          <span className={trendClass(trend)}>
            {trendArrow(trend)} {trend.replace(/^[+\-]/, '')}
          </span>
        )}
      </div>
      <p className="stat-label">{label}</p>
      <strong className="stat-value">{value}</strong>
    </article>
  )
}
