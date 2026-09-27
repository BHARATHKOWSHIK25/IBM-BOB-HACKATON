import { useState } from 'react'
import { runDemoScenario } from '../services/api'
import type { AnalysisResponse } from '../types'
import {
  PageHeader, Spinner, RiskBadge, DecisionBadge, DemoBanner, Card
} from '../components/ui'
import { STATUS_COLORS, STATUS_ICONS } from '../components/ui'

const SCENARIOS = [
  {
    id: 'hallucinated',
    label: 'AI Hallucination',
    icon: '🤖',
    badge: 'BLOCK',
    badgeRisk: 'CRITICAL',
    description: 'An AI agent requests fast-pdf-renderer — a package that does not exist in PyPI. DepPhantom detects the likely hallucination.',
    highlight: 'Most common AI failure mode',
  },
  {
    id: 'typosquatting',
    label: 'Typosquatting Attack',
    icon: '🎭',
    badge: 'BLOCK',
    badgeRisk: 'CRITICAL',
    description: 'The AI requests requets instead of requests — a typosquatted package with a malicious install script.',
    highlight: 'Primary demo scenario',
  },
  {
    id: 'suspicious_existing',
    label: 'Malicious Install Script',
    icon: '💣',
    badge: 'BLOCK',
    badgeRisk: 'CRITICAL',
    description: 'Package exists on npm but contains a postinstall script that downloads a payload and accesses credentials.',
    highlight: 'Demonstrates script analysis',
  },
  {
    id: 'trusted',
    label: 'Trusted Package',
    icon: '✓',
    badge: 'ALLOW',
    badgeRisk: 'LOW',
    description: 'The AI correctly identifies requests — a well-established, widely trusted Python library.',
    highlight: 'Shows DepPhantom is not paranoid',
  },
]

export default function DemoCenter() {
  const [loading, setLoading] = useState<string | null>(null)
  const [result, setResult] = useState<AnalysisResponse | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runScenario = async (id: string) => {
    setLoading(id)
    setError(null)
    setResult(null)
    setActiveId(id)
    try {
      const res = await runDemoScenario(id)
      setResult(res as unknown as AnalysisResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo failed')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Demo Center"
        subtitle="Pre-configured attack scenarios for demonstration. All results are simulated demo data."
      />
      <div style={{ padding: '24px 28px' }}>
        <DemoBanner />

        {/* Scenario cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, marginBottom: 28 }}>
          {SCENARIOS.map(sc => (
            <div
              key={sc.id}
              style={{
                background: 'var(--bg)',
                border: `2px solid ${activeId === sc.id && result ? (sc.badge === 'BLOCK' ? '#dc2626' : '#16a34a') : 'var(--border)'}`,
                borderRadius: 8,
                padding: '20px',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onClick={() => runScenario(sc.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontSize: 22 }}>{sc.icon}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <RiskBadge risk={sc.badgeRisk} size="sm" />
                  <DecisionBadge decision={sc.badge} size="sm" />
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 6 }}>
                {sc.label}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
                {sc.description}
              </div>
              <div style={{
                fontSize: 11,
                padding: '3px 8px',
                background: 'var(--surface)',
                borderRadius: 4,
                color: 'var(--text-muted)',
                display: 'inline-block',
                border: '1px solid var(--border)',
              }}>
                {sc.highlight}
              </div>
              {loading === sc.id && (
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-muted)' }}>
                  <Spinner /> Running scenario...
                </div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 20 }}>
            {error}
          </div>
        )}

        {result && <ScenarioResult result={result} />}
      </div>
    </div>
  )
}

function ScenarioResult({ result }: { result: AnalysisResponse & { demo_label?: string } }) {
  const isBlocked = (result.decision as string).toUpperCase() === 'BLOCK'
  const isReview = (result.decision as string).toUpperCase() === 'REVIEW'
  const decisionStr = (result.decision as string).toUpperCase()
  const riskStr = (result.overall_risk as string).toUpperCase()

  return (
    <div>
      <DemoBanner />

      {/* Verdict */}
      <div style={{
        background: isBlocked ? '#fff1f2' : isReview ? '#fffbeb' : '#f0fdf4',
        border: `2px solid ${isBlocked ? '#dc2626' : isReview ? '#d97706' : '#16a34a'}`,
        borderRadius: 8,
        padding: '22px 26px',
        marginBottom: 20,
      }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: isBlocked ? '#dc2626' : isReview ? '#d97706' : '#16a34a', marginBottom: 6 }}>
          {isBlocked ? '⛔ INSTALLATION BLOCKED' : isReview ? '⚠ REVIEW REQUIRED' : '✓ INSTALLATION ALLOWED'}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.4px', marginBottom: 10 }}>
          {result.package ?? 'package'}
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <RiskBadge risk={riskStr} size="md" />
          <DecisionBadge decision={decisionStr} size="md" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Confidence: {((result.confidence ?? 0) * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Security timeline */}
      <Card title="Security Event Timeline" style={{ marginBottom: 20 }}>
        {buildTimeline(result).map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: i < buildTimeline(result).length - 1 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: `${step.color}18`,
                border: `2px solid ${step.color}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: step.color,
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              {i < buildTimeline(result).length - 1 && (
                <div style={{ width: 2, flex: 1, background: 'var(--border)', minHeight: 20, marginTop: 4 }} />
              )}
            </div>
            <div style={{ paddingTop: 4 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{step.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.detail}</div>
            </div>
          </div>
        ))}
      </Card>

      {/* Pipeline */}
      {result.pipeline_steps && result.pipeline_steps.length > 0 && (
        <Card title="Verification Pipeline" style={{ marginBottom: 20 }}>
          {result.pipeline_steps.map((step, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 0',
              borderBottom: i < result.pipeline_steps.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{
                flexShrink: 0, width: 20, height: 20, borderRadius: '50%',
                background: `${STATUS_COLORS[(step.status as 'OK' | 'WARNING' | 'DANGER' | 'UNKNOWN')] ?? '#6b7280'}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700,
                color: STATUS_COLORS[(step.status as 'OK' | 'WARNING' | 'DANGER' | 'UNKNOWN')] ?? '#6b7280',
              }}>
                {STATUS_ICONS[(step.status as 'OK' | 'WARNING' | 'DANGER' | 'UNKNOWN')] ?? '?'}
              </span>
              <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{step.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', maxWidth: '55%', textAlign: 'right' }}>{step.description}</span>
              </div>
            </div>
          ))}
        </Card>
      )}

      {/* Reasons */}
      {result.reasons && result.reasons.length > 0 && (
        <Card title="Why This Decision?">
          {result.reasons.map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 0', borderBottom: i < result.reasons.length - 1 ? '1px solid var(--border)' : 'none', fontSize: 13 }}>
              <span style={{ flexShrink: 0, color: '#dc2626' }}>•</span>
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
  const decisionStr = (result.decision as string).toUpperCase()
  const isBlocked = decisionStr === 'BLOCK'
  const registryExists = result.registry?.exists ?? false
  const typosquatSuspicious = result.typosquat?.is_suspicious ?? false
  const typosquatMatch = result.typosquat?.closest_match ?? ''
  const scriptRisk = (result.script_risk?.risk_level as string) ?? 'UNKNOWN'
  const steps = [
    { label: 'AI dependency request received', detail: `AI agent requested: ${pkg}`, color: '#3b82d4' },
    { label: 'DepPhantom intercepted installation', detail: 'Pre-installation security gate activated', color: '#7c5cd8' },
    { label: 'Registry lookup performed', detail: registryExists ? `Package found in ${result.ecosystem?.toUpperCase?.() ?? ''}` : `Package NOT found in registry`, color: '#d97706' },
  ]
  if (typosquatSuspicious) {
    steps.push({ label: 'Typosquatting detected', detail: `Matches '${typosquatMatch}' with high similarity`, color: '#dc2626' })
  }
  if (scriptRisk && !['LOW', 'UNKNOWN'].includes(scriptRisk)) {
    steps.push({ label: 'Install script risk detected', detail: `Script analysis: ${scriptRisk}`, color: '#dc2626' })
  }
  steps.push({
    label: isBlocked ? 'Installation prevented' : 'Installation authorized',
    detail: isBlocked ? 'Dependency blocked by DepPhantom security gate' : 'Package cleared for installation',
    color: isBlocked ? '#dc2626' : '#16a34a',
  })
  if (isBlocked) {
    steps.push({ label: 'Security event recorded', detail: 'Audit log updated with full analysis details', color: '#6b7280' })
  }
  return steps
}
