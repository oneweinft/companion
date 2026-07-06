/**
 * SoulLink Image Generation Service.
 *
 * Frontend API client for the digital-twin-generator backend.
 * Handles:
 * 1. Avatar generation from selfie uploads (onboarding)
 * 2. In-chat photo generation requests (companion sends a "selfie")
 *
 * The digital-twin-generator runs as a separate Flask service,
 * typically deployed on a cloud GPU instance (RunPod A10G).
 *
 * Configure with VITE_DIGITAL_TWIN_URL env variable.
 */

const TWIN_API_URL = import.meta.env.VITE_DIGITAL_TWIN_URL as string | undefined;
const TWIN_API_KEY = import.meta.env.VITE_DIGITAL_TWIN_API_KEY as string | undefined;

const BASE_URL = TWIN_API_URL || 'http://localhost:5000';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface TwinJobStatus {
  job_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  result_url?: string;
  error?: string;
  created_at?: string;
}

export interface AvatarGenerationResult {
  imageUrl: string;
  jobId: string;
}

export type QualityMode = 'fast' | 'high_fidelity';

// ──────────────────────────────────────────────
// Avatar Generation (from selfies)
// ──────────────────────────────────────────────

/**
 * Upload a ZIP of selfies and generate a photorealistic avatar portrait.
 * Polls until the job completes or times out.
 */
export async function generateAvatarFromSelfies(
  file: File | Blob,
  options?: {
    promptStyle?: string;
    qualityMode?: QualityMode;
    onProgress?: (status: TwinJobStatus) => void;
    timeoutMs?: number;
  }
): Promise<AvatarGenerationResult> {
  const { promptStyle = 'portrait', qualityMode = 'fast', onProgress, timeoutMs = 180000 } = options || {};

  // Step 1: Upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('prompt_style', promptStyle);
  formData.append('quality_mode', qualityMode);

  const uploadResponse = await fetch(`${BASE_URL}/upload`, {
    method: 'POST',
    headers: TWIN_API_KEY ? { Authorization: `Bearer ${TWIN_API_KEY}` } : {},
    body: formData,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`Upload failed: ${error}`);
  }

  const uploadResult = await uploadResponse.json();
  const jobId = uploadResult.job_id;

  if (!jobId) {
    throw new Error('No job_id returned from upload');
  }

  // Step 2: Poll for completion
  const result = await pollJobStatus(jobId, onProgress, timeoutMs);

  return {
    imageUrl: result.result_url || `${BASE_URL}/download/${jobId}/avatar.png`,
    jobId,
  };
}

// ──────────────────────────────────────────────
// In-Chat Photo Generation
// ──────────────────────────────────────────────

/**
 * Generate an in-character photo of the companion.
 * Uses the companion's avatar as identity reference + a text prompt.
 *
 * This endpoint should be added to the digital-twin-generator:
 * POST /generate-photo — accepts identity_image_url + prompt + style
 */
export async function generateCompanionPhoto(
  identityImageUrl: string,
  prompt: string,
  options?: {
    style?: string;
    qualityMode?: QualityMode;
    onProgress?: (status: TwinJobStatus) => void;
  }
): Promise<string> {
  const { style = 'natural', qualityMode = 'fast', onProgress } = options || {};

  const response = await fetch(`${BASE_URL}/generate-photo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(TWIN_API_KEY ? { Authorization: `Bearer ${TWIN_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      identity_image: identityImageUrl,
      prompt,
      style,
      quality_mode: qualityMode,
    }),
  });

  if (!response.ok) {
    // Fallback: if /generate-photo doesn't exist yet, simulate for dev
    if (TWIN_API_URL === undefined) {
      return simulatePhotoGeneration(prompt);
    }
    const error = await response.text();
    throw new Error(`Photo generation failed: ${error}`);
  }

  const result = await response.json();
  const jobId = result.job_id;

  if (!jobId) {
    throw new Error('No job_id returned from generate-photo');
  }

  const status = await pollJobStatus(jobId, onProgress, 120000);
  return status.result_url || `${BASE_URL}/download/${jobId}/photo.png`;
}

// ──────────────────────────────────────────────
// Quality Modes
// ──────────────────────────────────────────────

export async function setQualityMode(mode: QualityMode): Promise<void> {
  await fetch(`${BASE_URL}/quality-mode/${mode}`, {
    method: 'POST',
    headers: TWIN_API_KEY ? { Authorization: `Bearer ${TWIN_API_KEY}` } : {},
  });
}

export async function getQualityModes(): Promise<{ modes: QualityMode[]; current: QualityMode }> {
  const response = await fetch(`${BASE_URL}/quality-modes`);
  return response.json();
}

// ──────────────────────────────────────────────
// Health Check
// ──────────────────────────────────────────────

export async function checkTwinHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/health`, { timeout: 5000 } as RequestInit);
    return response.ok;
  } catch {
    return false;
  }
}

// ──────────────────────────────────────────────
// Internal: Poll job status
// ──────────────────────────────────────────────

async function pollJobStatus(
  jobId: string,
  onProgress?: (status: TwinJobStatus) => void,
  timeoutMs = 180000
): Promise<TwinJobStatus> {
  const startTime = Date.now();
  const pollInterval = 3000; // 3 seconds

  while (Date.now() - startTime < timeoutMs) {
    const response = await fetch(`${BASE_URL}/status/${jobId}`);
    const status: TwinJobStatus = await response.json();

    if (onProgress) onProgress(status);

    if (status.status === 'completed') {
      return status;
    }

    if (status.status === 'failed') {
      throw new Error(status.error || 'Generation failed');
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  throw new Error('Generation timed out');
}

// ──────────────────────────────────────────────
// Dev simulation (when no backend is configured)
// ──────────────────────────────────────────────

function simulatePhotoGeneration(prompt: string): string {
  // Return a placeholder gradient data URL for dev mode
  console.warn('[Digital Twin] Running in simulation mode — set VITE_DIGITAL_TWIN_URL for real generation');
  console.warn(`[Digital Twin] Prompt: "${prompt}"`);
  return '';
}

/**
 * Check if the digital twin service is configured and available.
 */
export function isDigitalTwinConfigured(): boolean {
  return Boolean(TWIN_API_URL);
}
