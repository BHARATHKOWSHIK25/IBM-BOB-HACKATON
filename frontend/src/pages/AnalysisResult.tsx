import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import type { AnalysisResponse } from '../types'
import { PageHeader, Spinner, RiskBadge, DecisionBadge, DemoBanner, Card, SignalRow, SecondaryButton } from '../components/ui'
import { format } from 'date-fns'
import { ArrowLeft } from 'lucide-react'

export default function AnalysisResult() {
  const { id } = useParams()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [loading] = useState(false)

  useEffect(() => {
    const state = location.state as { result?: AnalysisResponse } | null
    if (state?.result) setResult(state.result)
  }, [id, location.state])

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}><Spinner /></div>

  if (!result) return (
    <div>
      <PageHeader title="Analysis Result" />
      <div style={{ padding: '60px 28px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
        <div style={{ fontSize: 14, marginBottom: 16 }}>No analysis result available for request #{id}.</div>
        <SecondaryButton onClick={() => navigate('/app/verify')}><ArrowLeft size={13} /> Verify a Dependency</SecondaryButton>
      </div>
    </div>
  )

  const dec     = (result.decision as string).toUpperCase()
  const risk    = (result.overall_risk as string).toUpperCase()
  const blocked = dec === 'BLOCK', review = dec === 'REVIEW'
  const acColor = blocked ? '#ff3b3b' : review ? '#f59e0b' : '#10b981'
  const acBg    = blocked ? '#ff3b3b12' : review ? '#f59e0b12' : '#10b98112'
  const acBor   = blocked ? '#ff3b3b30' : review ? '#f59e0b30' : '#10b98130'

  return (
    <div>
      <PageHeader
        title="Dependency Security Report"
        subtitle={`Analysis for: ${result.package} · ${result.ecosystem?.toUpperCase()}`}
        action={<SecondaryButton onClick={() => navigate('/app/verify')}><ArrowLeft size={13} /> New Verification</SecondaryButton>}
      />

      <div style={{ padding: '28px' }}>
        {result.is_demo && <DemoBanner />}

        {/* VERDICT */}
        <div style={{ background: acBg, border: `1px solid ${acBor}`, borderLeft: `4px solid ${acColor}`, borderRadius: 12, padding: '26px 28px', marginBottom: 24 }}>
          <div style={{ fontWeight: 800, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: acColor, marginBottom: 10, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
            {blocked ? '⛔ DEPENDENCY BLOCKED' : review ? '⚠ REVIEW REQUIRED' : '✓ DEPENDENCY APPROVED'}
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.6px', marginBottom: 14, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
            {result.package}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
            <RiskBadge risk={risk} size="lg" />
            <DecisionBadge decision={dec} size="lg" />
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
              confidence: {(result.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{result.explanation}</div>
        </div>

        {/* Grid: package info + signal breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          <Card title="Package Information">
            <table style={{ width: '100%' }}>
              <tbody>
                {[
                  ['Package',           result.package],
                  ['Ecosystem',         result.ecosystem?.toUpperCase()],
                  ['Version',           result.version || 'latest'],
                  ['Source',            result.source],
                  ['In Registry',       result.registry.exists ? '✓ Yes' : '✕ Not found'],
                  ['Publisher',         result.registry.publisher || '—'],
                  ['License',           result.registry.license || '—'],
                  ['Latest Version',    result.registry.latest_version || '—'],
                  ['Package Age',       result.metadata.package_age_days != null ? `${result.metadata.package_age_days} days` : '—'],
                  ['Version Count',     String(result.metadata.version_count)],
                  ['Downloads',         result.registry.download_count?.toLocaleString() || '—'],
                  ['Maintainers',       result.registry.maintainers?.join(', ') || '—'],
                ].map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '7px 0', fontWeight: 600, fontSize: 12.5, color: 'var(--text-muted)', width: '48%', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>{k}</td>
                    <td style={{ padding: '7px 0', fontSize: 13, color: 'var(--text)', wordBreak: 'break-all' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card title="Risk Signal Breakdown">
            {[
              { label: 'Registry Existence', val: result.registry.exists ? 'FOUND' : 'NOT FOUND',  status: result.registry.exists ? 'OK' : 'DANGER' },
              { label: 'Package Age',        val: result.metadata.is_new ? 'NEW' : 'ESTABLISHED',  status: result.metadata.is_new ? 'WARNING' : 'OK' },
              { label: 'Typosquatting',      val: result.typosquat.is_suspicious ? `${(result.typosquat.similarity_score * 100).toFixed(0)}% similar to '${result.typosquat.closest_match}'` : 'NONE', status: result.typosquat.is_suspicious ? 'DANGER' : 'OK' },
              { label: 'Install Scripts',    val: (result.script_risk.risk_level as string).toUpperCase(), status: result.script_risk.risk_level === 'LOW' ? 'OK' : result.script_risk.risk_level === 'MEDIUM' ? 'WARNING' : result.script_risk.risk_level === 'UNKNOWN' ? 'UNKNOWN' : 'DANGER' },
              { label: 'Dependency Risk',    val: (result.dependency_risk.risk_level as string).toUpperCase(), status: result.dependency_risk.risk_level === 'LOW' ? 'OK' : result.dependency_risk.risk_level === 'MEDIUM' ? 'WARNING' : 'DANGER' },
              { label: 'AI Intent',          val: result.intent.match_level, status: result.intent.match_level === 'MATCH' ? 'OK' : result.intent.match_level === 'PARTIAL' ? 'WARNING' : result.intent.match_level === 'MISMATCH' ? 'DANGER' : 'UNKNOWN' },
            ].map(row => (
              <SignalRow key={row.label} name={row.label} status={row.status as 'OK'|'WARNING'|'DANGER'|'UNKNOWN'} description={row.val} />
            ))}
          </Card>
        </div>

        {/* Why decision */}
        {result.reasons?.length > 0 && (
          <Card title="Why This Decision?" accent={acColor} style={{ marginBottom: 20 }}>
            {result.reasons.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, padding: '9px 0', borderBottom: i < result.reasons.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13.5, color: 'var(--text)', lineHeight: 1.65 }}>
                <span style={{ flexShrink: 0, color: acColor, marginTop: 2 }}>{blocked ? '✕' : review ? '⚠' : '✓'}</span>
                {r}
              </div>
            ))}
          </Card>
        )}

        {/* Typosquatting */}
        {result.typosquat.is_suspicious && (
          <Card title="Typosquatting Analysis" accent="#ff3b3b" style={{ marginBottom: 20 }}>
            <div style={{ background: '#ff3b3b12', border: '1px solid #ff3b3b30', borderRadius: 8, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#ff3b3b', marginBottom: 10 }}>Potential impersonation detected</div>
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', fontSize: 13 }}>
                {[['Requested', result.package], ['Similar to', result.typosquat.closest_match], ['Similarity', `${(result.typosquat.similarity_score * 100).toFixed(0)}%`]].map(([k, v]) => (
                  <div key={k}><span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{k}: </span><code style={{ background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 4, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace', fontSize: 13 }}>{v}</code></div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Script risk */}
        {result.script_risk.findings?.length > 0 && (
          <Card title="Installation Script Analysis" accent="#f59e0b" style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 12 }}><RiskBadge risk={(result.script_risk.risk_level as string).toUpperCase()} /></div>
            {result.script_risk.findings.map((f, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ color: '#f59e0b', flexShrink: 0 }}>⚠</span>
                <span style={{ color: 'var(--text)' }}>{f}</span>
              </div>
            ))}
          </Card>
        )}

        {/* Intent */}
        {result.intent?.explanation && (
          <Card title="AI Intent Analysis" accent="#8b5cf6" style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>Intent Match:</span>
              <span style={{
                padding: '2px 10px', borderRadius: 5,
                background: result.intent.match_level === 'MATCH' ? '#10b98112' : result.intent.match_level === 'MISMATCH' ? '#ff3b3b12' : '#f59e0b12',
                color:      result.intent.match_level === 'MATCH' ? '#10b981'   : result.intent.match_level === 'MISMATCH' ? '#ff3b3b'   : '#f59e0b',
                border: `1px solid ${result.intent.match_level === 'MATCH' ? '#10b98130' : result.intent.match_level === 'MISMATCH' ? '#ff3b3b30' : '#f59e0b30'}`,
                fontWeight: 700, fontSize: 12, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace', letterSpacing: '0.05em',
              }}>
                {result.intent.match_level}
              </span>
            </div>
            <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7, marginBottom: 14 }}>{result.intent.explanation}</div>
            {result.intent.signals?.length > 0 && result.intent.signals.map((s, i) => (
              <SignalRow key={i} name={s.name} status={s.status as 'OK'|'WARNING'|'DANGER'|'UNKNOWN'} description={s.description} value={s.value} />
            ))}
          </Card>
        )}

        {result.timestamp && (
          <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 8, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
            Analysis performed: {format(new Date(result.timestamp), 'PPpp')}
          </div>
        )}
      </div>
    </div>
  )
}
