import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getCompanion } from '../data/companions';
import { generateGreeting, getRelationshipMode } from '../data/customization';
import { AvatarRenderer } from '../components/AvatarRenderer';

/** First meeting — companion greets using full customization. Final onboarding step. */
export function FirstMeeting() {
  const { customization, completeOnboarding, navigate } = useApp();
  const [showGreeting, setShowGreeting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(true), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (!customization) {
    navigate('characterSelection');
    return null;
  }

  const archetype = getCompanion(customization.archetypeId);
  const accent = customization.visual.accentColor;
  const name = customization.name || archetype.name;
  const modeDef = getRelationshipMode(customization.relationshipMode);
  const greeting = generateGreeting(customization);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        background: `radial-gradient(ellipse at 50% 40%, ${accent}15 0%, transparent 60%), var(--bg-primary)`,
        padding: 'calc(var(--safe-top) + 16px) 20px calc(var(--safe-bottom) + 16px)',
      }}
    >
      {/* Avatar with loading animation */}
      <div style={{ position: 'relative', animation: 'fade-in-up 0.6s ease' }}>
                <AvatarRenderer
          appearance={customization.appearance}
          visual={customization.visual}
                    avatarImage={getCompanion(customization.archetypeId).avatarImage}
          size={130}
        />
        {/* Loading ring */}
        {!showGreeting && (
          <div style={{
            position: 'absolute', inset: -8, borderRadius: '50%',
            border: '2px solid transparent', borderTopColor: accent,
            animation: 'spin 1s linear infinite',
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Name + info */}
      <div style={{ textAlign: 'center', animation: 'fade-in-up 0.6s ease 0.2s both' }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
          {name}
        </div>
        <div style={{ fontSize: 13, color: accent, marginBottom: 2 }}>
          {archetype.archetype}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, color: 'var(--text-muted)',
          background: 'rgba(255,255,255,0.04)', padding: '3px 10px', borderRadius: 8,
          marginTop: 4,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
            <path d={modeDef.icon} />
          </svg>
          {modeDef.label}
        </div>
      </div>

      {/* Greeting */}
      {showGreeting && (
        <div
          className="glass-panel"
          style={{
            padding: 18, maxWidth: 340, animation: 'fade-in 0.6s ease',
            borderLeft: `3px solid ${accent}`,
          }}
        >
          <p style={{
            fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.6,
            margin: 0, fontStyle: 'italic',
          }}>
            "{greeting}"
          </p>
        </div>
      )}

      {/* Story recall if provided */}
      {showGreeting && customization.story && (
        <div style={{
          fontSize: 12, color: 'var(--text-muted)', textAlign: 'center',
          maxWidth: 300, animation: 'fade-in 0.6s ease 0.3s both',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }}>
            <path d="M12 2L4 6v6c0 5 3.5 9 8 10 4.5-1 8-5 8-10V6l-8-4z" stroke="var(--text-muted)" strokeWidth="2" />
          </svg>
          {name} remembers: "{customization.story.slice(0, 80)}{customization.story.length > 80 ? '...' : ''}"
        </div>
      )}

      {/* Enter SoulLink */}
      {showGreeting && (
        <button
          onClick={completeOnboarding}
          style={{
            padding: '16px 40px', borderRadius: 16, border: 'none', cursor: 'pointer',
            background: `linear-gradient(135deg, ${accent}, ${customization.visual.gradientTo})`,
            color: '#FFFFFF', fontSize: 17, fontWeight: 600,
            boxShadow: `0 4px 24px ${accent}40`,
            animation: 'fade-in 0.5s ease 0.5s both',
            transition: 'transform 0.2s ease',
          }}
          onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.97)')}
          onMouseUp={e => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Enter SoulLink
        </button>
      )}
    </div>
  );
}
