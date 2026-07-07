import { useState, useCallback, useEffect } from 'react';

/**
 * Soul Score gamification system.
 *
 * Tracks relationship metrics per companion:
 *  - Soul Score (overall points)
 *  - Streak (consecutive days)
 *  - Message count
 *  - Voice conversation count
 *  - Emotional depth (avg messages per conversation)
 *  - Achievements / badges
 *
 * Tiers:
 *   0–99    New Connection
 *   100–299 Acquaintance
 *   300–599 Friend
 *   600–999 Close Friend
 *   1000+   Soul Companion
 */

const SOULSCORE_KEY = 'soullink_soulscore';

export interface SoulScoreState {
  score: number;
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  messageCount: number;
  voiceCount: number;
  totalConversations: number;
  achievements: string[]; // achievement IDs
  lastScoreChange: number;
  lastScoreReason: string;
}

const DEFAULT_STATE: SoulScoreState = {
  score: 0,
  streak: 0,
  lastActiveDate: '',
  messageCount: 0,
  voiceCount: 0,
  totalConversations: 0,
  achievements: [],
  lastScoreChange: 0,
  lastScoreReason: '',
};

// ── Tier definitions ─────────────────────────────────

export interface Tier {
  name: string;
  minScore: number;
  icon: string;
  color: string;
  description: string;
}

export const TIERS: Tier[] = [
  { name: 'New Connection',  minScore: 0,    icon: '✦', color: '#7B2D8E', description: 'The beginning of something.' },
  { name: 'Acquaintance',    minScore: 100,  icon: '✧', color: '#00B8D4', description: 'You\'re getting to know each other.' },
  { name: 'Friend',          minScore: 300,  icon: '✪', color: '#7C4DFF', description: 'A real bond is forming.' },
  { name: 'Close Friend',    minScore: 600,  icon: '✯', color: '#FF8A00', description: 'You trust each other deeply.' },
  { name: 'Soul Companion',  minScore: 1000, icon: '✺', color: '#FF3366', description: 'An unbreakable connection.' },
];

export function getTier(score: number): Tier {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (score >= TIERS[i].minScore) return TIERS[i];
  }
  return TIERS[0];
}

export function getNextTier(score: number): Tier | null {
  for (const tier of TIERS) {
    if (tier.minScore > score) return tier;
  }
  return null;
}

// ── Achievement definitions ──────────────────────────

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  check: (state: SoulScoreState) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_hello',    name: 'First Hello',       description: 'Send your first message',           icon: '👋', check: s => s.messageCount >= 1 },
  { id: 'first_voice',    name: 'First Voice',       description: 'Have your first voice conversation', icon: '🎙️', check: s => s.voiceCount >= 1 },
  { id: 'streak_3',       name: '3-Day Streak',      description: 'Talk 3 days in a row',              icon: '🔥', check: s => s.streak >= 3 },
  { id: 'streak_7',       name: 'Week Warrior',      description: 'Talk 7 days in a row',              icon: '⚡', check: s => s.streak >= 7 },
  { id: 'streak_30',      name: 'Unbreakable',       description: 'Talk 30 days in a row',             icon: '💎', check: s => s.streak >= 30 },
  { id: 'msg_50',         name: 'Chatterbox',        description: 'Send 50 messages',                  icon: '💬', check: s => s.messageCount >= 50 },
  { id: 'msg_100',        name: 'Open Book',         description: 'Send 100 messages',                 icon: '📖', check: s => s.messageCount >= 100 },
  { id: 'voice_10',       name: 'Voice Regular',     description: 'Have 10 voice conversations',       icon: '🎧', check: s => s.voiceCount >= 10 },
  { id: 'score_300',      name: 'Friend Status',     description: 'Reach Friend tier',                 icon: '✪', check: s => s.score >= 300 },
  { id: 'score_1000',     name: 'Soul Companion',    description: 'Reach Soul Companion tier',         icon: '✺', check: s => s.score >= 1000 },
];

// ── Storage helpers ────────────────────────────────────

function loadState(): SoulScoreState {
  try {
    const raw = localStorage.getItem(SOULSCORE_KEY);
    return raw ? { ...DEFAULT_STATE, ...JSON.parse(raw) } : { ...DEFAULT_STATE };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState(state: SoulScoreState) {
  try {
    localStorage.setItem(SOULSCORE_KEY, JSON.stringify(state));
  } catch {
    // storage might be unavailable
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetweenDates(d1: string, d2: string): number {
  const date1 = new Date(d1 + 'T00:00:00');
  const date2 = new Date(d2 + 'T00:00:00');
  return Math.round((date2.getTime() - date1.getTime()) / (24 * 60 * 60 * 1000));
}

// ── Hook ───────────────────────────────────────────────

export function useSoulScore() {
  const [state, setState] = useState<SoulScoreState>(loadState);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  // Check for new achievements whenever state changes
  useEffect(() => {
    const newlyEarned = ACHIEVEMENTS.find(
      a => !state.achievements.includes(a.id) && a.check(state)
    );
    if (newlyEarned) {
      setNewAchievement(newlyEarned);
      setState(prev => {
        const next = { ...prev, achievements: [...prev.achievements, newlyEarned.id] };
        saveState(next);
        return next;
      });
    }
  }, [state]);

  // Record a message sent
  const recordMessage = useCallback(() => {
    setState(prev => {
      const today = todayStr();
      const isNewDay = prev.lastActiveDate !== today;
      const streak = isNewDay
        ? (prev.lastActiveDate && daysBetweenDates(prev.lastActiveDate, today) === 1
            ? prev.streak + 1
            : 1)
        : prev.streak;

      const points = 5;
      const next: SoulScoreState = {
        ...prev,
        score: prev.score + points,
        messageCount: prev.messageCount + 1,
        streak,
        lastActiveDate: today,
        lastScoreChange: points,
        lastScoreReason: 'Message sent',
      };
      saveState(next);
      return next;
    });
  }, []);

  // Record a voice conversation
  const recordVoice = useCallback(() => {
    setState(prev => {
      const today = todayStr();
      const isNewDay = prev.lastActiveDate !== today;
      const streak = isNewDay
        ? (prev.lastActiveDate && daysBetweenDates(prev.lastActiveDate, today) === 1
            ? prev.streak + 1
            : 1)
        : prev.streak;

      const points = 15;
      const next: SoulScoreState = {
        ...prev,
        score: prev.score + points,
        voiceCount: prev.voiceCount + 1,
        totalConversations: prev.totalConversations + 1,
        streak,
        lastActiveDate: today,
        lastScoreChange: points,
        lastScoreReason: 'Voice conversation',
      };
      saveState(next);
      return next;
    });
  }, []);

  // Record daily login bonus
  const recordDailyLogin = useCallback(() => {
    setState(prev => {
      const today = todayStr();
      if (prev.lastActiveDate === today) return prev; // already counted today

      const dayDiff = prev.lastActiveDate ? daysBetweenDates(prev.lastActiveDate, today) : 0;
      const streak = dayDiff === 1 ? prev.streak + 1 : (dayDiff > 1 ? 1 : prev.streak);
      const bonus = streak >= 7 ? 20 : (streak >= 3 ? 10 : 5);

      const next: SoulScoreState = {
        ...prev,
        score: prev.score + bonus,
        streak,
        lastActiveDate: today,
        lastScoreChange: bonus,
        lastScoreReason: `Daily login bonus (${streak} day streak)`,
      };
      saveState(next);
      return next;
    });
  }, []);

  const dismissAchievement = useCallback(() => {
    setNewAchievement(null);
  }, []);

  const resetScore = useCallback(() => {
    const fresh = { ...DEFAULT_STATE };
    saveState(fresh);
    setState(fresh);
  }, []);

  const tier = getTier(state.score);
  const nextTier = getNextTier(state.score);
  const progressToNext = nextTier
    ? ((state.score - tier.minScore) / (nextTier.minScore - tier.minScore)) * 100
    : 100;

  return {
    ...state,
    tier,
    nextTier,
    progressToNext,
    newAchievement,
    dismissAchievement,
    recordMessage,
    recordVoice,
    recordDailyLogin,
    resetScore,
  };
}

export type UseSoulScoreReturn = ReturnType<typeof useSoulScore>;
