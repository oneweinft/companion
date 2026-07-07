import { useState, useEffect } from 'react';
import type { UseSoulScoreReturn, Achievement } from '../hooks/useSoulScore';
import { ACHIEVEMENTS, TIERS } from '../hooks/useSoulScore';

// ═══════════════════════════════════════════════════════
//  SoulScoreWidget — compact floating chip for MainChat header
// ═══════════════════════════════════════════════════════

interface WidgetProps {
  soulScore: UseSoulScoreReturn;
  accent: string;
  onClick?: () => void;
}

export function SoulScoreWidget({ soulScore, accent: _accent, onClick }: WidgetProps) {
  const { score, tier } = soulScore;

  return (
    <button
      className="pressable"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 10,
        border: `1px solid ${tier.color}30`,
        background: `${tier.color}0a`,
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
      }}
    >
      <span style={{ fontSize: 12 }}>{tier.icon}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: tier.color }}>{score}</span>
      {soulScore.streak >= 2 && (
        <span style={{ fontSize: 10, color: '#FF8A00' }}>🔥{soulScore.streak}</span>
      )}
    </button>
  );
}

// ═══════════════════════════════════════════════════════
//  AchievementToast — popup when a new achievement is earned
// ═══════════════════════════════════════════════════════

interface ToastProps {
  achievement: Achievement;
  onDismiss: () => void;
}

export function AchievementToast({ achievement, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), 50);
    const autoDismiss = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 300);
    }, 5000);
    return () => { clearTimeout(showTimer); clearTimeout(autoDismiss); };
  }, [onDismiss]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(var(--safe-top) + 70px)',
        left: 12,
        right: 12,
        zIndex: 300,
        transform: visible ? 'translateY(0)' : 'translateY(-120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          borderRadius: 16,
          padding: '14px 16px',
          background: 'rgba(14, 14, 26, 0.95)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          border: '1px solid rgba(255, 180, 70, 0.25)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255, 180, 70, 0.1)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          pointerEvents: 'auto',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(255,180,70,0.15), rgba(255,138,0,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, flexShrink: 0,
        }}>
          {achievement.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, color: 'rgba(255, 180, 70, 0.9)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
            Achievement unlocked
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
            {achievement.name}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {achievement.description}
          </div>
        </div>
        <button
          onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', padding: 0, width: 24, height: 24,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
//  SoulScoreSection — full section for CompanionProfile
// ═══════════════════════════════════════════════════════

interface SectionProps {
  soulScore: UseSoulScoreReturn;
  accent: string;
}

export function SoulScoreSection({ soulScore, accent }: SectionProps) {
  const { score, tier, nextTier, progressToNext, streak, messageCount, voiceCount, achievements } = soulScore;

  const earnedAchievements = ACHIEVEMENTS.filter(a => achievements.includes(a.id));
  const lockedAchievements = ACHIEVEMENTS.filter(a => !achievements.includes(a.id));

  return (
    <div
      className="surface-card"
      style={{
        padding: 16,
        marginBottom: 16,
        borderRadius: 18,
        animation: 'fade-in-up 0.4s ease 0.15s both',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Soul Score
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14 }}>{tier.icon}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: tier.color }}>{tier.name}</span>
        </div>
      </div>

      {/* Score display */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 36, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {score}
        </span>
        {nextTier && (
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            / {nextTier.minScore}
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
        {nextTier
          ? `${nextTier.minScore - score} points to ${nextTier.name}`
          : 'Maximum tier reached'}
      </div>

      {/* Progress bar */}
      <div style={{
        width: '100%', height: 8, borderRadius: 4,
        background: 'var(--surface-2)', overflow: 'hidden', marginBottom: 16,
      }}>
        <div style={{
          width: `${Math.min(100, progressToNext)}%`,
          height: '100%',
          borderRadius: 4,
          background: `linear-gradient(90deg, ${tier.color}, ${accent})`,
          transition: 'width 0.6s ease',
          boxShadow: `0 0 12px ${tier.color}40`,
        }} />
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 16 }}>
        <ScoreStat label="Streak" value={`${streak}d`} icon="🔥" />
        <ScoreStat label="Messages" value={String(messageCount)} icon="💬" />
        <ScoreStat label="Voice" value={String(voiceCount)} icon="🎙️" />
      </div>

      {/* Tier path */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {TIERS.map((t) => (
          <div
            key={t.name}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: 8,
              textAlign: 'center',
              background: score >= t.minScore ? `${t.color}15` : 'var(--surface-1)',
              border: `1px solid ${score >= t.minScore ? `${t.color}30` : 'var(--border-subtle)'}`,
              opacity: score >= t.minScore ? 1 : 0.4,
            }}
          >
            <div style={{ fontSize: 14 }}>{t.icon}</div>
            <div style={{ fontSize: 9, color: score >= t.minScore ? t.color : 'var(--text-muted)', marginTop: 2 }}>
              {t.name.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        Achievements ({earnedAchievements.length}/{ACHIEVEMENTS.length})
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {earnedAchievements.map(a => (
          <div
            key={a.id}
            title={`${a.name}: ${a.description}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 10,
              background: 'rgba(255, 180, 70, 0.08)',
              border: '1px solid rgba(255, 180, 70, 0.15)',
              fontSize: 11, color: 'rgba(255, 200, 100, 0.9)',
              fontFamily: 'var(--font-body)',
            }}
          >
            <span>{a.icon}</span>
            <span>{a.name}</span>
          </div>
        ))}
        {lockedAchievements.map(a => (
          <div
            key={a.id}
            title={`${a.name}: ${a.description}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 10,
              background: 'var(--surface-1)',
              border: '1px solid var(--border-subtle)',
              fontSize: 11, color: 'var(--text-muted)',
              opacity: 0.5,
              fontFamily: 'var(--font-body)',
            }}
          >
            <span>🔒</span>
            <span>{a.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreStat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 16, marginBottom: 2 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{label}</div>
    </div>
  );
}
