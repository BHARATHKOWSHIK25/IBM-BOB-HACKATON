import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

// Landing page — eager (first thing users see)
import LandingPage from './pages/LandingPage'
import Layout from './components/Layout'

// App pages — lazy loaded (only fetched when user navigates to /app/*)
const Dashboard       = lazy(() => import('./pages/Dashboard'))
const VerifyDependency = lazy(() => import('./pages/VerifyDependency'))
const AnalysisResult  = lazy(() => import('./pages/AnalysisResult'))
const SecurityEvents  = lazy(() => import('./pages/SecurityEvents'))
const Policies        = lazy(() => import('./pages/Policies'))
const DemoCenter      = lazy(() => import('./pages/DemoCenter'))

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <div style={{ width: 22, height: 22, border: '2px solid #1e2d45', borderTopColor: '#00d4ff', borderRadius: '50%', animation: 'spin .7s linear infinite' }} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
          <Route path="verify"    element={<Suspense fallback={<PageLoader />}><VerifyDependency /></Suspense>} />
          <Route path="analysis/:id" element={<Suspense fallback={<PageLoader />}><AnalysisResult /></Suspense>} />
          <Route path="events"    element={<Suspense fallback={<PageLoader />}><SecurityEvents /></Suspense>} />
          <Route path="policies"  element={<Suspense fallback={<PageLoader />}><Policies /></Suspense>} />
          <Route path="demo"      element={<Suspense fallback={<PageLoader />}><DemoCenter /></Suspense>} />
        </Route>
        {/* Legacy redirects */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/verify"    element={<Navigate to="/app/verify"    replace />} />
        <Route path="/events"    element={<Navigate to="/app/events"    replace />} />
        <Route path="/policies"  element={<Navigate to="/app/policies"  replace />} />
        <Route path="/demo"      element={<Navigate to="/app/demo"      replace />} />
      </Routes>
    </BrowserRouter>
  )
}
