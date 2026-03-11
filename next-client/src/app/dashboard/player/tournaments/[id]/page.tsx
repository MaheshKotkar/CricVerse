"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { Activity, ArrowLeft, Trophy, MapPin, Calendar, Loader2, Play } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import MatchScorecard from '@/components/MatchScorecard';
import Link from 'next/link';

function PlayerTournamentDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const tournamentId = resolvedParams.id;
    const router = useRouter();

    const [tournament, setTournament] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [showScorecard, setShowScorecard] = useState(false);
    const [scorecardLoading, setScorecardLoading] = useState(false);

    useEffect(() => {
        if (tournamentId) {
            const fetchData = async () => {
                try {
                    const tourRes = await api.get(`/tournaments/${tournamentId}`);
                    setTournament(tourRes.data.data);

                    const matchRes = await api.get(`/tournaments/${tournamentId}/matches`);
                    setMatches(matchRes.data.data || []);
                } catch (err: any) {
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchData();
        }
    }, [tournamentId]);

    const handleViewScorecard = async (match: any) => {
        setScorecardLoading(true);
        try {
            // Fetch full match details with playerStats
            const res = await api.get(`/matches/${match._id}`);
            setSelectedMatch(res.data.data);
            setShowScorecard(true);
        } catch (err: any) {
            console.error(err);
        } finally {
            setScorecardLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="#22c55e" />
            </div>
        );
    }

    if (!tournament) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc', padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ maxWidth: 600, margin: '0 auto', background: 'rgba(15,22,41,0.6)', borderRadius: 24, padding: 40, border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Trophy size={64} color="#ef4444" style={{ margin: '0 auto 20px', opacity: 0.8 }} />
                    <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16 }}>Tournament not found</h1>
                    <Link href="/dashboard/player/tournaments" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>
                        <ArrowLeft size={16} /> Back to Tournaments
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc' }}>
            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 16px' }}>
                <button 
                    onClick={() => {
                        if (showScorecard) {
                            setShowScorecard(false);
                            setSelectedMatch(null);
                            setScorecardLoading(false);
                        } else {
                            router.back();
                        }
                    }} 
                    style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: 10, cursor: 'pointer', marginBottom: 24, fontSize: 14, fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back
                </button>

                {!showScorecard ? (
                    <>
                        {/* Tournament Header */}
                        <div style={{ background: 'linear-gradient(135deg, rgba(13,20,36,0.9), rgba(10,16,32,0.8))', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 28, marginBottom: 28 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 20 }}>
                                <div>
                                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#22c55e', background: 'rgba(34,197,94,0.1)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(34,197,94,0.2)', marginBottom: 12 }}>
                                        <Trophy size={12} /> {tournament.format}
                                    </div>
                                    <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 8px 0' }}>{tournament.name}</h1>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, color: '#94a3b8', fontSize: 14 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Calendar size={16} /> {new Date(tournament.startDate).toLocaleDateString()} 
                                            {tournament.endDate && ` to ${new Date(tournament.endDate).toLocaleDateString()}`}
                                        </div>
                                        {tournament.venue && (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <MapPin size={16} /> {tournament.venue}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: tournament.status === 'Active' ? '#22c55e' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: tournament.status === 'Active' ? '#22c55e' : '#94a3b8' }}></span>
                                        {tournament.status}
                                    </div>
                                    {tournament.description && (
                                        <p style={{ color: '#64748b', fontSize: 13, marginTop: 16, maxWidth: 250, textAlign: 'left' }}>{tournament.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Matches List */}
                        <div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Activity size={24} color="#3b82f6" /> Matches ({matches.length})
                            </h2>

                            {matches.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(15,22,41,0.4)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.08)' }}>
                                    <p style={{ color: '#64748b', fontSize: 15, margin: 0 }}>No matches scheduled yet.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {matches.map((match) => (
                                        <div
                                            key={match._id}
                                            style={{
                                                background: 'rgba(15,22,41,0.6)',
                                                border: '1px solid rgba(255,255,255,0.06)',
                                                borderRadius: 18,
                                                padding: 20,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: match.status === 'Completed' || match.status === 'Live' ? 'pointer' : 'default',
                                                transition: 'all 0.2s',
                                                gap: 16
                                            }}
                                            onClick={() => {
                                                if (match.status === 'Completed' || match.status === 'Live') {
                                                    handleViewScorecard(match);
                                                }
                                            }}
                                        >
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
                                                    {/* Team A */}
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, margin: '0 auto 8px', overflow: 'hidden' }}>
                                                            {match.teamA?.logo ? <img src={match.teamA.logo.startsWith('http') ? match.teamA.logo : `http://localhost:5000${match.teamA.logo.startsWith('/') ? '' : '/'}${match.teamA.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}
                                                        </div>
                                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{match.teamA?.name}</div>
                                                    </div>

                                                    <div style={{ textAlign: 'center', color: '#64748b' }}>VS</div>

                                                    {/* Team B */}
                                                    <div style={{ textAlign: 'center' }}>
                                                        <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, margin: '0 auto 8px', overflow: 'hidden' }}>
                                                            {match.teamB?.logo ? <img src={match.teamB.logo.startsWith('http') ? match.teamB.logo : `http://localhost:5000${match.teamB.logo.startsWith('/') ? '' : '/'}${match.teamB.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}
                                                        </div>
                                                        <div style={{ fontSize: 13, fontWeight: 700 }}>{match.teamB?.name}</div>
                                                    </div>
                                                </div>

                                                <div style={{ display: 'flex', justifyContent: 'center', gap: 12, color: '#94a3b8', fontSize: 12 }}>
                                                    <span>{new Date(match.date).toLocaleDateString()}</span>
                                                    {match.venue && <span>•</span>}
                                                    {match.venue && <span>{match.venue}</span>}
                                                </div>
                                            </div>

                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                                                    padding: '4px 12px', borderRadius: 6,
                                                    background: match.status === 'Completed' ? 'rgba(34,197,94,0.1)' : match.status === 'Live' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                                                    color: match.status === 'Completed' ? '#22c55e' : match.status === 'Live' ? '#ef4444' : '#94a3b8',
                                                    marginBottom: 8
                                                }}>
                                                    {match.status}
                                                </div>
                                                {(match.status === 'Completed' || match.status === 'Live') && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewScorecard(match);
                                                        }}
                                                        disabled={scorecardLoading}
                                                        style={{
                                                            background: '#3b82f6', color: '#fff', padding: '8px 16px',
                                                            borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                                            display: 'flex', alignItems: 'center', gap: 6, opacity: scorecardLoading ? 0.7 : 1
                                                        }}
                                                    >
                                                        {scorecardLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />} View Scorecard
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : selectedMatch ? (
                    <>
                        {scorecardLoading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                                <Loader2 className="animate-spin" size={40} color="#3b82f6" />
                            </div>
                        ) : (
                            <>
                                <div style={{ background: 'linear-gradient(135deg, rgba(13,20,36,0.9), rgba(10,16,32,0.8))', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 24, padding: 24, marginBottom: 24 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                                        <div>
                                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a855f7', background: 'rgba(168,85,247,0.1)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(168,85,247,0.2)' }}>
                                                <Trophy size={12} /> {tournament.name}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <div style={{ width: 50, height: 50, borderRadius: 12, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 10px', overflow: 'hidden' }}>
                                                {selectedMatch.teamA?.logo ? <img src={selectedMatch.teamA.logo.startsWith('http') ? selectedMatch.teamA.logo : `http://localhost:5000${selectedMatch.teamA.logo.startsWith('/') ? '' : '/'}${selectedMatch.teamA.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: 15 }}>{selectedMatch.teamA?.name}</div>
                                        </div>
                                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#64748b', border: '1px solid rgba(255,255,255,0.1)' }}>VS</div>
                                        <div style={{ flex: 1, textAlign: 'center' }}>
                                            <div style={{ width: 50, height: 50, borderRadius: 12, background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, margin: '0 auto 10px', overflow: 'hidden' }}>
                                                {selectedMatch.teamB?.logo ? <img src={selectedMatch.teamB.logo.startsWith('http') ? selectedMatch.teamB.logo : `http://localhost:5000${selectedMatch.teamB.logo.startsWith('/') ? '' : '/'}${selectedMatch.teamB.logo}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}
                                            </div>
                                            <div style={{ fontWeight: 800, fontSize: 15 }}>{selectedMatch.teamB?.name}</div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 20, color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                                        {selectedMatch.venue && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {selectedMatch.venue}</span>}
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {new Date(selectedMatch.date).toLocaleDateString()}</span>
                                    </div>

                                    {selectedMatch.status === 'Completed' && (
                                        <div style={{ marginTop: 20, textAlign: 'center', color: '#facc15', fontWeight: 800, fontSize: 15, background: 'rgba(250,204,21,0.05)', padding: 12, borderRadius: 12, border: '1px solid rgba(250,204,21,0.1)' }}>
                                            🏆 {selectedMatch.result?.winningTeam?.name ? `${selectedMatch.result.winningTeam.name} ${selectedMatch.result.margin}` : selectedMatch.result?.margin}
                                        </div>
                                    )}
                                </div>

                                <MatchScorecard match={selectedMatch} />
                            </>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
}

export default function PlayerTournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <ProtectedRoute allowedRoles={['player']}>
            <PlayerTournamentDetail params={params} />
        </ProtectedRoute>
    );
}
