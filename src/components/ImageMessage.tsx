import { useState } from 'react';

interface ImageMessageProps {
  imageUrl?: string;
  prompt?: string;
  isGenerating?: boolean;
  accent: string;
  onRetry?: () => void;
}

/**
 * Renders an AI-generated image message in the chat.
 * Shows loading shimmer while generating, then the image with tap-to-zoom.
 */
export function ImageMessage({ imageUrl, prompt, isGenerating, accent, onRetry }: ImageMessageProps) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Loading state — companion is "taking a photo"
  if (isGenerating) {
    return (
      <div style={{
        width: '100%',
        maxWidth: 280,
        borderRadius: 18,
        overflow: 'hidden',
        background: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm), var(--shadow-inset)',
      }}>
        <div
          className="skeleton-shimmer"
          style={{
            width: '100%',
            aspectRatio: '3/4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {/* Camera shutter animation */}
          <div style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            border: `2px solid ${accent}40`,
            borderTopColor: accent,
            animation: 'spin 1s linear infinite',
          }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
            Taking a photo...
          </span>
        </div>
        {prompt && (
          <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
            {prompt}
          </div>
        )}
      </div>
    );
  }

  // Error state
  if (!imageUrl || imgError) {
    return (
      <div style={{
        width: '100%',
        maxWidth: 280,
        padding: 16,
        borderRadius: 18,
        background: 'var(--surface-1)',
        border: '1px solid var(--border-subtle)',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-body)' }}>
          Couldn't generate that photo
        </p>
        {onRetry && (
          <button
            className="pressable"
            onClick={onRetry}
            style={{
              padding: '6px 16px',
              borderRadius: 10,
              border: `1px solid ${accent}40`,
              background: `${accent}0a`,
              color: accent,
              fontSize: 13,
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
            }}
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  // Image loaded
  return (
    <>
      <div
        className="pressable"
        onClick={() => setExpanded(true)}
        style={{
          width: '100%',
          maxWidth: 280,
          borderRadius: 18,
          overflow: 'hidden',
          background: 'var(--surface-1)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md), var(--shadow-inset)',
          cursor: 'pointer',
        }}
      >
        <img
          src={imageUrl}
          alt={prompt || 'Companion photo'}
          onError={() => setImgError(true)}
          style={{
            width: '100%',
            display: 'block',
            aspectRatio: '3/4',
            objectFit: 'cover',
          }}
        />
        {prompt && (
          <div style={{
            padding: '10px 14px',
            fontSize: 12,
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-body)',
            lineHeight: 1.4,
          }}>
            {prompt}
          </div>
        )}
      </div>

      {/* Fullscreen overlay */}
      {expanded && (
        <div
          onClick={() => setExpanded(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            animation: 'fade-in 0.2s ease',
          }}
        >
          <img
            src={imageUrl}
            alt={prompt || 'Companion photo'}
            style={{
              maxWidth: '90%',
              maxHeight: '80%',
              borderRadius: 16,
              objectFit: 'contain',
            }}
          />
          <button
            style={{
              position: 'absolute',
              top: 'calc(var(--safe-top) + 16px)',
              right: 20,
              background: 'var(--surface-3)',
              border: '1px solid var(--border-default)',
              borderRadius: '50%',
              width: 36,
              height: 36,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
