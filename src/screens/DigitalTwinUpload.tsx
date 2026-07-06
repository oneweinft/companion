import { useState, useRef, useCallback } from 'react';
import JSZip from 'jszip';
import { useApp } from '../context/AppContext';
import { AvatarRenderer } from '../components/AvatarRenderer';
import {
  generateAvatarFromSelfies,
  isDigitalTwinConfigured,
  type TwinJobStatus,
} from '../lib/digitalTwin';
import { backBtnStyle, h1Style, subStyle, ctaButtonStyle, screenContainerStyle } from '../styles/shared';

type Phase = 'intro' | 'upload' | 'generating' | 'result';

/**
 * Digital Twin Upload screen — optional onboarding step.
 *
 * Lets the user upload selfies to generate a photorealistic avatar
 * for their companion using the digital-twin-generator backend.
 * Skippable — falls back to the default pravatar avatar.
 */
export function DigitalTwinUpload() {
  const { customization, updateCustomization, navigate } = useApp();
  const [phase, setPhase] = useState<Phase>('intro');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const accent = customization?.visual.accentColor || '#7B2D8E';
  const visual = customization?.visual;
  const appearance = customization?.appearance;
  const twinAvailable = isDigitalTwinConfigured();

  // ── File selection ──────────────────────────
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    setSelectedFiles(files);
    // Revoke old thumbnails
    thumbnails.forEach(t => URL.revokeObjectURL(t));
    setThumbnails(files.map(f => URL.createObjectURL(f)));
    setError(null);
  }, [thumbnails]);

  const removeFile = useCallback((index: number) => {
    URL.revokeObjectURL(thumbnails[index]);
    const nextFiles = selectedFiles.filter((_, i) => i !== index);
    const nextThumbs = thumbnails.filter((_, i) => i !== index);
    setSelectedFiles(nextFiles);
    setThumbnails(nextThumbs);
  }, [selectedFiles, thumbnails]);

  // ── Generate avatar ──────────────────────────
  const handleGenerate = useCallback(async () => {
    if (selectedFiles.length < 3) {
      setError('Please select at least 3 photos for best results');
      return;
    }

    setPhase('generating');
    setProgress(5);
    setStatusText('Preparing photos...');
    setError(null);

    try {
      // Create ZIP from selected files
      const zip = new JSZip();
      selectedFiles.forEach((file, i) => {
        zip.file(`photo_${i + 1}.jpg`, file);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });

      setProgress(15);
      setStatusText('Uploading to AI engine...');

      const result = await generateAvatarFromSelfies(zipBlob, {
        promptStyle: 'portrait',
        qualityMode: 'fast',
        onProgress: (status: TwinJobStatus) => {
          if (status.status === 'queued') {
            setStatusText('Queued — waiting for GPU...');
            setProgress(20);
          } else if (status.status === 'processing') {
            setStatusText('Generating your avatar...');
            setProgress(30 + Math.round((status.progress || 0) * 0.6));
          }
        },
      });

      setProgress(100);
      setStatusText('Avatar ready!');
      setGeneratedUrl(result.imageUrl);
      setTimeout(() => setPhase('result'), 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
      setPhase('upload');
    }
  }, [selectedFiles]);

  // ── Accept generated avatar ────────────────────
  const handleAccept = useCallback(() => {
    if (generatedUrl) {
      updateCustomization({ avatarImage: generatedUrl });
    }
    navigate('voiceSelection');
  }, [generatedUrl, updateCustomization, navigate]);

  // ── Regenerate ─────────────────────────────────
  const handleRegenerate = useCallback(() => {
    setGeneratedUrl(null);
    setProgress(0);
    setPhase('upload');
  }, []);

  // ── Skip ───────────────────────────────────────
  const handleSkip = useCallback(() => {
    thumbnails.forEach(t => URL.revokeObjectURL(t));
    navigate('voiceSelection');
  }, [navigate, thumbnails]);

  // ── Cleanup thumbnails on unmount ───────────────
  // (handled by skip/accept, plus browser GC)

  // ════════════════════════════════════════════════
  //  Render
  // ════════════════════════════════════════════════

  return (
    <div style={{ ...screenContainerStyle(accent), overflowY: 'auto' }}>
      <div className="aurora-bg" />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', width: '100%' }}>
        {/* Back button */}
        <button onClick={() => navigate('characterCreator')} style={{ ...backBtnStyle, marginBottom: 16 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Back
        </button>

        {/* ── INTRO PHASE ── */}
        {phase === 'intro' && (
          <div style={{ animation: 'fade-in-up 0.4s ease' }}>
            <h1 style={h1Style}>Make it real</h1>
            <p style={subStyle}>
              Upload a few selfies and our AI will create a photorealistic avatar of {customization?.name || 'your companion'}.
              This becomes their face across SoulLink — in chat, in photos, everywhere.
            </p>

            {/* Visual preview */}
            {visual && (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
                <AvatarRenderer
                  visual={visual}
                  appearance={appearance}
                  size={140}
                  variant="portrait"
                />
              </div>
            )}

            {/* Feature bullets */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <FeatureRow icon="📸" title="15+ photos recommended" desc="More photos = better likeness" />
              <FeatureRow icon="🔒" title="Private & encrypted" desc="Your photos are deleted after generation" />
              <FeatureRow icon="✨" title="Unlimited regenerations" desc="Not happy? Generate again anytime" />
            </div>

            {/* Twin unavailable warning */}
            {!twinAvailable && (
              <div style={{
                padding: '12px 16px',
                borderRadius: 12,
                background: 'rgba(255, 180, 70, 0.08)',
                border: '1px solid rgba(255, 180, 70, 0.2)',
                marginBottom: 16,
                fontSize: 13,
                color: 'rgba(255, 200, 100, 0.9)',
                lineHeight: 1.5,
              }}>
                AI engine not detected. You can still proceed — generation will run in simulation mode.
              </div>
            )}

            {/* CTA */}
            <button
              className="pressable"
              onClick={() => setPhase('upload')}
              style={ctaButtonStyle(accent)}
            >
              Upload Photos
            </button>
            <button
              onClick={handleSkip}
              style={{
                width: '100%',
                padding: '12px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 14,
                cursor: 'pointer',
                marginTop: 8,
              }}
            >
              Skip for now
            </button>
          </div>
        )}

        {/* ── UPLOAD PHASE ── */}
        {phase === 'upload' && (
          <div style={{ animation: 'fade-in-up 0.4s ease' }}>
            <h1 style={{ ...h1Style, fontSize: 24 }}>Select selfies</h1>
            <p style={subStyle}>
              Pick 3–20 clear, well-lit photos. Different angles and expressions work best.
            </p>

            {/* File input zone */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {/* Thumbnails grid */}
            {thumbnails.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, margin: '20px 0' }}>
                {thumbnails.map((thumb, i) => (
                  <div
                    key={i}
                    style={{
                      position: 'relative',
                      borderRadius: 12,
                      overflow: 'hidden',
                      aspectRatio: '1',
                      background: 'var(--surface-1)',
                    }}
                  >
                    <img src={thumb} alt={`Photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => removeFile(i)}
                      style={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        border: 'none',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        fontSize: 14,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {/* Add more button */}
                {thumbnails.length < 20 && (
                  <button
                    className="pressable"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      aspectRatio: '1',
                      borderRadius: 12,
                      border: '2px dashed var(--border-default)',
                      background: 'var(--surface-1)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      color: 'var(--text-muted)',
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: 11 }}>Add</span>
                  </button>
                )}
              </div>
            ) : (
              <button
                className="pressable"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '40px 20px',
                  borderRadius: 18,
                  border: '2px dashed var(--border-default)',
                  background: 'var(--surface-1)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  margin: '20px 0',
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: `${accent}15`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path d="M21 19V8a2 2 0 00-2-2h-3.17l-1.84-2H9.99L8.15 6H5a2 2 0 00-2 2v11a2 2 0 002 2h14a2 2 0 002-2z" stroke={accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="13" r="3.5" stroke={accent} strokeWidth="1.5" />
                  </svg>
                </div>
                <span style={{ fontSize: 15, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                  Tap to select photos
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  3–20 photos · JPG or PNG
                </span>
              </button>
            )}

            {/* Count indicator */}
            {selectedFiles.length > 0 && (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 12 }}>
                {selectedFiles.length} {selectedFiles.length === 1 ? 'photo' : 'photos'} selected
                {selectedFiles.length < 3 && ' (need at least 3)'}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(255, 80, 80, 0.08)',
                border: '1px solid rgba(255, 80, 80, 0.2)',
                marginBottom: 12,
                fontSize: 13,
                color: '#FF6B6B',
              }}>
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              className="pressable"
              onClick={handleGenerate}
              disabled={selectedFiles.length < 3}
              style={ctaButtonStyle(accent, selectedFiles.length < 3)}
            >
              Generate Avatar
            </button>
            <button
              onClick={handleSkip}
              style={{
                width: '100%',
                padding: '12px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 14,
                cursor: 'pointer',
                marginTop: 8,
              }}
            >
              Skip
            </button>
          </div>
        )}

        {/* ── GENERATING PHASE ── */}
        {phase === 'generating' && (
          <div style={{
            animation: 'fade-in-up 0.4s ease',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
            gap: 24,
          }}>
            {/* Spinner */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              border: `3px solid ${accent}20`,
              borderTopColor: accent,
              animation: 'spin 1s linear infinite',
            }} />

            {/* Status */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: 17, fontWeight: 600, color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)', marginBottom: 6,
              }}>
                {statusText}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                This usually takes 30–60 seconds
              </div>
            </div>

            {/* Progress bar */}
            <div style={{
              width: '100%', maxWidth: 280,
              height: 6, borderRadius: 3,
              background: 'var(--surface-2)',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                borderRadius: 3,
                background: `linear-gradient(90deg, ${accent}, var(--color-base))`,
                transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {progress}%
            </div>
          </div>
        )}

        {/* ── RESULT PHASE ── */}
        {phase === 'result' && generatedUrl && visual && (
          <div style={{ animation: 'fade-in-up 0.4s ease', textAlign: 'center' }}>
            <h1 style={{ ...h1Style, fontSize: 24, textAlign: 'center' }}>Your avatar</h1>
            <p style={{ ...subStyle, textAlign: 'center' }}>
              Here's {customization?.name || 'your companion'} — generated just for you.
            </p>

            {/* Result preview */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '28px 0 32px' }}>
              <AvatarRenderer
                visual={visual}
                appearance={appearance}
                avatarImage={generatedUrl}
                size={180}
                variant="portrait"
                showTwinBadge
              />
            </div>

            {/* Actions */}
            <button
              className="pressable"
              onClick={handleAccept}
              style={ctaButtonStyle(accent)}
            >
              Use this avatar
            </button>
            <button
              className="pressable"
              onClick={handleRegenerate}
              style={{
                width: '100%',
                padding: '14px 24px',
                borderRadius: 16,
                border: `1px solid ${accent}30`,
                background: `${accent}08`,
                color: 'var(--text-primary)',
                fontSize: 15,
                fontWeight: 500,
                cursor: 'pointer',
                marginTop: 10,
                fontFamily: 'var(--font-body)',
              }}
            >
              Try again
            </button>
            <button
              onClick={handleSkip}
              style={{
                width: '100%',
                padding: '12px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: 14,
                cursor: 'pointer',
                marginTop: 8,
              }}
            >
              Use default avatar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Helper component ──────────────────────────

function FeatureRow({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="surface-card" style={{ padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <span style={{ fontSize: 20, lineHeight: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}
