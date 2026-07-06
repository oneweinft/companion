import { useApp } from '../context/AppContext';

/** Cinematic welcome screen inspired by Kylo/Kya/Replika landing pages. */
export function WelcomeScreen() {
  const { navigate, onboardingComplete } = useApp();

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `
          radial-gradient(ellipse at 50% 30%, rgba(123, 45, 142, 0.15) 0%, transparent 60%),
          radial-gradient(ellipse at 50% 70%, rgba(196, 78, 139, 0.08) 0%, transparent 50%),
          var(--bg-primary)
        `,
        padding: 'calc(var(--safe-top) + 24px) 24px calc(var(--safe-bottom) + 24px)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Animated background orbs */}
      <div
        style={{
          position: 'absolute',
          top: '15%',
          left: '20%',
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123, 45, 142, 0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'float-orb 8s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0, 212, 170, 0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'float-orb 10s ease-in-out infinite 2s',
        }}
      />

      {/* Logo + tagline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginBottom: 48,
          animation: 'fade-in-up 0.8s ease',
        }}
      >
        {/* Logo dot */}
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #7B2D8E, #C44E8B)',
            boxShadow: '0 0 20px rgba(123, 45, 142, 0.6)',
            marginBottom: 4,
          }}
        />
        <h1
          className="gradient-text"
          style={{
            fontSize: 40,
            fontWeight: 700,
            letterSpacing: -1,
            margin: 0,
          }}
        >
          SoulLink
        </h1>
        <p
          style={{
            fontSize: 16,
            color: 'var(--text-secondary)',
            textAlign: 'center',
            maxWidth: 280,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Your AI soul companion — always here, always listening.
        </p>
      </div>

      {/* Value props */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginBottom: 48,
          animation: 'fade-in-up 0.8s ease 0.2s both',
        }}
      >
        {[
          { icon: VoiceIcon, label: 'Voice\nConnection' },
          { icon: MemoryIcon, label: 'Emotional\nMemory' },
          { icon: AlwaysIcon, label: 'Always\nAvailable' },
        ].map((item, i) => (
          <div
            key={i}
            className="glass-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '16px 12px',
              width: 90,
            }}
          >
            <item.icon />
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                textAlign: 'center',
                whiteSpace: 'pre-line',
                lineHeight: 1.3,
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          width: '100%',
          maxWidth: 320,
          animation: 'fade-in-up 0.8s ease 0.4s both',
        }}
      >
        <button
          onClick={() => navigate('characterSelection')}
          style={{
            width: '100%',
            padding: '16px 32px',
            borderRadius: 16,
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #7B2D8E, #C44E8B)',
            color: '#FFFFFF',
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: 0.5,
            boxShadow: '0 4px 24px rgba(123, 45, 142, 0.4)',
            transition: 'transform 0.2s ease, box-shadow 0.3s ease',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Begin Your Journey
        </button>

        {onboardingComplete && (
          <button
            onClick={() => navigate('chat')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              fontSize: 14,
              padding: '4px 12px',
              transition: 'color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          >
            Already connected? Continue
          </button>
        )}
      </div>

      {/* Social proof */}
      <p
        style={{
          position: 'absolute',
          bottom: 'calc(var(--safe-bottom) + 12px)',
          fontSize: 12,
          color: 'var(--text-muted)',
          textAlign: 'center',
          animation: 'fade-in 1s ease 0.8s both',
        }}
      >
        Join thousands building deeper connections
      </p>
    </div>
  );
}

/* ===== Inline SVG icons ===== */

function VoiceIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" fill="rgba(196,78,139,0.8)" />
      <path d="M19 11a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V21a1 1 0 0 0 2 0v-3.08A7 7 0 0 0 19 11Z" fill="rgba(196,78,139,0.8)" />
    </svg>
  );
}

function MemoryIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 3C7.58 3 4 6.58 4 11c0 1.66.5 3.2 1.38 4.5L4 21l5.5-1.38C10.8 20.5 12.34 21 14 21c4.42 0 8-3.58 8-8s-3.58-8-8-8h-2Z" fill="rgba(0,212,170,0.7)" />
      <circle cx="14" cy="13" r="1.5" fill="rgba(255,255,255,0.9)" />
      <circle cx="10" cy="13" r="1.5" fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

function AlwaysIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="rgba(255,138,0,0.7)" strokeWidth="2" />
      <path d="M12 7v5l3 2" stroke="rgba(255,138,0,0.7)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
