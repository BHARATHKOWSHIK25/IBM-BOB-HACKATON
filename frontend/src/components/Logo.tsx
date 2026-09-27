export function DepPhantomIcon({ size = 36 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: 'linear-gradient(135deg, rgba(29,175,255,0.18) 0%, rgba(10,25,48,0.92) 100%)',
        border: '1px solid rgba(100,216,255,0.45)',
        boxShadow: '0 0 20px rgba(29,175,255,0.35), inset 0 1px 0 rgba(255,255,255,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background radial ambient shine */}
      <div
        style={{
          position: 'absolute',
          top: -4,
          right: -4,
          width: size,
          height: size,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,229,255,0.4) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <svg
        width={Math.round(size * 0.65)}
        height={Math.round(size * 0.65)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <defs>
          <linearGradient id="shieldGrad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
            <stop stopColor="#64d8ff" />
            <stop offset="0.5" stopColor="#1dafff" />
            <stop offset="1" stopColor="#0066ff" />
          </linearGradient>
          <linearGradient id="coreGlow" x1="12" y1="8" x2="12" y2="18" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffffff" />
            <stop offset="1" stopColor="#00e5ff" />
          </linearGradient>
        </defs>

        {/* Precision Cyber Shield Outline */}
        <path
          d="M12 2L20.5 5.8V11.2C20.5 16.5 16.8 21.2 12 22.8C7.2 21.2 3.5 16.5 3.5 11.2V5.8L12 2Z"
          stroke="url(#shieldGrad)"
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="rgba(8,16,36,0.6)"
        />

        {/* Angular Stealth Diamond / Phantom Core */}
        <path
          d="M12 6.5L16.8 11.5L12 17.5L7.2 11.5L12 6.5Z"
          stroke="url(#shieldGrad)"
          strokeWidth="1.2"
          fill="rgba(29,175,255,0.18)"
        />

        {/* Quantum Node / Radar Eye */}
        <circle cx="12" cy="11.5" r="2" fill="url(#coreGlow)" />
        <circle cx="12" cy="11.5" r="0.8" fill="#002b4d" />

        {/* Security radar sweep ticks */}
        <line x1="12" y1="3.5" x2="12" y2="5" stroke="#64d8ff" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="12" y1="18.5" x2="12" y2="20.5" stroke="#1dafff" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function DepPhantomLogo({
  size = 36,
  showBadge = true,
  onClick,
}: {
  size?: number
  showBadge?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
      }}
    >
      <DepPhantomIcon size={size} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span
          style={{
            fontWeight: 800,
            fontSize: Math.round(size * 0.48),
            letterSpacing: '-0.035em',
            lineHeight: 1,
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          Dep
          <span
            style={{
              background: 'linear-gradient(90deg, #64c8ff 0%, #1dafff 60%, #85dcff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 24px rgba(29,175,255,0.3)',
            }}
          >
            Phantom
          </span>
        </span>
        {showBadge && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#38bdf8',
              background: 'rgba(56,189,248,0.12)',
              border: '1px solid rgba(56,189,248,0.32)',
              padding: '2px 6px',
              borderRadius: 4,
              lineHeight: 1,
            }}
          >
            GATE
          </span>
        )}
      </div>
    </div>
  )
}
