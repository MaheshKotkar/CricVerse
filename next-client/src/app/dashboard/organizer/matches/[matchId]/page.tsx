"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Activity, ArrowLeft, Trophy, MapPin, Calendar, Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import MatchScorecard from '@/components/MatchScorecard';

function OrganizerMatchDetail({ params }: { params: Promise<{ matchId: string }> }) {
    const resolvedParams = use(params);
    const matchId = resolvedParams.matchId;
    const router = useRouter();

    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'summary' | 'scorecard'>('scorecard');

    const fetchMatch = async () => {
        try {
            const res = await api.get(`/matches/${matchId}`);
            setMatch(res.data.data);
        } catch (err: any) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (matchId) {
            fetchMatch();
            const interval = setInterval(fetchMatch, 5000);
            return () => clearInterval(interval);
        }
    }, [matchId]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="#3b82f6" />
            </div>
        );
    }

    if (!match) return <div style={{ padding: 40, textAlign: 'center', color: '#f8fafc' }}>Match not found.</div>;

    const inningKey = match.currentInning === 1 ? 'inning1' : 'inning2';
    const score = match.isSuperOver
        ? (match.currentInning === 1 ? match.superOver?.inning1 : match.superOver?.inning2)
        : (match.score?.[inningKey] || { runs: 0, wickets: 0, overs: 0 });

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc', padding: '24px 16px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', marginBottom: 24, fontSize: 14, fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back
                </button>

                <div style={{ background: 'linear-gradient(135deg, rgba(13,20,36,0.9), rgba(10,16,32,0.8))', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 24, marginBottom: 24 }}>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a855f7', background: 'rgba(168,85,247,0.1)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(168,85,247,0.2)' }}>
                            <Trophy size={12} /> {match.tournament?.name || 'Tournament Match'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ width: 50, height: 50, borderRadius: 12, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 10px', overflow: 'hidden' }}>
                                {match.teamA?.logo ? <img src={match.teamA.logo.startsWith('http') ? match.teamA.logo : `http://localhost:5000${match.teamA.logo.startsWith('/') ? '' : '/'}${match.teamA.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 15 }}>{match.teamA?.name}</div>
                        </div>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#64748b', border: '1px solid rgba(255,255,255,0.1)' }}>VS</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ width: 50, height: 50, borderRadius: 12, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 10px', overflow: 'hidden' }}>
                                {match.teamB?.logo ? <img src={match.teamB.logo.startsWith('http') ? match.teamB.logo : `http://localhost:5000${match.teamB.logo.startsWith('/') ? '' : '/'}${match.teamB.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 15 }}>{match.teamB?.name}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20, color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                        {match.venue && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {match.venue}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {new Date(match.date).toLocaleDateString()}</span>
                    </div>

                    {match.status === 'Completed' && (
                        <div style={{ marginTop: 20, textAlign: 'center', color: '#facc15', fontWeight: 800, fontSize: 15, background: 'rgba(250,204,21,0.05)', padding: 12, borderRadius: 12, border: '1px solid rgba(250,204,21,0.1)' }}>
                            🏆 {match.result?.winningTeam?.name ? `${match.result.winningTeam.name} ${match.result.margin}` : match.result?.margin}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 12, marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={() => setActiveTab('summary')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: activeTab === 'summary' ? '#22c55e' : 'transparent', color: activeTab === 'summary' ? '#000' : '#94a3b8', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Summary</button>
                    <button onClick={() => setActiveTab('scorecard')} style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: activeTab === 'scorecard' ? '#22c55e' : 'transparent', color: activeTab === 'scorecard' ? '#000' : '#94a3b8', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Scorecard</button>
                </div>

                {activeTab === 'summary' ? (
                    <div style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 32, textAlign: 'center' }}>
                        {match.status === 'Live' && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '6px 12px', borderRadius: 100, border: '1px solid rgba(239,68,68,0.3)', marginBottom: 20 }}>
                                ● LIVE
                            </div>
                        )}
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Innings {match.currentInning}</div>
                        <div style={{ fontSize: 64, fontWeight: 900, marginBottom: 10, color: '#fff' }}>
                            {score.runs} <span style={{ color: '#64748b', fontSize: 32 }}>/ {score.wickets}</span>
                        </div>
                        <div style={{ fontSize: 18, color: '#94a3b8', fontWeight: 600 }}>Overs: <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: 22 }}>{score.overs}</span> <span style={{ fontSize: 14, color: '#64748b' }}>/ {match.overs || 20}</span></div>
                    </div>
                ) : (
                    <MatchScorecard match={match} />
                )}
            </div>
        </div>
    );
}

export default function OrganizerMatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
    return (
        <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerMatchDetail params={params} />
        </ProtectedRoute>
    );
}
