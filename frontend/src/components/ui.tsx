import type { SignalStatus } from '../types'

/* ── Color maps ── */
export const RISK_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  LOW:      { color: '#10b981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.28)' },
  MEDIUM:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.28)' },
  HIGH:     { color: '#ef4444', bg: 'rgba(239,68,68,0.10)',   border: 'rgba(239,68,68,0.28)' },
  CRITICAL: { color: '#ff3b3b', bg: 'rgba(255,59,59,0.12)',   border: 'rgba(255,59,59,0.38)' },
  UNKNOWN:  { color: '#7a8fa8', bg: 'rgba(30,45,69,0.40)',    border: '#1e2d45' },
}

export const DECISION_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  ALLOW:  { color: '#10b981', bg: 'rgba(16,185,129,0.10)',  border: 'rgba(16,185,129,0.28)' },
  REVIEW: { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.28)' },
  BLOCK:  { color: '#ff3b3b', bg: 'rgba(255,59,59,0.12)',   border: 'rgba(255,59,59,0.38)' },
}

export const STATUS_ICONS: Record<SignalStatus, string> = {
  OK: '✓', WARNING: '⚠', DANGER: '✕', UNKNOWN: '?',
}

export const STATUS_COLORS: Record<SignalStatus, string> = {
  OK: '#10b981', WARNING: '#f59e0b', DANGER: '#ff3b3b', UNKNOWN: '#7a8fa8',
}

/* Shared style helpers */
const mono: React.CSSProperties = { fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace" }

/* ── RiskBadge ── */
interface RiskBadgeProps { risk: string; size?: 'sm' | 'md' | 'lg' }
export function RiskBadge({ risk, size = 'md' }: RiskBadgeProps) {
  const c = RISK_COLORS[risk?.toUpperCase()] ?? RISK_COLORS.UNKNOWN
  const pad = size === 'lg' ? '5px 14px' : size === 'sm' ? '2px 8px' : '3px 10px'
  const fs  = size === 'lg' ? 12.5 : size === 'sm' ? 10 : 11
  return (
    <span style={{ ...mono, display: 'inline-flex', alignItems: 'center', padding: pad, borderRadius: 5, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 700, fontSize: fs, letterSpacing: '0.07em' }}>
      {risk?.toUpperCase() ?? 'UNKNOWN'}
    </span>
  )
}

/* ── DecisionBadge ── */
interface DecisionBadgeProps { decision: string; size?: 'sm' | 'md' | 'lg' }
export function DecisionBadge({ decision, size = 'md' }: DecisionBadgeProps) {
  const c = DECISION_COLORS[decision?.toUpperCase()] ?? { color: '#7a8fa8', bg: 'rgba(30,45,69,0.40)', border: '#1e2d45' }
  const pad = size === 'lg' ? '6px 18px' : size === 'sm' ? '2px 8px' : '3px 10px'
  const fs  = size === 'lg' ? 13 : size === 'sm' ? 10 : 11
  const icon = decision === 'ALLOW' ? '✓' : decision === 'BLOCK' ? '✕' : '⚠'
  return (
    <span style={{ ...mono, display: 'inline-flex', alignItems: 'center', gap: 5, padding: pad, borderRadius: 5, background: c.bg, color: c.color, border: `1px solid ${c.border}`, fontWeight: 700, fontSize: fs, letterSpacing: '0.07em' }}>
      {icon} {decision?.toUpperCase() ?? '—'}
    </span>
  )
}

/* ── SignalRow ── */
interface SignalRowProps { name: string; status: SignalStatus | string; description: string; value?: string | number | boolean | null }
export function SignalRow({ name, status, description, value }: SignalRowProps) {
  const s = (status || 'UNKNOWN').toUpperCase() as SignalStatus
  const icon  = STATUS_ICONS[s] ?? '?'
  const color = STATUS_COLORS[s] ?? '#7a8fa8'
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ ...mono, flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: `${color}18`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color, marginTop: 1 }}>
        {icon}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', textTransform: 'capitalize' }}>
          {name.replace(/_/g, ' ')}
          {value !== null && value !== undefined && (
            <span style={{ ...mono, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8, fontSize: 11.5 }}>— {String(value)}</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{description}</div>
      </div>
    </div>
  )
}

/* ── PageHeader ── */
interface PageHeaderProps { title: string; subtitle?: string; action?: React.ReactNode }
export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      padding: '28px 32px 24px',
      borderBottom: '1px solid var(--border-2)',
      background: 'var(--surface)',
    }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: subtitle ? 6 : 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.55 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0, marginLeft: 16 }}>{action}</div>}
    </div>
  )
}

/* ── Card ── */
interface CardProps { children: React.ReactNode; style?: React.CSSProperties; title?: string; titleRight?: React.ReactNode; accent?: string }
export function Card({ children, style, title, titleRight, accent }: CardProps) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: `1px solid ${accent ? accent + '40' : 'var(--border)'}`,
      borderLeft: accent ? `3px solid ${accent}` : undefined,
      borderRadius: 10,
      ...style,
    }}>
      {title && (
        <div style={{
          padding: '13px 20px 11px',
          borderBottom: '1px solid var(--border)',
          fontWeight: 700, fontSize: 11,
          color: 'var(--text-faint)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <span>{title}</span>
          {titleRight}
        </div>
      )}
      <div style={{ padding: title ? '16px 20px' : '20px' }}>{children}</div>
    </div>
  )
}

/* ── Spinner ── */
export function Spinner() {
  return (
    <div style={{ display: 'inline-block', width: 22, height: 22, border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
  )
}

/* ── DemoBanner ── */
export function DemoBanner() {
  return (
    <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.28)', borderRadius: 8, padding: '9px 14px', fontSize: 12, color: '#f59e0b', fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 9, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.03em' }}>
      ⚠ DEMO DATA — Simulated results. Not real registry evidence.
    </div>
  )
}

/* ── StatCard ── */
interface StatCardProps { label: string; value: number | string; icon: React.ReactNode; color: string; bg: string; border?: string }
export function StatCard({ label, value, icon, color, bg, border }: StatCardProps) {
  return (
    <div className="stat-card" style={{ border: `1px solid ${border ?? 'var(--border)'}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, borderRadius: '50%', background: `${color}0c`, filter: 'blur(24px)', pointerEvents: 'none' }} />
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, border: `1px solid ${border ?? 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, color }}>
        {icon}
      </div>
      <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', lineHeight: 1, letterSpacing: '-1px', fontFamily: "'Space Grotesk', sans-serif" }}>{value}</div>
      <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 8, fontWeight: 500 }}>{label}</div>
    </div>
  )
}

/* ── PrimaryButton ── */
export function PrimaryButton({ children, onClick, disabled, type = 'button', style }: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit'; style?: React.CSSProperties
}) {
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      background: disabled ? 'var(--surface-3)' : 'linear-gradient(90deg, #12a7ed, #5ac8ff)',
      color: disabled ? 'var(--text-muted)' : '#ffffff',
      border: 'none', borderRadius: 8,
      padding: '10px 22px', fontWeight: 700, fontSize: 14,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: disabled ? 'none' : '0 8px 24px rgba(18,167,237,0.32)',
      letterSpacing: '0.01em', transition: 'opacity .15s, transform .1s',
      ...style,
    }}>
      {children}
    </button>
  )
}

/* ── SecondaryButton ── */
export function SecondaryButton({ children, onClick, style }: {
  children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties
}) {
  return (
    <button type="button" onClick={onClick} style={{
      background: 'transparent', color: 'var(--text-muted)',
      border: '1px solid var(--border)', borderRadius: 8,
      padding: '9px 18px', fontSize: 13.5,
      cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7,
      transition: 'border-color .15s, color .15s', letterSpacing: '0.01em',
      fontFamily: 'inherit',
      ...style,
    }}>
      {children}
    </button>
  )
}
