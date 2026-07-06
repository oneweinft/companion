import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { getCompanion } from '../data/companions';
import { PERSONALITY_SLIDERS, generatePreviewMessage } from '../data/customization';
import type { PersonalityProfile } from '../data/customization';

/** Personality composer — 5 sliders with live message preview. */
export function PersonalityComposer() {
  const { customization, updateCustomization, navigate } = useApp();

  const [personality, setPersonality] = useState<PersonalityProfile>(
    customization?.personality ?? { warmth: 50, humor: 50, directness: 50, energy: 50, depth: 50 }
  );

  if (!customization) {
    navigate('characterSelection');
    return null;
  }

  const archetype = getCompanion(customization.archetypeId);
  const accent = archetype.accentColor;

  const previewMessage = useMemo(
    () => generatePreviewMessage(customization.archetypeId, personality),
    [customization.archetypeId, personality]
  );

  const handleSlider = (key: keyof PersonalityProfile, value: number) => {
    setPersonality(prev => ({ ...prev, [key]: value }));
  };

  const handleContinue = () => {
    updateCustomization({ personality });
    navigate('characterCreator');
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(ellipse at 50% 30%, ${accent}12 0%, transparent 60%), var(--bg-primary)`,
        padding: 'calc(var(--safe-top) + 16px) 20px calc(var(--safe-bottom) + 16px)',
      }}
    >
      {/* Back */}
      <button onClick={() => navigate('relationshipMode')} style={backBtnStyle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: 20, animation: 'fade-in-up 0.5s ease' }}>
        <h1 style={h1Style}>Shape their personality</h1>
        <p style={subStyle}>
          Adjust to find your perfect match. You'll see a live preview of how {customization.name} responds.
        </p>
      </div>

      {/* Sliders */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 18, animation: 'fade-in-up 0.5s ease 0.1s both' }}>
        {PERSONALITY_SLIDERS.map(slider => {
          const value = personality[slider.key];
          return (
            <div key={slider.key}>
              {/* Label + value */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {slider.label}
                </span>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {value < 35 ? slider.leftLabel : value > 65 ? slider.rightLabel : 'Balanced'}
                </span>
              </div>

              {/* Slider track */}
              <div style={{ position: 'relative', height: 36, display: 'flex', alignItems: 'center' }}>
                {/* Track background */}
                <div style={{
                  position: 'absolute', left: 0, right: 0, height: 6,
                  borderRadius: 3, background: 'rgba(255,255,255,0.08)',
                }} />
                {/* Filled portion */}
                <div style={{
                  position: 'absolute', left: 0, width: `${value}%`, height: 6,
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${accent}60, ${accent})`,
                  transition: 'width 0.1s ease',
                }} />
                {/* Thumb */}
                <div style={{
                  position: 'absolute', left: `calc(${value}% - 12px)`,
                  width: 24, height: 24, borderRadius: '50%',
                  background: accent, border: '3px solid var(--bg-primary)',
                  boxShadow: `0 2px 12px ${accent}60`,
                  transition: 'left 0.1s ease',
                }} />
                {/* Native range input for interaction */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={value}
                  onChange={e => handleSlider(slider.key, Number(e.target.value))}
                  style={{
                    position: 'absolute', left: 0, right: 0, width: '100%',
                    height: 36, margin: 0, opacity: 0, cursor: 'pointer',
                  }}
                />
              </div>

              {/* Anchor labels */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{slider.leftLabel}</span>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{slider.rightLabel}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live preview */}
      <div
        className="glass-panel"
        style={{
          padding: 14, marginBottom: 16, marginTop: 8, animation: 'fade-in 0.3s ease',
          borderLeft: `3px solid ${accent}`,
        }}
      >
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
          Preview · {customization.name}'s response to "I had a rough day"
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, fontStyle: 'italic', transition: 'opacity 0.2s ease' }}>
          "{previewMessage}"
        </p>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={handleContinue}
          style={{
            ...ctaStyle,
            background: `linear-gradient(135deg, ${accent}, ${archetype.gradientTo})`,
            boxShadow: `0 4px 24px ${accent}40`,
            opacity: 1, color: '#FFFFFF', cursor: 'pointer',
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

// ── Styles ──────────────────────────────────────

const backBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: 'var(--text-muted)', fontSize: 14, padding: '4px 0',
  marginBottom: 8, alignSelf: 'flex-start',
  display: 'flex', alignItems: 'center', gap: 6,
};

const h1Style: React.CSSProperties = {
  fontSize: 26, fontWeight: 700, color: 'var(--text-primary)',
  margin: 0, letterSpacing: -0.5,
};

const subStyle: React.CSSProperties = {
  fontSize: 14, color: 'var(--text-secondary)',
  marginTop: 6, lineHeight: 1.5,
};

const ctaStyle: React.CSSProperties = {
  width: '100%', padding: '16px 32px', borderRadius: 16, border: 'none',
  fontSize: 17, fontWeight: 600, letterSpacing: 0.5,
  transition: 'all 0.3s ease',
};
