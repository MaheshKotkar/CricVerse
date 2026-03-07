"use client";
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import { LogOut, Trophy, Activity, TrendingUp, User, Menu, X, Bell } from 'lucide-react';
import { useState } from 'react';

const stats = [
    { icon: <Activity size={22} />, label: 'Matches Played', value: '0', color: '#22c55e' },
    { icon: <TrendingUp size={22} />, label: 'Batting Avg', value: '—', color: '#3b82f6' },
    { icon: <Trophy size={22} />, label: 'Tournaments', value: '0', color: '#f97316' },
    { icon: <User size={22} />, label: 'Rank', value: '#—', color: '#a3e635' },
];

const quickActions = [
    { icon: '👥', label: 'Create Team', sub: 'Build your squad', color: '#22c55e', href: '/dashboard/organizer/teams/new' },
    { icon: '🏆', label: 'Join Tournament', sub: 'Find an event', color: '#3b82f6', href: '/dashboard/player/tournaments' },
    { icon: '📊', label: 'Live Score', sub: 'Score in real-time', color: '#f97316', href: '#' },
    { icon: '👤', label: 'My Profile', sub: 'View & edit stats', color: '#a3e635', href: '/dashboard/player/profile' },
];

function PlayerDashboardContent() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', fontFamily: 'Inter, sans-serif', color: '#f8fafc' }}>
            {/* Navbar */}
            <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏏</div>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>CricVerse</span>
                    </Link>

                    {/* Desktop nav */}
                    <div className="player-desktop-nav">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(34,197,94,0.2)' }}>
                                Player
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#000' }}>
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 600 }}>{user?.name}</span>
                            </div>
                            <button onClick={logout} title="Logout" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex' }}><LogOut size={18} /></button>
                        </div>
                    </div>

                    {/* Mobile toggle */}
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="player-mobile-toggle">
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile menu dropdown */}
                {isMenuOpen && (
                    <div style={{ background: 'rgba(15,22,41,0.98)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#000', fontSize: 16 }}>{user?.name?.[0]?.toUpperCase()}</div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700 }}>{user?.name}</div>
                                <div style={{ fontSize: 12, color: '#64748b' }}>{user?.email}</div>
                            </div>
                        </div>
                        <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ef4444', background: 'none', border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                )}
            </nav>

            <div className="player-main">
                {/* Welcome Banner */}
                <div className="player-banner">
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Player Persona</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', fontWeight: 900, marginBottom: 8, lineHeight: 1.2 }}>
                            Level up your game, <span style={{ color: '#22c55e' }}>{user?.name?.split(' ')?.[0]}</span>
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: 14, maxWidth: 500, margin: 0 }}>Track your performance, join top leagues, and build your cricket legacy on CricVerse.</p>
                    </div>
                    <div style={{ fontSize: 'clamp(2.5rem, 10vw, 4.5rem)', flexShrink: 0 }}>🔥</div>
                </div>

                {/* Stats Grid */}
                <div className="player-stats-grid">
                    {stats.map((s, i) => (
                        <div key={i} style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 18, padding: '18px', textAlign: 'center' }}>
                            <div style={{ color: s.color, marginBottom: 10, display: 'flex', justifyContent: 'center' }}>{s.icon}</div>
                            <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16 }}>Quick Actions</h2>
                <div className="player-actions-grid">
                    {quickActions.map((a, i) => (
                        <Link href={a.href} key={i} style={{ textDecoration: 'none' }}>
                            <div className="player-action-card"
                                style={{ borderColor: 'rgba(255,255,255,0.06)' } as any}
                                onMouseOver={e => (e.currentTarget.style.borderColor = a.color + '40')}
                                onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
                            >
                                <div style={{ width: 42, height: 42, borderRadius: 12, background: `${a.color}15`, border: `1px solid ${a.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                                    {a.icon}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#f8fafc', marginBottom: 2 }}>{a.label}</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>{a.sub}</div>
                                </div>
                                <span style={{ color: '#475569', flexShrink: 0 }}>›</span>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Notice Card */}
                <div style={{ background: 'rgba(34,197,94,0.03)', border: '1px dashed rgba(34,197,94,0.15)', borderRadius: 22, padding: '28px', textAlign: 'center' }}>
                    <div style={{ fontSize: 28, marginBottom: 10 }}>📈</div>
                    <h3 style={{ fontWeight: 800, fontSize: 15, marginBottom: 8 }}>Earning Stats</h3>
                    <p style={{ color: '#64748b', fontSize: 13, marginBottom: 18 }}>Your match statistics will appear here automatically once you start playing in any tournament.</p>
                    <Link href="/dashboard/player/tournaments" style={{ color: '#22c55e', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>Find Tournaments →</Link>
                </div>
            </div>

            <style>{`
                .player-desktop-nav { display: none; }
                .player-mobile-toggle { display: flex; align-items: center; justify-content: center; border: none; background: none; color: #94a3b8; cursor: pointer; }
                .player-main { max-width: 1200px; margin: 0 auto; padding: 20px 16px; display: flex; flex-direction: column; gap: 28px; }
                .player-banner {
                    background: linear-gradient(135deg, rgba(34,197,94,0.1), rgba(59,130,246,0.05));
                    border: 1px solid rgba(34,197,94,0.15); border-radius: 22px; padding: 24px;
                    display: flex; align-items: center; justify-content: space-between; gap: 20;
                }
                .player-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
                .player-actions-grid { display: grid; grid-template-columns: 1fr; gap: 12px; margin-bottom: 0; }
                .player-action-card {
                    background: rgba(15,22,41,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 18px; padding: 16px 18px;
                    display: flex; align-items: center; gap: 14px; cursor: pointer; transition: all 0.2s;
                }
                @media (min-width: 480px) {
                    .player-actions-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (min-width: 640px) {
                    .player-main { padding: 32px 24px; }
                    .player-stats-grid { grid-template-columns: repeat(4, 1fr); }
                }
                @media (min-width: 768px) {
                    .player-desktop-nav { display: flex; }
                    .player-mobile-toggle { display: none; }
                }
            `}</style>
        </div>
    );
}

export default function PlayerDashboard() {
    return (
        <ProtectedRoute allowedRoles={['player']}>
            <PlayerDashboardContent />
        </ProtectedRoute>
    );
}
