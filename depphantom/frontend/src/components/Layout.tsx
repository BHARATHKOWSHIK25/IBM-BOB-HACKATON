import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Search, List, Settings, FlaskConical, ShieldAlert } from 'lucide-react'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/verify', icon: Search, label: 'Verify Dependency' },
  { to: '/events', icon: List, label: 'Security Events' },
  { to: '/policies', icon: Settings, label: 'Policies' },
  { to: '/demo', icon: FlaskConical, label: 'Demo Center' },
]

export default function Layout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220,
        background: 'var(--bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              background: '#dc2626',
              borderRadius: 8,
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <ShieldAlert size={18} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                DepPhantom
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                Supply Chain Gate
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: '12px 10px', flex: 1 }}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 6,
                color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                background: isActive ? '#eff6ff' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: 13.5,
                textDecoration: 'none',
                marginBottom: 2,
                transition: 'background 0.1s, color 0.1s',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer tagline */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-faint)',
          lineHeight: 1.5,
        }}>
          Don't let AI invent your next supply-chain attack.
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  )
}
