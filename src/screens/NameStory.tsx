import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { getCompanion } from '../data/companions';
import type { CommunicationMode } from '../data/customization';

/** Name & story — name input, optional backstory, communication mode. */
export function NameStory() {
  const { customization, updateCustomization, navigate } = useApp();

  const [name, setName] = useState(customization?.name ?? '');
  const [story, setStory] = useState(customization?.story ?? '');
  const [commMode, setCommMode] = useState<CommunicationMode>(
    customization?.communicationMode ?? 'both'
  );

  if (!customization) {
    navigate('characterSelection');
    return null;
  }

  const archetype = getCompanion(customization.archetypeId);
  const accent = customization.visual.accentColor;

  const handleContinue = () => {
    updateCustomization({
      name: name.trim() || archetype.name,
      story: story.trim(),
      communicationMode: commMode,
    });
    navigate('firstMeeting');
  };

  const commOptions: { label: string; value: CommunicationMode; icon: string }[] = [
    { label: 'Voice first', value: 'voice', icon: 'mic' },
    { label: 'Text first', value: 'text', icon: 'keyboard' },
    { label: 'Both equally', value: 'both', icon: 'balance' },
  ];

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
      <button onClick={() => navigate('voiceSelection')} style={backBtnStyle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: 20, animation: 'fade-in-up 0.5s ease' }}>
        <h1 style={h1Style}>Make it yours</h1>
        <p style={subStyle}>
          Name your companion and share how you met. This becomes a seed memory.
        </p>
      </div>

      {/* Name input */}
      <div style={{ marginBottom: 20, animation: 'fade-in-up 0.5s ease 0.1s both' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
          Companion Name
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={archetype.name}
          maxLength={24}
          style={{
            width: '100%', padding: '14px 18px', borderRadius: 14,
            border: `1px solid ${name ? accent + '60' : 'var(--glass-border)'}`,
            background: name ? `${accent}08` : 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
            color: 'var(--text-primary)', fontSize: 16, fontWeight: 500,
            outline: 'none', transition: 'all 0.2s ease',
          }}
        />
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Default: {archetype.name}. You can change this later.
        </div>
      </div>

      {/* Story input */}
      <div style={{ marginBottom: 20, animation: 'fade-in-up 0.5s ease 0.15s both' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>
          How We Met <span style={{ textTransform: 'none', color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
        </label>
        <textarea
          value={story}
          onChange={e => setStory(e.target.value)}
          placeholder="We met on a rainy afternoon. I was looking for someone to talk to, and there they were..."
          maxLength={300}
          rows={3}
          style={{
            width: '100%', padding: '14px 18px', borderRadius: 14,
            border: `1px solid ${story ? accent + '40' : 'var(--glass-border)'}`,
            background: story ? `${accent}08` : 'var(--glass-bg)',
            backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
            color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.5,
            outline: 'none', transition: 'all 0.2s ease',
            resize: 'none', fontFamily: 'inherit',
          }}
        />
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          This becomes {name || archetype.name}'s first memory of you. {story.length}/300
        </div>
      </div>

      {/* Communication mode */}
      <div style={{ marginBottom: 16, animation: 'fade-in-up 0.5s ease 0.2s both' }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 10 }}>
          How do you prefer to connect?
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {commOptions.map(opt => {
            const isSelected = commMode === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setCommMode(opt.value)}
                style={{
                  flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                  gap: 6, padding: '14px 8px', borderRadius: 14, cursor: 'pointer',
                  border: isSelected ? `1.5px solid ${accent}` : '1px solid var(--glass-border)',
                  background: isSelected ? `${accent}12` : 'var(--glass-bg)',
                  backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)',
                  transition: 'all 0.2s ease',
                }}
              >
                <CommIcon type={opt.icon} color={isSelected ? accent : 'var(--text-muted)'} />
                <span style={{
                  fontSize: 11, fontWeight: 500,
                  color: isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={handleContinue}
          style={{
            ...ctaStyle,
            background: `linear-gradient(135deg, ${accent}, ${customization.visual.gradientTo})`,
            boxShadow: `0 4px 24px ${accent}40`,
            color: '#FFFFFF', cursor: 'pointer',
          }}
        >
          Meet {name.trim() || archetype.name}
        </button>
      </div>
    </div>
  );
}

// ── Icons ───────────────────────────────────────

function CommIcon({ type, color }: { type: string; color: string }) {
  if (type === 'mic') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 15a3 3 0 003-3V6a3 3 0 00-6 0v6a3 3 0 003 3Z" fill={color} />
        <path d="M19 11a1 1 0 00-2 0 5 5 0 01-10 0 1 1 0 00-2 0 7 7 0 006 6.92V21a1 1 0 002 0v-3.08A7 7 0 0019 11Z" fill={color} />
      </svg>
    );
  }
  if (type === 'keyboard') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="12" rx="2" stroke={color} strokeWidth="2" />
        <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <path d="M12 4v16M4 12h16" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
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
