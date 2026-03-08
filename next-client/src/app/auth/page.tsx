"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// ── GOOGLE ICON SVG ─────────────────────────────
function GoogleIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
    );
}

// ── FLOATING PARTICLES ───────────────────────────
function Particle({ style }: { style: React.CSSProperties }) {
    return <div className="auth-particle" style={style} />;
}

export default function AuthPage() {
    const searchParams = useSearchParams();
    const modeParam = searchParams.get('mode');
    const initialMode = modeParam === 'signup' ? 'signup' : 'login';
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode); // 'login' | 'signup'
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [form, setForm] = useState({ name: '', email: '', password: '' });

    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) router.replace('/dashboard');
    }, [isAuthenticated, router]);

    // Show error from Google callback
    useEffect(() => {
        if (searchParams.get('error') === 'google_failed') {
            setError('Google sign-in failed. Please try again or use email & password.');
        }
    }, [searchParams]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (mode === 'signup') {
                if (!form.name.trim()) { setError('Please enter your name'); setLoading(false); return; }
                if (form.password.length < 6) { setError('Password must be at least 6 characters'); setLoading(false); return; }
                const res = await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
                login(res.data.token, res.data.user);
                router.push('/dashboard');
            } else {
                const res = await api.post('/auth/login', { email: form.email, password: form.password });
                login(res.data.token, res.data.user);
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google';
    };

    const switchMode = (newMode: 'login' | 'signup') => {
        setMode(newMode);
        setError('');
        setSuccess('');
        setForm({ name: '', email: '', password: '' });
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', flexDirection: 'column', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
            <Navbar />

            <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '110px 20px 80px', position: 'relative', overflow: 'hidden' }}>
                {/* Background glows */}
                <div style={{ position: 'absolute', top: '20%', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)', backgroundSize: '50px 50px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)', pointerEvents: 'none' }} />

                <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
                    {/* Welcome Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ textAlign: 'center', marginBottom: 32 }}
                    >
                        <h1 style={{ fontSize: 'clamp(28px, 5vw, 36px)', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.03em', marginBottom: 8 }}>
                            {mode === 'login' ? 'Welcome Back' : 'Get Started'}
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: 16 }}>
                            {mode === 'login' ? 'Sign in to continue your journey 🏆' : 'Create your account in seconds ⚡'}
                        </p>
                    </motion.div>

                    {/* Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        style={{
                            background: 'rgba(15,22,41,0.9)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 24,
                            padding: 'clamp(28px, 5vw, 40px)',
                            backdropFilter: 'blur(24px)',
                            boxShadow: '0 40px 80px rgba(0,0,0,0.4), 0 0 60px rgba(34,197,94,0.06)',
                        }}
                    >
                        {/* Tab toggle */}
                        <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 14, padding: 4, marginBottom: 32 }}>
                            {(['login', 'signup'] as const).map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => switchMode(tab)}
                                    style={{
                                        flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700,
                                        fontSize: 14, transition: 'all 0.3s ease', fontFamily: 'Inter, sans-serif',
                                        background: mode === tab ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'transparent',
                                        color: mode === tab ? '#000' : '#94a3b8',
                                        boxShadow: mode === tab ? '0 4px 16px rgba(34,197,94,0.35)' : 'none',
                                    }}
                                >
                                    {tab === 'login' ? '🔑 Sign In' : '⚡ Sign Up'}
                                </button>
                            ))}
                        </div>

                        {/* Google Button */}
                        <button
                            onClick={handleGoogleLogin}
                            style={{
                                width: '100%', padding: '13px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)',
                                background: 'rgba(255,255,255,0.05)', color: '#f8fafc', fontSize: 15, fontWeight: 600,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer',
                                transition: 'all 0.25s ease', marginBottom: 24, fontFamily: 'Inter, sans-serif',
                            }}
                            onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'; }}
                            onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; }}
                        >
                            <GoogleIcon />
                            Continue with Google
                        </button>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                            <span style={{ fontSize: 12, color: '#475569', fontWeight: 600, letterSpacing: '0.05em' }}>OR USE EMAIL</span>
                            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit}>
                            <AnimatePresence>
                                {mode === 'signup' && (
                                    <motion.div
                                        key="name-field"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.25 }}
                                        style={{ overflow: 'hidden' } as any}
                                    >
                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Full Name</label>
                                            <div style={{ position: 'relative' }}>
                                                <User size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                                <input
                                                    type="text" name="name" value={form.name} onChange={handleChange}
                                                    placeholder="Virat Kohli"
                                                    required={mode === 'signup'}
                                                    style={inputStyle}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div style={{ marginBottom: 16 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Email Address</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type="email" name="email" value={form.email} onChange={handleChange}
                                        placeholder="you@example.com"
                                        required
                                        style={inputStyle}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: error || success ? 16 : 24 }}>
                                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 }}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input
                                        type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                                        placeholder={mode === 'signup' ? 'Min 6 characters' : 'Your password'}
                                        required
                                        style={{ ...inputStyle, paddingRight: 48 }}
                                    />
                                    <button type="button" onClick={() => setShowPass(!showPass)}
                                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#475569' }}>
                                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {mode === 'login' && (
                                    <div style={{ textAlign: 'right', marginTop: 8 }}>
                                        <Link href="#" style={{ fontSize: 12, color: '#22c55e', fontWeight: 600, textDecoration: 'none' }}>Forgot password?</Link>
                                    </div>
                                )}
                            </div>

                            {/* Error / Success */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div key="error" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                                        <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: '#ef4444' }}>{error}</span>
                                    </motion.div>
                                )}
                                {success && (
                                    <motion.div key="success" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16 }}>
                                        <CheckCircle size={15} color="#22c55e" style={{ flexShrink: 0 }} />
                                        <span style={{ fontSize: 13, color: '#22c55e' }}>{success}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%', padding: '14px 20px', borderRadius: 12, border: 'none',
                                    background: loading ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    color: '#000', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    transition: 'all 0.3s ease', fontFamily: 'Inter, sans-serif',
                                    boxShadow: loading ? 'none' : '0 4px 24px rgba(34,197,94,0.4)',
                                }}
                                onMouseOver={e => { if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(34,197,94,0.6)'; }}
                                onMouseOut={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(34,197,94,0.4)'; }}
                            >
                                {loading ? (
                                    <><span style={{ width: 18, height: 18, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} /></>
                                ) : (
                                    <>{mode === 'login' ? 'Sign In to CricVerse' : 'Create My Account'} <ArrowRight size={18} /></>
                                )}
                            </button>
                        </form>

                        {/* Switch mode */}
                        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: '#64748b' }}>
                            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                            <button onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                                style={{ background: 'none', border: 'none', color: '#22c55e', fontWeight: 700, cursor: 'pointer', fontSize: 14, padding: 0 }}>
                                {mode === 'login' ? 'Sign up free' : 'Sign in'}
                            </button>
                        </p>
                    </motion.div>

                    {/* Footer note */}
                    <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#334155' }}>
                        By continuing, you agree to CricVerse&apos;s{' '}
                        <Link href="#" style={{ color: '#475569', textDecoration: 'underline' }}>Terms</Link>{' '}and{' '}
                        <Link href="#" style={{ color: '#475569', textDecoration: 'underline' }}>Privacy Policy</Link>
                    </p>
                </div>
            </main>

            <Footer />

            <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px rgba(15,22,41,0.98) inset !important;
          -webkit-text-fill-color: #f8fafc !important;
          caret-color: #f8fafc;
        }
      `}</style>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px 12px 42px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 12, color: '#f8fafc', fontSize: 15,
    outline: 'none', fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
};
