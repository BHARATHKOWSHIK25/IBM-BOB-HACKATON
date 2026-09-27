import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Search, List, Settings, FlaskConical,
  ChevronRight, Activity, ArrowLeft, Globe, Bell
} from 'lucide-react'
import { DepPhantomLogo } from './Logo'

const nav = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/verify',    icon: Search,           label: 'Verify Dependency' },
  { to: '/app/events',    icon: List,             label: 'Security Events' },
  { to: '/app/policies',  icon: Settings,         label: 'Policies' },
  { to: '/app/demo',      icon: FlaskConical,     label: 'Demo Center' },
]

const TITLES: Record<string, string> = {
  '/app/dashboard': 'Dashboard',
  '/app/verify':    'Verify Dependency',
  '/app/events':    'Security Events',
  '/app/policies':  'Policies',
  '/app/demo':      'Demo Center',
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const [hovered, setHovered] = useState<string | null>(null)
  const title = TITLES[location.pathname] ?? 'DepPhantom'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ── Sidebar ── */}
      <aside className="sidebar">
        {/* Logo block */}
        <div style={{ padding: '22px 20px 20px', borderBottom: '1px solid var(--border-2)' }}>
          <div style={{ marginBottom: 18, cursor: 'pointer' }} onClick={() => navigate('/')}>
            <DepPhantomLogo size={34} showBadge={true} />
          </div>

          {/* Status pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '7px 11px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.28)',
            borderRadius: 7,
            fontSize: 11, fontWeight: 600, color: '#10b981',
            fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', animation: 'pulse-glow 2s ease-in-out infinite', display: 'inline-block' }} />
            PROTECTION ACTIVE
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '14px 10px', flex: 1 }} aria-label="App navigation">
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '4px 10px 12px' }}>
            Navigation
          </div>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-nav-link${isActive ? ' active' : ''}`}
              onMouseEnter={() => setHovered(to)}
              onMouseLeave={() => setHovered(null)}
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent)' : hovered === to ? 'var(--text)' : 'var(--text-muted)',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={15} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {isActive && <ChevronRight size={12} style={{ opacity: 0.4 }} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-2)' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              background: 'transparent', border: 'none',
              fontSize: 12.5, color: 'var(--text-faint)', cursor: 'pointer',
              marginBottom: 14, padding: 0, fontFamily: 'inherit',
              transition: 'color .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-faint)')}
          >
            <ArrowLeft size={13} /> Back to Home
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-faint)', fontSize: 11 }}>
            <Activity size={11} />
            <span style={{ fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>v1.0</span>
            <span>· DepPhantom</span>
          </div>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Topbar */}
        <header style={{
          height: 56,
          borderBottom: '1px solid var(--border-2)',
          background: 'var(--surface)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 28px',
          gap: 10,
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}>
          {/* Breadcrumb */}
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>depphantom</span>
          <ChevronRight size={11} color="var(--text-faint)" />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text)' }}>{title}</span>
          <div style={{ flex: 1 }} />

          {/* Right side actions */}
          <button style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-bright)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            <Bell size={14} />
          </button>
          <button style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text-muted)', cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-bright)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
          >
            <Globe size={14} />
          </button>

          {/* API status */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '5px 12px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            borderRadius: 6,
            fontSize: 11.5,
            color: 'var(--text-muted)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px #10b981', animation: 'pulse-glow 2s ease-in-out infinite', display: 'inline-block' }} />
            API :8000
          </div>
        </header>

        {/* Luminous horizon divider */}
        <div className="glow-horizon-divider" />

        {/* Page content */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)', position: 'relative' }}>
          {/* Subtle top ambient glow */}
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '90%', height: 320, background: 'radial-gradient(ellipse at 50% 0%, rgba(29,175,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
