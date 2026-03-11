"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, User, UserCheck, Shield, Crown, Star } from 'lucide-react';
import Link from 'next/link';
import api from '../../../../../utils/api';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import { getImageUrl } from '../../../../../utils/imageUrl';

function AdminTeamDetail() {
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
                if (err.response?.status === 404) setError('Team not found');
                else if (err.response?.status === 403) setError('Not authorized to view this team');
                else setError('Failed to load team details');
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, [id]);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <Loader2 className="animate-spin" color="#f97316" size={48} style={{ margin: '0 auto 16px' }} />
                <p style={{ color: '#64748b', fontFamily: 'Inter, sans-serif' }}>Loading team details...</p>
            </div>
        </div>
    );

    if (error || !team) return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: 500, width: '100%', background: 'rgba(15,23,42,0.8)', borderRadius: 24, padding: 48, border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                    <Shield size={40} color="#ef4444" />
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>{error || 'Team not found'}</h1>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 28 }}>The team you're looking for doesn't exist or couldn't be loaded.</p>
                <Link href="/dashboard/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#f97316', textDecoration: 'none', fontWeight: 700, fontSize: 14, background: 'rgba(249,115,22,0.1)', padding: '10px 20px', borderRadius: 10, border: '1px solid rgba(249,115,22,0.2)' }}>
                    <ArrowLeft size={16} /> Back to Admin Dashboard
                </Link>
            </div>
        </div>
    );

    const getRoleInfo = (role: string) => {
        switch (role) {
            case 'Batsman': return { bg: 'rgba(59,130,246,0.12)', text: '#60a5fa', border: 'rgba(59,130,246,0.25)', emoji: '🏏' };
            case 'Bowler': return { bg: 'rgba(239,68,68,0.12)', text: '#f87171', border: 'rgba(239,68,68,0.25)', emoji: '⚡' };
            case 'All-rounder': return { bg: 'rgba(168,85,247,0.12)', text: '#c084fc', border: 'rgba(168,85,247,0.25)', emoji: '🌟' };
            case 'Wicket-keeper': return { bg: 'rgba(234,179,8,0.12)', text: '#facc15', border: 'rgba(234,179,8,0.25)', emoji: '🥊' };
            default: return { bg: 'rgba(148,163,184,0.12)', text: '#94a3b8', border: 'rgba(148,163,184,0.2)', emoji: '🏃' };
        }
    };

    return (
        <div className="atd-shell">
            <div className="atd-container">
                {/* Back Button */}
                <Link href="/dashboard/admin" className="atd-back-btn">
                    <ArrowLeft size={16} /> Back to Admin Panel
                </Link>

                {/* Header Card */}
                <div className="atd-header">
                    <div className="atd-logo-wrap">
                        {team.logo ? (
                            <img src={getImageUrl(team.logo)} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: 40 }}>🛡️</span>
                        )}
                    </div>
                    <div className="atd-header-info">
                        <div className="atd-admin-badge">
                            <Shield size={12} /> Admin View
                        </div>
                        <h1 className="atd-team-name">{team.name}</h1>
                        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
                            <span className="atd-meta-chip">
                                <UserCheck size={14} /> {team.players?.length || 0} Squad Members
                            </span>
                            {team.organizer && (
                                <span className="atd-meta-chip secondary">
                                    <User size={14} /> {team.organizer?.name || 'Unknown Organizer'}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Squad Section */}
                <div className="atd-section">
                    <div className="atd-section-header">
                        <Crown size={22} color="#f97316" />
                        <h2>Full Squad</h2>
                        <span className="atd-count-badge">{team.players?.length || 0}</span>
                    </div>

                    {team.players && team.players.length > 0 ? (
                        <div className="atd-squad-grid">
                            {team.players.map((player: any, index: number) => {
                                const roleInfo = getRoleInfo(player.role);
                                return (
                                    <div key={index} className="atd-player-card">
                                        <div className="atd-player-top">
                                            <div className="atd-player-avatar">
                                                <span>{roleInfo.emoji}</span>
                                            </div>
                                            <div className="atd-player-badges">
                                                {player.isCaptain && (
                                                    <span className="atd-badge captain">
                                                        <Crown size={10} /> Captain
                                                    </span>
                                                )}
                                                {player.isViceCaptain && (
                                                    <span className="atd-badge vc">
                                                        <Star size={10} /> Vice-Captain
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <h3 className="atd-player-name">{player.name}</h3>
                                        <span className="atd-role-tag" style={{ background: roleInfo.bg, color: roleInfo.text, borderColor: roleInfo.border }}>
                                            {player.role || 'Unspecified'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="atd-empty">
                            <User size={48} color="#475569" style={{ margin: '0 auto 16px', display: 'block' }} />
                            <p>No players registered in this squad yet.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                .atd-shell { min-height: 100vh; background: #0a0e1a; color: #f8fafc; font-family: 'Inter', sans-serif; }
                .atd-container { max-width: 1100px; margin: 0 auto; padding: 32px 16px 60px; }
                
                .atd-back-btn {
                    display: inline-flex; align-items: center; gap: 8px; color: #64748b;
                    text-decoration: none; font-size: 13px; font-weight: 600; margin-bottom: 32px;
                    padding: 8px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08);
                    background: rgba(255,255,255,0.03); transition: all 0.15s;
                }
                .atd-back-btn:hover { color: #f97316; border-color: rgba(249,115,22,0.3); background: rgba(249,115,22,0.06); }

                .atd-header {
                    display: flex; align-items: center; gap: 24px; flex-wrap: wrap;
                    background: linear-gradient(135deg, rgba(15,23,42,0.9), rgba(30,42,70,0.7));
                    border: 1px solid rgba(249,115,22,0.15); border-radius: 24px; padding: 32px;
                    margin-bottom: 32px;
                    box-shadow: 0 8px 40px rgba(0,0,0,0.3), 0 0 80px rgba(249,115,22,0.04);
                }
                .atd-logo-wrap {
                    width: 96px; height: 96px; border-radius: 22px; flex-shrink: 0;
                    background: rgba(249,115,22,0.1); border: 2px solid rgba(249,115,22,0.2);
                    display: flex; align-items: center; justify-content: center; overflow: hidden;
                }
                .atd-header-info { flex: 1; min-width: 0; }
                .atd-admin-badge {
                    display: inline-flex; align-items: center; gap: 5px;
                    background: rgba(249,115,22,0.12); color: #f97316;
                    border: 1px solid rgba(249,115,22,0.25); font-size: 10px; font-weight: 800;
                    letter-spacing: 0.05em; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; margin-bottom: 10px;
                }
                .atd-team-name { font-size: clamp(1.6rem, 5vw, 2.8rem); font-weight: 900; margin: 0; line-height: 1.1; }
                .atd-meta-chip {
                    display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600;
                    color: #f97316; background: rgba(249,115,22,0.1); border: 1px solid rgba(249,115,22,0.2);
                    padding: 5px 12px; border-radius: 100px;
                }
                .atd-meta-chip.secondary { color: #94a3b8; background: rgba(148,163,184,0.08); border-color: rgba(148,163,184,0.15); }

                .atd-section { margin-top: 8px; }
                .atd-section-header {
                    display: flex; align-items: center; gap: 12px; margin-bottom: 20px;
                    padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .atd-section-header h2 { font-size: 20px; font-weight: 800; margin: 0; }
                .atd-count-badge {
                    background: rgba(249,115,22,0.12); color: #f97316; border: 1px solid rgba(249,115,22,0.2);
                    font-size: 11px; font-weight: 800; padding: 2px 10px; border-radius: 100px;
                }

                .atd-squad-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr)); gap: 16px; }
                .atd-player-card {
                    background: rgba(15,23,42,0.7); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 18px; padding: 20px; transition: all 0.2s;
                    backdrop-filter: blur(10px);
                }
                .atd-player-card:hover { transform: translateY(-3px); border-color: rgba(249,115,22,0.2); box-shadow: 0 12px 40px rgba(0,0,0,0.3); }
                .atd-player-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
                .atd-player-avatar {
                    width: 44px; height: 44px; border-radius: 12px;
                    background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.15);
                    display: flex; align-items: center; justify-content: center; font-size: 20px;
                }
                .atd-player-badges { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
                .atd-badge {
                    display: inline-flex; align-items: center; gap: 4px;
                    font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.04em;
                }
                .atd-badge.captain { background: #eab308; color: #000; }
                .atd-badge.vc { background: #3b82f6; color: #fff; }
                .atd-player-name { font-size: 15px; font-weight: 700; margin: 0 0 10px 0; color: #f8fafc; }
                .atd-role-tag {
                    display: inline-block; font-size: 11px; font-weight: 700;
                    padding: 4px 12px; border-radius: 8px; border: 1px solid;
                }
                .atd-empty {
                    text-align: center; padding: 60px 24px;
                    background: rgba(15,23,42,0.4); border-radius: 20px; border: 1px dashed rgba(255,255,255,0.08);
                }
                .atd-empty p { color: '#64748b'; font-size: 15px; margin: 0; }

                @media (min-width: 640px) {
                    .atd-container { padding: 48px 32px 80px; }
                }
            `}</style>
        </div>
    );
}

export default function AdminTeamDetailPage() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminTeamDetail />
        </ProtectedRoute>
    );
}
