import { useMemo } from 'react';
import type { InteractionState } from '../types';
import { STATE_COLORS } from '../types';

interface WaveformProps {
  data: number[];
  state: InteractionState;
  height?: number;
  barCount?: number;
}

/**
 * Animated waveform visualization with 4 interaction states.
 *
 * State behaviors:
 * - idle: minimal flat bars, gentle breathing
 * - listening: active bars reacting to mic input (red/pink)
 * - thinking: slow oscillating bars (amber)
 * - speaking: active bars reacting to TTS output (green/teal)
 *
 * Design references:
 * - Pi AI: wave animation when listening, abstract animation when thinking
 * - ElevenLabs UI: conversation bar waveform
 * - 2026 trend: micro-animations for AI state changes (100-300ms)
 */
export function Waveform({ data, state, height = 80 }: WaveformProps) {
  const color = STATE_COLORS[state];
  const barCount = data.length;

  const bars = useMemo(() => {
    return data.map((value, i) => {
      // Minimum height so bars are always visible
      const minH = state === 'idle' ? 3 : 4;
      const h = Math.max(minH, value * height);

      // Center the bars vertically
      const isCenter = i >= barCount / 2 - 1 && i <= barCount / 2;

      // Fade edges slightly for visual focus
      const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
      const opacity = state === 'idle'
        ? 0.2 + (1 - distFromCenter) * 0.15
        : 0.4 + (1 - distFromCenter) * 0.6;

      return { h, opacity, isCenter, key: i };
    });
  }, [data, state, height, barCount]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        height,
        width: '100%',
        maxWidth: 340,
        margin: '0 auto',
        padding: '0 12px',
      }}
    >
      {bars.map(bar => (
        <div
          key={bar.key}
          style={{
            width: 3,
            height: bar.h,
            borderRadius: 2,
            background: `linear-gradient(to top, ${color}, ${color}cc)`,
            opacity: bar.opacity,
            transition: state === 'idle'
              ? 'height 0.4s ease, opacity 0.4s ease'
              : 'height 0.06s linear, opacity 0.2s ease',
            boxShadow: state !== 'idle' && bar.isCenter
              ? `0 0 8px ${color}80`
              : 'none',
          }}
        />
      ))}
    </div>
  );
}
