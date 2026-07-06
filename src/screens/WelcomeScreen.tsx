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
        background: 'var(--bg-primary)',
        padding: 'calc(var(--safe-top) + 24px) 24px calc(var(--safe-bottom) + 24px)',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Aurora mesh background */}
      <div className="aurora-bg" />
    
      {/* Logo + tagline */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginBottom: 48,
          animation: 'fade-in-up 0.8s ease',
          position: 'relative',
          zIndex: 1,
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
            fontFamily: 'var(--font-display)',
            fontSize: 40,
            fontWeight: 600,
            letterSpacing: -1,
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          SoulLink
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
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
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[
          { icon: VoiceIcon, label: 'Voice\nConnection' },
          { icon: MemoryIcon, label: 'Emotional\nMemory' },
          { icon: AlwaysIcon, label: 'Always\nAvailable' },
        ].map((item, i) => (
          <div
            key={i}
            className="surface-card pressable"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: '16px 12px',
              width: 90,
              borderRadius: 18,
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
          position: 'relative',
          zIndex: 1,
        }}
      >
        <button
          className="pressable"
          onClick={() => navigate('characterSelection')}
          style={{
            width: '100%',
            padding: '16px 32px',
            borderRadius: 16,
            border: 'none',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, var(--color-base), var(--color-accent))',
            color: '#FFFFFF',
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: 0.3,
            fontFamily: 'var(--font-body)',
            boxShadow: '0 4px 24px rgba(123, 45, 142, 0.4)',
          }}
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
              fontFamily: 'var(--font-body)',
            }}
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
          fontFamily: 'var(--font-body)',
          animation: 'fade-in 1s ease 0.8s both',
          zIndex: 1,
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
