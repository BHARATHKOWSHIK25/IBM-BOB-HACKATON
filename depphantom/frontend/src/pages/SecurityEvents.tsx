import { useEffect, useState } from 'react'
import { getEvents } from '../services/api'
import type { AuditEvent } from '../types'
import { PageHeader, Spinner, RiskBadge, DecisionBadge } from '../components/ui'
import { format } from 'date-fns'

const RISK_OPTS = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const DEC_OPTS = ['', 'ALLOW', 'REVIEW', 'BLOCK']
const ECO_OPTS = ['', 'pypi', 'npm']

export default function SecurityEvents() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    risk: '', decision: '', ecosystem: '', package: ''
  })

  const load = () => {
    setLoading(true)
    getEvents({
      limit: 100,
      risk: filters.risk || undefined,
      decision: filters.decision || undefined,
      ecosystem: filters.ecosystem || undefined,
      package: filters.package || undefined,
    })
      .then(setEvents)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filters])

  return (
    <div>
      <PageHeader
        title="Security Events"
        subtitle="Audit log of all dependency verification events."
      />
      <div style={{ padding: '20px 28px' }}>
        {/* Filters */}
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '16px 20px',
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 20,
          alignItems: 'flex-end',
        }}>
          <div>
            <label style={lbl}>Package</label>
            <input
              style={inp}
              placeholder="Filter by package..."
              value={filters.package}
              onChange={e => setFilters(f => ({ ...f, package: e.target.value }))}
            />
          </div>
          <div>
            <label style={lbl}>Risk</label>
            <select style={inp} value={filters.risk} onChange={e => setFilters(f => ({ ...f, risk: e.target.value }))}>
              {RISK_OPTS.map(o => <option key={o} value={o}>{o || 'All'}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Decision</label>
            <select style={inp} value={filters.decision} onChange={e => setFilters(f => ({ ...f, decision: e.target.value }))}>
              {DEC_OPTS.map(o => <option key={o} value={o}>{o || 'All'}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Ecosystem</label>
            <select style={inp} value={filters.ecosystem} onChange={e => setFilters(f => ({ ...f, ecosystem: e.target.value }))}>
              {ECO_OPTS.map(o => <option key={o} value={o}>{o || 'All'}</option>)}
            </select>
          </div>
          <button onClick={() => setFilters({ risk: '', decision: '', ecosystem: '', package: '' })}
            style={{ padding: '7px 14px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--bg)', cursor: 'pointer', fontSize: 13, color: 'var(--text-muted)', height: 34 }}>
            Clear
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spinner />
          </div>
        ) : (
          <div style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderRadius: 8,
          }}>
            {events.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                No security events found.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--surface)' }}>
                    {['Time', 'Event', 'Package', 'Ecosystem', 'Risk', 'Decision', 'User'].map(h => (
                      <th key={h} style={th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {format(new Date(ev.timestamp), 'MMM d, HH:mm:ss')}
                      </td>
                      <td style={{ ...td }}>
                        <span style={{
                          fontSize: 11,
                          fontFamily: 'monospace',
                          padding: '2px 7px',
                          borderRadius: 4,
                          background: 'var(--surface)',
                          color: ev.event_type === 'OVERRIDE' ? '#7c5cd8' : 'var(--text-muted)',
                          border: '1px solid var(--border)',
                        }}>
                          {ev.event_type}
                        </span>
                      </td>
                      <td style={{ ...td, fontWeight: 600, color: 'var(--text)' }}>
                        {ev.package_name}
                      </td>
                      <td style={{ ...td, fontFamily: 'monospace', fontSize: 12, color: 'var(--text-muted)' }}>
                        {ev.ecosystem?.toUpperCase()}
                      </td>
                      <td style={td}>
                        {ev.risk_level ? <RiskBadge risk={ev.risk_level} size="sm" /> : '—'}
                      </td>
                      <td style={td}>
                        {ev.decision ? <DecisionBadge decision={ev.decision} size="sm" /> : '—'}
                      </td>
                      <td style={{ ...td, color: 'var(--text-muted)', fontSize: 12.5 }}>
                        {ev.user}
                      </td>
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

const lbl: React.CSSProperties = {
  display: 'block',
  fontSize: 11.5,
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: 4,
  letterSpacing: '0.03em',
  textTransform: 'uppercase',
}

const inp: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 13,
  color: 'var(--text)',
  background: 'var(--bg)',
  height: 34,
}

const th: React.CSSProperties = {
  padding: '8px 14px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--text-muted)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  borderBottom: '1px solid var(--border)',
  whiteSpace: 'nowrap',
}

const td: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 13,
  verticalAlign: 'middle',
}
