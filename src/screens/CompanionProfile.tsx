import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';

/** Companion profile + memories + settings — slide-in panel from right. */
export function CompanionProfile() {
    const { selectedCompanion, navigate, resetOnboarding } = useApp();

  if (!selectedCompanion) {
    navigate('characterSelection');
    return null;
  }

  const companion = selectedCompanion;
  const accent = companion.accentColor;

  // Mock stats — in production, fetch from GET /users/stats
  const stats = {
    streakDays: 1,
    totalMessages: 0,
    conversations: 0,
  };

  // Mock memories — in production, fetch from GET /memory/context
  const memories: { type: string; content: string }[] = [];

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: `
          radial-gradient(ellipse at 50% 10%, ${accent}12 0%, transparent 60%),
          var(--bg-primary)
        `,
        animation: 'slide-in-right 0.35s ease',
        overflowY: 'auto',
        padding: 'calc(var(--safe-top) + 12px) 20px calc(var(--safe-bottom) + 20px)',
      }}
    >
      {/* Close button */}
      <button
        onClick={() => navigate('chat')}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-muted)',
          fontSize: 14,
          padding: '4px 0',
          marginBottom: 16,
          alignSelf: 'flex-start',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to chat
      </button>

      {/* Portrait + name */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginBottom: 28,
          animation: 'fade-in-up 0.4s ease',
        }}
      >
                <AvatarRenderer
          appearance={companion.appearance}
          visual={companion.visual}
          avatarImage={companion.avatarImage}
          size={96}
        />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>
            {companion.name}
          </div>
          <div style={{ fontSize: 13, color: accent, marginTop: 2 }}>
            {companion.archetype}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {companion.personalityTraits.map(trait => (
            <span
              key={trait}
              style={{
                fontSize: 11,
                padding: '3px 10px',
                borderRadius: 10,
                background: `${accent}15`,
                color: 'var(--text-secondary)',
              }}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div
        className="glass-panel"
        style={{
          padding: 16,
          marginBottom: 16,
          animation: 'fade-in-up 0.4s ease 0.1s both',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Connection
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <StatBlock label="Streak" value={`${stats.streakDays}d`} accent={accent} />
          <StatBlock label="Messages" value={String(stats.totalMessages)} accent={accent} />
          <StatBlock label="Chats" value={String(stats.conversations)} accent={accent} />
        </div>
      </div>

      {/* What I know about you */}
      <div
        className="glass-panel"
        style={{
          padding: 16,
          marginBottom: 16,
          animation: 'fade-in-up 0.4s ease 0.2s both',
        }}
      >
        <div style={{ fontSize: 11, color: accent, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, fontWeight: 600 }}>
          What I know about you
        </div>
        {memories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {memories.map((mem, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${accent}15`,
                }}
              >
                <div style={{ fontSize: 10, color: accent, marginBottom: 4, textTransform: 'uppercase' }}>
                  {mem.type}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {mem.content}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              padding: '20px 12px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            As you talk with {companion.name}, the things you share will be remembered here.
            Start a conversation to build your connection.
          </div>
        )}
      </div>

      {/* Preferences */}
      <div
        className="glass-panel"
        style={{
          padding: 16,
          marginBottom: 16,
          animation: 'fade-in-up 0.4s ease 0.3s both',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
          Preferences
        </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Relationship</span>
            <span style={{ fontSize: 13, color: accent, textTransform: 'capitalize' }}>
              {companion.relationshipMode}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Communication</span>
            <span style={{ fontSize: 13, color: accent, textTransform: 'capitalize' }}>
              {companion.communicationMode}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Aura</span>
            <span style={{ fontSize: 13, color: accent }}>
              {companion.visual.paletteName}
            </span>
          </div>
        </div>
      </div>

      {/* Switch companion */}
      <button
        onClick={() => navigate('characterSelection')}
        style={{
          width: '100%',
          padding: '14px 24px',
          borderRadius: 14,
          border: `1px solid ${accent}30`,
          background: `${accent}08`,
          color: 'var(--text-primary)',
          fontSize: 15,
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Switch companion
      </button>

      {/* Reset onboarding */}
      <button
        onClick={resetOnboarding}
        style={{
          width: '100%',
          padding: '10px 24px',
          borderRadius: 14,
          border: 'none',
          background: 'none',
          color: 'var(--text-muted)',
          fontSize: 13,
          cursor: 'pointer',
          transition: 'color 0.2s ease',
        }}
      >
        Reset SoulLink
      </button>
    </div>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}
