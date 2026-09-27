import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, Brain, Eye, Terminal, GitBranch, Zap, Lock,
  Activity, Copy, Check, Globe, Menu, X,
  ShieldCheck, AlertTriangle, XCircle, CheckCircle
} from 'lucide-react'
import { DepPhantomLogo } from '../components/Logo'

/* ── DATA ── */
const installTabs = [
  { id: 'pip',  label: 'pip / PyPI',  cmd: 'pip install depphantom && depphantom init' },
  { id: 'npm',  label: 'npm',         cmd: 'npm install -g depphantom && depphantom init' },
  { id: 'npx',  label: 'npx',         cmd: 'npx depphantom@latest init' },
  { id: 'curl', label: 'cURL',        cmd: 'curl -fsSL https://get.depphantom.dev/install.sh | bash' },
]

const metrics = [
  { value: '10,000+', label: 'Packages Verified' },
  { value: '500+',    label: 'Threats Blocked' },
  { value: '13+',     label: 'Risk Signals' },
  { value: '<200ms',  label: 'Avg Decision Time' },
]

const features = [
  { icon: Brain,     color: '#1dafff', title: 'AI Hallucination Detection',  desc: "Catches packages that don't exist in any registry — the #1 failure mode of autonomous coding agents." },
  { icon: Eye,       color: '#8b5cf6', title: 'Typosquatting Detection',      desc: 'Fuzzy-matches every request against 10,000+ trusted packages. requets vs requests — caught instantly.' },
  { icon: Terminal,  color: '#f59e0b', title: 'Install Script Analysis',      desc: 'Static analysis of setup.py and postinstall scripts for network calls, credential theft, and shell execution.' },
  { icon: GitBranch, color: '#10b981', title: 'Dependency Graph Analysis',    desc: 'Walks the transitive dependency tree and flags suspicious packages embedded several levels deep.' },
  { icon: Zap,       color: '#ff3b3b', title: 'Explainable Risk Engine',      desc: "Every decision is backed by a scored signal breakdown — not a black-box score you can't trust." },
  { icon: Lock,      color: '#5ac8ff', title: 'Policy Configuration',         desc: 'Define what BLOCK, REVIEW, and ALLOW mean for your team. Fail-closed by default.' },
]

const detectors = [
  { title: 'Credential Exposure Detection',  desc: 'Identify embedded secrets, tokens, private keys, and connection strings.' },
  { title: 'Prompt Injection Detection',     desc: 'Review encoded, obfuscated, role-manipulation, and system-prompt extraction patterns.' },
  { title: 'Malicious Command Detection',    desc: 'Identify command patterns associated with remote execution and unsafe payload delivery.' },
  { title: 'Data Exfiltration Detection',    desc: 'Review suspicious access and transfer paths that may expose sensitive data.' },
  { title: 'Permission Abuse Analysis',      desc: 'Compare declared tool needs with risky permission combinations.' },
  { title: 'URL Analysis',                   desc: 'Review suspicious domains, phishing patterns, shortened links, and lookalike URLs.' },
]

const whyCards = [
  { icon: Brain,   title: 'Agents Can Take Real Actions',                   body: 'Commands, file changes, API calls and automated workflows can create immediate consequences.' },
  { icon: GitBranch, title: 'Dependencies Add Supply-Chain Risk',           body: 'Unreviewed packages and scripts can introduce malicious payloads, credential leaks, or backdoors.' },
  { icon: Terminal, title: 'Prompt Injection Can Influence Tool Behavior',  body: 'Manipulated instructions can change which packages an agent installs and how those tools are used.' },
  { icon: Eye,     title: 'Static Scanning Is Not Enough',                  body: 'Components can be reviewed before use, while high-impact installs still need a runtime decision.' },
]

const principles = [
  { icon: XCircle,      color: '#ff3b3b', title: 'AI-generated ≠ Trusted', body: 'Every AI-generated dependency must establish identity and trust before installation. No exceptions.' },
  { icon: AlertTriangle,color: '#f59e0b', title: 'Existing ≠ Safe',        body: 'A package in the registry is not automatically safe. Typosquats and malicious packages exist at scale.' },
  { icon: CheckCircle,  color: '#10b981', title: 'Popular ≠ Safe',          body: 'Download counts are not a proxy for safety. event-stream had 2M weekly downloads when compromised.' },
]

const scenarios = [
  { icon: '🤖', label: 'fast-pdf-renderer', tag: 'HALLUCINATED',    color: '#ff3b3b', decision: 'BLOCK' },
  { icon: '🎭', label: 'requets',            tag: 'TYPOSQUATTING',   color: '#ff3b3b', decision: 'BLOCK' },
  { icon: '💣', label: 'event-stream@3.3.6', tag: 'MALICIOUS SCRIPT',color: '#ff3b3b', decision: 'BLOCK' },
  { icon: '✓',  label: 'requests',           tag: 'TRUSTED',         color: '#10b981', decision: 'ALLOW' },
]

/* ── COMPONENTS ── */
function InstallWidget() {
  const [active, setActive] = useState(0)
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(installTabs[active].cmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="install-widget" style={{ maxWidth: 680, width: '100%' }}>
      {/* Tab row */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${installTabs.length}, 1fr)`, borderBottom: '1px solid rgba(255,255,255,0.12)' }}>
        {installTabs.map((t, i) => (
          <button
            key={t.id}
            className={`install-tab${active === i ? ' active' : ''}`}
            onClick={() => setActive(i)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Command row */}
      <div style={{ padding: '24px 28px 28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <code className="install-code">{installTabs[active].cmd}</code>
          <button className="copy-btn" onClick={copy} aria-label="Copy command">
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.40)', lineHeight: 1.6 }}>
          Intercepts every pip/npm install and evaluates it against 13+ risk signals before execution.
        </p>
      </div>
    </div>
  )
}

const navItems = [
  { id: 'features',     label: 'Features' },
  { id: 'solutions',    label: 'Solutions' },
  { id: 'detectors',    label: 'Detectors' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'demo',         label: 'Demo' },
  { id: 'pricing',      label: 'Pricing' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMenuOpen(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>

      {/* ───── HEADER ───── */}
      <header className="site-header">
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 20px', height: '100%', display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Left: logo + nav */}
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: 28, minWidth: 0 }}>
            {/* Effective Cyber Logo */}
            <div
              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => scrollTo('home')}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); scrollTo('home'); } }}
              aria-label="DepPhantom home"
            >
              <DepPhantomLogo size={36} showBadge={true} />
            </div>

            {/* Desktop nav with interactive tab navigation */}
            <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} aria-label="Main navigation">
              {navItems.map(item => (
                <button
                  key={item.id}
                  className="nav-link"
                  onClick={() => scrollTo(item.id)}
                  aria-label={`Navigate to ${item.label}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: lang + buttons + mobile menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <button className="nav-link" style={{ gap: 6, borderRadius: 10, padding: '4px 10px' }} aria-label="Switch language">
              <Globe size={15} />
              <span style={{ fontSize: 12, fontWeight: 500 }}>EN</span>
            </button>
            <button className="btn-sm-secondary" onClick={() => navigate('/app/dashboard')}>
              Open Dashboard
            </button>
            <button className="btn-sm-primary" onClick={() => navigate('/app/verify')}>
              Verify Package
            </button>
            <button
              className="nav-link"
              style={{ width: 40, minWidth: 40, height: 40, border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, padding: 0, justifyContent: 'center' }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div
            style={{
              position: 'absolute',
              top: 72,
              left: 0,
              right: 0,
              background: 'rgba(1,1,24,0.97)',
              borderBottom: '1px solid var(--border-2)',
              backdropFilter: 'blur(20px)',
              padding: '16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
          >
            {navItems.map(item => (
              <button
                key={item.id}
                className="nav-link"
                style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px', fontSize: 14 }}
                onClick={() => scrollTo(item.id)}
              >
                {item.label}
              </button>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <button className="btn-sm-secondary" style={{ flex: 1 }} onClick={() => { setMenuOpen(false); navigate('/app/dashboard'); }}>
                Dashboard
              </button>
              <button className="btn-sm-primary" style={{ flex: 1 }} onClick={() => { setMenuOpen(false); navigate('/app/verify'); }}>
                Verify Package
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ───── HERO ───── */}
      <section id="home" className="hero-section">
        {/* Glowing cosmic horizon background */}
        <div className="hero-bg-horizon" />
        <div className="hero-glow-beam" />
        {/* Dot grid */}
        <div className="dot-bg" style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none', zIndex: 1 }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1440, margin: '0 auto', padding: '0 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {/* Badge */}
          <div className="anim-fadeup" style={{ marginTop: 100, marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', border: '1px solid rgba(29,175,255,0.28)', borderRadius: 20, background: 'rgba(29,175,255,0.06)', fontSize: 12.5, color: '#1dafff', fontWeight: 600, letterSpacing: '0.05em' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1dafff', boxShadow: '0 0 8px #1dafff', animation: 'pulse-glow 2s ease-in-out infinite', display: 'inline-block' }} />
              AI SUPPLY-CHAIN SECURITY GATE — OPEN SOURCE
            </div>
          </div>

          {/* Headline */}
          <h1 className="anim-fadeup anim-delay-1 grad-text-hero" style={{ fontSize: 'clamp(48px, 8vw, 96px)', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.05em', textAlign: 'center', maxWidth: 1280 }}>
            <span style={{ display: 'block' }}>Stop AI From</span>
            <span style={{ display: 'block' }}>Inventing Your Next</span>
            <span style={{ display: 'block' }}>Attack Vector</span>
          </h1>

          {/* Subhead */}
          <p className="anim-fadeup anim-delay-2" style={{ marginTop: 32, maxWidth: 820, textAlign: 'center', fontSize: 15, fontWeight: 500, color: 'var(--text-muted)', lineHeight: 2 }}>
            DepPhantom sits between your AI coding agent and the package registry —
            intercepting every <code className="font-mono" style={{ fontSize: 13, color: 'var(--accent)', background: 'rgba(29,175,255,0.08)', padding: '1px 6px', borderRadius: 4 }}>pip install</code> and <code className="font-mono" style={{ fontSize: 13, color: 'var(--accent)', background: 'rgba(29,175,255,0.08)', padding: '1px 6px', borderRadius: 4 }}>npm install</code> before it runs.
          </p>

          {/* Tag line badges */}
          <div className="anim-fadeup anim-delay-3" style={{ display: 'flex', gap: 32, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['＋ Open Source ＋', '＋ MIT Licensed ＋', '＋ Local First ＋'].map(t => (
              <span key={t} style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.80)', textShadow: '0 0 12px rgba(86,203,255,0.8)' }}>{t}</span>
            ))}
          </div>

          {/* CTA row */}
          <div className="anim-fadeup anim-delay-4" style={{ display: 'flex', gap: 16, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => navigate('/app/dashboard')}>
              Launch Dashboard <ArrowRight size={17} />
            </button>
            <button className="btn-secondary" onClick={() => navigate('/app/demo')}>
              <Activity size={17} /> Run Demo Scenarios
            </button>
          </div>

          {/* Install widget */}
          <div id="integrations" className="anim-fadeup anim-delay-5" style={{ marginTop: 72, width: '100%', display: 'flex', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <p style={{ fontSize: 17, fontWeight: 500, color: 'rgba(255,255,255,0.70)', letterSpacing: '-0.02em', marginBottom: 20 }}>
                Install DepPhantom
              </p>
              <InstallWidget />
            </div>
          </div>

          {/* Metrics */}
          <div className="anim-fadeup anim-delay-6" style={{ marginTop: 80, marginBottom: 60, width: '100%', maxWidth: 1180 }}>
            <div className="metric-strip">
              {metrics.map((m, i) => (
                <div key={i} className="metric-item">
                  <div className="metric-value">{m.value}</div>
                  <div className="metric-label">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───── WHY AI AGENT SECURITY ───── */}
      <section id="why" style={{ background: 'var(--bg-2)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ display: 'grid', gap: 40, gridTemplateColumns: '1fr 1fr', alignItems: 'end', marginBottom: 80 }}>
            <div>
              <div className="section-tag" style={{ marginBottom: 20 }}>The Risk Moved Into Action</div>
              <h2 className="grad-text" style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.045em', maxWidth: 650 }}>
                Why AI Dependency Security Matters
              </h2>
            </div>
            <p style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.7, color: 'var(--text-dim)', maxWidth: 510, justifySelf: 'end', textAlign: 'right', paddingBottom: 4 }}>
              AI agents do more than generate text. They call registries, download packages, execute install scripts, and interact with external services. Each install creates a security decision that prompts alone cannot cover.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {whyCards.map((c, i) => (
              <div key={i} className="why-card">
                <c.icon size={80} strokeWidth={1.35} strokeDasharray="1.5 2.4" style={{ marginBottom: 'auto' }} />
                <div style={{ marginTop: 'auto' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.18, letterSpacing: '-0.025em', color: '#fff', marginBottom: 20 }}>{c.title}</h3>
                  <p style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.75, color: 'rgba(255,255,255,0.80)' }}>{c.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── FEATURES ───── */}
      <section id="features" style={{ background: 'var(--bg)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-tag" style={{ marginBottom: 14 }}>CAPABILITIES</div>
            <h2 className="grad-text-blue" style={{ fontSize: 'clamp(28px, 4vw, 54px)', fontWeight: 600, letterSpacing: '-0.045em', lineHeight: 1.08, marginBottom: 16 }}>
              Built for the Agentic Era
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-muted)', maxWidth: 520, margin: '0 auto', lineHeight: 1.7 }}>
              Every attack vector an AI agent might introduce has a countermeasure.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="glow-card" style={{ padding: '28px 26px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: `${f.color}0c`, filter: 'blur(30px)', pointerEvents: 'none' }} />
                <div style={{ width: 44, height: 44, borderRadius: 11, background: `${f.color}18`, border: `1px solid ${f.color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                  <f.icon size={20} color={f.color} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── THREE LAYERS (light section) ───── */}
      <section id="solutions" className="light-section" style={{ padding: '80px 24px 120px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ maxWidth: 1040, marginBottom: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#101426', marginBottom: 16 }}>PROTECTION COVERAGE</div>
            <h2 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 600, lineHeight: 1.2, letterSpacing: '-0.045em', color: '#05091f', marginBottom: 16 }}>
              Three Layers Of <span style={{ background: 'linear-gradient(90deg, #173d87, #559dff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Protection</span><br />
              For Your AI Pipeline
            </h2>
            <p style={{ fontSize: 13, color: '#536074', maxWidth: 560, lineHeight: 1.7 }}>
              Registry interception, deep static analysis, and continuous environment monitoring.
            </p>
          </div>

          <div style={{ marginTop: 64, display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {[
              { title: 'Registry Guard',      sub: 'Intercept Every Install Before Execution',       items: ['pip install', 'npm install', 'npx calls', 'yarn add', 'Automatic scripts', 'CI/CD pipelines'] },
              { title: 'Deep Scan',           sub: 'Analyze Components Before You Trust Them',        items: ['Registry lookups', 'Typosquatting checks', 'Script analysis', 'Metadata scoring', 'Dependency trees', 'Intent verification'] },
              { title: 'Environment Patrol',  sub: 'Monitor Changes Inside Your Agent Workspace',     items: ['Suspicious packages', 'Modified scripts', 'New registries', 'Drift in trusted files'] },
            ].map((card, i) => (
              <div key={i} className="feature-card" style={{ padding: 30, display: 'flex', flexDirection: 'column', minHeight: 400 }}>
                <h3 style={{ fontSize: 27, fontWeight: 700, lineHeight: 1.14, letterSpacing: '-0.035em', color: '#05091f', marginBottom: 8 }}>{card.title}</h3>
                <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.28, color: '#232838', marginBottom: 28 }}>{card.sub}</div>
                <div style={{ width: '100%', height: 120, borderRadius: 6, background: 'linear-gradient(135deg, #e8f4ff, #cce8ff)', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={48} color="#2f69b8" strokeWidth={1.5} />
                </div>
                <ul style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', marginBottom: 28 }}>
                  {card.items.map(item => (
                    <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 10, color: '#4c5563', lineHeight: 1.3 }}>
                      <span style={{ marginTop: 5, width: 4, height: 4, borderRadius: '50%', background: '#4c5563', flexShrink: 0 }} />
                      {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => i === 0 ? navigate('/app/verify') : navigate('/app/dashboard')}
                  style={{ marginTop: 'auto', height: 52, border: '1px solid #214d87', borderRadius: 5, background: 'transparent', fontSize: 14, fontWeight: 500, color: '#14233d', cursor: 'pointer', transition: 'all .2s', fontFamily: 'inherit' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#edf6ff'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#1f6fe5'; (e.currentTarget as HTMLButtonElement).style.color = '#145dbb'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#214d87'; (e.currentTarget as HTMLButtonElement).style.color = '#14233d'; }}
                >
                  Explore {card.title}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── SIX DETECTORS ───── */}
      <section id="detectors" style={{ background: 'var(--bg)', padding: '96px 24px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, margin: '0 auto 64px', textAlign: 'center' }}>
            <h2 className="grad-text" style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 600, lineHeight: 1.04, letterSpacing: '-0.045em' }}>
              Six Security Detectors. One Scan.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '48px 54px' }}>
            {detectors.map((d, i) => (
              <div key={i} className="detector-card">
                <div style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.02em', color: '#fff', marginBottom: 16 }}>{d.title}</div>
                <p style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.25, color: 'rgba(255,255,255,0.55)', maxWidth: 320 }}>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── DEMO / LIVE SCENARIOS ───── */}
      <section id="demo" style={{ background: 'var(--bg)', padding: '40px 24px 96px' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto' }}>
          <div style={{ maxWidth: 720, marginBottom: 64 }}>
            <h2 className="grad-text-blue" style={{ fontSize: 'clamp(28px, 4vw, 56px)', fontWeight: 600, lineHeight: 1.04, letterSpacing: '-0.045em', marginBottom: 16 }}>
              See DepPhantom in Real<br />Agent Workflows
            </h2>
          </div>

          <div style={{ display: 'grid', gap: 40, gridTemplateColumns: '1fr 1.4fr', alignItems: 'start' }}>
            {/* Left: terminal mock */}
            <div className="terminal" style={{ marginTop: 40 }}>
              <div className="terminal-titlebar">
                <span className="terminal-dot" style={{ background: '#ff3b3b' }} />
                <span className="terminal-dot" style={{ background: '#f59e0b' }} />
                <span className="terminal-dot" style={{ background: '#10b981' }} />
                <span style={{ flex: 1 }} />
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-faint)' }}>depphantom — security gate</span>
              </div>
              <div className="terminal-body">
                <div style={{ color: 'var(--text-faint)' }}>$ pip install requets  <span style={{ fontSize: 11 }}># AI agent typo</span></div>
                <div style={{ color: '#1dafff', marginTop: 4 }}>▶ DepPhantom intercepted — analyzing...</div>
                <div style={{ color: 'var(--text-muted)', marginLeft: 4 }}>  ✓ Registry lookup: EXISTS</div>
                <div style={{ color: '#f59e0b', marginLeft: 4 }}>  ⚠ Typosquatting: 94% similar to <span style={{ color: '#fff' }}>requests</span></div>
                <div style={{ color: '#ff3b3b', marginLeft: 4 }}>  ✕ Install script: network download detected</div>
                <div style={{ color: '#ff3b3b', marginLeft: 4 }}>  ✕ Publisher: unknown, registered 3 days ago</div>
                <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(255,59,59,0.10)', border: '1px solid rgba(255,59,59,0.30)', borderRadius: 6, color: '#ff3b3b', fontWeight: 700, letterSpacing: '0.05em' }}>
                  ⛔ INSTALLATION BLOCKED — Risk: CRITICAL
                </div>
              </div>
            </div>

            {/* Right: scenario tabs */}
            <div style={{ border: '1px solid #5c7da8', background: '#02021b', borderRadius: 9, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.09)', padding: '0 20px' }}>
                <div style={{ display: 'flex' }}>
                  {['1', '2', '3'].map((n, i) => (
                    <button key={n} style={{ height: 58, padding: '0 20px', background: 'none', border: 'none', borderBottom: `2px solid ${i === 0 ? '#fff' : 'transparent'}`, color: i === 0 ? '#fff' : 'rgba(255,255,255,0.50)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'color .15s' }}>
                      {n}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => navigate('/app/demo')}
                  style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid rgba(255,255,255,0.25)', background: 'transparent', fontSize: 13, color: 'rgba(255,255,255,0.80)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
                >
                  Open Demo Center
                </button>
              </div>
              <div style={{ padding: '32px 28px' }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#5ecbff', marginBottom: 20 }}>Live Attack Scenarios</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {scenarios.map((sc, i) => (
                    <div key={i} style={{ padding: '16px 14px', border: `1px solid ${sc.color}30`, borderRadius: 8, background: `${sc.color}08` }}>
                      <div style={{ fontSize: 22, marginBottom: 10 }}>{sc.icon}</div>
                      <div className="font-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>{sc.label}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <span className="badge" style={{ background: `${sc.color}15`, border: `1px solid ${sc.color}40`, color: sc.color }}>{sc.tag}</span>
                        <span className="badge" style={{ background: `${sc.color}15`, border: `1px solid ${sc.color}40`, color: sc.color }}>{sc.decision}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" style={{ width: '100%', marginTop: 24, height: 50 }} onClick={() => navigate('/app/demo')}>
                  Run Live Demo <Activity size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── SECURITY PRINCIPLES ───── */}
      <section id="resources" style={{ background: 'var(--bg-2)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 700, letterSpacing: '-0.5px', textAlign: 'center', marginBottom: 48, color: 'var(--text)' }}>
            The DepPhantom Security Model
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--border)' }}>
            {principles.map((p, i) => (
              <div key={i} style={{ background: 'var(--surface)', padding: '32px 28px', transition: 'background .2s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface)')}
              >
                <p.icon size={28} color={p.color} style={{ marginBottom: 16 }} />
                <h3 style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 10, letterSpacing: '-0.3px' }}>{p.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.65 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA BAND ───── */}
      <section id="pricing" style={{ background: 'var(--bg)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="bg-horizon-banner" style={{ position: 'relative', padding: '72px 40px', textAlign: 'center' }}>
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div className="section-tag" style={{ marginBottom: 16 }}>GET STARTED</div>
              <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 16 }}>
                Ready to protect your<br />
                <span className="grad-text-blue">AI coding pipeline?</span>
              </h2>
              <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto 36px', lineHeight: 1.7 }}>
                Open the dashboard, verify your first dependency, or run a demo scenario to see DepPhantom in action.
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn-primary" onClick={() => navigate('/app/dashboard')}>
                  Open Dashboard <ArrowRight size={16} />
                </button>
                <button className="btn-secondary" onClick={() => navigate('/app/verify')}>
                  <Zap size={16} /> Verify a Package
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>
            {/* Brand */}
            <div>
              <div style={{ marginBottom: 16, cursor: 'pointer', display: 'inline-block' }} onClick={() => scrollTo('home')}>
                <DepPhantomLogo size={32} showBadge={false} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 280 }}>
                Pre-installation supply-chain security gate for AI coding agents. Stop hallucinated and typosquatted packages before they execute.
              </p>
            </div>
            {/* Product */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: 16 }}>Product</div>
              {[
                { label: 'Dashboard',       to: '/app/dashboard' },
                { label: 'Verify Package',  to: '/app/verify' },
                { label: 'Security Events', to: '/app/events' },
                { label: 'Demo Center',     to: '/app/demo' },
                { label: 'Policies',        to: '/app/policies' },
              ].map(l => (
                <div key={l.label} style={{ marginBottom: 8 }}>
                  <a onClick={() => navigate(l.to)} style={{ fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer' }}>{l.label}</a>
                </div>
              ))}
            </div>
            {/* Security */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: 16 }}>Security</div>
              {['Risk Engine', 'Audit Log', 'Threat Model', 'Policy Config'].map(l => (
                <div key={l} style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{l}</span>
                </div>
              ))}
            </div>
            {/* Ecosystems */}
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-faint)', textTransform: 'uppercase', marginBottom: 16 }}>Ecosystems</div>
              {[
                { label: 'Python / PyPI',     badge: 'LIVE' },
                { label: 'JavaScript / npm',  badge: 'LIVE' },
                { label: 'Ruby Gems',          badge: 'SOON' },
                { label: 'Go Modules',         badge: 'SOON' },
              ].map(l => (
                <div key={l.label} style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{l.label}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '1px 5px', borderRadius: 3, fontFamily: 'monospace', background: l.badge === 'LIVE' ? 'var(--ok-dim)' : 'var(--surface-3)', color: l.badge === 'LIVE' ? 'var(--ok)' : 'var(--text-faint)', border: `1px solid ${l.badge === 'LIVE' ? 'var(--ok-border)' : 'var(--border)'}` }}>
                    {l.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* Bottom bar */}
          <div style={{ paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ fontSize: 12.5, color: 'var(--text-faint)' }}>
              © 2026 Digital Defenders · MIT License · Built for the IBM Bob Hackathon
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-faint)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', animation: 'pulse-glow 2s ease-in-out infinite', display: 'inline-block' }} />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
