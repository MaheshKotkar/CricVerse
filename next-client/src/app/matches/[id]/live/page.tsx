"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/utils/api';
import {
    Activity, ArrowLeft, Trophy, Users, AlertCircle, Play,
    CheckCircle2, Swords, Shield, Loader2, Zap, Calendar, MapPin
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function PublicLiveScorePage() {
    const params = useParams();
    const router = useRouter();
    const matchId = params.id as string;

    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
            // Poll for live updates every 5 seconds
            const interval = setInterval(() => {
                fetchMatch();
            }, 5000);
            return () => clearInterval(interval);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId]);

    if (loading) {
        return (
            <div className="pd-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="#3b82f6" />
            </div>
        );
    }

    if (!match) return <div className="pd-shell" style={{ padding: 40, textAlign: 'center' }}>Match not found.</div>;

    const inningKey = match.currentInning === 1 ? 'inning1' : 'inning2';
    const score = match.score?.[inningKey] || { runs: 0, wickets: 0, overs: 0 };
    const isPlayersSet = match.activePlayers?.striker && match.activePlayers?.nonStriker && match.activePlayers?.bowler;

    // Player Stats Helper
    const pStats = match.playerStats || {};
    const strikerStats = pStats[match.activePlayers?.striker] || { batRuns: 0, batBalls: 0 };
    const nonStrikerStats = pStats[match.activePlayers?.nonStriker] || { batRuns: 0, batBalls: 0 };
    const bowlerStats = pStats[match.activePlayers?.bowler] || { bowlRuns: 0, bowlBalls: 0, bowlWickets: 0 };

    const formatOvers = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`;

    return (
        <div className="pd-shell">
            <nav className="pd-navbar">
                <div className="pd-navbar-inner">
                    <button onClick={() => router.back()} className="pd-back-btn">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <Link href="/" className="pd-brand">
                        <div className="pd-brand-icon" style={{ width: 28, height: 28, borderRadius: 8 }}><Zap size={14} /></div>
                        <span className="pd-brand-text" style={{ fontSize: 16 }}>Live Scoring</span>
                    </Link>
                    <div style={{ width: 70 }} /> {/* Spacer */}
                </div>
            </nav>

            <div className="pd-content" style={{ maxWidth: 800 }}>
                {/* Match Header */}
                <div className="score-header">
                    <div style={{ textAlign: 'center', marginBottom: 15 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#a855f7', background: 'rgba(168,85,247,0.1)', padding: '4px 12px', borderRadius: 100, border: '1px solid rgba(168,85,247,0.2)' }}>
                            <Trophy size={12} /> {match.tournament?.name || 'Tournament'}
                        </div>
                    </div>
                    <div className="score-teams">
                        <div className="score-team">
                            <div className="score-logo">
                                {match.teamA?.logo ? (
                                    <img src={match.teamA.logo.startsWith('http') ? match.teamA.logo : `http://localhost:5000${match.teamA.logo.startsWith('/') ? '' : '/'}${match.teamA.logo}`} alt="" />
                                ) : (
                                    '🛡️'
                                )}
                            </div>
                            <div className="score-name">{match.teamA?.name}</div>
                        </div>
                        <div className="score-vs">VS</div>
                        <div className="score-team">
                            <div className="score-logo">
                                {match.teamB?.logo ? (
                                    <img src={match.teamB.logo.startsWith('http') ? match.teamB.logo : `http://localhost:5000${match.teamB.logo.startsWith('/') ? '' : '/'}${match.teamB.logo}`} alt="" />
                                ) : (
                                    '🛡️'
                                )}
                            </div>
                            <div className="score-name">{match.teamB?.name}</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 16, color: '#64748b', fontSize: 12, fontWeight: 600 }}>
                        {match.venue && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {match.venue}</span>}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {new Date(match.date).toLocaleDateString()}</span>
                    </div>
                </div>

                {match.status === 'Scheduled' && (
                    <div className="toss-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <h2 className="toss-title" style={{ justifyContent: 'center' }}><Calendar size={24} color="#3b82f6" /> Scheduled Match</h2>
                        <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 400, margin: '0 auto' }}>
                            The toss has not happened yet. This match will begin shortly. Stay tuned!
                        </p>
                    </div>
                )}

                {match.status === 'Completed' && (
                    <div className="toss-container" style={{ textAlign: 'center', padding: '40px 20px', borderColor: '#10b981' }}>
                        <h2 className="toss-title" style={{ justifyContent: 'center', color: '#10b981' }}><Trophy size={24} /> Match Completed</h2>
                        <p style={{ color: '#94a3b8', fontSize: 15, maxWidth: 400, margin: '0 auto' }}>
                            The match has concluded. Check back later for full scorecards.
                        </p>
                    </div>
                )}

                {/* Main Scoreboard Area */}
                {match.status === 'Live' && (
                    <div className="live-container">
                        {/* Huge Scoreboard */}
                        <div className="huge-scoreboard">
                            <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '6px 12px', borderRadius: 100, border: '1px solid rgba(239,68,68,0.3)', animation: 'pulse 2s infinite' }}>
                                ● LIVE
                            </div>

                            {match.toss?.wonBy && (
                                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>
                                    <b>{match.toss.wonBy.name}</b> won the toss and elected to <b>{match.toss.decision}</b>.
                                </div>
                            )}

                            <div className="huge-inning">Innings {match.currentInning}</div>
                            <div className="huge-score">
                                {score.runs} <span className="huge-wickets">/ {score.wickets}</span>
                            </div>
                            <div className="huge-overs">
                                Overs: <span>{score.overs}</span> <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>/ {match.overs || 20}</span>
                            </div>
                            <div className="huge-batting-team">
                                🏏 {match.battingTeam?.name} is batting.
                            </div>

                            {/* Current Players Mini-Table */}
                            {isPlayersSet && (
                                <div style={{ marginTop: 24, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: 12, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span style={{ color: '#94a3b8' }}>Striker:</span>
                                        <b style={{ marginLeft: 6 }}>{match.activePlayers.striker}</b>
                                        <span style={{ color: '#4ade80', marginLeft: 8, fontWeight: 700 }}>{strikerStats.batRuns}*</span>
                                        <span style={{ color: '#64748b', fontSize: 12 }}> ({strikerStats.batBalls})</span>
                                    </div>
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: 12, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <span style={{ color: '#94a3b8' }}>Non-Striker:</span>
                                        <b style={{ marginLeft: 6 }}>{match.activePlayers.nonStriker}</b>
                                        <span style={{ color: '#e2e8f0', marginLeft: 8, fontWeight: 700 }}>{nonStrikerStats.batRuns}</span>
                                        <span style={{ color: '#64748b', fontSize: 12 }}> ({nonStrikerStats.batBalls})</span>
                                    </div>
                                    <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', padding: '12px 20px', borderRadius: 12, fontSize: 14, color: '#93c5fd' }}>
                                        <span style={{ color: '#60a5fa' }}>Bowler:</span>
                                        <b style={{ marginLeft: 6 }}>{match.activePlayers.bowler}</b>
                                        <span style={{ color: '#bfdbfe', marginLeft: 8, fontWeight: 700 }}>{bowlerStats.bowlWickets}-{bowlerStats.bowlRuns}</span>
                                        <span style={{ color: '#60a5fa', fontSize: 12 }}> ({formatOvers(bowlerStats.bowlBalls)})</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {(!isPlayersSet) && (
                            <div className="toss-container" style={{ textAlign: 'center', padding: '24px' }}>
                                <Loader2 className="animate-spin" size={24} color="#3b82f6" style={{ margin: '0 auto 10px' }} />
                                <h3 style={{ fontSize: 16, color: '#e2e8f0', marginBottom: 6 }}>Setting up players...</h3>
                                <p style={{ fontSize: 13, color: '#94a3b8' }}>The organizer is selecting the opening batsmen and bowler. The scoreboard will update shortly.</p>
                            </div>
                        )}

                        {(score.wickets >= 10 || score.overs >= match.overs) && (
                            <div className="toss-container" style={{ marginTop: 24, border: '1px solid #10b981', textAlign: 'center' }}>
                                <h2 className="toss-title" style={{ justifyContent: 'center', color: '#10b981' }}><Trophy size={24} /> Innings Complete!</h2>
                                <p style={{ color: '#94a3b8', fontSize: 15 }}>
                                    {match.battingTeam?.name} scored <b>{score.runs}/{score.wickets}</b> in <b>{score.overs}</b> overs.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                .pd-shell { min-height: 100vh; background: #080c18; color: #f8fafc; font-family: 'Inter', sans-serif; }
                .pd-navbar { position: sticky; top: 0; z-index: 100; background: rgba(8,12,24,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05); }
                .pd-navbar-inner { max-width: 1200px; margin: 0 auto; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
                .pd-back-btn { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.05); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; width: 80px; justify-content: center; }
                .pd-back-btn:hover { background: rgba(255,255,255,0.1); }
                .pd-brand { display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 16px; text-decoration: none; color: white; }
                .pd-brand-icon {
                    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    display: flex; align-items: center; justify-content: center; color: #fff;
                    box-shadow: 0 4px 14px rgba(34,197,94,0.35);
                }
                .pd-content { margin: 0 auto; padding: 24px 16px; }

                /* Header */
                .score-header { background: linear-gradient(135deg, rgba(13,20,36,0.9), rgba(10,16,32,0.8)); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 20px; margin-bottom: 24px; }
                .score-teams { display: flex; align-items: center; justify-content: space-between; }
                .score-team { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
                .score-logo { width: 50px; height: 50px; border-radius: 12px; background: #1e293b; display: flex; align-items: center; justify-content: center; font-size: 24px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
                .score-logo img { width: 100%; height: 100%; object-fit: cover; }
                .score-name { font-weight: 800; font-size: 15px; text-align: center; }
                .score-vs { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; color: #64748b; border: 1px solid rgba(255,255,255,0.1); }

                /* Toss Wrapper (for messages) */
                .toss-container { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 24px; border-radius: 20px; }
                .toss-title { font-size: 18px; font-weight: 800; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; color: #e2e8f0; }

                /* Live Scoreboard */
                .live-container { display: flex; flex-direction: column; gap: 24px; }
                .huge-scoreboard { position: relative; background: radial-gradient(circle at top, rgba(34,197,94,0.15), rgba(8,12,24,0.9)); border: 1px solid rgba(34,197,94,0.3); border-radius: 24px; padding: 40px 20px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .huge-inning { font-size: 12px; font-weight: 800; color: #22c55e; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; background: rgba(34,197,94,0.1); display: inline-block; padding: 4px 12px; border-radius: 100px; border: 1px solid rgba(34,197,94,0.2); }
                .huge-score { font-size: clamp(4rem, 15vw, 6rem); font-weight: 900; line-height: 1; color: #fff; text-shadow: 0 0 40px rgba(34,197,94,0.4); display: flex; align-items: baseline; justify-content: center; gap: 5px; }
                .huge-wickets { font-size: clamp(2rem, 8vw, 3rem); color: #cbd5e1; }
                .huge-overs { font-size: 18px; font-weight: 600; color: #94a3b8; margin-top: 10px; }
                .huge-overs span { color: #f8fafc; font-weight: 800; font-size: 22px; }
                .huge-batting-team { margin-top: 20px; font-size: 15px; font-weight: 700; color: #f8fafc; display: flex; align-items: center; justify-content: center; gap: 8px; }
                
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
}
