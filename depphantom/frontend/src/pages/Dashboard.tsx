import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, ShieldX, AlertTriangle, Brain, ArrowRight } from 'lucide-react'
import { getDashboard } from '../services/api'
import type { DashboardStats } from '../types'
import { PageHeader, Spinner, RiskBadge, DecisionBadge } from '../components/ui'
import { format } from 'date-fns'

const statCards = [
  {
    key: 'protected_installations',
    label: 'Protected Installations',
    icon: ShieldCheck,
    color: '#3b82d4',
    bg: '#eff6ff',
  },
  {
    key: 'blocked_dependencies',
    label: 'Blocked Dependencies',
    icon: ShieldX,
    color: '#dc2626',
    bg: '#fef2f2',
  },
  {
    key: 'review_required',
    label: 'Review Required',
    icon: AlertTriangle,
    color: '#d97706',
    bg: '#fffbeb',
  },
  {
    key: 'high_risk_packages',
    label: 'High-Risk Packages',
    icon: ShieldX,
    color: '#991b1b',
    bg: '#fff1f2',
  },
  {
    key: 'ai_hallucinations_detected',
    label: 'AI Hallucinations Detected',
    icon: Brain,
    color: '#7c5cd8',
    bg: '#f5f3ff',
  },
]

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getDashboard()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <PageHeader
        title="Security Dashboard"
        subtitle="Pre-installation dependency security gate for autonomous AI coding agents"
        action={
          <button
            onClick={() => navigate('/verify')}
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            Verify Dependency <ArrowRight size={14} />
          </button>
        }
      />

      <div style={{ padding: '24px 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spinner />
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 28,
            }}>
              {statCards.map(({ key, label, icon: Icon, color, bg }) => (
                <div key={key} style={{
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '18px 20px',
                }}>
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 12,
                  }}>
                    <Icon size={18} color={color} />
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                    {stats?.[key as keyof DashboardStats] as number ?? 0}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 6 }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent events */}
            <div style={{
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: 8,
            }}>
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                  Recent Security Events
                </span>
                <button
                  onClick={() => navigate('/events')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent)',
                    fontSize: 12.5,
                    cursor: 'pointer',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  View all <ArrowRight size={12} />
                </button>
              </div>

              {!stats?.recent_events?.length ? (
                <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  No verification events yet. <button
                    onClick={() => navigate('/verify')}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer' }}
                  >
                    Verify your first dependency.
                  </button>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface)' }}>
                      {['Time', 'Package', 'Ecosystem', 'Risk', 'Decision'].map(h => (
                        <th key={h} style={{
                          padding: '8px 16px',
                          textAlign: 'left',
                          fontSize: 11.5,
                          fontWeight: 600,
                          color: 'var(--text-muted)',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          borderBottom: '1px solid var(--border)',
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.recent_events?.map((ev, i) => (
                      <tr key={ev.id ?? i} style={{
                        borderBottom: '1px solid var(--border)',
                        transition: 'background 0.1s',
                      }}>
                        <td style={{ padding: '10px 16px', fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                          {format(new Date(ev.timestamp), 'HH:mm:ss')}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                          {ev.package_name}
                        </td>
                        <td style={{ padding: '10px 16px', fontSize: 12, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {ev.ecosystem?.toUpperCase()}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          {ev.risk_level && <RiskBadge risk={ev.risk_level} size="sm" />}
                        </td>
                        <td style={{ padding: '10px 16px' }}>
                          {ev.decision && <DecisionBadge decision={ev.decision} size="sm" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Principle callout */}
            <div style={{
              marginTop: 24,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderLeft: '3px solid #dc2626',
              borderRadius: 8,
              padding: '18px 20px',
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 10 }}>
                Security Principle
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {[
                  { label: 'AI-generated ≠ Trusted', desc: 'Every AI-generated dependency must establish identity and trust before installation.' },
                  { label: 'Existing ≠ Safe', desc: 'A package existing in the registry does not make it automatically safe.' },
                  { label: 'Popular ≠ Safe', desc: 'Download count alone is not evidence of safety or legitimacy.' },
                ].map(p => (
                  <div key={p.label} style={{ padding: '12px 14px', background: 'var(--surface)', borderRadius: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--text)', marginBottom: 4 }}>
                      {p.label}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                      {p.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
