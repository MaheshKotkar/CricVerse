"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import {
    Trophy, Users, Activity, TrendingUp,
    PlusSquare, Settings, LogOut, ChevronRight, Calendar, Bell, Loader2
} from 'lucide-react';
import api from '../../../utils/api';
import ProtectedRoute from '../../../components/ProtectedRoute';

function OrganizerDashboard() {
    const { user, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ tournaments: 0, teams: 0, activeMatches: 0, players: 0 });
    const [recentTournaments, setRecentTournaments] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, tourRes] = await Promise.all([
                    api.get('/tournaments/stats'),
                    api.get('/tournaments?limit=5')
                ]);
                setStats(statsRes.data.data);
                setRecentTournaments(tourRes.data.data);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" color="#3b82f6" size={40} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
            <main className="dash-main">
                <header className="dash-header">
                    <div>
                        <h1 className="dash-title">Dashboard</h1>
                        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>Welcome back, {user?.name} 👋</p>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                        <button style={iconButtonStyle}><Bell size={20} /></button>
                        <button onClick={logout} style={{ ...iconButtonStyle, color: '#ef4444' }}><LogOut size={20} /></button>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <StatCard icon={<Trophy color="#3b82f6" />} label="Tournaments" value={stats.tournaments} trend="+2 this month" />
                    <StatCard icon={<Users color="#22c55e" />} label="Total Teams" value={stats.teams} trend="+4 new" />
                    <StatCard icon={<Activity color="#ef4444" />} label="Active Matches" value={stats.activeMatches} trend="Live now" />
                    <StatCard icon={<TrendingUp color="#a855f7" />} label="Total Players" value={stats.players} trend="Across all leagues" />
                </div>

                <div className="dash-grid">
                    {/* Recent Tournaments */}
                    <div className="dash-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Recent Tournaments</h2>
                            <Link href="/dashboard/organizer/tournaments" style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>View all</Link>
                        </div>

                        {recentTournaments.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                                <Trophy size={40} color="#1e293b" style={{ marginBottom: 12 }} />
                                <p style={{ color: '#475569', fontSize: 14 }}>No tournaments yet.</p>
                                <Link href="/dashboard/organizer/tournaments/new" style={{ color: '#3b82f6', fontWeight: 700, textDecoration: 'none', fontSize: 14 }}>
                                    Create your first →
                                </Link>
                            </div>
                        ) : (
                            <div className="dash-tour-list">
                                {recentTournaments.map((t) => (
                                    <Link href={`/dashboard/organizer/tournaments/${t._id}`} key={t._id} className="dash-tour-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 800, fontSize: 15, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#f8fafc' }}>{t.name}</div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, fontSize: 12, color: '#64748b', alignItems: 'center' }}>
                                                <span style={{ fontWeight: 600, color: '#94a3b8' }}>{t.format}</span>
                                                <span style={{ opacity: 0.5 }}>•</span>
                                                <span>{new Date(t.startDate).toLocaleDateString()}</span>
                                                <span style={{ opacity: 0.5 }}>•</span>
                                                <span>{t.teams?.length || 0} teams</span>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
                                            <span style={{
                                                fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 6, textTransform: 'uppercase',
                                                background: t.status === 'Active' ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)',
                                                color: t.status === 'Active' ? '#22c55e' : '#94a3b8'
                                            }}>{t.status}</span>
                                            <ChevronRight size={18} color="#475569" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>Quick Actions</h2>
                        <ActionCard href="/dashboard/organizer/tournaments/new" icon={<PlusSquare color="#3b82f6" />} title="Create Tournament" desc="Launch a new league or cup" />
                        <ActionCard href="/dashboard/organizer/teams/new" icon={<Users color="#22c55e" />} title="Register Team" desc="Add a new team to the database" />
                        <ActionCard href="/dashboard/organizer/teams" icon={<Settings color="#64748b" />} title="Manage Teams" desc="View and edit existing squads" />
                    </div>
                </div>
            </main>

            <style>{`
                .dash-main { padding: 20px 16px; max-width: 1200px; margin: 0 auto; }
                .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; gap: 16px; flex-wrap: wrap; }
                .dash-title { font-size: clamp(1.4rem, 5vw, 2rem); font-weight: 900; margin: 0 0 4px 0; }
                .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-bottom: 32px; }
                .dash-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
                @media (min-width: 640px) {
                    .dash-main { padding: 32px 24px; }
                    .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 20px; }
                }
                @media (min-width: 1024px) {
                    .dash-grid { grid-template-columns: 2fr 1fr; }
                }
                .dash-card { background: rgba(15,22,41,0.6); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 20px; }
                .dash-tour-list { display: flex; flex-direction: column; gap: 10px; }
                .dash-tour-item {
                    display: flex; align-items: center; justify-content: space-between; gap: 12px;
                    padding: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04); 
                    border-radius: 16px; transition: all 0.2s; cursor: pointer;
                }
                .dash-tour-item:hover { transform: translateY(-2px); background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.1); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                @media (min-width: 640px) {
                    .dash-card { padding: 32px; }
                }
            `}</style>
        </div>
    );
}

function StatCard({ icon, label, value, trend }: any) {
    return (
        <div style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
                <span style={{ fontSize: 10, color: trend.includes('+') ? '#22c55e' : '#64748b', fontWeight: 600, textAlign: 'right' }}>{trend}</span>
            </div>
            <div style={{ fontSize: 'clamp(1.4rem, 5vw, 1.75rem)', fontWeight: 800, marginBottom: 4 }}>{value}</div>
            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{label}</div>
        </div>
    );
}

function ActionCard({ href, icon, title, desc }: any) {
    return (
        <Link href={href} style={{ textDecoration: 'none' }}>
            <div style={{
                background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 18, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer'
            }}
                onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: 14 }}>{title}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{desc}</div>
                </div>
                <ChevronRight size={16} color="#475569" style={{ flexShrink: 0 }} />
            </div>
        </Link>
    );
}

const iconButtonStyle: React.CSSProperties = {
    width: 42, height: 42, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)',
    background: 'rgba(255,255,255,0.03)', color: '#94a3b8', display: 'flex', alignItems: 'center',
    justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
};

export default function OrganizerDashboardPage() {
    return (
        <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerDashboard />
        </ProtectedRoute>
    );
}
