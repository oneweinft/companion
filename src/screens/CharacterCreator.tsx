import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Avatar3D } from '../components/Avatar3D';
import {
  ETHNICITIES, SKIN_TONES, HAIR_STYLES, HAIR_COLORS, EYE_COLORS, GENDERS,
  VISUAL_PALETTES, AMBIENT_MOTIFS, getDefaultAppearance,
} from '../data/customization';
import type {
  AppearanceAttributes, Ethnicity, HairStyle, Gender,
  VisualIdentity as VisualState, AmbientMotif,
} from '../data/customization';

type Tab = 'face' | 'hair' | 'eyes' | 'aura';

/** Character creator — build your companion's visual appearance. Replaces the abstract orb. */
export function CharacterCreator() {
  const { customization, updateCustomization, navigate } = useApp();

  const [tab, setTab] = useState<Tab>('face');
  const [appearance, setAppearance] = useState<AppearanceAttributes>(
    customization?.appearance ?? getDefaultAppearance('aria')
  );
  const [visual, setVisual] = useState<VisualState>(
    customization?.visual ?? {
      paletteName: 'Default',
      accentColor: '#C44E8B', accentColorDim: '#C44E8B30',
      gradientFrom: '#C44E8B', gradientTo: '#7B2D8E',
      ambientMotif: 'stars',
    }
  );

  if (!customization) {
    navigate('characterSelection');
    return null;
  }

      const accent = visual.accentColor;

  const updateAppearance = (partial: Partial<AppearanceAttributes>) => {
    setAppearance(prev => ({ ...prev, ...partial }));
  };

  const handleEthnicity = (eth: Ethnicity) => {
    const ethData = ETHNICITIES.find(e => e.id === eth);
    updateAppearance({ ethnicity: eth, skinTone: ethData?.swatch ?? appearance.skinTone });
  };

  const handlePalette = (palette: typeof VISUAL_PALETTES[0]) => {
    setVisual(prev => ({
      ...prev,
      paletteName: palette.name,
      accentColor: palette.accentColor,
      accentColorDim: palette.accentColorDim,
      gradientFrom: palette.gradientFrom,
      gradientTo: palette.gradientTo,
    }));
  };

  const handleMotif = (motif: AmbientMotif) => {
    setVisual(prev => ({ ...prev, ambientMotif: motif }));
  };

  const handleContinue = () => {
    updateCustomization({ appearance, visual });
    navigate('digitalTwinUpload');
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'face', label: 'Face' },
    { id: 'hair', label: 'Hair' },
    { id: 'eyes', label: 'Eyes' },
    { id: 'aura', label: 'Aura' },
  ];

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `radial-gradient(ellipse at 50% 20%, ${accent}12 0%, transparent 60%), var(--bg-primary)`,
        padding: 'calc(var(--safe-top) + 16px) 20px calc(var(--safe-bottom) + 16px)',
        transition: 'background 0.5s ease',
      }}
    >
      {/* Back */}
      <button onClick={() => navigate('personalityComposer')} style={backBtnStyle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: 8, animation: 'fade-in-up 0.5s ease' }}>
        <h1 style={h1Style}>Design your companion</h1>
        <p style={subStyle}>Shape every detail of how {customization.name} looks.</p>
      </div>

            {/* Live 3D avatar preview */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, animation: 'fade-in-up 0.5s ease 0.1s both' }}>
        <Avatar3D
          appearance={appearance}
          visual={visual}
          size={140}
          controls
          background={visual.accentColor}
        />
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14, background: 'var(--glass-bg)', borderRadius: 12, padding: 4, border: '1px solid var(--glass-border)' }}>
        {tabs.map(t => {
          const isActive = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '8px 0', borderRadius: 9, border: 'none', cursor: 'pointer',
                background: isActive ? `${accent}20` : 'transparent',
                color: isActive ? accent : 'var(--text-muted)',
                fontSize: 13, fontWeight: 600,
                transition: 'all 0.2s ease',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab content (scrollable) */}
      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: 4 }}>
        {/* ── FACE TAB ── */}
        {tab === 'face' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fade-in 0.3s ease' }}>
            {/* Ethnicity grid */}
            <div>
              <SectionLabel accent={accent}>Ethnicity</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {ETHNICITIES.map(eth => {
                  const isSelected = appearance.ethnicity === eth.id;
                  return (
                    <button
                      key={eth.id}
                      onClick={() => handleEthnicity(eth.id)}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        padding: '12px 6px', borderRadius: 14, cursor: 'pointer',
                        border: isSelected ? `1.5px solid ${accent}` : '1px solid var(--glass-border)',
                        background: isSelected ? `${accent}12` : 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
                        transition: 'all 0.2s ease',
                        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                      }}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: eth.swatch,
                        border: '2px solid rgba(255,255,255,0.15)',
                        boxShadow: isSelected ? `0 0 12px ${accent}40` : 'none',
                      }} />
                      <span style={{
                        fontSize: 11, fontWeight: 500,
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}>
                        {eth.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skin tones */}
            <div>
              <SectionLabel accent={accent}>Skin Tone</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {SKIN_TONES.map(tone => {
                  const isSelected = appearance.skinTone === tone.color;
                  return (
                    <button
                      key={tone.color}
                      onClick={() => updateAppearance({ skinTone: tone.color })}
                      title={tone.name}
                      style={{
                        width: 44, height: 44, borderRadius: 14, cursor: 'pointer',
                        background: tone.color,
                        border: isSelected ? '2.5px solid #fff' : '2px solid transparent',
                        boxShadow: isSelected ? `0 0 14px ${accent}80` : '0 2px 8px rgba(0,0,0,0.15)',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                      }}
                    >
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                          <path d="M5 13l4 4L19 7" stroke={tone.color === '#FFF0E0' || tone.color === '#E8E8E8' ? '#333' : '#fff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: accent, marginTop: 4 }}>
                {SKIN_TONES.find(t => t.color === appearance.skinTone)?.name ?? 'Custom'}
              </div>
            </div>

            {/* Gender */}
            <div>
              <SectionLabel accent={accent}>Gender</SectionLabel>
              <div style={{ display: 'flex', gap: 8 }}>
                {GENDERS.map(g => {
                  const isSelected = appearance.gender === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => updateAppearance({ gender: g.id as Gender })}
                      style={{
                        flex: 1, padding: '10px 0', borderRadius: 12, cursor: 'pointer',
                        border: isSelected ? `1.5px solid ${accent}` : '1px solid var(--glass-border)',
                        background: isSelected ? `${accent}12` : 'var(--glass-bg)',
                        color: isSelected ? accent : 'var(--text-muted)',
                        fontSize: 13, fontWeight: 600,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── HAIR TAB ── */}
        {tab === 'hair' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fade-in 0.3s ease' }}>
            {/* Hair styles */}
            <div>
              <SectionLabel accent={accent}>Style</SectionLabel>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {HAIR_STYLES.map(style => {
                  const isSelected = appearance.hairStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => updateAppearance({ hairStyle: style.id as HairStyle })}
                      style={{
                        padding: '10px 4px', borderRadius: 12, cursor: 'pointer',
                        border: isSelected ? `1.5px solid ${accent}` : '1px solid var(--glass-border)',
                        background: isSelected ? `${accent}12` : 'var(--glass-bg)',
                        fontSize: 11, fontWeight: 500,
                        color: isSelected ? accent : 'var(--text-muted)',
                        transition: 'all 0.2s ease',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      {style.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hair colors */}
            <div>
              <SectionLabel accent={accent}>Color</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {HAIR_COLORS.map(hc => {
                  const isSelected = appearance.hairColor === hc.color;
                  return (
                    <button
                      key={hc.color}
                      onClick={() => updateAppearance({ hairColor: hc.color })}
                      title={hc.name}
                      style={{
                        width: 44, height: 44, borderRadius: 14, cursor: 'pointer',
                        background: hc.color,
                        border: isSelected ? '2.5px solid #fff' : '2px solid transparent',
                        boxShadow: isSelected ? `0 0 14px ${accent}80` : '0 2px 8px rgba(0,0,0,0.15)',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                      }}
                    >
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                          <path d="M5 13l4 4L19 7" stroke={hc.color === '#E8E8E8' ? '#333' : '#fff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: accent, marginTop: 4 }}>
                {HAIR_COLORS.find(h => h.color === appearance.hairColor)?.name ?? 'Custom'}
              </div>
            </div>
          </div>
        )}

        {/* ── EYES TAB ── */}
        {tab === 'eyes' && (
          <div style={{ animation: 'fade-in 0.3s ease' }}>
            <SectionLabel accent={accent}>Eye Color</SectionLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              {EYE_COLORS.map(ec => {
                const isSelected = appearance.eyeColor === ec.color;
                return (
                  <button
                    key={ec.color}
                    onClick={() => updateAppearance({ eyeColor: ec.color })}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                      cursor: 'pointer', background: 'none', border: 'none',
                    }}
                  >
                    <div style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: ec.color,
                      border: isSelected ? '3px solid #fff' : '2px solid rgba(255,255,255,0.1)',
                      boxShadow: isSelected ? `0 0 16px ${accent}80, inset 0 0 12px rgba(0,0,0,0.3)` : '0 2px 8px rgba(0,0,0,0.15), inset 0 0 12px rgba(0,0,0,0.2)',
                      transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                    }}>
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                          <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <span style={{
                      fontSize: 11, fontWeight: 500,
                      color: isSelected ? accent : 'var(--text-muted)',
                    }}>
                      {ec.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── AURA TAB ── */}
        {tab === 'aura' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, animation: 'fade-in 0.3s ease' }}>
            {/* Color palettes */}
            <div>
              <SectionLabel accent={accent}>Color Palette</SectionLabel>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {VISUAL_PALETTES.map(pal => {
                  const isSelected = visual.paletteName === pal.name;
                  return (
                    <button
                      key={pal.name}
                      onClick={() => handlePalette(pal)}
                      title={pal.name}
                      style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: `linear-gradient(135deg, ${pal.gradientFrom}, ${pal.gradientTo})`,
                        border: isSelected ? '2.5px solid #fff' : '2px solid transparent',
                        boxShadow: isSelected ? `0 0 14px ${pal.accentColor}80` : 'none',
                        cursor: 'pointer', transition: 'all 0.2s ease',
                        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                        position: 'relative',
                      }}
                    >
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                          <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: accent, marginTop: 4 }}>{visual.paletteName}</div>
            </div>

            {/* Ambient motifs */}
            <div>
              <SectionLabel accent={accent}>Ambient Vibe</SectionLabel>
              <div style={{ display: 'flex', gap: 8 }}>
                {AMBIENT_MOTIFS.map(motif => {
                  const isSelected = visual.ambientMotif === motif.id;
                  return (
                    <button
                      key={motif.id}
                      onClick={() => handleMotif(motif.id)}
                      style={{
                        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                        gap: 6, padding: '12px 6px', borderRadius: 14, cursor: 'pointer',
                        border: isSelected ? `1.5px solid ${accent}` : '1px solid var(--glass-border)',
                        background: isSelected ? `${accent}12` : 'var(--glass-bg)',
                        backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
                        transition: 'all 0.2s ease',
                        transform: isSelected ? 'scale(1.03)' : 'scale(1)',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isSelected ? accent : 'var(--text-muted)'}>
                        <path d={motif.icon} />
                      </svg>
                      <span style={{
                        fontSize: 10, fontWeight: 500,
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                      }}>
                        {motif.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA */}
      <div style={{ marginTop: 12 }}>
        <button
          onClick={handleContinue}
          style={{
            ...ctaStyle,
            background: `linear-gradient(135deg, ${accent}, ${visual.gradientTo})`,
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

// ── Helper components ───────────────────────────

function SectionLabel({ children }: { children: React.ReactNode; accent?: string }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
    }}>
      {children}
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
