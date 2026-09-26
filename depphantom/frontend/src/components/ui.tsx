import type { SignalStatus } from '../types'

export const RISK_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  LOW:      { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  MEDIUM:   { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  HIGH:     { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  CRITICAL: { color: '#991b1b', bg: '#fff1f2', border: '#fecdd3' },
  UNKNOWN:  { color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
}

export const DECISION_COLORS: Record<string, { color: string; bg: string }> = {
  ALLOW:  { color: '#16a34a', bg: '#f0fdf4' },
  REVIEW: { color: '#d97706', bg: '#fffbeb' },
  BLOCK:  { color: '#dc2626', bg: '#fef2f2' },
}

export const STATUS_ICONS: Record<SignalStatus, string> = {
  OK: '✓',
  WARNING: '⚠',
  DANGER: '✕',
  UNKNOWN: '?',
}

export const STATUS_COLORS: Record<SignalStatus, string> = {
  OK: '#16a34a',
  WARNING: '#d97706',
  DANGER: '#dc2626',
  UNKNOWN: '#6b7280',
}

interface RiskBadgeProps {
  risk: string
  size?: 'sm' | 'md' | 'lg'
}

export function RiskBadge({ risk, size = 'md' }: RiskBadgeProps) {
  const c = RISK_COLORS[risk?.toUpperCase()] ?? RISK_COLORS.UNKNOWN
  const padding = size === 'lg' ? '6px 14px' : size === 'sm' ? '2px 8px' : '3px 10px'
  const fontSize = size === 'lg' ? 14 : size === 'sm' ? 11 : 12
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding,
      borderRadius: 4,
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      fontWeight: 700,
      fontSize,
      letterSpacing: '0.04em',
      fontFamily: 'monospace',
    }}>
      {risk?.toUpperCase() ?? 'UNKNOWN'}
    </span>
  )
}

interface DecisionBadgeProps {
  decision: string
  size?: 'sm' | 'md' | 'lg'
}

export function DecisionBadge({ decision, size = 'md' }: DecisionBadgeProps) {
  const c = DECISION_COLORS[decision?.toUpperCase()] ?? { color: '#6b7280', bg: '#f9fafb' }
  const padding = size === 'lg' ? '8px 20px' : size === 'sm' ? '2px 8px' : '3px 10px'
  const fontSize = size === 'lg' ? 15 : size === 'sm' ? 11 : 12
  const icon = decision === 'ALLOW' ? '✓' : decision === 'BLOCK' ? '✕' : '⚠'
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding,
      borderRadius: 4,
      background: c.bg,
      color: c.color,
      fontWeight: 700,
      fontSize,
      letterSpacing: '0.04em',
      fontFamily: 'monospace',
    }}>
      {icon} {decision?.toUpperCase() ?? '—'}
    </span>
  )
}

interface SignalRowProps {
  name: string
  status: SignalStatus | string
  description: string
  value?: string | number | boolean | null
}

export function SignalRow({ name, status, description, value }: SignalRowProps) {
  const s = (status || 'UNKNOWN').toUpperCase() as SignalStatus
  const icon = STATUS_ICONS[s] ?? '?'
  const color = STATUS_COLORS[s] ?? '#6b7280'
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12,
      padding: '8px 0',
      borderBottom: '1px solid var(--border)',
    }}>
      <span style={{
        flexShrink: 0,
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: `${color}18`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 11,
        fontWeight: 700,
        color,
        marginTop: 1,
      }}>
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', textTransform: 'capitalize' }}>
          {name.replace(/_/g, ' ')}
          {value !== null && value !== undefined && (
            <span style={{ fontWeight: 400, color: 'var(--text-muted)', marginLeft: 6 }}>
              — {String(value)}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>
      </div>
    </div>
  )
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      padding: '24px 28px 20px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg)',
    }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

interface CardProps {
  children: React.ReactNode
  style?: React.CSSProperties
  title?: string
}

export function Card({ children, style, title }: CardProps) {
  return (
    <div style={{
      background: 'var(--bg)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      ...style,
    }}>
      {title && (
        <div style={{
          padding: '14px 18px 12px',
          borderBottom: '1px solid var(--border)',
          fontWeight: 600,
          fontSize: 13,
          color: 'var(--text)',
          letterSpacing: '-0.1px',
        }}>
          {title}
        </div>
      )}
      <div style={{ padding: title ? '16px 18px' : '18px' }}>
        {children}
      </div>
    </div>
  )
}

export function Spinner() {
  return (
    <div style={{
      display: 'inline-block',
      width: 20,
      height: 20,
      border: '2px solid var(--border)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export function DemoBanner() {
  return (
    <div style={{
      background: '#fffbeb',
      border: '1px solid #fde68a',
      borderRadius: 6,
      padding: '8px 14px',
      fontSize: 12,
      color: '#92400e',
      fontWeight: 500,
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 8,
    }}>
      ⚠ DEMO DATA — Simulated results for demonstration purposes. Not real registry evidence.
    </div>
  )
}
