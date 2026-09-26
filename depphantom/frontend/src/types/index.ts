// DepPhantom TypeScript types

export type Ecosystem = 'pypi' | 'npm'
export type Source = 'AI_AGENT' | 'MANUAL' | 'CI_CD'
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN'
export type Decision = 'ALLOW' | 'REVIEW' | 'BLOCK'
export type SignalStatus = 'OK' | 'WARNING' | 'DANGER' | 'UNKNOWN'
export type IntentMatch = 'MATCH' | 'PARTIAL' | 'MISMATCH' | 'UNKNOWN'

export interface SignalResult {
  name: string
  status: SignalStatus
  value: string | number | boolean | null
  description: string
}

export interface RegistryResult {
  exists: boolean
  registry_url?: string
  latest_version?: string
  all_versions: string[]
  published_at?: string
  publisher?: string
  maintainers: string[]
  description?: string
  homepage?: string
  license?: string
  download_count?: number
  is_demo: boolean
}

export interface TyposquatResult {
  closest_match?: string
  similarity_score: number
  is_suspicious: boolean
  all_matches: Array<{ package: string; score: number }>
}

export interface MetadataResult {
  package_age_days?: number
  version_count: number
  is_new: boolean
  is_abandoned: boolean
  signals: SignalResult[]
}

export interface ScriptRiskResult {
  risk_level: RiskLevel | 'UNKNOWN'
  findings: string[]
  signals: SignalResult[]
}

export interface DependencyRiskResult {
  risk_level: RiskLevel | 'UNKNOWN'
  suspicious_deps: string[]
  signals: SignalResult[]
}

export interface IntentResult {
  match_level: IntentMatch
  explanation: string
  signals: SignalResult[]
}

export interface AnalysisResponse {
  request_id: number
  analysis_id?: number
  package: string
  ecosystem: string
  version?: string
  source: string
  registry: RegistryResult
  typosquat: TyposquatResult
  metadata: MetadataResult
  script_risk: ScriptRiskResult
  dependency_risk: DependencyRiskResult
  intent: IntentResult
  overall_risk: RiskLevel
  confidence: number
  decision: Decision
  reasons: string[]
  explanation: string
  pipeline_steps: SignalResult[]
  timestamp: string
  is_demo?: boolean
  demo_label?: string
}

export interface AuditEvent {
  id: number
  event_type: string
  package_name: string
  ecosystem: string
  risk_level?: RiskLevel
  decision?: Decision
  user: string
  timestamp: string
  details?: Record<string, unknown>
}

export interface DashboardStats {
  protected_installations: number
  blocked_dependencies: number
  review_required: number
  high_risk_packages: number
  ai_hallucinations_detected: number
  recent_events: Array<{
    id: number
    package_name: string
    ecosystem: string
    risk_level?: string
    decision?: string
    timestamp: string
    event_type: string
  }>
}

export interface Policy {
  key: string
  value: string
  description?: string
  updated_at: string
}

export interface DemoScenario {
  id: string
  label: string
  description: string
}

export interface VerifyRequest {
  package: string
  ecosystem: Ecosystem
  version?: string
  reason?: string
  source?: Source
}
