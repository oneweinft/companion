import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { COMPANIONS } from '../data/companions';
import { CompanionCard } from '../components/CompanionCard';

/** Character selection screen — 2x2 grid of companion characters. */
export function CharacterSelection() {
  const { selectCompanion, navigate, selectedCompanion } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedCompanion?.id ?? null
  );

  const selected = COMPANIONS.find(c => c.id === selectedId);

  const handleConnect = () => {
    if (selectedId) {
      selectCompanion(selectedId);
            navigate('relationshipMode');
    }
  };

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        padding: 'calc(var(--safe-top) + 16px) 20px calc(var(--safe-bottom) + 16px)',
      }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('welcome')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: 14,
          padding: '4px 0',
          marginBottom: 8,
          alignSelf: 'flex-start',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </button>

      {/* Header */}
      <div style={{ marginBottom: 24, animation: 'fade-in-up 0.5s ease' }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: 0,
            letterSpacing: -0.5,
          }}
        >
          Choose Your Companion
        </h1>
        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginTop: 6,
            lineHeight: 1.5,
          }}
        >
          Each has their own way of connecting. You can always switch later.
        </p>
      </div>

      {/* 2x2 grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12,
          marginBottom: 16,
          animation: 'fade-in-up 0.5s ease 0.1s both',
        }}
      >
        {COMPANIONS.map(companion => (
          <CompanionCard
            key={companion.id}
            companion={companion}
            isSelected={selectedId === companion.id}
            onSelect={() => setSelectedId(companion.id)}
          />
        ))}
      </div>

      {/* Bio detail for selected companion */}
      {selected && (
        <div
          className="glass-panel"
          style={{
            padding: 16,
            marginBottom: 16,
            animation: 'fade-in 0.3s ease',
          }}
        >
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {selected.bio}
          </p>
          <div
            style={{
              marginTop: 12,
              paddingTop: 12,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              fontSize: 13,
              color: selected.accentColor,
              fontStyle: 'italic',
              lineHeight: 1.5,
            }}
          >
            "{selected.defaultGreeting}"
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ marginTop: 'auto' }}>
        <button
          onClick={handleConnect}
          disabled={!selectedId}
          style={{
            width: '100%',
            padding: '16px 32px',
            borderRadius: 16,
            border: 'none',
            cursor: selectedId ? 'pointer' : 'default',
            background: selectedId
              ? `linear-gradient(135deg, ${selected?.accentColor || '#7B2D8E'}, ${selected?.gradientTo || '#C44E8B'})`
              : 'rgba(255,255,255,0.05)',
            color: selectedId ? '#FFFFFF' : 'var(--text-muted)',
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: 0.5,
            boxShadow: selectedId
              ? `0 4px 24px ${selected?.accentColor || '#7B2D8E'}40`
              : 'none',
            transition: 'all 0.3s ease',
            opacity: selectedId ? 1 : 0.5,
          }}
        >
          {selectedId ? `Connect with ${selected?.name}` : 'Select a companion'}
        </button>
      </div>
    </div>
  );
}
