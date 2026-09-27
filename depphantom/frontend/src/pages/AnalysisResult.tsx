import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import type { AnalysisResponse } from '../types'
import {
  PageHeader, Spinner, RiskBadge, DecisionBadge, DemoBanner, Card, SignalRow
} from '../components/ui'
import { format } from 'date-fns'

// This page receives a full result via react-router location state
export default function AnalysisResult() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [loading] = useState(false)

  useEffect(() => {
    // Read result from navigate() state (set by VerifyDependency and DemoCenter)
    const locationState = location.state as { result?: AnalysisResponse } | null
    if (locationState?.result) {
      setResult(locationState.result)
    }
  }, [id, location.state])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
        <Spinner />
      </div>
    )
  }

  if (!result) {
    return (
      <div>
        <PageHeader title="Analysis Result" />
        <div style={{ padding: '40px 28px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 14, marginBottom: 12 }}>
            No analysis result available for request #{id}.
          </div>
          <button
            onClick={() => navigate('/verify')}
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', cursor: 'pointer', fontSize: 13 }}
          >
            ← Verify a Dependency
          </button>
        </div>
      </div>
    )
  }

  const decisionStr = (result.decision as string).toUpperCase()
  const riskStr = (result.overall_risk as string).toUpperCase()
  const isBlocked = decisionStr === 'BLOCK'
  const isReview = decisionStr === 'REVIEW'

  return (
    <div>
      <PageHeader
        title="Dependency Security Report"
        subtitle={`Analysis for: ${result.package} · ${result.ecosystem?.toUpperCase()}`}
        action={
          <button onClick={() => navigate('/verify')} style={{
            background: 'none',
            border: '1px solid var(--border)',
            borderRadius: 6,
            padding: '7px 14px',
            fontSize: 13,
            cursor: 'pointer',
            color: 'var(--text-muted)',
          }}>
            ← New Verification
          </button>
        }
      />

      <div style={{ padding: '24px 28px' }}>
        {result.is_demo && <DemoBanner />}

        {/* VERDICT BLOCK */}
        <div style={{
          background: isBlocked ? '#fff1f2' : isReview ? '#fffbeb' : '#f0fdf4',
          border: `2px solid ${isBlocked ? '#dc2626' : isReview ? '#d97706' : '#16a34a'}`,
          borderRadius: 8,
          padding: '24px 28px',
          marginBottom: 24,
        }}>
          <div style={{
            fontWeight: 800,
            fontSize: 11,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: isBlocked ? '#dc2626' : isReview ? '#d97706' : '#16a34a',
            marginBottom: 8,
          }}>
            {isBlocked ? 'DEPENDENCY BLOCKED' : isReview ? 'REVIEW REQUIRED' : 'DEPENDENCY APPROVED'}
          </div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 12 }}>
            {result.package}
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <RiskBadge risk={riskStr} size="lg" />
            <DecisionBadge decision={decisionStr} size="lg" />
            <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Confidence: {(result.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.7 }}>
            {result.explanation}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
          {/* Package info */}
          <Card title="Package Information">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                {[
                  ['Package', result.package],
                  ['Ecosystem', result.ecosystem?.toUpperCase()],
                  ['Version', result.version || 'latest'],
                  ['Source', result.source],
                  ['Exists in Registry', result.registry.exists ? 'Yes' : 'No'],
                  ['Publisher', result.registry.publisher || '—'],
                  ['License', result.registry.license || '—'],
                  ['Latest Version', result.registry.latest_version || '—'],
                  ['Package Age', result.metadata.package_age_days != null ? `${result.metadata.package_age_days} days` : '—'],
                  ['Version Count', String(result.metadata.version_count)],
                  ['Downloads', result.registry.download_count?.toLocaleString() || '—'],
                  ['Maintainers', result.registry.maintainers?.join(', ') || '—'],
                ].map(([k, v]) => (
                  <tr key={k} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 0', fontWeight: 600, color: 'var(--text-muted)', width: '48%' }}>{k}</td>
                    <td style={{ padding: '6px 0', color: 'var(--text)', wordBreak: 'break-all' }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Risk breakdown */}
          <Card title="Risk Signal Breakdown">
            {[
              { label: 'Registry Existence', val: result.registry.exists ? 'FOUND' : 'NOT FOUND', status: result.registry.exists ? 'OK' : 'DANGER' },
              { label: 'Package Age', val: result.metadata.is_new ? 'NEW' : 'ESTABLISHED', status: result.metadata.is_new ? 'WARNING' : 'OK' },
              { label: 'Typosquatting', val: result.typosquat.is_suspicious ? `${(result.typosquat.similarity_score * 100).toFixed(0)}% similar to '${result.typosquat.closest_match}'` : 'NONE', status: result.typosquat.is_suspicious ? 'DANGER' : 'OK' },
              { label: 'Install Scripts', val: (result.script_risk.risk_level as string).toUpperCase(), status: result.script_risk.risk_level === 'LOW' ? 'OK' : result.script_risk.risk_level === 'MEDIUM' ? 'WARNING' : result.script_risk.risk_level === 'UNKNOWN' ? 'UNKNOWN' : 'DANGER' },
              { label: 'Dependency Risk', val: (result.dependency_risk.risk_level as string).toUpperCase(), status: result.dependency_risk.risk_level === 'LOW' ? 'OK' : result.dependency_risk.risk_level === 'MEDIUM' ? 'WARNING' : 'DANGER' },
              { label: 'AI Intent', val: result.intent.match_level, status: result.intent.match_level === 'MATCH' ? 'OK' : result.intent.match_level === 'PARTIAL' ? 'WARNING' : result.intent.match_level === 'MISMATCH' ? 'DANGER' : 'UNKNOWN' },
            ].map(row => (
              <SignalRow key={row.label} name={row.label} status={row.status as 'OK'|'WARNING'|'DANGER'|'UNKNOWN'} description={row.val} />
            ))}
          </Card>
        </div>

        {/* Why blocked */}
        {result.reasons?.length > 0 && (
          <Card title="Why This Decision?" style={{ marginBottom: 20 }}>
            {result.reasons.map((r, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 12,
                padding: '8px 0',
                borderBottom: i < result.reasons.length - 1 ? '1px solid var(--border)' : 'none',
                fontSize: 13.5,
                color: 'var(--text)',
                lineHeight: 1.6,
              }}>
                <span style={{ flexShrink: 0, marginTop: 2 }}>
                  {isBlocked ? '🔴' : isReview ? '⚠️' : '✓'}
                </span>
                {r}
              </div>
            ))}
          </Card>
        )}

        {/* Typosquatting */}
        {result.typosquat.is_suspicious && (
          <Card title="Typosquatting Analysis" style={{ marginBottom: 20 }}>
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 6, padding: '14px 16px', marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#dc2626', marginBottom: 8 }}>
                Potential impersonation detected
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13 }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Requested: </span>
                  <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{result.package}</code>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Similar to: </span>
                  <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{result.typosquat.closest_match}</code>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Similarity: </span>
                  <strong>{(result.typosquat.similarity_score * 100).toFixed(0)}%</strong>
                </div>
              </div>
            </div>
            {result.typosquat.all_matches?.length > 1 && (
              <>
                <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                  All similar packages:
                </div>
                {result.typosquat.all_matches.map(m => (
                  <div key={m.package} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--border)',
                    fontSize: 13,
                  }}>
                    <code style={{ fontFamily: 'monospace', fontWeight: 600 }}>{m.package}</code>
                    <span style={{
                      color: m.score > 0.9 ? '#dc2626' : m.score > 0.8 ? '#d97706' : 'var(--text-muted)',
                      fontWeight: 600,
                    }}>
                      {(m.score * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </>
            )}
          </Card>
        )}

        {/* Install script */}
        {result.script_risk.findings?.length > 0 && (
          <Card title="Installation Script Analysis" style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <RiskBadge risk={(result.script_risk.risk_level as string).toUpperCase()} />
            </div>
            {result.script_risk.findings.map((f, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: 10,
                padding: '7px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: 13,
              }}>
                <span style={{ color: '#dc2626', flexShrink: 0 }}>⚠</span>
                {f}
              </div>
            ))}
          </Card>
        )}

        {/* Intent */}
        {result.intent?.explanation && (
          <Card title="AI Intent Analysis" style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: 13 }}>Intent Match:</span>
              <span style={{
                padding: '2px 10px',
                borderRadius: 4,
                background: result.intent.match_level === 'MATCH' ? '#f0fdf4' : result.intent.match_level === 'MISMATCH' ? '#fef2f2' : '#fffbeb',
                color: result.intent.match_level === 'MATCH' ? '#16a34a' : result.intent.match_level === 'MISMATCH' ? '#dc2626' : '#d97706',
                fontWeight: 700,
                fontSize: 12,
                fontFamily: 'monospace',
              }}>
                {result.intent.match_level}
              </span>
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--text)', lineHeight: 1.7 }}>
              {result.intent.explanation}
            </div>
            {result.intent.signals?.length > 0 && (
              <div style={{ marginTop: 14 }}>
                {result.intent.signals.map((s, i) => (
                  <SignalRow key={i} name={s.name} status={s.status as 'OK'|'WARNING'|'DANGER'|'UNKNOWN'} description={s.description} value={s.value} />
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Timestamp */}
        {result.timestamp && (
          <div style={{ fontSize: 11.5, color: 'var(--text-faint)', marginTop: 8 }}>
            Analysis performed: {format(new Date(result.timestamp), 'PPpp')}
          </div>
        )}
      </div>
    </div>
  )
}
