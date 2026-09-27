import { useEffect, useState } from 'react'
import { getPolicies, updatePolicy } from '../services/api'
import type { Policy } from '../types'
import { PageHeader, Spinner } from '../components/ui'
import { format } from 'date-fns'
import { ShieldCheck, ShieldX, Eye, ToggleLeft, Zap } from 'lucide-react'

const POLICY_META: Record<string, { label: string; description: string; options: string[]; icon: React.ElementType }> = {
  unknown_package_policy:    { label: 'Unknown Package Policy',        description: 'Action when a package is not found in any registry (likely hallucinated or mistyped).',   options: ['BLOCK', 'REVIEW'],         icon: ShieldX },
  new_package_policy:        { label: 'New Package Policy',            description: 'Action when a package was registered within the last 30 days.',                           options: ['REVIEW', 'BLOCK', 'ALLOW'], icon: Eye },
  typosquatting_policy:      { label: 'Typosquatting Policy',          description: 'Action when a package name is suspiciously similar to a known trusted package.',           options: ['BLOCK', 'REVIEW'],         icon: ShieldX },
  high_risk_script_policy:   { label: 'High-Risk Install Script',      description: 'Action when install scripts contain dangerous patterns (network calls, credential access).', options: ['BLOCK', 'REVIEW'],        icon: Zap },
  intent_mismatch_policy:    { label: 'Intent Mismatch Policy',        description: 'Action when the AI-stated purpose does not match the package\'s apparent functionality.',  options: ['REVIEW', 'BLOCK'],         icon: Eye },
  ai_agent_multiplier:       { label: 'AI Agent Scrutiny',             description: 'Apply additional risk weight to requests originating from AI coding agents.',              options: ['enabled', 'disabled'],     icon: ShieldCheck },
  fail_closed:               { label: 'Fail Closed (Registry Down)',   description: 'When the registry is unreachable, block installation rather than allowing by default.',    options: ['enabled', 'disabled'],     icon: ToggleLeft },
}

function optColor(opt: string) {
  if (opt === 'BLOCK')    return { color: '#ff3b3b', bg: '#ff3b3b12', border: '#ff3b3b30' }
  if (opt === 'REVIEW')   return { color: '#f59e0b', bg: '#f59e0b12', border: '#f59e0b30' }
  if (opt === 'ALLOW')    return { color: '#10b981', bg: '#10b98112', border: '#10b98130' }
  if (opt === 'enabled')  return { color: '#00d4ff', bg: '#00d4ff12', border: '#00d4ff30' }
  return { color: '#7a8fa8', bg: '#1e2d4540', border: '#1e2d45' }
}

export default function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved,  setSaved]  = useState<string | null>(null)

  useEffect(() => {
    getPolicies().then(setPolicies).finally(() => setLoading(false))
  }, [])

  const update = async (key: string, value: string) => {
    setSaving(key)
    try {
      await updatePolicy(key, value)
      setPolicies(prev => prev.map(p => p.key === key ? { ...p, value, updated_at: new Date().toISOString() } : p))
      setSaved(key); setTimeout(() => setSaved(null), 2000)
    } finally { setSaving(null) }
  }

  return (
    <div>
      <PageHeader title="Security Policies" subtitle="Configure DepPhantom's decision policies for different threat scenarios." />
      <div style={{ padding: '24px 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
        ) : (
          <>
            {/* Info banner */}
            <div style={{ background: '#00d4ff0a', border: '1px solid #00d4ff25', borderRadius: 10, padding: '13px 18px', marginBottom: 24, fontSize: 13, color: '#00d4ff', display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 15 }}>ℹ</span>
              <span><strong>Note:</strong> Policy changes take effect immediately for all future verifications and are logged in the audit trail.</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {policies.map(policy => {
                const meta = POLICY_META[policy.key]
                if (!meta) return null
                const Icon = meta.icon
                const isSaving = saving === policy.key
                const isSaved  = saved  === policy.key

                return (
                  <div key={policy.key} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', transition: 'border-color .2s' }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = '#2a3f5f')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}>
                            <Icon size={15} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text)' }}>{meta.label}</span>
                        </div>
                        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, paddingLeft: 42 }}>{meta.description}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6, paddingLeft: 42, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>
                          Updated: {format(new Date(policy.updated_at), 'PPp')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                        {meta.options.map(opt => {
                          const active = policy.value === opt
                          const c = optColor(opt)
                          return (
                            <button key={opt} onClick={() => update(policy.key, opt)} disabled={isSaving} style={{
                              padding: '8px 20px', borderRadius: 7,
                              border: active ? `1.5px solid ${c.border}` : '1px solid var(--border)',
                              background: active ? c.bg : 'transparent',
                              color: active ? c.color : 'var(--text-muted)',
                              fontWeight: active ? 700 : 400,
                              fontSize: 13.5, cursor: isSaving ? 'not-allowed' : 'pointer',
                              transition: 'all .15s',
                              fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace',
                              letterSpacing: '0.04em',
                              boxShadow: active ? `0 0 10px ${c.color}20` : 'none',
                            }}>
                              {opt}
                            </button>
                          )
                        })}
                        {isSaved && <span style={{ fontSize: 12, color: '#10b981', fontWeight: 700, fontFamily: 'Cascadia Code, Consolas, SF Mono, monospace' }}>✓ saved</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {policies.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60, fontSize: 14 }}>
                No policies configured. Policies are seeded on first application start.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
