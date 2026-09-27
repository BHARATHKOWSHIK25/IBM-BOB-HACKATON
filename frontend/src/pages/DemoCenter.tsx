import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { runDemoScenario } from '../services/api'
import type { AnalysisResponse } from '../types'
import { PageHeader, Spinner, RiskBadge, DecisionBadge, DemoBanner, Card } from '../components/ui'
import { STATUS_COLORS, STATUS_ICONS } from '../components/ui'
import { ArrowRight, Play } from 'lucide-react'

const SCENARIOS = [
  { id: 'hallucinated',        label: 'AI Hallucination',       icon: '🤖', badge: 'BLOCK', risk: 'CRITICAL', desc: 'An AI agent requests fast-pdf-renderer — a package that does not exist in any registry. DepPhantom catches the hallucination.',   tag: 'Most common AI failure mode', color: '#ff3b3b' },
  { id: 'typosquatting',       label: 'Typosquatting Attack',   icon: '🎭', badge: 'BLOCK', risk: 'CRITICAL', desc: 'The AI requests requets instead of requests — a typosquatted package with a malicious install script.',                       tag: 'Primary demo scenario',       color: '#ff3b3b' },
  { id: 'suspicious_existing', label: 'Malicious Script',       icon: '💣', badge: 'BLOCK', risk: 'CRITICAL', desc: 'Package exists on npm but contains a postinstall script that downloads a payload and exfiltrates credentials.',                tag: 'Demonstrates script analysis', color: '#ff3b3b' },
  { id: 'trusted',             label: 'Trusted Package',        icon: '✓',  badge: 'ALLOW', risk: 'LOW',      desc: 'The AI correctly identifies requests — a well-established, widely trusted Python library with clean signals.',                  tag: 'Shows DepPhantom is not paranoid', color: '#10b981' },
]

export default function DemoCenter() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState<string | null>(null)
  const [result,  setResult]  = useState<AnalysisResponse | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [error,   setError]   = useState<string | null>(null)

  const run = async (id: string) => {
    setLoading(id); setError(null); setResult(null); setActiveId(id)
    try { setResult(await runDemoScenario(id) as unknown as AnalysisResponse) }
    catch (e) { setError(e instanceof Error ? e.message : 'Demo failed') }
    finally { setLoading(null) }
  }

  return (
    <div>
      <PageHeader title="Demo Center" subtitle="Pre-configured attack scenarios for demonstration. All results are simulated demo data." />
      <div style={{ padding: '28px' }}>
        <DemoBanner />

        {/* Scenario grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
          {SCENARIOS.map(sc => {
            const isActive = activeId === sc.id && result
            return (
              <div key={sc.id}
                onClick={() => run(sc.id)}
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${isActive ? sc.color + '50' : 'var(--border)'}`,
                  borderRadius: 12,
                  padding: '22px',
                  cursor: 'pointer',
                  transition: 'border-color .2s, box-shadow .2s',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: isActive ? `0 0 20px ${sc.color}15` : 'none',
                }}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = sc.color + '40' }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                {/* Background glow */}
                <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: `${sc.color}0a`, filter: 'blur(20px)', pointerEvents: 'none' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <span style={{ fontSize: 26 }}>{sc.icon}</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <RiskBadge risk={sc.risk} size="sm" />
                    <DecisionBadge decision={sc.badge} size="sm" />
                  </div>
                </div>
                <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text)', marginBottom: 8 }}>{sc.label}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: 14 }}>{sc.desc}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 4, background: `${sc.color}12`, border: `1px solid ${sc.color}30`, color: sc.color, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace', letterSpacing: '0.04em' }}>
                    {sc.tag}
                  </span>
                  {loading === sc.id
                    ? <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}><Spinner /> Running...</div>
                    : <Play size={14} color={sc.color} />
                  }
                </div>
              </div>
            )
          })}
        </div>

        {error && (
          <div style={{ background: '#ff3b3b12', border: '1px solid #ff3b3b30', borderRadius: 8, padding: '12px 16px', color: '#ff3b3b', fontSize: 13, marginBottom: 20, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
            ✕ {error}
          </div>
        )}

        {result && <ScenarioResult result={result} onReport={() => navigate(`/app/analysis/${result.request_id}`, { state: { result } })} />}
      </div>
    </div>
  )
}

function ScenarioResult({ result, onReport }: { result: AnalysisResponse & { demo_label?: string }; onReport: () => void }) {
  const dec     = (result.decision as string).toUpperCase()
  const risk    = (result.overall_risk as string).toUpperCase()
  const blocked = dec === 'BLOCK', review = dec === 'REVIEW'
  const acColor = blocked ? '#ff3b3b' : review ? '#f59e0b' : '#10b981'
  const acBg    = blocked ? '#ff3b3b12' : review ? '#f59e0b12' : '#10b98112'
  const acBor   = blocked ? '#ff3b3b30' : review ? '#f59e0b30' : '#10b98130'

  return (
    <div className="anim-fadeup">
      <DemoBanner />

      {/* Verdict */}
      <div style={{ background: acBg, border: `1px solid ${acBor}`, borderLeft: `4px solid ${acColor}`, borderRadius: 12, padding: '22px 26px', marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: acColor, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
          {blocked ? '⛔ INSTALLATION BLOCKED' : review ? '⚠ REVIEW REQUIRED' : '✓ INSTALLATION ALLOWED'}
        </div>
        <div style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.5px', marginBottom: 12, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
          {result.package ?? 'package'}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          <RiskBadge risk={risk} size="md" />
          <DecisionBadge decision={dec} size="md" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>confidence: {((result.confidence ?? 0) * 100).toFixed(0)}%</span>
        </div>
        <button onClick={onReport} style={{ background: 'linear-gradient(135deg, #00d4ff, #0ea5e9)', color: '#060b12', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13.5, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 18px #00d4ff33', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          Full Report <ArrowRight size={14} />
        </button>
      </div>

      {/* Timeline */}
      <Card title="Security Event Timeline" style={{ marginBottom: 20 }}>
        {buildTimeline(result).map((step, i, arr) => (
          <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${step.color}18`, border: `2px solid ${step.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: step.color, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace', position: 'relative', zIndex: 1 }}>
                {i + 1}
              </div>
              {i < arr.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 16, marginTop: 3 }} />}
            </div>
            <div style={{ paddingTop: 5 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{step.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.detail}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* Pipeline */}
      {result.pipeline_steps?.length > 0 && (
        <Card title="Verification Pipeline" style={{ marginBottom: 20 }}>
          {result.pipeline_steps.map((step, i) => {
            const sc = STATUS_COLORS[(step.status as 'OK'|'WARNING'|'DANGER'|'UNKNOWN')] ?? '#7a8fa8'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < result.pipeline_steps.length - 1 ? '1px solid var(--border)' : 'none' }}>
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
        </Card>
      )}

      {/* Reasons */}
      {result.reasons?.length > 0 && (
        <Card title="Why This Decision?">
          {result.reasons.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '9px 0', borderBottom: i < result.reasons.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13.5, color: 'var(--text)', lineHeight: 1.6 }}>
              <span style={{ flexShrink: 0, color: acColor }}>{blocked ? '✕' : review ? '⚠' : '✓'}</span>
              {r}
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}

function buildTimeline(result: AnalysisResponse) {
  const pkg = result.package ?? 'package'
  const dec = (result.decision as string).toUpperCase()
  const blocked = dec === 'BLOCK'
  const steps = [
    { label: 'AI dependency request received',    detail: `AI agent requested: ${pkg}`,                                          color: '#7a8fa8' },
    { label: 'DepPhantom intercepted',            detail: 'Pre-installation security gate activated before execution',            color: '#00d4ff' },
    { label: 'Registry lookup performed',         detail: result.registry?.exists ? `Package found in ${result.ecosystem?.toUpperCase?.() ?? ''}` : 'Package NOT found in registry', color: '#f59e0b' },
  ]
  if (result.typosquat?.is_suspicious)
    steps.push({ label: 'Typosquatting detected', detail: `Matches '${result.typosquat.closest_match}' with ${(result.typosquat.similarity_score * 100).toFixed(0)}% similarity`, color: '#ff3b3b' })
  const scriptRisk = (result.script_risk?.risk_level as string) ?? 'UNKNOWN'
  if (!['LOW', 'UNKNOWN'].includes(scriptRisk))
    steps.push({ label: 'Install script risk detected', detail: `Script analysis: ${scriptRisk}`, color: '#ff3b3b' })
  steps.push({ label: blocked ? 'Installation prevented' : 'Installation authorized', detail: blocked ? 'Dependency blocked by DepPhantom security gate' : 'Package cleared for installation', color: blocked ? '#ff3b3b' : '#10b981' })
  if (blocked) steps.push({ label: 'Security event recorded', detail: 'Audit log updated with full analysis details', color: '#7a8fa8' })
  return steps
}
