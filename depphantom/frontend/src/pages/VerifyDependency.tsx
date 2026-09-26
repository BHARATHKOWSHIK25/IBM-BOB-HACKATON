import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyDependency } from '../services/api'
import type { VerifyRequest, AnalysisResponse } from '../types'
import { PageHeader, Spinner, RiskBadge, DecisionBadge, DemoBanner } from '../components/ui'
import { STATUS_ICONS, STATUS_COLORS } from '../components/ui'

const ECOSYSTEMS = [
  { value: 'pypi', label: 'Python / PyPI' },
  { value: 'npm', label: 'JavaScript / npm' },
]

const SOURCES = [
  { value: 'AI_AGENT', label: 'AI Coding Agent' },
  { value: 'MANUAL', label: 'Manual / Developer' },
  { value: 'CI_CD', label: 'CI/CD Pipeline' },
]

export default function VerifyDependency() {
  const navigate = useNavigate()
  const [form, setForm] = useState<VerifyRequest>({
    package: '',
    ecosystem: 'pypi',
    version: 'latest',
    reason: '',
    source: 'AI_AGENT',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResponse | null>(null)

  const handleChange = (field: keyof VerifyRequest, value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.package.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await verifyDependency(form)
      setResult(res)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed. Check backend connection.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Verify Dependency"
        subtitle="Analyze a package before it enters your development environment."
      />
      <div style={{ padding: '24px 28px', maxWidth: 960 }}>
        {/* Form */}
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '24px',
          marginBottom: 24,
        }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 18, color: 'var(--text)' }}>
            Dependency Verification Request
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label style={labelStyle}>Package Name *</label>
                <input
                  style={inputStyle}
                  placeholder="e.g. requests, lodash, requets"
                  value={form.package}
                  onChange={e => handleChange('package', e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>Ecosystem</label>
                <select style={inputStyle} value={form.ecosystem} onChange={e => handleChange('ecosystem', e.target.value)}>
                  {ECOSYSTEMS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Version</label>
                <input
                  style={inputStyle}
                  placeholder="latest"
                  value={form.version}
                  onChange={e => handleChange('version', e.target.value)}
                />
              </div>
              <div>
                <label style={labelStyle}>Request Source</label>
                <select style={inputStyle} value={form.source} onChange={e => handleChange('source', e.target.value)}>
                  {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>AI-Stated Reason (context for intent analysis)</label>
              <input
                style={inputStyle}
                placeholder="e.g. HTTP client for REST API calls, PDF report generation"
                value={form.reason}
                onChange={e => handleChange('reason', e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !form.package.trim()}
              style={{
                background: loading ? 'var(--border)' : 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '10px 24px',
                fontWeight: 700,
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'background 0.15s',
              }}
            >
              {loading ? <><Spinner /> Analyzing...</> : '→ VERIFY DEPENDENCY'}
            </button>
          </form>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            padding: '12px 16px',
            color: '#dc2626',
            fontSize: 13,
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {result && <AnalysisPanel result={result} onFull={() => navigate(`/analysis/${result.request_id}`, { state: { result } })} />}
      </div>
    </div>
  )
}

function AnalysisPanel({ result, onFull }: { result: AnalysisResponse; onFull: () => void }) {
  const decisionStr = (result.decision as string).toUpperCase()
  const riskStr = (result.overall_risk as string).toUpperCase()
  const isBlocked = decisionStr === 'BLOCK'
  const isReview = decisionStr === 'REVIEW'

  return (
    <div>
      {result.is_demo && <DemoBanner />}

      {/* Verdict banner */}
      <div style={{
        borderRadius: 8,
        border: `2px solid ${isBlocked ? '#dc2626' : isReview ? '#d97706' : '#16a34a'}`,
        background: isBlocked ? '#fff1f2' : isReview ? '#fffbeb' : '#f0fdf4',
        padding: '20px 24px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
      }}>
        <div>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            color: isBlocked ? '#dc2626' : isReview ? '#d97706' : '#16a34a',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            {isBlocked ? '⛔ INSTALLATION BLOCKED' : isReview ? '⚠ HUMAN REVIEW REQUIRED' : '✓ INSTALLATION ALLOWED'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px' }}>
            {result.package}
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 10 }}>
              {result.ecosystem?.toUpperCase()} {result.version && `· ${result.version}`}
            </span>
          </div>
          <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <RiskBadge risk={riskStr} size="md" />
            <DecisionBadge decision={decisionStr} size="md" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Confidence: {(result.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        <button onClick={onFull} style={{
          background: 'var(--accent)',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '9px 18px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Full Report →
        </button>
      </div>

      {/* Pipeline steps */}
      <div style={{
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        marginBottom: 20,
      }}>
        <div style={{ padding: '12px 18px 10px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13 }}>
          Verification Pipeline
        </div>
        <div style={{ padding: '8px 18px' }}>
          {result.pipeline_steps?.map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 0',
              borderBottom: i < (result.pipeline_steps?.length ?? 0) - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{
                flexShrink: 0,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: `${STATUS_COLORS[(step.status as 'OK'|'WARNING'|'DANGER'|'UNKNOWN')] ?? '#6b7280'}18`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: STATUS_COLORS[(step.status as 'OK'|'WARNING'|'DANGER'|'UNKNOWN')] ?? '#6b7280',
              }}>
                {STATUS_ICONS[(step.status as 'OK'|'WARNING'|'DANGER'|'UNKNOWN')] ?? '?'}
              </span>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{step.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: '55%', textAlign: 'right' }}>
                  {step.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why blocked */}
      {result.reasons?.length > 0 && (
        <div style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
        }}>
          <div style={{ padding: '12px 18px 10px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 13 }}>
            Why {decisionStr}?
          </div>
          <div style={{ padding: '12px 18px' }}>
            {result.reasons.map((r, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                marginBottom: 8,
                fontSize: 13,
                color: 'var(--text)',
              }}>
                <span style={{ color: '#dc2626', flexShrink: 0, marginTop: 1 }}>
                  {isBlocked ? '🔴' : isReview ? '⚠️' : '✓'}
                </span>
                {r}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12.5,
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: 6,
  letterSpacing: '0.02em',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  border: '1px solid var(--border)',
  borderRadius: 6,
  fontSize: 13.5,
  color: 'var(--text)',
  background: 'var(--bg)',
  outline: 'none',
}
