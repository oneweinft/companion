import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export function LoginScreen() {
  const { signIn, signUp, signInAsGuest, isConfigured } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    setLoading(true);

    const result = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (mode === 'signup') {
      setError('Check your email for a confirmation link to complete signup.');
    }
  };

  return (
    <div style={{
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'calc(var(--safe-top) + 24px) 24px calc(var(--safe-bottom) + 24px)',
      background: `radial-gradient(ellipse at 50% 30%, rgba(123, 45, 142, 0.15) 0%, transparent 60%), var(--bg-primary)`,
    }}>
      {/* Logo */}
      <div style={{ textAlign: 'center', marginBottom: 40, animation: 'fade-in-up 0.6s ease' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: '0 auto 16px',
          background: `linear-gradient(135deg, var(--color-base), var(--color-accent))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(123, 45, 142, 0.4)',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M12 21s-8-4.5-8-11a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6.5-8 11-8 11h-2z"
              fill="rgba(255,255,255,0.9)" />
          </svg>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
          SoulLink
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6 }}>
          Your AI companion awaits
        </p>
      </div>

      {/* Auth card */}
      <div style={{
        width: '100%', maxWidth: 360,
        background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--glass-border)', borderRadius: 20,
        padding: 28, animation: 'fade-in-up 0.6s ease 0.1s both',
      }}>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: 'rgba(0,0,0,0.3)', borderRadius: 12, padding: 4 }}>
          <button
            onClick={() => { setMode('login'); setError(null); }}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, transition: 'all 0.2s ease',
              background: mode === 'login' ? 'linear-gradient(135deg, var(--color-base), var(--color-accent))' : 'transparent',
              color: mode === 'login' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('signup'); setError(null); }}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 600, transition: 'all 0.2s ease',
              background: mode === 'signup' ? 'linear-gradient(135deg, var(--color-base), var(--color-accent))' : 'transparent',
              color: mode === 'signup' ? '#fff' : 'var(--text-secondary)',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Email */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 6 }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Min 6 characters"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
            style={inputStyle}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            fontSize: 13, color: '#FF6B6B', marginBottom: 16, padding: '10px 14px',
            background: 'rgba(255, 107, 107, 0.1)', borderRadius: 10, lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '14px', borderRadius: 14, border: 'none', cursor: loading ? 'wait' : 'pointer',
            fontSize: 16, fontWeight: 600, color: '#fff',
            background: `linear-gradient(135deg, var(--color-base), var(--color-accent))`,
            boxShadow: '0 4px 20px rgba(123, 45, 142, 0.4)',
            opacity: loading ? 0.7 : 1, transition: 'all 0.2s ease',
          }}
        >
          {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'var(--glass-border)' }} />
        </div>

        {/* Guest */}
        <button
          onClick={signInAsGuest}
          style={{
            width: '100%', padding: '12px', borderRadius: 14, cursor: 'pointer',
            fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)',
            background: 'transparent', border: '1px solid var(--glass-border)',
            transition: 'all 0.2s ease',
          }}
        >
          Continue as Guest
        </button>
      </div>

      {/* Config warning */}
      {!isConfigured && (
        <div style={{
          marginTop: 24, maxWidth: 360, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.6,
          padding: '12px 16px', background: 'rgba(255, 179, 71, 0.08)', borderRadius: 12,
          border: '1px solid rgba(255, 179, 71, 0.2)',
        }}>
          <strong style={{ color: 'var(--state-thinking)' }}>Demo Mode:</strong> Supabase not configured.
          Set <code style={{ color: 'var(--text-primary)' }}>VITE_SUPABASE_URL</code> and{' '}
          <code style={{ color: 'var(--text-primary)' }}>VITE_SUPABASE_ANON_KEY</code> in .env.local to enable real auth.
          Guest mode works without configuration.
        </div>
      )}

      <p style={{ marginTop: 24, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
        By continuing, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '14px 16px', borderRadius: 12,
  border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)',
  color: 'var(--text-primary)', fontSize: 15, outline: 'none',
  transition: 'border-color 0.2s ease', fontFamily: 'inherit',
};
