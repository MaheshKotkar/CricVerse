"use client";
import { useState, useEffect } from 'react';
import { Trophy, Plus, ArrowLeft, Loader2, ChevronRight, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';
import api from '../../../../utils/api';
import ProtectedRoute from '../../../../components/ProtectedRoute';

function TournamentList() {
    const [loading, setLoading] = useState(true);
    const [tournaments, setTournaments] = useState<any[]>([]);

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const res = await api.get('/tournaments');
                setTournaments(res.data.data);
            } catch (err) {
                console.error("Fetch Tournaments Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTournaments();
    }, []);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" color="#3b82f6" size={40} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc' }}>
            <div className="tlist-container">
                <Link href="/dashboard/organizer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#94a3b8', textDecoration: 'none', marginBottom: 28, fontSize: 14, fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                <div className="tlist-header">
                    <div>
                        <h1 className="tlist-title">My Tournaments</h1>
                        <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Manage all your cricket events and view their status.</p>
                    </div>
                    <Link href="/dashboard/organizer/tournaments/new" className="tlist-btn">
                        <Plus size={18} /> New Tournament
                    </Link>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {tournaments.length > 0 ? tournaments.map(t => (
                        <Link key={t._id} href={`/dashboard/organizer/tournaments/${t._id}`} style={{ textDecoration: 'none' }}>
                            <div className="tlist-card"
                                onMouseOver={e => (e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)')}
                                onMouseOut={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                            >
                                <div className="tlist-icon-wrap">
                                    <Trophy size={24} color="#3b82f6" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc', margin: 0 }}>{t.name}</h3>
                                        <span style={{
                                            fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase',
                                            background: t.status === 'Active' ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)',
                                            color: t.status === 'Active' ? '#22c55e' : '#94a3b8',
                                            border: `1px solid ${t.status === 'Active' ? 'rgba(34,197,94,0.2)' : 'rgba(148,163,184,0.2)'}`,
                                            flexShrink: 0
                                        }}>{t.status}</span>
                                    </div>
                                    <div className="tlist-meta">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={13} /> {new Date(t.startDate).toLocaleDateString()}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} /> {t.venue || 'No Venue'}</div>
                                        <div>🛡️ {t.teams?.length || 0} Teams</div>
                                    </div>
                                </div>
                                <ChevronRight color="#475569" size={20} style={{ flexShrink: 0 }} />
                            </div>
                        </Link>
                    )) : (
                        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(15,22,41,0.4)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.08)' }}>
                            <Trophy size={48} color="#1e293b" style={{ marginBottom: 16 }} />
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No Tournaments Found</h3>
                            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>You haven't created any tournaments yet.</p>
                            <Link href="/dashboard/organizer/tournaments/new" style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: 700 }}>
                                Create your first tournament →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .tlist-container { max-width: 1000px; margin: 0 auto; padding: 24px 16px; }
                .tlist-header { display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
                .tlist-title { font-size: clamp(1.4rem, 5vw, 1.75rem); font-weight: 900; margin: 0 0 4px 0; }
                .tlist-btn {
                    text-decoration: none;
                    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
                    color: #fff; padding: 12px 20px; border-radius: 12px; font-weight: 700;
                    display: inline-flex; align-items: center; gap: 8px; font-size: 14px;
                    box-shadow: 0 4px 12px rgba(59,130,246,0.3); align-self: flex-start;
                }
                .tlist-card {
                    background: rgba(15,22,41,0.6); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 18px; padding: 18px 16px;
                    display: flex; align-items: center; gap: 14px;
                    transition: all 0.2s ease; cursor: pointer;
                }
                .tlist-icon-wrap {
                    width: 48px; height: 48px; border-radius: 12px;
                    background: rgba(59,130,246,0.08); display: flex;
                    align-items: center; justify-content: center; flex-shrink: 0;
                }
                .tlist-meta { display: flex; flex-wrap: wrap; gap: 10px 16px; color: #64748b; font-size: 12px; }
                @media (min-width: 640px) {
                    .tlist-container { padding: 40px 24px; }
                    .tlist-header { flex-direction: row; justify-content: space-between; align-items: flex-start; }
                    .tlist-card { padding: 20px 24px; gap: 20px; }
                    .tlist-icon-wrap { width: 56px; height: 56px; }
                    .tlist-meta { font-size: 13px; }
                }
            `}</style>
        </div>
    );
}

export default function TournamentListPage() {
    return (
        <ProtectedRoute allowedRoles={['organizer']}>
            <TournamentList />
        </ProtectedRoute>
    );
}
