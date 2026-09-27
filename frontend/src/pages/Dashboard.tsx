import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, ShieldX, AlertTriangle, Brain, ArrowRight, TrendingUp } from 'lucide-react'
import { getDashboard } from '../services/api'
import type { DashboardStats } from '../types'
import { PageHeader, Spinner, RiskBadge, DecisionBadge, StatCard, PrimaryButton } from '../components/ui'
import { format } from 'date-fns'

const statCards = [
  { key: 'protected_installations', label: 'Protected',     icon: ShieldCheck,  color: '#00d4ff', bg: '#00d4ff12', border: '#00d4ff25' },
  { key: 'blocked_dependencies',    label: 'Blocked',        icon: ShieldX,      color: '#ff3b3b', bg: '#ff3b3b12', border: '#ff3b3b25' },
  { key: 'review_required',         label: 'Review Required',icon: AlertTriangle, color: '#f59e0b', bg: '#f59e0b12', border: '#f59e0b25' },
  { key: 'high_risk_packages',      label: 'High-Risk',      icon: TrendingUp,   color: '#ef4444', bg: '#ef444412', border: '#ef444425' },
  { key: 'ai_hallucinations_detected', label: 'Hallucinations', icon: Brain,     color: '#8b5cf6', bg: '#8b5cf612', border: '#8b5cf625' },
]

const TH: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: 10, fontWeight: 700, color: 'var(--text-faint)',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  borderBottom: '1px solid var(--border)',
  background: 'var(--surface-2)',
  fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace',
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboard().then(setStats).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="Security Dashboard"
        subtitle="Pre-installation dependency security gate for autonomous AI coding agents"
        action={<PrimaryButton onClick={() => navigate('/app/verify')}>Verify Dependency <ArrowRight size={14} /></PrimaryButton>}
      />

      <div style={{ padding: '28px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner /></div>
        ) : (
          <div className="anim-fadeup">
            {/* Stat row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 14, marginBottom: 28 }}>
              {statCards.map(({ key, label, icon: Icon, color, bg, border }) => (
                <StatCard key={key} label={label} value={stats?.[key as keyof DashboardStats] as number ?? 0}
                  icon={<Icon size={18} />} color={color} bg={bg} border={border} />
              ))}
            </div>

            {/* Recent events */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 24, overflow: 'hidden' }}>
              <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
                  Recent Security Events
                </span>
                <button onClick={() => navigate('/app/events')} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 12.5, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                  View all <ArrowRight size={12} />
                </button>
              </div>
              {!stats?.recent_events?.length ? (
                <div style={{ padding: '56px 32px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 14 }}>🔍</div>
                  <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 10 }}>No verification events yet.</div>
                  <button onClick={() => navigate('/app/verify')} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 13.5, fontWeight: 600 }}>
                    Verify your first dependency →
                  </button>
                </div>
              ) : (
                <table style={{ width: '100%' }}>
                  <thead><tr>{['Time','Package','Ecosystem','Risk','Decision'].map(h => <th key={h} style={TH}>{h}</th>)}</tr></thead>
                  <tbody>
                    {stats?.recent_events?.map((ev, i) => (
                      <tr key={ev.id ?? i}
                        style={{ borderBottom: '1px solid var(--border)', transition: 'background .1s', cursor: 'default' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        <td style={{ padding: '11px 16px', fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace', whiteSpace: 'nowrap' }}>{format(new Date(ev.timestamp), 'HH:mm:ss')}</td>
                        <td style={{ padding: '11px 16px', fontSize: 13.5, fontWeight: 600, color: 'var(--text)', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>{ev.package_name}</td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{ fontSize: 10.5, padding: '2px 8px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-muted)', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace', letterSpacing: '0.06em' }}>{ev.ecosystem?.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '11px 16px' }}>{ev.risk_level && <RiskBadge risk={ev.risk_level} size="sm" />}</td>
                        <td style={{ padding: '11px 16px' }}>{ev.decision && <DecisionBadge decision={ev.decision} size="sm" />}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Principles */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px 12px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
                Security Principles
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)' }}>
                {[
                  { label: 'AI-generated ≠ Trusted', desc: 'Every AI-generated dependency must establish identity and trust before installation.', color: '#ff3b3b' },
                  { label: 'Existing ≠ Safe',         desc: 'A package existing in the registry does not make it safe. Typosquats exist at scale.', color: '#f59e0b' },
                  { label: 'Popular ≠ Safe',           desc: 'Download counts are not a proxy for safety. Verify intent on every request.', color: '#8b5cf6' },
                ].map((p, i) => (
                  <div key={p.label} style={{ padding: '22px 24px', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 3, height: 24, background: p.color, borderRadius: 2, marginBottom: 14, boxShadow: `0 0 10px ${p.color}66` }} />
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 8 }}>{p.label}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65 }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
