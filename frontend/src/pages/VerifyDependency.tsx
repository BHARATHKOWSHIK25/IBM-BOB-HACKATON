import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { verifyDependency } from '../services/api'
import type { VerifyRequest, AnalysisResponse } from '../types'
import { PageHeader, Spinner, RiskBadge, DecisionBadge, DemoBanner, PrimaryButton } from '../components/ui'
import { STATUS_ICONS, STATUS_COLORS } from '../components/ui'
import { ArrowRight, Terminal } from 'lucide-react'

const ECOSYSTEMS = [
  { value: 'pypi', label: 'Python / PyPI' },
  { value: 'npm',  label: 'JavaScript / npm' },
]
const SOURCES = [
  { value: 'AI_AGENT', label: 'AI Coding Agent' },
  { value: 'MANUAL',   label: 'Manual / Developer' },
  { value: 'CI_CD',    label: 'CI/CD Pipeline' },
]

const label: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700,
  color: 'var(--text-muted)', marginBottom: 7,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace',
}
const input: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: '1px solid var(--border)',
  borderRadius: 8, fontSize: 14,
  color: 'var(--text)', background: 'var(--surface-2)',
  outline: 'none', transition: 'border-color .15s',
  fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace',
}

export default function VerifyDependency() {
  const navigate = useNavigate()
  const [form, setForm] = useState<VerifyRequest>({ package: '', ecosystem: 'pypi', version: 'latest', reason: '', source: 'AI_AGENT' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResponse | null>(null)

  const set = (f: keyof VerifyRequest, v: string) => setForm(prev => ({ ...prev, [f]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.package.trim()) return
    setLoading(true); setError(null); setResult(null)
    try { setResult(await verifyDependency(form)) }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Verification failed.') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <PageHeader title="Verify Dependency" subtitle="Analyze a package before it enters your development environment." />
      <div style={{ padding: '28px', maxWidth: 980 }}>

        {/* Form card */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '28px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
            <Terminal size={16} color="var(--accent)" />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>Dependency Verification Request</span>
          </div>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
              <div>
                <label style={label}>Package Name *</label>
                <input style={input} placeholder="e.g. requests, lodash, requets" value={form.package} onChange={e => set('package', e.target.value)} required
                  onFocus={e => (e.target.style.borderColor = '#00d4ff44')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              </div>
              <div>
                <label style={label}>Ecosystem</label>
                <select style={input} value={form.ecosystem} onChange={e => set('ecosystem', e.target.value)}>
                  {ECOSYSTEMS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                </select>
              </div>
              <div>
                <label style={label}>Version</label>
                <input style={input} placeholder="latest" value={form.version} onChange={e => set('version', e.target.value)}
                  onFocus={e => (e.target.style.borderColor = '#00d4ff44')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              </div>
              <div>
                <label style={label}>Request Source</label>
                <select style={input} value={form.source} onChange={e => set('source', e.target.value)}>
                  {SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={label}>AI-Stated Reason (context for intent analysis)</label>
              <input style={input} placeholder="e.g. HTTP client for REST API calls, PDF generation" value={form.reason} onChange={e => set('reason', e.target.value)}
                onFocus={e => (e.target.style.borderColor = '#00d4ff44')} onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
            </div>
            <PrimaryButton type="submit" disabled={loading || !form.package.trim()}>
              {loading ? <><Spinner /> Analyzing...</> : <>Verify Dependency <ArrowRight size={15} /></>}
            </PrimaryButton>
          </form>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: '#ff3b3b12', border: '1px solid #ff3b3b30', borderRadius: 8, padding: '12px 16px', color: '#ff3b3b', fontSize: 13, marginBottom: 20, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
            ✕ {error}
          </div>
        )}

        {result && <AnalysisPanel result={result} onFull={() => navigate(`/app/analysis/${result.request_id}`, { state: { result } })} />}
      </div>
    </div>
  )
}

function AnalysisPanel({ result, onFull }: { result: AnalysisResponse; onFull: () => void }) {
  const dec  = (result.decision as string).toUpperCase()
  const risk = (result.overall_risk as string).toUpperCase()
  const blocked = dec === 'BLOCK', review = dec === 'REVIEW'
  const acColor = blocked ? '#ff3b3b' : review ? '#f59e0b' : '#10b981'
  const acBg    = blocked ? '#ff3b3b12' : review ? '#f59e0b12' : '#10b98112'
  const acBor   = blocked ? '#ff3b3b30' : review ? '#f59e0b30' : '#10b98130'

  return (
    <div className="anim-fadeup">
      {result.is_demo && <DemoBanner />}

      {/* Verdict banner */}
      <div style={{ borderRadius: 12, border: `1px solid ${acBor}`, borderLeft: `4px solid ${acColor}`, background: acBg, padding: '22px 26px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: acColor, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
            {blocked ? '⛔ INSTALLATION BLOCKED' : review ? '⚠ HUMAN REVIEW REQUIRED' : '✓ INSTALLATION ALLOWED'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.5px', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
            {result.package}
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-muted)', marginLeft: 12 }}>
              {result.ecosystem?.toUpperCase()} {result.version && `· ${result.version}`}
            </span>
          </div>
          <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <RiskBadge risk={risk} size="md" />
            <DecisionBadge decision={dec} size="md" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>confidence: {(result.confidence * 100).toFixed(0)}%</span>
          </div>
        </div>
        <button onClick={onFull} style={{ background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)', color: '#060b12', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 20px #00d4ff33', display: 'flex', alignItems: 'center', gap: 8 }}>
          Full Report <ArrowRight size={14} />
        </button>
      </div>

      {/* Pipeline */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, marginBottom: 20 }}>
        <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
          Verification Pipeline
        </div>
        <div style={{ padding: '8px 18px' }}>
          {result.pipeline_steps?.map((step, i) => {
            const sc = STATUS_COLORS[(step.status as 'OK'|'WARNING'|'DANGER'|'UNKNOWN')] ?? '#7a8fa8'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < (result.pipeline_steps?.length ?? 0) - 1 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ flexShrink: 0, width: 22, height: 22, borderRadius: '50%', background: `${sc}18`, border: `1px solid ${sc}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: sc, fontFamily: 'monospace' }}>
                  {STATUS_ICONS[(step.status as 'OK'|'WARNING'|'DANGER'|'UNKNOWN')] ?? '?'}
                </span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{step.name}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: '55%', textAlign: 'right' }}>{step.description}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Reasons */}
      {result.reasons?.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
          <div style={{ padding: '13px 18px', borderBottom: '1px solid var(--border)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
            Why {dec}?
          </div>
          <div style={{ padding: '14px 18px' }}>
            {result.reasons.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, fontSize: 13.5, color: 'var(--text)', lineHeight: 1.6 }}>
                <span style={{ color: acColor, flexShrink: 0 }}>{blocked ? '✕' : review ? '⚠' : '✓'}</span>
                {r}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
