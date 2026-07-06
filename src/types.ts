/** SoulLink voice interaction types. */

export type InteractionState = 'idle' | 'listening' | 'thinking' | 'speaking';

export type EmotionLabel =
  | 'joy'
  | 'sadness'
  | 'anger'
  | 'fear'
  | 'surprise'
  | 'disgust'
  | 'trust'
  | 'anticipation'
  | 'loneliness'
  | 'love'
  | 'confusion'
  | 'neutral';

export interface EmotionState {
  primary: EmotionLabel;
  secondary: EmotionLabel | null;
  intensity: number;
  valence: number;
  arousal: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  emotion?: EmotionLabel;
  timestamp: number;
  isStreaming?: boolean;
}

/** Emotion → color mapping (from SoulLink avatar_sync.py) */
export const EMOTION_COLORS: Record<EmotionLabel, { glow: string; accent: string }> = {
  joy:         { glow: '#00D4AA', accent: '#00FFB3' },
  sadness:     { glow: '#4A6FA5', accent: '#6B8DD6' },
  anger:       { glow: '#FF3366', accent: '#FF6B8A' },
  fear:        { glow: '#8B5CF6', accent: '#A78BFA' },
  surprise:    { glow: '#FFB347', accent: '#FFCC70' },
  disgust:     { glow: '#8B8000', accent: '#B8A000' },
  trust:       { glow: '#00D4AA', accent: '#33DDBB' },
  anticipation:{ glow: '#FFB347', accent: '#FFC884' },
  loneliness:  { glow: '#4A6FA5', accent: '#5A7FB5' },
  love:        { glow: '#FF3366', accent: '#FF6B9D' },
  confusion:   { glow: '#9966CC', accent: '#B388D9' },
  neutral:     { glow: '#7B2D8E', accent: '#9B4DAE' },
};

/** State → color mapping */
export const STATE_COLORS: Record<InteractionState, string> = {
  idle: '#7B2D8E',
  listening: '#FF3366',
  thinking: '#FFB347',
  speaking: '#00D4AA',
};

export const STATE_LABELS: Record<InteractionState, string> = {
  idle: 'Tap to talk',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'Speaking...',
};
