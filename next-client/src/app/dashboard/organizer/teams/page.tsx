"use client";
import { useState, useEffect } from 'react';
import { Users, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '../../../../utils/api';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { getImageUrl } from '../../../../utils/imageUrl';

function TeamList() {
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<any[]>([]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await api.get('/teams');
                setTeams(res.data.data);
            } catch (err) {
                console.error("Fetch Teams Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" color="#22c55e" size={40} />
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc' }}>
            <div className="teams-container">
                <Link href="/dashboard/organizer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#94a3b8', textDecoration: 'none', marginBottom: 28, fontSize: 14, fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                <div className="teams-header">
                    <div>
                        <h1 className="teams-title">Manage Teams</h1>
                        <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Create and manage squads for your tournaments.</p>
                    </div>
                    <Link href="/dashboard/organizer/teams/new" className="teams-btn">
                        <Plus size={18} /> Register Team
                    </Link>
                </div>

                <div className="teams-grid">
                    {teams.length > 0 ? teams.map(team => (
                        <div key={team._id} style={{
                            background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 22, padding: '22px', display: 'flex', flexDirection: 'column', gap: 14
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 14,
                                    background: 'rgba(34,197,94,0.1)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 22, flexShrink: 0,
                                    overflow: 'hidden'
                                }}>
                                    {team.logo ? (
                                        <img
                                            src={getImageUrl(team.logo)}
                                            alt={team.name}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        '🛡️'
                                    )}
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <h3 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</h3>
                                    <div style={{ fontSize: 13, color: '#22c55e', fontWeight: 600 }}>{team.players?.length || 0} Players</div>
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14 }}>
                                <div style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Key Players</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                    {team.players?.slice(0, 3).map((p: any, i: number) => (
                                        <div key={i} style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, fontSize: 12, color: '#94a3b8' }}>
                                            {p.name}
                                        </div>
                                    ))}
                                    {team.players?.length > 3 && (
                                        <div style={{ padding: '4px 10px', fontSize: 12, color: '#475569' }}>+{team.players.length - 3} more</div>
                                    )}
                                    {(!team.players || team.players.length === 0) && (
                                        <div style={{ fontSize: 12, color: '#334155' }}>No players yet</div>
                                    )}
                                </div>
                            </div>

                            <Link href={`/dashboard/organizer/teams/${team._id}`} style={{ width: '100%', marginTop: 4, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#f8fafc', fontSize: 13, fontWeight: 600, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', display: 'block' }}>
                                View Full Squad
                            </Link>
                        </div>
                    )) : (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 20px', background: 'rgba(15,22,41,0.4)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.08)' }}>
                            <Users size={48} color="#1e293b" style={{ marginBottom: 16 }} />
                            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No Teams Found</h3>
                            <p style={{ color: '#64748b', fontSize: 14, marginBottom: 24 }}>You haven't registered any teams yet.</p>
                            <Link href="/dashboard/organizer/teams/new" style={{ textDecoration: 'none', color: '#22c55e', fontWeight: 700 }}>
                                Register your first team →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .teams-container { max-width: 1000px; margin: 0 auto; padding: 24px 16px; }
                .teams-header { display: flex; flex-direction: column; gap: 16px; margin-bottom: 28px; }
                .teams-title { font-size: clamp(1.4rem, 5vw, 1.75rem); font-weight: 900; margin: 0 0 4px 0; }
                .teams-btn {
                    text-decoration: none;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: #000; padding: 12px 20px; border-radius: 12px; font-weight: 800;
                    display: inline-flex; align-items: center; gap: 8px; font-size: 14px;
                    box-shadow: 0 4px 12px rgba(34,197,94,0.3); align-self: flex-start;
                }
                .teams-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 16px; }
                @media (min-width: 640px) {
                    .teams-container { padding: 40px 24px; }
                    .teams-header { flex-direction: row; justify-content: space-between; align-items: flex-start; }
                }
            `}</style>
        </div>
    );
}

export default function TeamListPage() {
    return (
        <ProtectedRoute allowedRoles={['organizer']}>
            <TeamList />
        </ProtectedRoute>
    );
}
