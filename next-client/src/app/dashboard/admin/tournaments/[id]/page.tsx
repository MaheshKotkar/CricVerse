"use client";
import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, MapPin, Play, ArrowLeft, Loader2, CheckCircle2, Activity, Info } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../../../../utils/api';
import ProtectedRoute from '../../../../../components/ProtectedRoute';

function AdminTournamentDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                const [tRes, mRes] = await Promise.all([
                    api.get(`/tournaments/${id}`),
                    api.get(`/tournaments/${id}/matches`)
                ]);
                setData(tRes.data.data);
                setMatches(mRes.data.data);
            } catch (err: any) {
                console.error("Failed to fetch admin tournament data", err);
                toast.error("Failed to load tournament details");
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // Real-time updates simulation: Polling every 10 seconds for results
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, [id]);

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#080c18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" color="#f97316" size={40} />
        </div>
    );

    if (!data) return (
        <div style={{ minHeight: '100vh', background: '#080c18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8fafc' }}>
            Tournament not found
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#080c18', color: '#f8fafc', paddingBottom: 60 }}>
            <div className="adm-container" style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
                <Link href="/dashboard/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#94a3b8', textDecoration: 'none', marginBottom: 28, fontSize: 14, fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                {/* Header Card */}
                <div style={{
                    background: 'linear-gradient(135deg, rgba(13,20,36,0.95), rgba(10,16,32,0.9))',
                    border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 32, marginBottom: 32,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24
                }}>
                    <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <span style={{
                                fontSize: 11, fontWeight: 800, padding: '5px 14px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.06em',
                                background: data.status === 'Active' ? 'rgba(34,197,94,0.1)' : 'rgba(148,163,184,0.1)',
                                color: data.status === 'Active' ? '#4ade80' : '#94a3b8',
                                border: `1px solid ${data.status === 'Active' ? 'rgba(34,197,94,0.2)' : 'rgba(148,163,184,0.2)'}`
                            }}>● {data.status}</span>
                            <span style={{ color: '#64748b', fontSize: 13, fontWeight: 700 }}>{data.format}</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 900, marginBottom: 12, lineHeight: 1 }}>{data.name}</h1>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                                <Calendar size={16} color="#f97316" /> {new Date(data.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#64748b', fontSize: 14, fontWeight: 600 }}>
                                <MapPin size={16} color="#f97316" /> {data.venue || 'Multiple Venues'}
                            </div>
                        </div>
                    </div>

                    <div style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        padding: '16px 24px', borderRadius: 20, textAlign: 'right'
                    }}>
                        <div style={{ color: '#475569', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', marginBottom: 4 }}>Organizer</div>
                        <div style={{ color: '#f97316', fontSize: 16, fontWeight: 800 }}>{data.organizer?.name || 'Administrator'}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 32, alignItems: 'start' }} className="adm-grid">
                    {/* Main Content: Matches */}
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <Activity size={22} color="#f97316" />
                            <h2 style={{ fontSize: 20, fontWeight: 900, margin: 0 }}>Tournament Matches</h2>
                            <div style={{ background: 'rgba(249,115,22,0.1)', color: '#f97316', padding: '2px 10px', borderRadius: 100, fontSize: 12, fontWeight: 800 }}>{matches.length}</div>
                        </div>

                        {matches.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(255,255,255,0.02)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.08)' }}>
                                <Info size={32} color="#475569" style={{ marginBottom: 16 }} />
                                <p style={{ color: '#64748b', fontSize: 15, fontWeight: 600, margin: 0 }}>No matches have been scheduled for this tournament yet.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                {matches.map((m: any) => (
                                    <div key={m._id} style={{
                                        background: 'linear-gradient(135deg, rgba(15,22,41,0.7), rgba(10,16,32,0.6))',
                                        border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: 24,
                                        transition: 'all 0.2s'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, fontSize: 12, fontWeight: 700 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <Calendar size={14} /> {new Date(m.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                                <span style={{
                                                    background: m.status === 'Live' ? 'rgba(239,68,68,0.1)' : m.status === 'Completed' ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.04)',
                                                    color: m.status === 'Live' ? '#ef4444' : m.status === 'Completed' ? '#22c55e' : '#64748b',
                                                    padding: '4px 12px', borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: 'uppercase'
                                                }}>
                                                    {m.status === 'Live' && <Activity size={10} style={{ marginRight: 4 }} className="animate-pulse" />}
                                                    {m.status}
                                                </span>
                                            </div>
                                            {m.venue && <span style={{ color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {m.venue}</span>}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                                            <div style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.03)', borderRadius: 16, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, overflow: 'hidden' }}>
                                                    {m.teamA?.logo ? (
                                                        <img src={m.teamA.logo.startsWith('http') ? m.teamA.logo : `http://localhost:5000${m.teamA.logo.startsWith('/') ? '' : '/'}${m.teamA.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        '🛡️'
                                                    )}
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: 16 }}>{m.teamA?.name}</div>
                                                {m.status === 'Completed' && (
                                                    <div style={{ fontSize: 20, fontWeight: 900, color: m.winner === m.teamA?._id ? '#22c55e' : '#475569', marginTop: 8 }}>
                                                        {m.teamAScore?.runs}/{m.teamAScore?.wickets} ({m.teamAScore?.overs})
                                                    </div>
                                                )}
                                            </div>

                                            <div style={{ fontSize: 12, fontWeight: 900, color: '#475569', background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: 100 }}>VS</div>

                                            <div style={{ flex: 1, textAlign: 'center' }}>
                                                <div style={{ width: 60, height: 60, background: 'rgba(255,255,255,0.03)', borderRadius: 16, margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, overflow: 'hidden' }}>
                                                    {m.teamB?.logo ? (
                                                        <img src={m.teamB.logo.startsWith('http') ? m.teamB.logo : `http://localhost:5000${m.teamB.logo.startsWith('/') ? '' : '/'}${m.teamB.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        '🛡️'
                                                    )}
                                                </div>
                                                <div style={{ fontWeight: 800, fontSize: 16 }}>{m.teamB?.name}</div>
                                                {m.status === 'Completed' && (
                                                    <div style={{ fontSize: 20, fontWeight: 900, color: m.winner === m.teamB?._id ? '#22c55e' : '#475569', marginTop: 8 }}>
                                                        {m.teamBScore?.runs}/{m.teamBScore?.wickets} ({m.teamBScore?.overs})
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {m.status === 'Completed' && (
                                            <div style={{
                                                marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)',
                                                textAlign: 'center', color: '#facc15', fontWeight: 800, fontSize: 14
                                            }}>
                                                🏆 Result: {m.winnerName} won by {m.winMargin}
                                            </div>
                                        )}

                                        {m.status === 'Cancelled' && (
                                            <div style={{
                                                marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(239,68,68,0.1)',
                                                textAlign: 'center', color: '#ef4444', fontWeight: 700, fontSize: 14
                                            }}>
                                                🚫 Match Cancelled: {m.cancelReason || 'Unspecified Reason'}
                                            </div>
                                        )}

                                        {m.status === 'Live' && (
                                            <div style={{ marginTop: 20, textAlign: 'center' }}>
                                                <Link href={`/dashboard/player/live-score/${m._id}`} style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)',
                                                    color: '#ef4444', padding: '10px 24px', borderRadius: 12, textDecoration: 'none',
                                                    fontSize: 14, fontWeight: 800, border: '1px solid rgba(239,68,68,0.2)'
                                                }}>
                                                    <Activity size={16} className="animate-pulse" /> Watch Real-time Score
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar: Participating Teams */}
                    <aside>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                            <Users size={20} color="#3b82f6" />
                            <h2 style={{ fontSize: 18, fontWeight: 900, margin: 0 }}>Participating Teams</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {data.teams?.map((team: any) => (
                                <div key={team._id} style={{
                                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                                    padding: 16, borderRadius: 16, display: 'flex', alignItems: 'center', gap: 14
                                }}>
                                    <div style={{
                                        width: 40, height: 40, background: 'linear-gradient(135deg, #1e293b, #0f172a)',
                                        borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, overflow: 'hidden'
                                    }}>
                                        {team.logo ? (
                                            <img src={team.logo.startsWith('http') ? team.logo : `http://localhost:5000${team.logo.startsWith('/') ? '' : '/'}${team.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            '🛡️'
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{team.name}</div>
                                        <div style={{ fontSize: 11, color: '#475569', fontWeight: 700 }}>{team.players?.length || 0} Players Registered</div>
                                    </div>
                                    <CheckCircle2 size={16} color="#22c55e" />
                                </div>
                            ))}
                        </div>

                        <div style={{
                            marginTop: 32, padding: 24, borderRadius: 24,
                            border: '1px solid rgba(255,255,255,0.06)',
                            background: 'linear-gradient(135deg, rgba(20,30,55,0.5), rgba(8,12,24,0.5))'
                        }}>
                            <h3 style={{ fontSize: 14, fontWeight: 900, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569' }}>Tournament Info</h3>
                            <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.6, marginBottom: 0 }}>
                                {data.description || 'Professional tournament hosted on CricVerse. Follow live results and team standings.'}
                            </p>
                        </div>
                    </aside>
                </div>
            </div>

            <style>{`
                @media (max-width: 850px) {
                    .adm-grid { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

export default function AdminTournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminTournamentDetail params={params} />
        </ProtectedRoute>
    );
}
