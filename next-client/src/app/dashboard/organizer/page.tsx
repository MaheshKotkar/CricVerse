"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import {
    Trophy, Users, Activity, TrendingUp,
    PlusSquare, Settings, LogOut, ChevronRight,
    Calendar, Loader2, Zap, BarChart3, Menu, X, Star
} from 'lucide-react';
import api from '../../../utils/api';
import ProtectedRoute from '../../../components/ProtectedRoute';

function OrganizerDashboardContent() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ tournaments: 0, teams: 0, activeMatches: 0, players: 0 });
    const [recentTournaments, setRecentTournaments] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, tourRes] = await Promise.all([
                    api.get('/tournaments/stats'),
                    api.get('/tournaments?limit=5'),
                ]);
                setStats(statsRes.data.data);
                setRecentTournaments(tourRes.data.data);
            } catch (err) {
                console.error('Dashboard Fetch Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const statCards = [
        { icon: Trophy, label: 'Tournaments', value: stats.tournaments, color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', glow: 'rgba(59,130,246,0.3)', trend: 'Total created' },
        { icon: Users, label: 'Total Teams', value: stats.teams, color: '#22c55e', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)', glow: 'rgba(34,197,94,0.3)', trend: 'Registered' },
        { icon: Activity, label: 'Active Matches', value: stats.activeMatches, color: '#ef4444', gradient: 'linear-gradient(135deg,#ef4444,#dc2626)', glow: 'rgba(239,68,68,0.3)', trend: 'Live now' },
        { icon: TrendingUp, label: 'Total Players', value: stats.players, color: '#a855f7', gradient: 'linear-gradient(135deg,#a855f7,#7c3aed)', glow: 'rgba(168,85,247,0.3)', trend: 'Across all teams' },
    ];

    const quickActions = [
        { href: '/dashboard/organizer/tournaments/new', icon: PlusSquare, label: 'Create Tournament', desc: 'Launch a new league or cup', color: '#3b82f6' },
        { href: '/dashboard/organizer/teams/new', icon: Users, label: 'Register Team', desc: 'Add a new team to the database', color: '#22c55e' },
        { href: '/dashboard/organizer/teams', icon: Settings, label: 'Manage Teams', desc: 'View and edit existing squads', color: '#f97316' },
        { href: '/dashboard/organizer/tournaments', icon: BarChart3, label: 'View Tournaments', desc: 'Monitor all your live tournaments', color: '#a855f7' },
    ];

    return (
        <div className="od-shell">
            {/* Top Navbar */}
            <nav className="od-navbar">
                <div className="od-navbar-inner">
                    <Link href="/" className="od-brand">
                        <div className="od-brand-icon"><Zap size={18} /></div>
                        <span className="od-brand-text">CricVerse</span>
                    </Link>

                    <div className="od-navbar-right">
                        <span className="od-role-badge">Organizer</span>
                        <div className="od-nav-user">
                            <div className="od-nav-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                            <span className="od-nav-name">{user?.name}</span>
                        </div>
                        <button onClick={logout} className="od-logout-btn" title="Logout">
                            <LogOut size={17} />
                        </button>
                    </div>
                </div>
            </nav>

            {loading ? (
                <div className="od-loader">
                    <Loader2 size={44} color="#3b82f6" className="animate-spin" />
                    <p>Loading your dashboard...</p>
                </div>
            ) : (
                <div className="od-content">
                    {/* Hero Banner */}
                    <div className="od-hero">
                        <div className="od-hero-glow" />
                        <div className="od-hero-inner">
                            <div>
                                <div className="od-hero-tag">
                                    <Star size={11} /> Organizer Command Center
                                </div>
                                <h1 className="od-hero-title">
                                    Welcome back, <span className="od-hero-name">{user?.name?.split(' ')?.[0]}</span> 👋
                                </h1>
                                <p className="od-hero-sub">
                                    Manage your tournaments, teams, and players — all in one premium workspace.
                                </p>
                            </div>
                            <div className="od-hero-emoji">🏆</div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="od-section">
                        <h2 className="od-section-title"><Activity size={20} color="#3b82f6" /> Overview Stats</h2>
                        <div className="od-stats-grid">
                            {statCards.map((s, i) => (
                                <div key={i} className="od-stat-card" style={{ '--glow': s.glow } as any}>
                                    <div className="od-stat-top">
                                        <div className="od-stat-icon" style={{ background: s.gradient }}>
                                            <s.icon size={20} color="#fff" />
                                        </div>
                                        <span className="od-stat-trend">{s.trend}</span>
                                    </div>
                                    <div className="od-stat-value" style={{ color: s.color }}>{s.value}</div>
                                    <div className="od-stat-label">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Grid */}
                    <div className="od-main-grid">
                        {/* Recent Tournaments */}
                        <div className="od-card">
                            <div className="od-card-header">
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Trophy size={18} color="#3b82f6" />
                                    <span>Recent Tournaments</span>
                                </div>
                                <Link href="/dashboard/organizer/tournaments" className="od-view-all">View all →</Link>
                            </div>

                            {recentTournaments.length === 0 ? (
                                <div className="od-empty">
                                    <Trophy size={40} color="#1e293b" style={{ margin: '0 auto 12px' }} />
                                    <p className="od-empty-text">No tournaments yet.</p>
                                    <Link href="/dashboard/organizer/tournaments/new" className="od-empty-link">
                                        Create your first →
                                    </Link>
                                </div>
                            ) : (
                                <div className="od-tour-list">
                                    {recentTournaments.map((t) => (
                                        <Link href={`/dashboard/organizer/tournaments/${t._id}`} key={t._id} className="od-tour-item">
                                            <div className="od-tour-icon">🏆</div>
                                            <div className="od-tour-info">
                                                <div className="od-tour-name">{t.name}</div>
                                                <div className="od-tour-meta">
                                                    <span>{t.format}</span>
                                                    <span className="od-dot">•</span>
                                                    <Calendar size={11} />
                                                    <span>{new Date(t.startDate).toLocaleDateString()}</span>
                                                    <span className="od-dot">•</span>
                                                    <span>{t.teams?.length || 0} teams</span>
                                                </div>
                                            </div>
                                            <div className="od-tour-right">
                                                <span className={`od-status-badge ${t.status === 'Active' ? 'active' : t.status === 'Completed' ? 'done' : 'draft'}`}>
                                                    {t.status}
                                                </span>
                                                <ChevronRight size={16} color="#334155" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quick Actions */}
                        <div className="od-section">
                            <h2 className="od-section-title"><PlusSquare size={20} color="#22c55e" /> Quick Actions</h2>
                            <div className="od-quick-actions">
                                {quickActions.map((a, i) => (
                                    <Link key={i} href={a.href} className="od-action-card" style={{ '--color': a.color } as any}>
                                        <div className="od-action-icon" style={{ background: a.color + '12', border: `1px solid ${a.color}22` }}>
                                            <a.icon size={20} color={a.color} />
                                        </div>
                                        <div className="od-action-text">
                                            <div className="od-action-label">{a.label}</div>
                                            <div className="od-action-sub">{a.desc}</div>
                                        </div>
                                        <ChevronRight size={16} color="#334155" className="od-action-arrow" />
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .od-shell { min-height: 100vh; background: #080c18; color: #f8fafc; font-family: 'Inter', sans-serif; }

                /* ── Navbar ── */
                .od-navbar {
                    position: sticky; top: 0; z-index: 100;
                    background: rgba(8,12,24,0.92); backdrop-filter: blur(20px);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .od-navbar-inner {
                    max-width: 1280px; margin: 0 auto; padding: 14px 16px;
                    display: flex; align-items: center; justify-content: space-between; gap: 12px;
                }
                .od-brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
                .od-brand-icon {
                    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
                    background: linear-gradient(135deg, #3b82f6, #6366f1);
                    display: flex; align-items: center; justify-content: center; color: #fff;
                    box-shadow: 0 4px 14px rgba(59,130,246,0.35);
                }
                .od-brand-text { font-size: 18px; font-weight: 900; color: #f8fafc; letter-spacing: -0.02em; }

                .od-navbar-right { display: flex; align-items: center; gap: 10px; }
                .od-role-badge {
                    display: none; background: rgba(59,130,246,0.1); color: #60a5fa;
                    font-size: 10px; font-weight: 800; padding: 4px 12px; border-radius: 100px;
                    text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid rgba(59,130,246,0.2);
                }
                .od-nav-user { display: none; align-items: center; gap: 8px; }
                .od-nav-avatar {
                    width: 32px; height: 32px; border-radius: 10px;
                    background: linear-gradient(135deg, #3b82f6, #6366f1);
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; font-size: 13px; color: #fff; flex-shrink: 0;
                }
                .od-nav-name { font-size: 13px; font-weight: 600; white-space: nowrap; }
                .od-logout-btn {
                    display: flex; width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(239,68,68,0.2);
                    background: rgba(239,68,68,0.06); color: #ef4444; cursor: pointer; align-items: center; justify-content: center;
                    transition: all 0.15s; margin-left: auto;
                }
                .od-logout-btn:hover { background: rgba(239,68,68,0.14); }
                .od-menu-toggle {
                    width: 36px; height: 36px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.04); color: #94a3b8; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                }
                .od-mobile-menu {
                    padding: 16px; border-top: 1px solid rgba(255,255,255,0.05);
                    background: rgba(10,14,26,0.99); display: flex; flex-direction: column; gap: 14px;
                }
                .od-mobile-user { display: flex; align-items: center; gap: 12px; }
                .od-mobile-avatar {
                    width: 44px; height: 44px; border-radius: 12px;
                    background: linear-gradient(135deg, #3b82f6, #6366f1);
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; font-size: 18px; color: #fff;
                }
                .od-mobile-name { font-size: 15px; font-weight: 700; }
                .od-mobile-email { font-size: 12px; color: #64748b; }
                .od-mobile-logout {
                    display: flex; align-items: center; gap: 8px; color: #ef4444; background: rgba(239,68,68,0.06);
                    border: 1px solid rgba(239,68,68,0.15); padding: 10px 14px; border-radius: 10px;
                    font-weight: 700; font-size: 13px; cursor: pointer; width: fit-content;
                }

                /* ── Loader ── */
                .od-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; gap: 16px; }
                .od-loader p { color: #475569; font-size: 14px; }

                /* ── Content ── */
                .od-content { max-width: 1280px; margin: 0 auto; padding: 24px 16px 60px; display: flex; flex-direction: column; gap: 32px; }

                /* ── Hero ── */
                .od-hero {
                    position: relative; overflow: hidden;
                    background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(99,102,241,0.05), rgba(8,12,24,0.5));
                    border: 1px solid rgba(59,130,246,0.15); border-radius: 24px; padding: 36px 28px;
                }
                .od-hero-glow {
                    position: absolute; top: -60px; right: -60px; width: 220px; height: 220px;
                    border-radius: 50%; background: radial-gradient(circle, rgba(59,130,246,0.12), transparent 70%);
                    pointer-events: none;
                }
                .od-hero-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; position: relative; z-index: 1; }
                .od-hero-tag {
                    display: inline-flex; align-items: center; gap: 5px;
                    font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
                    color: #60a5fa; background: rgba(59,130,246,0.1); border: 1px solid rgba(59,130,246,0.2);
                    padding: 4px 12px; border-radius: 100px; margin-bottom: 12px;
                }
                .od-hero-title { font-size: clamp(1.5rem, 5vw, 2.4rem); font-weight: 900; line-height: 1.15; margin-bottom: 10px; }
                .od-hero-name { color: #60a5fa; }
                .od-hero-sub { color: #64748b; font-size: clamp(13px, 2.5vw, 15px); max-width: 480px; line-height: 1.6; }
                .od-hero-emoji { font-size: clamp(3rem, 10vw, 5rem); flex-shrink: 0; line-height: 1; }

                /* ── Section ── */
                .od-section { display: flex; flex-direction: column; gap: 14px; }
                .od-section-title { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 800; }

                /* ── Stats ── */
                .od-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
                .od-stat-card {
                    background: linear-gradient(135deg, rgba(13,20,36,0.95), rgba(10,16,32,0.9));
                    border: 1px solid rgba(255,255,255,0.06); border-radius: 20px;
                    padding: 20px; display: flex; flex-direction: column; gap: 10px; transition: all 0.2s;
                }
                .od-stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 40px var(--glow); }
                .od-stat-top { display: flex; align-items: flex-start; justify-content: space-between; }
                .od-stat-icon { width: 46px; height: 46px; border-radius: 13px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(0,0,0,0.3); }
                .od-stat-trend { font-size: 10px; color: #475569; font-weight: 600; text-align: right; white-space: nowrap; }
                .od-stat-value { font-size: 34px; font-weight: 900; line-height: 1; }
                .od-stat-label { font-size: 11px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }

                /* ── Main Grid ── */
                .od-main-grid { display: grid; grid-template-columns: 1fr; gap: 28px; }

                /* ── Card ── */
                .od-card {
                    background: linear-gradient(135deg, rgba(13,20,36,0.95), rgba(10,16,32,0.9));
                    border: 1px solid rgba(255,255,255,0.06); border-radius: 22px; padding: 24px; overflow: hidden;
                }
                .od-card-header {
                    display: flex; align-items: center; justify-content: space-between; gap: 12px;
                    font-size: 15px; font-weight: 800; margin-bottom: 20px; padding-bottom: 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.05); flex-wrap: wrap;
                }
                .od-view-all { font-size: 13px; color: #3b82f6; text-decoration: none; font-weight: 700; flex-shrink: 0; }
                .od-view-all:hover { color: #60a5fa; }

                /* ── Tour List ── */
                .od-tour-list { display: flex; flex-direction: column; gap: 8px; }
                .od-tour-item {
                    display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 14px;
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
                    text-decoration: none; color: inherit; transition: all 0.2s;
                }
                .od-tour-item:hover { background: rgba(255,255,255,0.04); border-color: rgba(59,130,246,0.2); transform: translateX(3px); }
                .od-tour-icon { font-size: 18px; flex-shrink: 0; }
                .od-tour-info { flex: 1; min-width: 0; }
                .od-tour-name { font-size: 14px; font-weight: 700; color: #f8fafc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 4px; }
                .od-tour-meta { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #475569; font-weight: 600; flex-wrap: wrap; }
                .od-dot { opacity: 0.4; }
                .od-tour-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
                .od-status-badge { font-size: 10px; font-weight: 800; padding: 3px 9px; border-radius: 100px; text-transform: uppercase; }
                .od-status-badge.active { background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
                .od-status-badge.draft { background: rgba(100,116,139,0.1); color: #64748b; border: 1px solid rgba(100,116,139,0.15); }
                .od-status-badge.done { background: rgba(99,102,241,0.1); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.2); }

                /* ── Empty ── */
                .od-empty { text-align: center; padding: 32px 16px; }
                .od-empty-text { color: #475569; font-size: 14px; margin-bottom: 10px; }
                .od-empty-link { color: #3b82f6; font-weight: 700; text-decoration: none; font-size: 14px; }

                /* ── Quick Actions ── */
                .od-quick-actions { display: flex; flex-direction: column; gap: 10px; }
                .od-action-card {
                    display: flex; align-items: center; gap: 14px; padding: 15px 16px;
                    background: linear-gradient(135deg, rgba(13,20,36,0.9), rgba(10,16,32,0.8));
                    border: 1px solid rgba(255,255,255,0.06); border-radius: 16px;
                    text-decoration: none; transition: all 0.2s;
                }
                .od-action-card:hover { border-color: var(--color, #3b82f6); transform: translateX(3px); }
                .od-action-icon { width: 42px; height: 42px; border-radius: 11px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .od-action-text { flex: 1; min-width: 0; }
                .od-action-label { font-size: 13.5px; font-weight: 700; color: #f8fafc; margin-bottom: 2px; }
                .od-action-sub { font-size: 11.5px; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .od-action-arrow { transition: transform 0.2s; }
                .od-action-card:hover .od-action-arrow { transform: translateX(4px); }

                /* ── Responsive ── */
                @media (min-width: 640px) {
                    .od-stats-grid { grid-template-columns: repeat(4, 1fr); }
                    .od-content { padding: 32px 24px 80px; }
                    .od-card { padding: 28px; }
                }
                @media (min-width: 768px) {
                    .od-role-badge { display: inline-flex; }
                    .od-nav-user { display: flex; }
                    .od-logout-btn { margin-left: 0; }
                }
                @media (min-width: 1024px) {
                    .od-main-grid { grid-template-columns: 2fr 1fr; }
                    .od-content { padding: 40px 32px 80px; }
                }
            `}</style>
        </div>
    );
}

export default function OrganizerDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerDashboardContent />
        </ProtectedRoute>
    );
}
