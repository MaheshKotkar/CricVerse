"use client";
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import {
    LogOut, Trophy, Activity, TrendingUp, User,
    LayoutDashboard, ChevronRight, Zap, Star, Target,
    Menu, X, Calendar, MapPin, Play, Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../../utils/api';

function PlayerDashboardContent() {
    const { user, logout } = useAuth();
    const [matches, setMatches] = useState<any[]>([]);
    const [loadingMatches, setLoadingMatches] = useState(true);

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const res = await api.get('/matches/upcoming');
                setMatches(res.data.data);
            } catch (err) {
                console.error("Failed to fetch matches:", err);
            } finally {
                setLoadingMatches(false);
            }
        };
        fetchMatches();
    }, []);

    const statCards = [
        { icon: Activity, label: 'Matches Played', value: '0', color: '#22c55e', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)', glow: 'rgba(34,197,94,0.3)' },
        { icon: TrendingUp, label: 'Batting Avg', value: '—', color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(59,130,246,0.3)' },
        { icon: Trophy, label: 'Tournaments', value: '0', color: '#f97316', gradient: 'linear-gradient(135deg,#f97316,#ea580c)', glow: 'rgba(249,115,22,0.3)' },
        { icon: Star, label: 'Player Rank', value: '#—', color: '#a855f7', gradient: 'linear-gradient(135deg,#a855f7,#7c3aed)', glow: 'rgba(168,85,247,0.3)' },
    ];

    const quickActions = [
        { emoji: '🏆', label: 'Join Tournament', sub: 'Browse & register for events', color: '#3b82f6', href: '/dashboard/player/tournaments' },
        { emoji: '👤', label: 'My Profile', sub: 'View & edit career stats', color: '#22c55e', href: '/dashboard/player/profile' },
        { emoji: '📊', label: 'Live Score', sub: 'Score in real-time', color: '#f97316', href: '/matches/live' },
        { emoji: '🎯', label: 'My Stats', sub: 'Detailed performance analytics', color: '#a855f7', href: '#' },
    ];

    return (
        <div className="pd-shell">
            {/* Top Navbar */}
            <nav className="pd-navbar">
                <div className="pd-navbar-inner">
                    <Link href="/" className="pd-brand">
                        <div className="pd-brand-icon"><Zap size={18} /></div>
                        <span className="pd-brand-text">CricVerse</span>
                    </Link>

                    <div className="pd-navbar-right">
                        <span className="pd-role-badge">Player</span>
                        <div className="pd-nav-user">
                            <div className="pd-nav-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                            <span className="pd-nav-name">{user?.name}</span>
                        </div>
                        <button onClick={logout} className="pd-logout-btn" title="Logout">
                            <LogOut size={17} />
                        </button>
                    </div>
                </div>
            </nav>

            <div className="pd-content">
                {/* Hero Banner */}
                <div className="pd-hero">
                    <div className="pd-hero-glow" />
                    <div className="pd-hero-inner">
                        <div>
                            <div className="pd-hero-tag">
                                <Target size={11} /> Player Persona
                            </div>
                            <h1 className="pd-hero-title">
                                Level up your game,{' '}
                                <span className="pd-hero-name">{user?.name?.split(' ')?.[0]}</span> 🔥
                            </h1>
                            <p className="pd-hero-sub">
                                Track your performance, join top leagues, and build your cricket legacy on CricVerse.
                            </p>
                            <div className="pd-hero-ctas">
                                <Link href="/dashboard/player/tournaments" className="pd-cta-primary">
                                    <Trophy size={16} /> Find Tournaments
                                </Link>
                                <Link href="/dashboard/player/profile" className="pd-cta-secondary">
                                    <User size={16} /> My Profile
                                </Link>
                            </div>
                        </div>
                        <div className="pd-hero-emoji">🏏</div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="pd-section">
                    <h2 className="pd-section-title">
                        <Activity size={20} color="#22c55e" /> Your Stats
                    </h2>
                    <div className="pd-stats-grid">
                        {statCards.map((s, i) => (
                            <div key={i} className="pd-stat-card" style={{ '--glow': s.glow } as any}>
                                <div className="pd-stat-icon" style={{ background: s.gradient }}>
                                    <s.icon size={20} color="#fff" />
                                </div>
                                <div className="pd-stat-value" style={{ color: s.color }}>{s.value}</div>
                                <div className="pd-stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="pd-section">
                    <h2 className="pd-section-title">
                        <LayoutDashboard size={20} color="#3b82f6" /> Quick Actions
                    </h2>
                    <div className="pd-actions-grid">
                        {quickActions.map((a, i) => (
                            <Link href={a.href} key={i} className="pd-action-card" style={{ '--color': a.color } as any}>
                                <div className="pd-action-icon" style={{ background: a.color + '15', border: `1px solid ${a.color}25` }}>
                                    {a.emoji}
                                </div>
                                <div className="pd-action-text">
                                    <div className="pd-action-label">{a.label}</div>
                                    <div className="pd-action-sub">{a.sub}</div>
                                </div>
                                <ChevronRight size={18} className="pd-action-arrow" color="#475569" />
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Upcoming Matches */}
                <div className="pd-section">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                        <h2 className="pd-section-title">
                            <Calendar size={20} color="#f97316" /> Upcoming Matches
                        </h2>
                        <Link href="/dashboard/player/tournaments" style={{ fontSize: 13, color: '#f97316', textDecoration: 'none', fontWeight: 700 }}>View all →</Link>
                    </div>

                    {loadingMatches ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                            <Loader2 className="animate-spin" size={32} color="#f97316" />
                        </div>
                    ) : matches.length === 0 ? (
                        <div className="pd-empty-card">
                            <div className="pd-empty-icon">🏏</div>
                            <h3 className="pd-empty-title">No matches scheduled yet</h3>
                            <p className="pd-empty-sub">
                                Keep an eye out. Once organizers schedule matches, they will appear here.
                            </p>
                            <Link href="/dashboard/player/tournaments" className="pd-cta-primary" style={{ display: 'inline-flex', marginTop: 24 }}>
                                <Trophy size={16} /> Browse Tournaments →
                            </Link>
                        </div>
                    ) : (
                        <div className="pd-matches-list">
                            {matches.map((m: any) => (
                                <div key={m._id} className="pd-match-card">
                                    <div className="pd-match-header">
                                        <div className="pd-match-tour">
                                            <Trophy size={14} color="#a855f7" />
                                            <span>{m.tournament?.name || 'Unknown Tournament'}</span>
                                        </div>
                                        <div className={`pd-match-status ${m.status === 'Live' ? 'live' : m.status === 'Completed' ? 'completed' : ''}`}>
                                            {m.status === 'Live' ? '● LIVE' : m.status === 'Completed' ? 'COMPLETED' : m.status}
                                        </div>
                                    </div>

                                    <div className="pd-match-teams">
                                        <div className="pd-team">
                                            <div className="pd-team-logo">
                                                {m.teamA?.logo ? (
                                                    <img src={m.teamA.logo.startsWith('http') ? m.teamA.logo : `http://localhost:5000${m.teamA.logo.startsWith('/') ? '' : '/'}${m.teamA.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                                                ) : (
                                                    '🛡️'
                                                )}
                                            </div>
                                            <div className="pd-team-name">{m.teamA?.name || 'Team A'}</div>
                                            {m.status === 'Completed' && (
                                                <div className="pd-team-score-container" style={{ marginTop: 6 }}>
                                                    {m.isSuperOver && (
                                                        <div className="pd-team-score-reg" style={{ fontSize: 13, color: '#475569', marginBottom: 2 }}>
                                                            Reg: {m.score?.inning1?.runs}/{m.score?.inning1?.wickets}
                                                        </div>
                                                    )}
                                                    <div className="pd-team-score-main" style={{ fontSize: 18, fontWeight: 900, color: m.result?.winningTeam?._id === m.teamA?._id ? '#22c55e' : '#475569' }}>
                                                        {m.isSuperOver
                                                            ? `${m.superOver?.inning1?.runs}/${m.superOver?.inning1?.wickets} (SO)`
                                                            : `${m.score?.inning1?.runs}/${m.score?.inning1?.wickets}`
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="pd-match-vs">VS</div>
                                        <div className="pd-team">
                                            <div className="pd-team-logo">
                                                {m.teamB?.logo ? (
                                                    <img src={m.teamB.logo.startsWith('http') ? m.teamB.logo : `http://localhost:5000${m.teamB.logo.startsWith('/') ? '' : '/'}${m.teamB.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '14px' }} />
                                                ) : (
                                                    '🛡️'
                                                )}
                                            </div>
                                            <div className="pd-team-name">{m.teamB?.name || 'Team B'}</div>
                                            {m.status === 'Completed' && (
                                                <div className="pd-team-score-container" style={{ marginTop: 6 }}>
                                                    {m.isSuperOver && (
                                                        <div className="pd-team-score-reg" style={{ fontSize: 13, color: '#475569', marginBottom: 2 }}>
                                                            Reg: {m.score?.inning2?.runs}/{m.score?.inning2?.wickets}
                                                        </div>
                                                    )}
                                                    <div className="pd-team-score-main" style={{ fontSize: 18, fontWeight: 900, color: m.result?.winningTeam?._id === m.teamB?._id ? '#22c55e' : '#475569' }}>
                                                        {m.isSuperOver
                                                            ? `${m.superOver?.inning2?.runs}/${m.superOver?.inning2?.wickets} (SO)`
                                                            : `${m.score?.inning2?.runs}/${m.score?.inning2?.wickets}`
                                                        }
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {m.status === 'Completed' && (
                                        <div className="pd-match-result" style={{ textAlign: 'center', background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.1)', padding: '10px', borderRadius: '12px', marginBottom: 20, color: '#facc15', fontSize: 13, fontWeight: 800 }}>
                                            🏆 Result: {m.result?.winningTeam?.name ? `${m.result.winningTeam.name} ${m.result.margin}` : m.result?.margin || 'Match Completed'}
                                            {m.isSuperOver && <span style={{ marginLeft: 8, fontSize: 9, background: '#ef4444', color: '#fff', padding: '1px 5px', borderRadius: 4, verticalAlign: 'middle' }}>SUPER OVER RESULT</span>}
                                        </div>
                                    )}

                                    <div className="pd-match-footer">
                                        <div className="pd-match-meta">
                                            <Calendar size={13} /> {new Date(m.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </div>
                                        {m.venue && (
                                            <div className="pd-match-meta">
                                                <MapPin size={13} /> {m.venue}
                                            </div>
                                        )}
                                        {m.status === 'Live' && (
                                            <Link href={`/matches/${m._id}/live`} className="pd-match-live-btn" style={{ textDecoration: 'none' }}>
                                                <Play size={12} fill="currentColor" /> Watch Score
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .pd-shell { min-height: 100vh; background: #080c18; color: #f8fafc; font-family: 'Inter', sans-serif; }

                /* ── Navbar ── */
                .pd-navbar {
                    position: sticky; top: 0; z-index: 100;
                    background: rgba(8,12,24,0.92); backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .pd-navbar-inner {
                    max-width: 1200px; margin: 0 auto; padding: 14px 16px;
                    display: flex; align-items: center; justify-content: space-between; gap: 12px;
                }
                .pd-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .pd-brand-icon {
                    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    display: flex; align-items: center; justify-content: center; color: #fff;
                    box-shadow: 0 4px 14px rgba(34,197,94,0.35);
                }
                .pd-brand-text { font-size: 18px; font-weight: 900; color: #f8fafc; letter-spacing: -0.02em; }

                .pd-navbar-right { display: flex; align-items: center; gap: 10px; }
                .pd-role-badge {
                    display: none; background: rgba(34,197,94,0.1); color: #22c55e;
                    font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 100px;
                    text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(34,197,94,0.2);
                }
                .pd-nav-user { display: none; align-items: center; gap: 8px; }
                .pd-nav-avatar {
                    width: 32px; height: 32px; border-radius: 10px;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; font-size: 13px; color: #fff; flex-shrink: 0;
                }
                .pd-nav-name { font-size: 13px; font-weight: 600; white-space: nowrap; }
                .pd-logout-btn {
                    display: flex; width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(239,68,68,0.2);
                    background: rgba(239,68,68,0.06); color: #ef4444; cursor: pointer; align-items: center; justify-content: center;
                    transition: all 0.15s; margin-left: auto;
                }
                .pd-logout-btn:hover { background: rgba(239,68,68,0.14); }
                .pd-menu-toggle {
                    width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.04); color: #94a3b8; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
                }
                .pd-mobile-menu {
                    padding: 16px; border-top: 1px solid rgba(255,255,255,0.05);
                    background: rgba(10,14,26,0.99); display: flex; flex-direction: column; gap: 14px;
                }
                .pd-mobile-user { display: flex; align-items: center; gap: 12px; }
                .pd-mobile-avatar {
                    width: 44px; height: 44px; border-radius: 12px;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; fontSize: 18px; color: #fff;
                }
                .pd-mobile-name { font-size: 15px; font-weight: 700; }
                .pd-mobile-email { font-size: 12px; color: #64748b; }
                .pd-mobile-logout {
                    display: flex; align-items: center; gap: 8px; color: #ef4444; background: rgba(239,68,68,0.06);
                    border: 1px solid rgba(239,68,68,0.15); padding: 10px 14px; border-radius: 10px;
                    font-weight: 700; font-size: 13px; cursor: pointer; width: fit-content; transition: all 0.15s;
                }

                /* ── Content ── */
                .pd-content { max-width: 1200px; margin: 0 auto; padding: 24px 16px 60px; display: flex; flex-direction: column; gap: 32px; }

                /* ── Hero ── */
                .pd-hero {
                    position: relative; overflow: hidden;
                    background: linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.05), rgba(8,12,24,0.5));
                    border: 1px solid rgba(34,197,94,0.15); border-radius: 24px; padding: 36px 28px;
                }
                .pd-hero-glow {
                    position: absolute; top: -60px; right: -60px; width: 200px; height: 200px;
                    border-radius: 50%; background: radial-gradient(circle, rgba(34,197,94,0.12), transparent 70%);
                    pointer-events: none;
                }
                .pd-hero-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; position: relative; z-index: 1; }
                .pd-hero-tag {
                    display: inline-flex; align-items: center; gap: 5px;
                    font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
                    color: #22c55e; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.2);
                    padding: 4px 12px; border-radius: 100px; margin-bottom: 12px;
                }
                .pd-hero-title { font-size: clamp(1.5rem, 5vw, 2.4rem); font-weight: 900; line-height: 1.15; margin-bottom: 10px; }
                .pd-hero-name { color: #22c55e; }
                .pd-hero-sub { color: #64748b; font-size: clamp(13px, 2.5vw, 15px); max-width: 480px; line-height: 1.6; margin-bottom: 24px; }
                .pd-hero-ctas { display: flex; gap: 10px; flex-wrap: wrap; }
                .pd-hero-emoji { font-size: clamp(3rem, 10vw, 5rem); flex-shrink: 0; line-height: 1; }
                .pd-cta-primary {
                    display: inline-flex; align-items: center; gap: 8px; padding: 11px 20px;
                    border-radius: 12px; background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff;
                    font-size: 13px; font-weight: 800; text-decoration: none; border: none; cursor: pointer;
                    transition: all 0.2s; box-shadow: 0 4px 18px rgba(34,197,94,0.35);
                }
                .pd-cta-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(34,197,94,0.5); }
                .pd-cta-secondary {
                    display: inline-flex; align-items: center; gap: 8px; padding: 11px 20px;
                    border-radius: 12px; background: rgba(255,255,255,0.05); color: #94a3b8;
                    font-size: 13px; font-weight: 700; text-decoration: none;
                    border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s;
                }
                .pd-cta-secondary:hover { background: rgba(255,255,255,0.09); color: #f8fafc; }

                /* ── Section ── */
                .pd-section { display: flex; flex-direction: column; gap: 16px; }
                .pd-section-title { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 800; }

                /* ── Stats ── */
                .pd-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
                .pd-stat-card {
                    background: linear-gradient(135deg, rgba(13,20,36,0.95), rgba(10,16,32,0.9));
                    border: 1px solid rgba(255,255,255,0.06); border-radius: 20px;
                    padding: 20px; display: flex; flex-direction: column; gap: 10px;
                    transition: all 0.2s;
                }
                .pd-stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px var(--glow); }
                .pd-stat-icon { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(0,0,0,0.3); }
                .pd-stat-value { font-size: 34px; font-weight: 900; line-height: 1; }
                .pd-stat-label { font-size: 11px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }

                /* ── Actions ── */
                .pd-actions-grid { display: grid; grid-template-columns: 1fr; gap: 10px; }
                .pd-action-card {
                    display: flex; align-items: center; gap: 14px; padding: 16px 18px;
                    background: linear-gradient(135deg, rgba(13,20,36,0.9), rgba(10,16,32,0.8));
                    border: 1px solid rgba(255,255,255,0.06); border-radius: 18px;
                    text-decoration: none; transition: all 0.2s;
                }
                .pd-action-card:hover { border-color: var(--color, #22c55e); transform: translateX(3px); background: rgba(255,255,255,0.03); }
                .pd-action-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
                .pd-action-text { flex: 1; min-width: 0; }
                .pd-action-label { font-size: 14px; font-weight: 700; color: #f8fafc; margin-bottom: 2px; }
                .pd-action-sub { font-size: 12px; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .pd-action-arrow { flex-shrink: 0; transition: transform 0.2s; }
                .pd-action-card:hover .pd-action-arrow { transform: translateX(4px); }

                /* ── Matches ── */
                .pd-matches-list { display: flex; flex-direction: column; gap: 14px; }
                .pd-match-card {
                    background: linear-gradient(135deg, rgba(13,20,36,0.9), rgba(10,16,32,0.8));
                    border: 1px solid rgba(255,255,255,0.06); border-radius: 20px;
                    padding: 20px; transition: all 0.2s;
                }
                .pd-match-card:hover { border-color: rgba(255,255,255,0.15); transform: translateY(-2px); }
                .pd-match-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px dashed rgba(255,255,255,0.08); }
                .pd-match-tour { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #e2e8f0; }
                .pd-match-status { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 100px; text-transform: uppercase; background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
                .pd-match-status.live { background: rgba(239,68,68,0.15); color: #ef4444; border-color: rgba(239,68,68,0.3); animation: pulse 2s infinite; }
                .pd-match-status.completed { background: rgba(34,197,94,0.1); color: #22c55e; border-color: rgba(34,197,94,0.2); }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
                .pd-match-teams { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 24px; }
                .pd-team { display: flex; flex-direction: column; align-items: center; gap: 10px; flex: 1; min-width: 0; }
                .pd-team-logo { width: 50px; height: 50px; border-radius: 14px; background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
                .pd-team-name { font-size: 15px; font-weight: 800; text-align: center; color: #f8fafc; line-height: 1.3; }
                .pd-match-vs { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; color: #64748b; flex-shrink: 0; }
                .pd-match-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; background: rgba(0,0,0,0.2); padding: 12px 16px; border-radius: 12px; }
                .pd-match-meta { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #94a3b8; font-weight: 600; }
                .pd-match-live-btn { display: flex; align-items: center; gap: 6px; background: #ef4444; color: #fff; border: none; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 800; cursor: pointer; transition: background 0.2s; }
                .pd-match-live-btn:hover { background: #dc2626; }

                /* ── Empty ── */
                .pd-empty-card {
                    background: rgba(249,115,22,0.02); border: 1px dashed rgba(249,115,22,0.15);
                    border-radius: 24px; padding: 40px 24px; text-align: center;
                }
                .pd-empty-icon { font-size: 40px; margin-bottom: 14px; }
                .pd-empty-title { font-size: 17px; font-weight: 800; margin-bottom: 8px; }
                .pd-empty-sub { color: #475569; font-size: 13.5px; max-width: 440px; margin: 0 auto; line-height: 1.6; }

                /* ── Responsive ── */
                @media (min-width: 480px) {
                    .pd-actions-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (min-width: 640px) {
                    .pd-stats-grid { grid-template-columns: repeat(4, 1fr); }
                    .pd-content { padding: 32px 24px 80px; }
                }
                @media (min-width: 768px) {
                    .pd-role-badge { display: inline-flex; }
                    .pd-nav-user { display: flex; }
                    .pd-logout-btn { margin-left: 0; }
                    .pd-actions-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (min-width: 1024px) {
                    .pd-content { padding: 40px 32px 80px; }
                    .pd-actions-grid { grid-template-columns: repeat(4, 1fr); }
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
