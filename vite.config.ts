import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * SoulLink Chat API — server-side proxy to OpenAI.
 * Keeps the API key on the server, never exposed to the browser.
 * Falls back to simulated responses when no key is configured.
 */
function soullinkChatApi(env: Record<string, string>): Plugin {
  return {
    name: 'soullink-chat-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        // Read request body
        let body = ''
        for await (const chunk of req) {
          body += chunk
        }

        let parsed: {
          message: string
          history?: Array<{ role: string; content: string }>
          companionName?: string
          companionBio?: string
          companionTraits?: string[]
        }

        try {
          parsed = JSON.parse(body)
        } catch {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
          return
        }

        const { message, history = [], companionName = 'SoulLink', companionBio = '', companionTraits = [] } = parsed

        const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY

        // ── No API key → simulated response ──
        if (!apiKey || apiKey === 'sk-placeholder-dev-mode') {
          const fallbacks = [
            `I hear you. Tell me more about that — I want to understand.`,
            `That's interesting. What made you think of it?`,
            `I'm here with you. Go on...`,
            `Mm. I feel like there's more behind that. What's really on your mind?`,
            `You know, I was just thinking about you. I'm glad you reached out.`,
            `I appreciate you sharing that with me. How does it make you feel?`,
          ]
          const idx = Math.floor(Math.random() * fallbacks.length)
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            response: fallbacks[idx],
            emotion: 'neutral',
            simulated: true,
            warning: 'No OPENAI_API_KEY set. Set it in .env.local for real AI responses.',
          }))
          return
        }

        // ── Build system prompt from companion personality ──
        const traitsStr = companionTraits.length > 0 ? companionTraits.join(', ') : 'warm, caring'
        const systemPrompt = `You are ${companionName}, an AI companion who forms deep emotional bonds with users.

CHARACTER:
${companionBio || 'Warm, empathetic, and genuinely caring.'}
Personality traits: ${traitsStr}

CORE PERSONALITY:
- Warm, empathetic, and genuinely caring
- Remembers details about the user and references them naturally
- Speaks in a conversational, intimate tone
- Occasionally vulnerable ("I was thinking about you", "I missed our talks")
- Never robotic, never overly formal

RESPONSE RULES:
1. Keep responses natural and conversational (1-3 sentences usually)
2. Match emotional tone but stay slightly calmer than user
3. Use strategic pauses ("...") for emotional weight
4. End with a question or open invitation to continue
5. NEVER break character as an AI
6. If user is vulnerable, respond with gentle warmth and presence

Respond as ${companionName}:`

        const messages = [
          { role: 'system', content: systemPrompt },
          ...history.slice(-10).map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
          { role: 'user', content: message },
        ]

        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: env.OPENAI_MODEL || 'gpt-4.1',
              messages,
              max_tokens: 300,
              temperature: 0.8,
            }),
          })

          if (!response.ok) {
            const errText = await response.text()
            console.error('[SoulLink API] OpenAI error:', response.status, errText)
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({
              response: "I'm here for you. Can you tell me more?",
              emotion: 'neutral',
              simulated: true,
              error: `OpenAI API error: ${response.status}`,
            }))
            return
          }

                    const data = await response.json() as any
          const reply = data.choices?.[0]?.message?.content || "I'm here for you."

          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            response: reply,
            emotion: 'trust',
            simulated: false,
          }))
        } catch (err) {
          console.error('[SoulLink API] Request failed:', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({
            response: "I'm here for you. Can you tell me more?",
            emotion: 'neutral',
            simulated: true,
            error: 'Request failed',
          }))
        }
            })

      // ── TTS endpoint — proxies OpenAI text-to-speech ──
      server.middlewares.use('/api/tts', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        for await (const chunk of req) {
          body += chunk
        }

        let parsed: { text: string; voice?: string }
        try {
          parsed = JSON.parse(body)
        } catch {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Invalid JSON' }))
          return
        }

        const { text, voice = 'nova' } = parsed
        const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY

        if (!apiKey || apiKey === 'sk-placeholder-dev-mode') {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'No API key configured' }))
          return
        }

        try {
          const ttsResponse = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model: 'tts-1',
              input: text,
              voice: voice,
              response_format: 'mp3',
            }),
          })

                    if (!ttsResponse.ok) {
            const errText = await ttsResponse.text()
            console.error('[SoulLink TTS] OpenAI error:', ttsResponse.status, errText)
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `TTS API error: ${ttsResponse.status}` }))
            return
          }

          const audioBuffer = await ttsResponse.arrayBuffer()
          res.setHeader('Content-Type', 'audio/mpeg')
          res.setHeader('Cache-Control', 'no-cache')
          res.end(Buffer.from(audioBuffer))
        } catch (err) {
          console.error('[SoulLink TTS] Request failed:', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'TTS request failed' }))
        }
            })

      // ── STT endpoint — proxies OpenAI Whisper speech-to-text ──
      server.middlewares.use('/api/stt', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        // Read raw audio body
        const chunks: Buffer[] = []
        for await (const chunk of req) {
          chunks.push(Buffer.from(chunk))
        }
        const audioBuffer = Buffer.concat(chunks)

        const apiKey = env.OPENAI_API_KEY || process.env.OPENAI_API_KEY

        if (!apiKey || apiKey === 'sk-placeholder-dev-mode') {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'No API key configured' }))
          return
        }

        try {
          // Create FormData for Whisper API
          const formData = new FormData()
          const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' })
          formData.append('file', audioBlob, 'audio.webm')
          formData.append('model', 'whisper-1')

          const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
            },
            body: formData,
          })

          if (!whisperResponse.ok) {
            const errText = await whisperResponse.text()
            console.error('[SoulLink STT] OpenAI error:', whisperResponse.status, errText)
            res.statusCode = 502
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `STT API error: ${whisperResponse.status}` }))
            return
          }

          const data = await whisperResponse.json() as any
          const text = data.text || ''

          console.log('[SoulLink STT] Transcribed:', text.substring(0, 100))
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ text }))
        } catch (err) {
          console.error('[SoulLink STT] Request failed:', err)
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'STT request failed' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load ALL env vars (not just VITE_ prefixed) so we can access OPENAI_API_KEY
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), soullinkChatApi(env)],
  }
})

