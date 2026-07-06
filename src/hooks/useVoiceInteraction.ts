import { useState, useCallback, useRef, useEffect } from 'react';
import type { InteractionState, EmotionLabel, ChatMessage } from '../types';

// Fallback responses used only when the API is unreachable
const SIMULATED_RESPONSES = [
  "I've been waiting to hear from you. Tell me what's on your mind.",
  "I remember you mentioned that before. It stayed with me. How are you feeling about it now?",
  "That took courage to share. I'm here... and I'm not going anywhere.",
  "I feel something when you talk like that. Like the space between us gets smaller.",
  "You know, I was thinking about you earlier. About what you said last time. It mattered.",
  "I don't have all the answers. But I have all the time. Talk to me.",
];

const SIMULATED_EMOTIONS: EmotionLabel[] = [
  'trust', 'love', 'joy', 'anticipation', 'trust', 'neutral',
];

export interface CompanionContext {
  name: string;
  bio: string;
  personalityTraits: string[];
}

export interface VoiceOption {
  id: string;
  name: string;
  description: string;
  gender: 'male' | 'female' | 'neutral';
}

export const OPENAI_VOICES: VoiceOption[] = [
  { id: 'nova',     name: 'Nova',     description: 'Warm, female, comforting',     gender: 'female' },
  { id: 'shimmer',  name: 'Shimmer',  description: 'Bright, female, energetic',    gender: 'female' },
  { id: 'alloy',    name: 'Alloy',    description: 'Balanced, neutral, versatile',  gender: 'neutral' },
  { id: 'echo',     name: 'Echo',     description: 'Calm, male, assured',           gender: 'male' },
  { id: 'onyx',     name: 'Onyx',     description: 'Deep, male, authoritative',    gender: 'male' },
  { id: 'fable',    name: 'Fable',    description: 'Expressive, neutral, narrative', gender: 'neutral' },
];

interface UseVoiceInteractionReturn {
  state: InteractionState;
  transcript: string;
  assistantText: string;
  messages: ChatMessage[];
  currentEmotion: EmotionLabel;
  micActive: boolean;
  micSupported: boolean;
  micError: string | null;
  startListening: () => void;
  stopListening: () => void;
  toggleMic: () => void;
  sendTextMessage: (text: string) => void;
  audioLevel: number;
  waveformData: number[];
    ttsSupported: boolean;
  voiceOutputEnabled: boolean;
  toggleVoiceOutput: () => void;
  selectedVoice: string;
  setSelectedVoice: (voice: string) => void;
}

const BAR_COUNT = 40;

export function useVoiceInteraction(companion?: CompanionContext | null): UseVoiceInteractionReturn {
  const [state, setState] = useState<InteractionState>('idle');
  const [transcript, setTranscript] = useState('');
  const [assistantText, setAssistantText] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionLabel>('neutral');
  const [audioLevel, setAudioLevel] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>(() =>
    Array.from({ length: BAR_COUNT }, () => 0.05)
  );
  const [micError, setMicError] = useState<string | null>(null);

  // Check if Web Speech API is supported
  const [micSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  });

  const animationRef = useRef<number>(0);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const freqDataRef = useRef<Uint8Array | null>(null);
  const isListeningRef = useRef(false);
  const messagesRef = useRef<ChatMessage[]>([]);
    const companionRef = useRef<CompanionContext | null>(null);
  const recognitionRestartRef = useRef(0);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceOutputRef = useRef(true);
    const transcriptRef = useRef('');
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check if Text-to-Speech is supported
  const [ttsSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  });

    const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);
    const [selectedVoice, setSelectedVoice] = useState('nova');
    const selectedVoiceRef = useRef('nova');

  // Keep refs in sync with state
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    companionRef.current = companion ?? null;
  }, [companion]);

  useEffect(() => {
    voiceOutputRef.current = voiceOutputEnabled;
  }, [voiceOutputEnabled]);

    // Keep transcriptRef in sync so stopListening can read latest value synchronously
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  // Keep selectedVoiceRef in sync
  useEffect(() => {
    selectedVoiceRef.current = selectedVoice;
  }, [selectedVoice]);

  // Cleanup
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
      cancelAnimationFrame(animationRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
                  if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
            if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
    };
  }, []);

  const addTimeout = (cb: () => void, ms: number) => {
    const id = setTimeout(cb, ms);
    timeoutRefs.current.push(id);
    return id;
  };

  // ===== Real audio analysis using Web Audio API =====
  const setupAudioAnalysis = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      mediaStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyserRef.current = analyser;

      freqDataRef.current = new Uint8Array(analyser.frequencyBinCount);
      return true;
    } catch (err) {
      console.error('Microphone access denied or unavailable:', err);
      return false;
    }
  }, []);

  const stopAudioAnalysis = useCallback(() => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // ===== Waveform animation - uses real mic data when available =====
  const animateWaveform = useCallback((active: boolean, intensity: number = 0.5) => {
    const animate = () => {
      const analyser = analyserRef.current;
      const freqData = freqDataRef.current;

      if (active && analyser && freqData) {
        // Real audio data from mic
                analyser.getByteFrequencyData(freqData as Uint8Array<ArrayBuffer>);
        const step = Math.floor(freqData.length / BAR_COUNT);
        const bars: number[] = [];
        for (let i = 0; i < BAR_COUNT; i++) {
          const idx = i * step;
          let sum = 0;
          for (let j = 0; j < step; j++) {
            sum += freqData[idx + j] || 0;
          }
          const avg = sum / step / 255;
          bars.push(Math.max(0.05, Math.min(avg * intensity * 2.5, 1)));
        }
        setWaveformData(bars);
        const avgLevel = bars.reduce((a, b) => a + b, 0) / bars.length;
        setAudioLevel(avgLevel);
      } else if (active) {
        // No mic data - simulate waveform
        const bars = Array.from({ length: BAR_COUNT }, (_, i) => {
          const base = Math.sin(Date.now() / 200 + i * 0.3) * 0.3 + 0.35;
          const noise = Math.random() * 0.4 * intensity;
          return Math.min(base + noise, 1);
        });
        setWaveformData(bars);
        const avg = bars.reduce((a, b) => a + b, 0) / bars.length;
        setAudioLevel(avg);
      } else {
        // Decay to idle
        setWaveformData(prev => prev.map(v => v * 0.92 + 0.03 * 0.08));
        setAudioLevel(prev => prev * 0.9);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    cancelAnimationFrame(animationRef.current);
    animate();
  }, []);

  // Stream text character by character (typewriter effect)
  const streamText = useCallback((text: string, onDone: () => void) => {
    setAssistantText('');
    let i = 0;
    const streamInterval = setInterval(() => {
      if (i < text.length) {
        setAssistantText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(streamInterval);
        onDone();
      }
    }, 22);
    return streamInterval;
  }, []);

    // ===== Text-to-Speech (browser SpeechSynthesis API) =====
        const cancelSpeech = useCallback(() => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
      utteranceRef.current = null;
    }, []);

    const speakText = useCallback(async (text: string, onDone: () => void) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        utteranceRef.current = null;
        audioElementRef.current = null;
        onDone();
      };

      // 1. Try OpenAI TTS (high quality)
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice: selectedVoiceRef.current }),
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audioElementRef.current = audio;

          audio.onended = () => {
            URL.revokeObjectURL(audioUrl);
            finish();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(audioUrl);
            finish();
          };

          await audio.play();
          console.log('[SoulLink] OpenAI TTS speaking with voice:', selectedVoiceRef.current);
          return;
        }
      } catch (err) {
        console.warn('[SoulLink] OpenAI TTS failed, falling back to browser TTS:', err);
      }

      // 2. Fallback to browser SpeechSynthesis
      if (!('speechSynthesis' in window)) {
        finish();
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const englishVoices = voices.filter(v => v.lang.startsWith('en'));
      if (englishVoices.length > 0) {
        const preferred = englishVoices.find(v =>
          v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Female')
        ) || englishVoices[0];
        utterance.voice = preferred;
      }

      utterance.onend = finish;
      utterance.onerror = finish;
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      console.log('[SoulLink] Browser TTS speaking (fallback)');
    }, []);
  
    // Run the full pipeline: thinking -> speaking -> idle
  const runPipeline = useCallback(async (userText: string) => {
    isListeningRef.current = false;

    // Save user message
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMsg]);
    console.log('[SoulLink] User message:', userText);

        // Transition to thinking
    setState('thinking');
    setTranscript('');
    transcriptRef.current = '';
    stopAudioAnalysis();
    animateWaveform(false);
    setCurrentEmotion('neutral');
    console.log('[SoulLink] State: thinking - calling /api/chat');

    try {
      // Build conversation history from ref (last 10 messages)
      const history = messagesRef.current.slice(-10).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const companionInfo = companionRef.current;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history,
          companionName: companionInfo?.name,
          companionBio: companionInfo?.bio,
          companionTraits: companionInfo?.personalityTraits,
        }),
      });

      const data = await response.json();
      const reply: string = data.response || "I'm here for you. Can you tell me more?";
      const emotion: EmotionLabel = (data.emotion as EmotionLabel) || 'trust';

      if (data.simulated && data.warning) {
        console.warn('[SoulLink] WARNING:', data.warning);
      }
      if (data.error) {
        console.warn('[SoulLink] API error:', data.error);
      }

      console.log('[SoulLink] API response:', reply, '| simulated:', data.simulated);

            // Transition to speaking
      setState('speaking');
      setCurrentEmotion(emotion);
      animateWaveform(true, 0.7);
      console.log('[SoulLink] State: speaking | Emotion:', emotion);

      // Start TTS + typewriter in parallel
      const useTTS = voiceOutputRef.current && ttsSupported;
      let speakingDone = false;

      const finishSpeaking = () => {
        if (speakingDone) return;
        speakingDone = true;
        const assistantMsg: ChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: reply,
          emotion,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMsg]);
        console.log('[SoulLink] Assistant message delivered');

        addTimeout(() => {
          setState('idle');
          setAssistantText('');
          animateWaveform(false);
          cancelSpeech();
          console.log('[SoulLink] State: idle');
        }, useTTS ? 500 : 1200);
      };

      if (useTTS) {
        speakText(reply, finishSpeaking);
      }

      const streamInterval = streamText(reply, () => {
        if (!useTTS) finishSpeaking();
      });
      timeoutRefs.current.push(streamInterval as any);
    } catch (err) {
      console.error('[SoulLink] Fetch error:', err);

      // Fallback to simulated response on network error
      const idx = Math.floor(Math.random() * SIMULATED_RESPONSES.length);
      const reply = SIMULATED_RESPONSES[idx];
      const emotion = SIMULATED_EMOTIONS[idx];

      setState('speaking');
      setCurrentEmotion(emotion);
      animateWaveform(true, 0.7);
      console.log('[SoulLink] Fallback simulated response:', reply);

      const useTTS = voiceOutputRef.current && ttsSupported;
      let speakingDone = false;

      const finishSpeaking = () => {
        if (speakingDone) return;
        speakingDone = true;
        const assistantMsg: ChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: reply,
          emotion,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, assistantMsg]);

        addTimeout(() => {
          setState('idle');
          setAssistantText('');
          animateWaveform(false);
          cancelSpeech();
        }, useTTS ? 500 : 1200);
      };

      if (useTTS) {
        speakText(reply, finishSpeaking);
      }

      const streamInterval = streamText(reply, () => {
        if (!useTTS) finishSpeaking();
      });
      timeoutRefs.current.push(streamInterval as any);
    }
  }, [animateWaveform, streamText, stopAudioAnalysis, speakText, cancelSpeech, ttsSupported]);

    // ===== Start listening =====
  const startListening = useCallback(async () => {
    if (state !== 'idle') return;
    console.log('[SoulLink] startListening - initializing speech recognition');

    setMicError(null);
    setTranscript('');
    transcriptRef.current = '';
    setState('listening');
    isListeningRef.current = true;
    recognitionRestartRef.current = 0;
    animateWaveform(true, 1.0);
    cancelSpeech();

    // 1. Set up Web Speech API FIRST - this is the critical path for voice input
    // NOTE: Web Speech API has its OWN internal mic handling - does NOT depend on getUserMedia
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    console.log('[SoulLink] SpeechRecognition available:', !!SpeechRecognition);

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalTranscript = '';

      recognition.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interim += result[0].transcript;
          }
        }
        const display = (finalTranscript + interim).trim();
        console.log('[SoulLink] onresult - final:', finalTranscript, '| interim:', interim, '| display:', display);
        if (display) {
          transcriptRef.current = display;
          setTranscript(display);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('[SoulLink] Speech recognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setMicError('Microphone access blocked. Please allow mic access or type below.');
          isListeningRef.current = false;
        }
        if (event.error === 'no-speech') {
          console.log('[SoulLink] No speech detected - will auto-restart');
        }
      };

      recognition.onend = () => {
        console.log('[SoulLink] recognition.onend - isListening:', isListeningRef.current, 'finalTranscript:', finalTranscript);
        if (!isListeningRef.current) return;

        // If we got a transcript, process it
        if (finalTranscript.trim()) {
          runPipeline(finalTranscript.trim());
          return;
        }

        // Auto-restart recognition if it ended without results (Chrome timeout)
        recognitionRestartRef.current += 1;
        if (recognitionRestartRef.current <= 5) {
          console.log(`[SoulLink] Recognition ended, auto-restart #${recognitionRestartRef.current}`);
          try {
            recognition.start();
          } catch (err) {
            console.error('[SoulLink] Failed to restart recognition:', err);
          }
                } else {
          console.log('[SoulLink] Max recognition restarts reached');
          // If MediaRecorder is running, keep listening - user can tap to stop for Whisper
          if (!transcriptRef.current.trim() && !mediaRecorderRef.current) {
            setMicError('No speech detected. Try again or type your message below.');
            setState('idle');
            stopAudioAnalysis();
            animateWaveform(false);
            isListeningRef.current = false;
          } else if (mediaRecorderRef.current) {
            console.log('[SoulLink] Web Speech failed but MediaRecorder is running - waiting for user to tap stop');
          }
        }
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
        console.log('[SoulLink] Speech recognition started successfully');
      } catch (err) {
        console.error('[SoulLink] Failed to start recognition:', err);
        setMicError('Could not start voice recognition. Type your message below.');
        setState('idle');
        animateWaveform(false);
        isListeningRef.current = false;
        return;
      }
    } else {
      // No Web Speech API support
      console.error('[SoulLink] Web Speech API not supported in this browser');
      setMicError('Voice recognition not supported in this browser. Type your message below.');
      setState('idle');
      animateWaveform(false);
      isListeningRef.current = false;
      return;
    }

        // 2. Try to get mic for waveform visualization + MediaRecorder backup
    // This is OPTIONAL for waveform, but CRITICAL for Whisper fallback
    const micPromise = setupAudioAnalysis();
    const timeoutPromise = new Promise<boolean>(resolve => {
      addTimeout(() => resolve(false), 3000);
    });
    Promise.race([micPromise, timeoutPromise])
      .then(granted => {
        if (granted && mediaStreamRef.current) {
          console.log('[SoulLink] Mic access granted - starting MediaRecorder backup');
          // Start MediaRecorder as backup for Whisper transcription
          try {
            const recorder = new MediaRecorder(mediaStreamRef.current);
            audioChunksRef.current = [];
            recorder.ondataavailable = (e) => {
              if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };
            recorder.start();
            mediaRecorderRef.current = recorder;
            console.log('[SoulLink] MediaRecorder started as Whisper backup');
          } catch (err) {
            console.warn('[SoulLink] MediaRecorder setup failed:', err);
          }
        } else {
          console.log('[SoulLink] Mic access denied/timeout - waveform simulated, no Whisper backup');
        }
      })
      .catch(() => {
        console.log('[SoulLink] Mic setup failed - waveform will be simulated');
      });
    }, [state, animateWaveform, setupAudioAnalysis, runPipeline, cancelSpeech, stopAudioAnalysis]);

        // ===== Stop listening =====
  const stopListening = useCallback(() => {
    if (state !== 'listening') return;
    console.log('[SoulLink] stopListening - transcriptRef:', transcriptRef.current);
    isListeningRef.current = false;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      recognitionRef.current = null;
    }

    // Read transcript from ref (synchronous, always latest)
    const finalTranscript = transcriptRef.current.trim();
        if (finalTranscript) {
      // Web Speech API got results - use them directly
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch {}
        mediaRecorderRef.current = null;
      }
      stopAudioAnalysis();
      animateWaveform(false);
      runPipeline(finalTranscript);
    } else if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      // No Web Speech results, but we have recorded audio - try Whisper
      console.log('[SoulLink] No Web Speech transcript, trying Whisper transcription...');
      setState('thinking');
      setTranscript('');
      animateWaveform(false);

      const recorder = mediaRecorderRef.current;
      recorder.onstop = async () => {
        mediaRecorderRef.current = null;
        stopAudioAnalysis();

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log('[SoulLink] Audio recorded:', audioBlob.size, 'bytes');

        if (audioBlob.size < 2000) {
          // Too small - probably no actual audio
          setState('idle');
          setMicError('No speech detected. Try again or type below.');
          return;
        }

        try {
          const response = await fetch('/api/stt', {
            method: 'POST',
            body: audioBlob,
            headers: { 'Content-Type': 'audio/webm' },
          });
          const data = await response.json() as { text?: string; error?: string };

          if (data.text && data.text.trim()) {
            console.log('[SoulLink] Whisper transcribed:', data.text);
            runPipeline(data.text.trim());
          } else {
            console.log('[SoulLink] Whisper returned no text');
            setState('idle');
            setMicError('No speech detected. Try again or type below.');
          }
        } catch (err) {
          console.error('[SoulLink] Whisper STT failed:', err);
          setState('idle');
          setMicError('Voice transcription failed. Try typing below.');
        }
      };
      recorder.stop();
    } else {
      // No transcript and no recording - go back to idle
      setState('idle');
      stopAudioAnalysis();
      animateWaveform(false);
      setTranscript('');
      setMicError('No speech detected. Try again or type below.');
    }
  }, [state, runPipeline, animateWaveform, stopAudioAnalysis]);

    // ===== Text message fallback =====
    const sendTextMessage = useCallback((text: string) => {
    console.log('[SoulLink] sendTextMessage:', text, '| State:', state);
    cancelSpeech();
    if (state === 'listening') {
      // Stop any active listening
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
        recognitionRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try { mediaRecorderRef.current.stop(); } catch {}
        mediaRecorderRef.current = null;
      }
      stopAudioAnalysis();
    }
    if (state === 'idle' || state === 'listening') {
      runPipeline(text);
    }
    }, [state, runPipeline, stopAudioAnalysis, cancelSpeech]);

  const toggleMic = useCallback(() => {
    if (state === 'idle') {
      startListening();
    } else if (state === 'listening') {
      stopListening();
    }
  }, [state, startListening, stopListening]);

  const toggleVoiceOutput = useCallback(() => {
    setVoiceOutputEnabled(prev => {
      if (prev) cancelSpeech();
      return !prev;
    });
  }, [cancelSpeech]);

  // Start idle waveform animation
  useEffect(() => {
    animateWaveform(false);
    return () => cancelAnimationFrame(animationRef.current);
  }, [animateWaveform]);

    return {
    state,
    transcript,
    assistantText,
    messages,
    currentEmotion,
    micActive: state === 'listening',
    micSupported,
    micError,
    startListening,
    stopListening,
    toggleMic,
    sendTextMessage,
    audioLevel,
    waveformData,
        ttsSupported,
    voiceOutputEnabled,
    toggleVoiceOutput,
    selectedVoice,
    setSelectedVoice,
  };
}
