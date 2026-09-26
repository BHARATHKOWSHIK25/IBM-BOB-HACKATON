import { useEffect, useState } from 'react'
import { getPolicies, updatePolicy } from '../services/api'
import type { Policy } from '../types'
import { PageHeader, Spinner } from '../components/ui'
import { format } from 'date-fns'

const POLICY_LABELS: Record<string, { label: string; description: string; options: string[] }> = {
  unknown_package_policy: {
    label: 'Unknown Package Policy',
    description: 'Action when a package is not found in the registry (likely hallucinated or mistyped).',
    options: ['BLOCK', 'REVIEW'],
  },
  new_package_policy: {
    label: 'New Package Policy',
    description: 'Action when a package was registered within the last 30 days.',
    options: ['REVIEW', 'BLOCK', 'ALLOW'],
  },
  typosquatting_policy: {
    label: 'Typosquatting Policy',
    description: 'Action when a package name is suspiciously similar to a known trusted package.',
    options: ['BLOCK', 'REVIEW'],
  },
  high_risk_script_policy: {
    label: 'High-Risk Install Script Policy',
    description: 'Action when installation scripts contain dangerous patterns (network calls, shell execution, credential access).',
    options: ['BLOCK', 'REVIEW'],
  },
  intent_mismatch_policy: {
    label: 'Intent Mismatch Policy',
    description: 'Action when the AI-stated purpose does not match the package\'s apparent functionality.',
    options: ['REVIEW', 'BLOCK'],
  },
  ai_agent_multiplier: {
    label: 'AI Agent Scrutiny',
    description: 'Apply additional risk weight to requests originating from AI coding agents.',
    options: ['enabled', 'disabled'],
  },
  fail_closed: {
    label: 'Fail Closed (Registry Unavailable)',
    description: 'When the registry is unreachable, block installation rather than allowing by default.',
    options: ['enabled', 'disabled'],
  },
}

export default function Policies() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    getPolicies().then(setPolicies).finally(() => setLoading(false))
  }, [])

  const handleUpdate = async (key: string, value: string) => {
    setSaving(key)
    try {
      await updatePolicy(key, value)
      setPolicies(prev => prev.map(p => p.key === key ? { ...p, value, updated_at: new Date().toISOString() } : p))
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Security Policies"
        subtitle="Configure DepPhantom's decision policies for different threat scenarios."
      />
      <div style={{ padding: '24px 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
            <Spinner />
          </div>
        ) : (
          <>
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: 8,
              padding: '14px 18px',
              marginBottom: 24,
              fontSize: 13,
              color: '#1d4ed8',
            }}>
              <strong>Security note:</strong> These policies control what happens when risk signals are detected.
              Changes take effect immediately for all future verifications.
              Changes are logged in the audit trail.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {policies.map(policy => {
                const meta = POLICY_LABELS[policy.key]
                if (!meta) return null
                const isSaving = saving === policy.key
                const isSaved = saved === policy.key
                return (
                  <div key={policy.key} style={{
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '18px 20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>
                          {meta.label}
                        </div>
                        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                          {meta.description}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 6 }}>
                          Last updated: {format(new Date(policy.updated_at), 'PPp')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {meta.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleUpdate(policy.key, opt)}
                            disabled={isSaving}
                            style={{
                              padding: '7px 18px',
                              borderRadius: 6,
                              border: policy.value === opt
                                ? `2px solid ${opt === 'BLOCK' ? '#dc2626' : opt === 'REVIEW' ? '#d97706' : opt === 'ALLOW' ? '#16a34a' : opt === 'enabled' ? '#3b82d4' : '#6b7280'}`
                                : '2px solid var(--border)',
                              background: policy.value === opt
                                ? (opt === 'BLOCK' ? '#fef2f2' : opt === 'REVIEW' ? '#fffbeb' : opt === 'ALLOW' ? '#f0fdf4' : opt === 'enabled' ? '#eff6ff' : '#f9fafb')
                                : 'var(--bg)',
                              color: policy.value === opt
                                ? (opt === 'BLOCK' ? '#dc2626' : opt === 'REVIEW' ? '#d97706' : opt === 'ALLOW' ? '#16a34a' : opt === 'enabled' ? '#3b82d4' : '#6b7280')
                                : 'var(--text-muted)',
                              fontWeight: policy.value === opt ? 700 : 400,
                              fontSize: 13,
                              cursor: isSaving ? 'not-allowed' : 'pointer',
                              transition: 'all 0.12s',
                            }}
                          >
                            {opt}
                          </button>
                        ))}
                        {isSaved && (
                          <span style={{ fontSize: 12, color: '#16a34a', fontWeight: 600 }}>✓ Saved</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {policies.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                No policies configured. Policies are seeded on first application start.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
