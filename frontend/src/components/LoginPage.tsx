import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { Zap, Mail, Lock, LogIn, UserPlus, UserCheck } from 'lucide-react';

export function LoginPage({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAsGuest } = useAuth();
  const { showToast } = useToast();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
        showToast('Account created successfully! Welcome to Q-GraphRAG.', 'success');
      } else {
        await signInWithEmail(email, password);
        showToast('Signed in successfully.', 'success');
      }
      onAuthSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      // Simplify Firebase error messages
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/wrong-password') || msg.includes('auth/user-not-found')) {
        setError('Invalid email or password. Please try again or create a new account.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setError('An account with this email already exists. Try signing in.');
      } else if (msg.includes('auth/weak-password')) {
        setError('Password should be at least 6 characters long.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      showToast('Signed in with Google.', 'success');
      onAuthSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign in was cancelled or failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAsGuest();
      showToast('Signed in as Guest Researcher.', 'success');
      onAuthSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Guest sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 120px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      background: 'radial-gradient(circle at 50% 20%, rgba(79, 70, 229, 0.08) 0%, rgba(248, 250, 252, 0.6) 70%)'
    }}>
      <div className="card fade-in" style={{
        width: '100%',
        maxWidth: 440,
        padding: '36px 32px',
        borderRadius: 20,
        boxShadow: '0 20px 40px -15px rgba(79, 70, 229, 0.15), 0 0 0 1px rgba(79, 70, 229, 0.1)',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 22
      }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.4)'
          }}>
            <Zap size={26} color="#ffffff" />
          </div>
          <div>
            <h2 className="font-headline" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--t1)', margin: 0 }}>
              {isSignUp ? 'Create Researcher Account' : 'Welcome to Q-GraphRAG'}
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--t3)', marginTop: 4, margin: 0 }}>
              {isSignUp 
                ? 'Sign up to explore quantum multi-hop retrieval and benchmarks.' 
                : 'Sign in to access your Quantum Graph Workspace & Research Studio.'}
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            padding: '10px 14px',
            borderRadius: 8,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            fontSize: '12px',
            lineHeight: 1.4
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Email Address
            </label>
            <div style={{ position: 'relative', marginTop: 5 }}>
              <input
                className="inp"
                type="email"
                placeholder="researcher@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                style={{ width: '100%', paddingLeft: 36 }}
              />
              <Mail size={15} color="var(--t4)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Password
            </label>
            <div style={{ position: 'relative', marginTop: 5 }}>
              <input
                className="inp"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
                minLength={6}
                style={{ width: '100%', paddingLeft: 36 }}
              />
              <Lock size={15} color="var(--t4)" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              padding: '11px',
              borderRadius: 10,
              fontWeight: 700,
              fontSize: '13.5px',
              marginTop: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}
          >
            {loading ? <span className="spin" /> : isSignUp ? <UserPlus size={16} /> : <LogIn size={16} />}
            <span>{loading ? 'Processing…' : isSignUp ? 'Sign Up with Email' : 'Sign In'}</span>
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
          <span style={{ fontSize: '11px', color: 'var(--t4)', textTransform: 'uppercase', fontWeight: 600 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: 'var(--bd)' }} />
        </div>

        {/* Social / Alternative Sign In Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Google Sign In */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              padding: '10px',
              borderRadius: 10,
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              border: '1px solid var(--bd)'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Instant Guest / Demo Sign In */}
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleGuestSignIn}
            disabled={loading}
            style={{
              padding: '10px',
              borderRadius: 10,
              fontSize: '12.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: '#f8fafc',
              border: '1px dashed #cbd5e1'
            }}
          >
            <UserCheck size={16} color="#059669" />
            <span>Instant Demo / Guest Researcher Access</span>
          </button>
        </div>

        {/* Toggle between Sign In and Sign Up */}
        <div style={{ textAlign: 'center', fontSize: '12.5px', color: 'var(--t3)', borderTop: '1px solid var(--bd-subtle)', paddingTop: 14 }}>
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(false); setError(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(true); setError(null); }}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
              >
                Sign Up
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
