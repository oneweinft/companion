import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RELATIONSHIP_MODES, getRelationshipMode } from '../data/customization';
import type { RelationshipMode as Mode } from '../data/customization';
import { getCompanion } from '../data/companions';

/** Relationship mode selection — sets the tone and guardrails for the companion relationship. */
export function RelationshipMode() {
  const { customization, updateCustomization, navigate } = useApp();
  const [selected, setSelected] = useState<Mode | null>(
    customization?.relationshipMode ?? null
  );

  if (!customization) {
    navigate('characterSelection');
    return null;
  }

  const archetype = getCompanion(customization.archetypeId);
  const accent = archetype.accentColor;
  const selectedDef = selected ? getRelationshipMode(selected) : null;

  const handleContinue = () => {
    if (selected) {
      updateCustomization({ relationshipMode: selected });
      navigate('personalityComposer');
    }
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
      <button
        onClick={() => navigate('characterSelection')}
        style={backBtnStyle}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: 20, animation: 'fade-in-up 0.5s ease' }}>
        <h1 style={h1Style}>How do you want to connect?</h1>
        <p style={subStyle}>
          This sets the tone for your relationship with {customization.name}. You can evolve it over time.
        </p>
      </div>

      {/* Mode cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16, animation: 'fade-in-up 0.5s ease 0.1s both' }}>
        {RELATIONSHIP_MODES.map(mode => {
          const isSelected = selected === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => setSelected(mode.id)}
              style={{
                ...cardStyle,
                border: isSelected ? `1.5px solid ${accent}` : '1px solid var(--glass-border)',
                background: isSelected ? `${accent}12` : 'var(--glass-bg)',
                boxShadow: isSelected ? `0 4px 24px ${accent}30` : '0 4px 16px rgba(0,0,0,0.2)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {/* Icon */}
              <div style={{
                width: 44, height: 44, borderRadius: 14,
                background: isSelected ? `${accent}25` : 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 10,
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill={isSelected ? accent : 'var(--text-muted)'}>
                  <path d={mode.icon} />
                </svg>
              </div>

              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                {mode.label}
              </div>
              <div style={{ fontSize: 11, color: accent, fontStyle: 'italic', marginBottom: 6 }}>
                {mode.tagline}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {mode.description}
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 10, right: 10,
                  width: 22, height: 22, borderRadius: '50%',
                  background: accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

              {/* Responsible romance badge */}
              {mode.id === 'romantic' && (
                <div style={{
                  position: 'absolute', top: 10, right: isSelected ? 38 : 10,
                  fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 6,
                  background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)',
                  whiteSpace: 'nowrap',
                }}>
                  Responsible
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Guardrail note for romantic mode */}
      {selectedDef?.guardrailNote && (
        <div
          className="glass-panel"
          style={{
            padding: 14, marginBottom: 16, animation: 'fade-in 0.4s ease',
            borderLeft: `3px solid ${accent}`,
          }}
        >
          <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
            {selectedDef.guardrailNote}
          </p>
        </div>
      )}

      {/* Expectation for selected mode */}
      {selectedDef && (
        <div style={{ marginBottom: 16, animation: 'fade-in 0.3s ease' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
            <span style={{ color: accent, fontWeight: 600 }}>What to expect: </span>
            {selectedDef.expectation}
          </p>
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={handleContinue}
          disabled={!selected}
          style={selected ? { ...ctaStyle, background: `linear-gradient(135deg, ${accent}, ${archetype.gradientTo})`, boxShadow: `0 4px 24px ${accent}40` } : ctaStyle}
        >
          {selected ? 'Continue' : 'Select a mode'}
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

const cardStyle: React.CSSProperties = {
  position: 'relative',
  display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
  padding: 18, borderRadius: 18, cursor: 'pointer',
  backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
  transition: 'all 0.3s ease', textAlign: 'left',
};

const ctaStyle: React.CSSProperties = {
  width: '100%', padding: '16px 32px', borderRadius: 16, border: 'none',
  fontSize: 17, fontWeight: 600, letterSpacing: 0.5,
  cursor: 'pointer', transition: 'all 0.3s ease',
  background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', opacity: 0.5,
};
