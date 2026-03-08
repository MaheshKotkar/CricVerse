"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Activity, ArrowLeft, Trophy, MapPin, Calendar, Loader2, Shield } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import MatchScorecard from '@/components/MatchScorecard';

function AdminMatchDetail({ params }: { params: Promise<{ matchId: string }> }) {
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
            <div style={{ minHeight: '100vh', background: '#080c18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="#f97316" />
            </div>
        );
    }

    if (!match) return <div style={{ padding: 40, textAlign: 'center', color: '#f8fafc' }}>Match not found.</div>;

    const inningKey = match.currentInning === 1 ? 'inning1' : 'inning2';
    const score = match.isSuperOver
        ? (match.currentInning === 1 ? match.superOver?.inning1 : match.superOver?.inning2)
        : (match.score?.[inningKey] || { runs: 0, wickets: 0, overs: 0 });

    return (
        <div style={{ minHeight: '100vh', background: '#080c18', color: '#f8fafc', padding: '24px 16px' }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(249,115,22,0.1)', color: '#f97316', padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', border: '1px solid rgba(249,115,22,0.2)' }}>
                        <Shield size={12} /> God Mode
                    </div>
                </div>

                <div style={{ background: 'linear-gradient(135deg, rgba(13,20,36,0.95), rgba(10,16,32,0.9))', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 32, marginBottom: 24 }}>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#f97316', background: 'rgba(249,115,22,0.1)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(249,115,22,0.2)' }}>
                            <Trophy size={12} /> {match.tournament?.name || 'Tournament Match'}
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 12px', overflow: 'hidden' }}>
                                {match.teamA?.logo ? <img src={match.teamA.logo.startsWith('http') ? match.teamA.logo : `http://localhost:5000${match.teamA.logo.startsWith('/') ? '' : '/'}${match.teamA.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 18 }}>{match.teamA?.name}</div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 900, color: '#475569', background: 'rgba(255,255,255,0.04)', padding: '6px 12px', borderRadius: 100 }}>VS</div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                            <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 12px', overflow: 'hidden' }}>
                                {match.teamB?.logo ? <img src={match.teamB.logo.startsWith('http') ? match.teamB.logo : `http://localhost:5000${match.teamB.logo.startsWith('/') ? '' : '/'}${match.teamB.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}
                            </div>
                            <div style={{ fontWeight: 800, fontSize: 18 }}>{match.teamB?.name}</div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 24, color: '#64748b', fontSize: 13, fontWeight: 600 }}>
                        {match.venue && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} color="#f97316" /> {match.venue}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} color="#f97316" /> {new Date(match.date).toLocaleDateString()}</span>
                    </div>

                    {match.status === 'Completed' && (
                        <div style={{ marginTop: 24, textAlign: 'center', color: '#fbbf24', fontWeight: 900, fontSize: 16, background: 'rgba(251,191,36,0.08)', padding: 16, borderRadius: 16, border: '1px solid rgba(251,191,36,0.2)', boxShadow: '0 8px 32px rgba(251,191,36,0.1)' }}>
                            🏆 {match.result?.winningTeam?.name ? `${match.result.winningTeam.name} ${match.result.margin}` : match.result?.margin}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: 5, borderRadius: 14, marginBottom: 28, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <button onClick={() => setActiveTab('summary')} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: activeTab === 'summary' ? '#f97316' : 'transparent', color: activeTab === 'summary' ? '#fff' : '#64748b', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>Summary View</button>
                    <button onClick={() => setActiveTab('scorecard')} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: activeTab === 'scorecard' ? '#f97316' : 'transparent', color: activeTab === 'scorecard' ? '#fff' : '#64748b', fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>Full Scorecard</button>
                </div>

                {activeTab === 'summary' ? (
                    <div style={{ background: 'linear-gradient(135deg, rgba(15,22,41,0.8), rgba(10,16,32,0.7))', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, padding: 40, textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                        {match.status === 'Live' && (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.12)', padding: '6px 14px', borderRadius: 100, border: '1px solid rgba(239,68,68,0.3)', marginBottom: 24, animation: 'pulse 2s infinite' }}>
                                ● LIVE MONITORING
                            </div>
                        )}
                        <div style={{ fontSize: 12, fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Innings Breakdown</div>
                        <div style={{ fontSize: 72, fontWeight: 950, marginBottom: 10, color: '#fff', textShadow: '0 0 40px rgba(249,115,22,0.3)' }}>
                            {score.runs} <span style={{ color: '#475569', fontSize: 36 }}>/ {score.wickets}</span>
                        </div>
                        <div style={{ fontSize: 20, color: '#64748b', fontWeight: 600 }}>Overs Handled: <span style={{ color: '#f8fafc', fontWeight: 900, fontSize: 26 }}>{score.overs}</span> <span style={{ fontSize: 16, color: '#475569' }}>/ {match.overs || 20}</span></div>
                    </div>
                ) : (
                    <MatchScorecard match={match} />
                )}
            </div>

            <style>{`
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
}

export default function AdminMatchDetailPage({ params }: { params: Promise<{ matchId: string }> }) {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminMatchDetail params={params} />
        </ProtectedRoute>
    );
}
