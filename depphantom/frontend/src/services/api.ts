import axios from 'axios'
import type {
  AnalysisResponse, AuditEvent, DashboardStats, Policy,
  DemoScenario, VerifyRequest
} from '../types'

const BASE = '/api'

const api = axios.create({ baseURL: BASE, timeout: 30000 })

// Verification
export const verifyDependency = (req: VerifyRequest): Promise<AnalysisResponse> =>
  api.post('/dependencies/verify', req).then(r => r.data)

export const getAnalysis = (id: number): Promise<unknown> =>
  api.get(`/dependencies/${id}`).then(r => r.data)

// Dashboard
export const getDashboard = (): Promise<DashboardStats> =>
  api.get('/dashboard').then(r => r.data)

// Events
export const getEvents = (params?: {
  limit?: number; offset?: number; risk?: string;
  decision?: string; ecosystem?: string; package?: string
}): Promise<AuditEvent[]> =>
  api.get('/events', { params }).then(r => r.data)

// Policies
export const getPolicies = (): Promise<Policy[]> =>
  api.get('/policies').then(r => r.data)

export const updatePolicy = (key: string, value: string): Promise<unknown> =>
  api.put('/policies', { key, value }).then(r => r.data)

// Demo
export const getDemoScenarios = (): Promise<DemoScenario[]> =>
  api.get('/demo/scenarios').then(r => r.data)

export const runDemoScenario = (scenario_id: string): Promise<AnalysisResponse> =>
  api.post('/demo/scenario', { scenario_id }).then(r => r.data)

// Override
export const overrideDecision = (
  decision_id: number,
  new_decision: string,
  user: string,
  reason: string
): Promise<unknown> =>
  api.post('/decisions/override', { decision_id, new_decision, user, reason }).then(r => r.data)

export default api
