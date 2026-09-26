import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import VerifyDependency from './pages/VerifyDependency'
import AnalysisResult from './pages/AnalysisResult'
import SecurityEvents from './pages/SecurityEvents'
import Policies from './pages/Policies'
import DemoCenter from './pages/DemoCenter'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="verify" element={<VerifyDependency />} />
          <Route path="analysis/:id" element={<AnalysisResult />} />
          <Route path="events" element={<SecurityEvents />} />
          <Route path="policies" element={<Policies />} />
          <Route path="demo" element={<DemoCenter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
