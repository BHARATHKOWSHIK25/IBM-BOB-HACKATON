import { useEffect, useState } from 'react'
import { getEvents } from '../services/api'
import type { AuditEvent } from '../types'
import { PageHeader, Spinner, RiskBadge, DecisionBadge } from '../components/ui'
import { format } from 'date-fns'

const TH: React.CSSProperties = {
  padding: '10px 16px', textAlign: 'left',
  fontSize: 10, fontWeight: 700, color: 'var(--text-faint)',
  letterSpacing: '0.1em', textTransform: 'uppercase',
  borderBottom: '1px solid var(--border)',
  background: 'var(--surface-2)',
  fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace',
  whiteSpace: 'nowrap',
}

const SEL: React.CSSProperties = {
  padding: '7px 10px', border: '1px solid var(--border)',
  borderRadius: 7, fontSize: 13, color: 'var(--text)',
  background: 'var(--surface-2)', height: 36,
  fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace',
  outline: 'none',
}

const INP: React.CSSProperties = {
  ...SEL,
  minWidth: 180,
}

const LBL: React.CSSProperties = {
  display: 'block', fontSize: 10, fontWeight: 700,
  color: 'var(--text-faint)', marginBottom: 5,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace',
}

export default function SecurityEvents() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ risk: '', decision: '', ecosystem: '', package: '' })

  useEffect(() => {
    setLoading(true)
    getEvents({
      limit: 100,
      risk: filters.risk || undefined,
      decision: filters.decision || undefined,
      ecosystem: filters.ecosystem || undefined,
      package: filters.package || undefined,
    }).then(setEvents).finally(() => setLoading(false))
  }, [filters])

  return (
    <div>
      <PageHeader title="Security Events" subtitle="Audit log of all dependency verification events." />
      <div style={{ padding: '24px 28px' }}>

        {/* Filters */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 22px', display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 24, alignItems: 'flex-end' }}>
          <div>
            <label style={LBL}>Package</label>
            <input style={INP} placeholder="Filter by package..." value={filters.package} onChange={e => setFilters(f => ({ ...f, package: e.target.value }))} />
          </div>
          <div>
            <label style={LBL}>Risk</label>
            <select style={SEL} value={filters.risk} onChange={e => setFilters(f => ({ ...f, risk: e.target.value }))}>
              {['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(o => <option key={o} value={o}>{o || 'All'}</option>)}
            </select>
          </div>
          <div>
            <label style={LBL}>Decision</label>
            <select style={SEL} value={filters.decision} onChange={e => setFilters(f => ({ ...f, decision: e.target.value }))}>
              {['', 'ALLOW', 'REVIEW', 'BLOCK'].map(o => <option key={o} value={o}>{o || 'All'}</option>)}
            </select>
          </div>
          <div>
            <label style={LBL}>Ecosystem</label>
            <select style={SEL} value={filters.ecosystem} onChange={e => setFilters(f => ({ ...f, ecosystem: e.target.value }))}>
              {['', 'pypi', 'npm'].map(o => <option key={o} value={o}>{o || 'All'}</option>)}
            </select>
          </div>
          <button onClick={() => setFilters({ risk: '', decision: '', ecosystem: '', package: '' })}
            style={{ padding: '7px 16px', border: '1px solid var(--border)', borderRadius: 7, background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', height: 36, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
            Clear
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
            {events.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>📋</div>
                <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>No security events found.</div>
              </div>
            ) : (
              <table style={{ width: '100%' }}>
                <thead>
                  <tr>{['Time','Event','Package','Ecosystem','Risk','Decision','User'].map(h => <th key={h} style={TH}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id}
                      style={{ borderBottom: '1px solid var(--border)', transition: 'background .1s' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '11px 16px', fontSize: 11.5, color: 'var(--text-muted)', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace', whiteSpace: 'nowrap' }}>
                        {format(new Date(ev.timestamp), 'MMM d, HH:mm:ss')}
                      </td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontSize: 10.5, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace', padding: '2px 8px', borderRadius: 4, background: ev.event_type === 'OVERRIDE' ? '#8b5cf612' : 'var(--surface-3)', color: ev.event_type === 'OVERRIDE' ? '#8b5cf6' : 'var(--text-muted)', border: '1px solid var(--border)', letterSpacing: '0.05em' }}>
                          {ev.event_type}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', fontWeight: 600, color: 'var(--text)', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace', fontSize: 13 }}>{ev.package_name}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{ fontSize: 10.5, padding: '2px 8px', background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-muted)', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace', letterSpacing: '0.06em' }}>{ev.ecosystem?.toUpperCase()}</span>
                      </td>
                      <td style={{ padding: '11px 16px' }}>{ev.risk_level ? <RiskBadge risk={ev.risk_level} size="sm" /> : <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                      <td style={{ padding: '11px 16px' }}>{ev.decision ? <DecisionBadge decision={ev.decision} size="sm" /> : <span style={{ color: 'var(--text-faint)' }}>—</span>}</td>
                      <td style={{ padding: '11px 16px', color: 'var(--text-muted)', fontSize: 12.5, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>{ev.user}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
