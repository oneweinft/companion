import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { VOICE_PROFILES } from '../data/customization';

/** Voice profile selection — voice-first architecture makes this critical. */
export function VoiceSelection() {
  const { customization, updateCustomization, navigate } = useApp();
  const [selectedId, setSelectedId] = useState<string>(
    customization?.voiceId ?? 'warm_gentle'
  );
  const [previewing, setPreviewing] = useState<string | null>(null);

  if (!customization) {
    navigate('characterSelection');
    return null;
  }

      const accent = customization.visual.accentColor;

  const handlePreview = (voiceId: string) => {
    setPreviewing(voiceId);
    // Simulate preview duration
    setTimeout(() => setPreviewing(null), 2000);
  };

  const handleContinue = () => {
    updateCustomization({ voiceId: selectedId });
    navigate('nameStory');
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
      <button onClick={() => navigate('characterCreator')} style={backBtnStyle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: 20, animation: 'fade-in-up 0.5s ease' }}>
        <h1 style={h1Style}>Pick their voice</h1>
        <p style={subStyle}>
          You'll hear this voice in every conversation with {customization.name}. Choose what feels right.
        </p>
      </div>

      {/* Voice cards */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, animation: 'fade-in-up 0.5s ease 0.1s both' }}>
        {VOICE_PROFILES.map(voice => {
          const isSelected = selectedId === voice.id;
          const isPreviewing = previewing === voice.id;
          return (
            <button
              key={voice.id}
              onClick={() => setSelectedId(voice.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '16px 18px', borderRadius: 16, cursor: 'pointer',
                border: isSelected ? `1.5px solid ${accent}` : '1px solid var(--glass-border)',
                background: isSelected ? `${accent}12` : 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
                transition: 'all 0.2s ease',
                transform: isSelected ? 'scale(1.01)' : 'scale(1)',
                textAlign: 'left',
              }}
            >
              {/* Voice icon / preview button */}
              <div
                onClick={(e) => { e.stopPropagation(); handlePreview(voice.id); }}
                style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: isSelected ? `${accent}25` : 'rgba(255,255,255,0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, cursor: 'pointer',
                }}
              >
                {isPreviewing ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={accent}>
                    <rect x="6" y="5" width="4" height="14" rx="1" />
                    <rect x="14" y="5" width="4" height="14" rx="1" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M8 5v14l11-7z" fill={isSelected ? accent : 'var(--text-muted)'} />
                  </svg>
                )}
              </div>

              {/* Voice info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {voice.name}
                  </span>
                  <span style={{
                    fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4,
                    background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)',
                    textTransform: 'capitalize',
                  }}>
                    {voice.gender}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
                  {voice.description}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                  {voice.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 10, padding: '2px 7px', borderRadius: 6,
                      background: `${accent}12`, color: 'var(--text-muted)',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected checkmark */}
              {isSelected && (
                <div style={{ flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Preview hint */}
      <div style={{ textAlign: 'center', marginBottom: 12, animation: 'fade-in 0.3s ease' }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Tap the play icon to preview a voice sample
        </span>
      </div>

      {/* CTA */}
      <div>
        <button
          onClick={handleContinue}
          style={{
            ...ctaStyle,
            background: `linear-gradient(135deg, ${accent}, ${customization.visual.gradientTo})`,
            boxShadow: `0 4px 24px ${accent}40`,
            color: '#FFFFFF', cursor: 'pointer',
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
