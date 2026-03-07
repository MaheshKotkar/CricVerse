"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, User, UserCheck, Shield } from 'lucide-react';
import Link from 'next/link';
import api from '../../../../../utils/api';
import ProtectedRoute from '../../../../../components/ProtectedRoute';

function TeamDetail() {
    const params = useParams();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!id) return;

        const fetchTeam = async () => {
            try {
                const res = await api.get(`/teams/${id}`);
                setTeam(res.data.data);
            } catch (err: any) {
                console.error("Fetch Team Error:", err);
                if (err.response?.status === 404) {
                    setError('Team not found');
                } else if (err.response?.status === 403) {
                    setError('Not authorized to view this team');
                } else {
                    setError('Failed to load team details');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, [id]);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" color="#22c55e" size={40} />
        </div>
    );

    if (error || !team) return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc', padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ maxWidth: 600, margin: '0 auto', background: 'rgba(15,22,41,0.6)', borderRadius: 24, padding: 40, border: '1px solid rgba(255,255,255,0.08)' }}>
                <Shield size={64} color="#ef4444" style={{ margin: '0 auto 20px', opacity: 0.8 }} />
                <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>{error || 'Team not found'}</h1>
                <Link href="/dashboard/organizer/teams" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Return to Teams
                </Link>
            </div>
        </div>
    );

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Batsman': return { bg: 'rgba(59, 130, 246, 0.1)', text: '#60a5fa' };
            case 'Bowler': return { bg: 'rgba(239, 68, 68, 0.1)', text: '#f87171' };
            case 'All-rounder': return { bg: 'rgba(168, 85, 247, 0.1)', text: '#c084fc' };
            case 'Wicket-keeper': return { bg: 'rgba(234, 179, 8, 0.1)', text: '#facc15' };
            default: return { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8' };
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc' }}>
            <div className="team-container">
                <Link href="/dashboard/organizer/teams" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#94a3b8', textDecoration: 'none', marginBottom: 28, fontSize: 14, fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back to Teams
                </Link>

                <div className="team-header-card">
                    <div style={{
                        width: 80, height: 80, borderRadius: 20,
                        background: 'rgba(34,197,94,0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 36, flexShrink: 0,
                        overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)'
                    }}>
                        {team.logo ? (
                            <img src={team.logo.startsWith('/') ? team.logo : `/${team.logo}`} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            '🛡️'
                        )}
                    </div>
                    <div>
                        <h1 className="team-title">{team.name}</h1>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <span style={{ color: '#22c55e', fontWeight: 600, fontSize: 15 }}>{team.players?.length || 0} Squad Members</span>
                        </div>
                    </div>
                </div>

                <div className="squad-section">
                    <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <UserCheck size={24} color="#22c55e" /> Full Squad
                    </h2>

                    <div className="squad-grid">
                        {team.players && team.players.length > 0 ? team.players.map((player: any, index: number) => {
                            const roleStyle = getRoleColor(player.role);
                            return (
                                <div key={index} className="player-card">
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                                        <div style={{
                                            width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'
                                        }}>
                                            <User size={20} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                                            {player.isCaptain && (
                                                <span style={{ fontSize: 10, fontWeight: 800, background: '#eab308', color: '#000', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Captain (C)</span>
                                            )}
                                            {player.isViceCaptain && (
                                                <span style={{ fontSize: 10, fontWeight: 800, background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase' }}>Vice-Captain (VC)</span>
                                            )}
                                        </div>
                                    </div>
                                    <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 8px 0', color: '#f8fafc' }}>{player.name}</h3>
                                    <span style={{
                                        display: 'inline-block', fontSize: 12, fontWeight: 600,
                                        background: roleStyle.bg, color: roleStyle.text,
                                        padding: '4px 10px', borderRadius: 6
                                    }}>
                                        {player.role || 'Unspecified'}
                                    </span>
                                </div>
                            );
                        }) : (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', background: 'rgba(15,22,41,0.4)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.08)' }}>
                                <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>No players registered in this squad yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .team-container { max-width: 1000px; margin: 0 auto; padding: 24px 16px; }
                .team-header-card {
                    background: rgba(15,22,41,0.6);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 24px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    gap: 20px;
                    margin-bottom: 32px;
                }
                .team-title { font-size: clamp(1.5rem, 6vw, 2.5rem); font-weight: 900; margin: 0; color: #fff; word-break: break-word; }
                .squad-section { margin-top: 20px; }
                .squad-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr)); gap: 16px; }
                .player-card {
                    background: rgba(15,22,41,0.4);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 16px;
                    padding: 20px;
                    transition: transform 0.2s, border-color 0.2s;
                }
                .player-card:hover {
                    transform: translateY(-2px);
                    border-color: rgba(255,255,255,0.1);
                }
                
                @media (min-width: 640px) {
                    .team-container { padding: 40px 24px; }
                    .team-header-card {
                        flex-direction: row;
                        align-items: center;
                        text-align: left;
                        padding: 32px;
                    }
                }
            `}</style>
        </div>
    );
}

export default function TeamDetailPage() {
    return (
        <ProtectedRoute allowedRoles={['organizer']}>
            <TeamDetail />
        </ProtectedRoute>
    );
}
