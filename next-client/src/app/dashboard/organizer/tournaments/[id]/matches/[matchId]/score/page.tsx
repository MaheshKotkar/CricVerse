"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/utils/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import {
    Activity, ArrowLeft, Trophy, Users, AlertCircle, Play,
    CheckCircle2, Swords, Shield, Loader2
} from 'lucide-react';
import { toast } from 'react-hot-toast';

function MatchScoringContent() {
    const params = useParams();
    const router = useRouter();
    const tournamentId = params.id as string;
    const matchId = params.matchId as string;

    const [match, setMatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Toss State
    const [tossWonBy, setTossWonBy] = useState<string>('');
    const [tossDecision, setTossDecision] = useState<'Bat' | 'Bowl'>('Bat');
    const [matchOvers, setMatchOvers] = useState<string>('20');
    const [customOvers, setCustomOvers] = useState<string>('');
    const [startingMatch, setStartingMatch] = useState(false);

    // Player Selection State
    const [striker, setStriker] = useState('');
    const [nonStriker, setNonStriker] = useState('');
    const [bowler, setBowler] = useState('');
    const [settingPlayers, setSettingPlayers] = useState(false);

    // Live Scoring State
    const [scoringBall, setScoringBall] = useState(false);

    // Over / Bowler State
    const [needsNewBowler, setNeedsNewBowler] = useState(false);
    const [nextBowler, setNextBowler] = useState('');

    // Wicket State
    const [pendingWicket, setPendingWicket] = useState(false);
    const [wicketRuns, setWicketRuns] = useState(0);
    const [dismissedPlayer, setDismissedPlayer] = useState('');
    const [wicketType, setWicketType] = useState('bowled');
    const [newBatsman, setNewBatsman] = useState('');

    // Cancellation State
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const cancellationReasons = [
        "Heavy rain",
        "Poor visibility due to fog",
        "Wet outfield that is unsafe for players",
        "Poor lighting in stadiums without floodlights",
        "Thunderstorms or lightning",
        "Other (Custom Reason)"
    ];

    const fetchMatch = async () => {
        try {
            const res = await api.get(`/matches/${matchId}`);
            setMatch(res.data.data);
            if (!tossWonBy && res.data.data?.teamA) {
                setTossWonBy(res.data.data.teamA._id);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to load match');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (matchId) fetchMatch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [matchId]);

    const handleStartMatch = async () => {
        setStartingMatch(true);
        try {
            const finalOvers = matchOvers === 'Custom' ? parseInt(customOvers) : parseInt(matchOvers);
            if (!finalOvers || finalOvers < 1) {
                toast.error("Please enter a valid number of overs.");
                setStartingMatch(false);
                return;
            }

            const res = await api.patch(`/matches/${matchId}/start`, {
                tossWonBy,
                tossDecision,
                overs: finalOvers
            });
            setMatch(res.data.data);
            toast.success("Toss Completed! Select opening players to begin scoring.");
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to start match');
        } finally {
            setStartingMatch(false);
        }
    };

    const handleSelectPlayers = async () => {
        if (!striker || !nonStriker || !bowler) {
            return toast.error("Please select both batsmen and the bowler.");
        }
        if (striker === nonStriker) {
            return toast.error("Striker and Non-Striker cannot be the same player.");
        }

        setSettingPlayers(true);
        try {
            const res = await api.patch(`/matches/${matchId}/players`, {
                striker,
                nonStriker,
                bowler
            });
            setMatch(res.data.data);
            toast.success("Players Set! Match is now Live.");
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to set players');
        } finally {
            setSettingPlayers(false);
        }
    };

    const handleScoreBall = async (runs: number, extras: number = 0, extraType: string | null = null, isWicket: boolean = false) => {
        if (scoringBall) return;
        setScoringBall(true);
        try {
            const inningKey = match.currentInning === 1 ? 'inning1' : 'inning2';
            const dataPath = match.isSuperOver ? match.superOver : match.score;
            const currentOvers = dataPath[inningKey].overs;

            // Calculate new over logic: 1.5 -> 2.0. If WD/NB, over doesn't increase.
            let newOvers = currentOvers;
            let overCompleted = false;

            if (!extraType || extraType === 'b' || extraType === 'lb') {
                const decimal = Math.round((currentOvers % 1) * 10);
                if (decimal === 5) {
                    newOvers = Math.floor(currentOvers) + 1.0;
                    overCompleted = true;
                } else {
                    newOvers = parseFloat((currentOvers + 0.1).toFixed(1));
                }
            }

            let newStriker = match.activePlayers.striker;
            let newNonStriker = match.activePlayers.nonStriker;

            // Rotate strike if odd runs scored (1 or 3)
            if (runs % 2 !== 0) {
                newStriker = match.activePlayers.nonStriker;
                newNonStriker = match.activePlayers.striker;
            }

            // Rotate strike again if over is completed
            if (overCompleted) {
                const temp = newStriker;
                newStriker = newNonStriker;
                newNonStriker = temp;
            }

            const res = await api.post(`/matches/${matchId}/score`, {
                runs, extras, extraType, isWicket, updatedOverCount: newOvers,
                striker: newStriker,
                nonStriker: newNonStriker
            });

            setMatch(res.data.data.match);
            toast.success(isWicket ? "WICKET!" : `${runs + extras} Runs`);

            const currentMatch = res.data.data.match;
            const currentDataPath = currentMatch.isSuperOver ? currentMatch.superOver : currentMatch.score;
            const isAllOut = currentDataPath[inningKey].wickets >= (currentMatch.isSuperOver ? 2 : 10);
            const isOversDone = newOvers >= (currentMatch.isSuperOver ? 1.0 : currentMatch.overs);

            if (isAllOut || isOversDone) {
                toast.success("Innings Complete!", { duration: 5000, icon: '🎯' });
                setNeedsNewBowler(true);
            } else if (overCompleted) {
                setNeedsNewBowler(true);
                setNextBowler('');
            }

        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to update score');
        } finally {
            setScoringBall(false);
        }
    };

    const handleNewOver = async () => {
        if (!nextBowler) return toast.error("Please select a bowler for the new over.");
        setSettingPlayers(true);
        try {
            // Rotate Strike and set new bowler
            const res = await api.patch(`/matches/${matchId}/players`, {
                striker: match.activePlayers.nonStriker,
                nonStriker: match.activePlayers.striker,
                bowler: nextBowler
            });
            setMatch(res.data.data);
            setNeedsNewBowler(false);
            toast.success("New Over Started!");
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to set new bowler');
        } finally {
            setSettingPlayers(false);
        }
    };

    const triggerWicket = () => {
        setDismissedPlayer(match.activePlayers.striker);
        setWicketRuns(0);
        setWicketType('bowled');
        setNewBatsman('');
        setPendingWicket(true);
    };

    const submitWicket = async () => {
        if (!newBatsman) return toast.error("Please select the new batsman.");
        setScoringBall(true);
        try {
            const inningKey = match.currentInning === 1 ? 'inning1' : 'inning2';
            const dataPath = match.isSuperOver ? match.superOver : match.score;
            const currentOvers = dataPath[inningKey].overs;

            let newOvers = currentOvers;
            let overCompleted = false;

            const decimal = Math.round((currentOvers % 1) * 10);
            if (decimal === 5) {
                newOvers = Math.floor(currentOvers) + 1.0;
                overCompleted = true;
            } else {
                newOvers = parseFloat((currentOvers + 0.1).toFixed(1));
            }

            const newStriker = dismissedPlayer === match.activePlayers.striker ? newBatsman : match.activePlayers.striker;
            const newNonStriker = dismissedPlayer === match.activePlayers.nonStriker ? newBatsman : match.activePlayers.nonStriker;

            const res = await api.post(`/matches/${matchId}/score`, {
                runs: 0,
                extras: 0,
                extraType: null,
                isWicket: true,
                wicketType,
                playerDismissed: dismissedPlayer,
                updatedOverCount: newOvers,
                striker: newStriker,
                nonStriker: newNonStriker
            });

            setMatch(res.data.data.match);
            toast.success(`WICKET! ${dismissedPlayer} is out.`);
            setPendingWicket(false);

            const currentMatch = res.data.data.match;
            const currentDataPath = currentMatch.isSuperOver ? currentMatch.superOver : currentMatch.score;
            const isAllOut = currentDataPath[inningKey].wickets >= (currentMatch.isSuperOver ? 2 : 10);
            const isOversDone = newOvers >= (currentMatch.isSuperOver ? 1.0 : currentMatch.overs);

            if (isAllOut || isOversDone) {
                toast.success("Innings Complete!", { duration: 5000, icon: '🎯' });
                setNeedsNewBowler(true);
            } else if (overCompleted) {
                setNeedsNewBowler(true);
                setNextBowler('');
            }

        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to log wicket');
        } finally {
            setScoringBall(false);
        }
    };

    const handleCancelMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cancelReason) return;

        setActionLoading(true);
        const loadingToast = toast.loading('Cancelling Match...');
        try {
            await api.patch(`/matches/${matchId}/cancel`, { reason: cancelReason });
            setMatch({ ...match, status: 'Cancelled' });
            toast.success('Match Cancelled!', { id: loadingToast });
            setCancelModalVisible(false);
            setCancelReason('');
            router.push(`/dashboard/organizer/tournaments/${tournamentId}`);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel match', { id: loadingToast });
        } finally {
            setActionLoading(false);
        }
    };

    const handleSwitchInning = async () => {
        setActionLoading(true);
        const loadingToast = toast.loading('Switching Inning...');
        try {
            const res = await api.patch(`/matches/${matchId}/switch-inning`);
            setMatch(res.data.data);
            setNeedsNewBowler(false);
            setStriker('');
            setNonStriker('');
            setBowler('');
            toast.success("Inning 2 Started! Select new players.", { id: loadingToast });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to switch inning', { id: loadingToast });
        } finally {
            setActionLoading(false);
        }
    };

    const handleStartSuperOver = async () => {
        setActionLoading(true);
        const loadingToast = toast.loading('Initializing Super Over...');
        try {
            const res = await api.patch(`/matches/${matchId}/start-super-over`);
            setMatch(res.data.data);
            setNeedsNewBowler(false);
            setStriker('');
            setNonStriker('');
            setBowler('');
            toast.success("Super Over Started!", { id: loadingToast });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to start Super Over', { id: loadingToast });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="pd-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={40} color="#3b82f6" />
            </div>
        );
    }

    if (!match) return <div className="pd-shell">Match not found.</div>;

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
                    <button onClick={() => router.push(`/dashboard/organizer/tournaments/${tournamentId}`)} className="pd-back-btn">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <div className="pd-brand">
                        <Activity size={18} color="#ef4444" className={match.status === 'Live' ? "animate-pulse" : ""} />
                        <span className="pd-brand-text">Live Scoring</span>
                    </div>
                    <div style={{ width: 100, display: 'flex', justifyContent: 'flex-end' }}>
                        {(match.status === 'Scheduled' || match.status === 'Live') && (
                            <button
                                onClick={() => setCancelModalVisible(true)}
                                style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.5)', color: '#ef4444', padding: '6px 12px', borderRadius: '8px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                            >
                                Cancel Match
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <div className="pd-content" style={{ maxWidth: 800 }}>
                {/* Match Header */}
                <div className="score-header">
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
                </div>

                {/* Cancel Match Modal */}
                {cancelModalVisible && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0, 0, 0, 0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20
                    }}>
                        <div style={{
                            background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, width: '100%', maxWidth: 400,
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}>
                            <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>Cancel Match</h3>
                            <p style={{ margin: '0 0 16px 0', fontSize: 14, color: '#94a3b8' }}>Please select or provide a reason for cancelling this match.</p>

                            <form onSubmit={handleCancelMatch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                <select
                                    value={cancellationReasons.includes(cancelReason) ? cancelReason : (cancelReason ? 'Other (Custom Reason)' : '')}
                                    onChange={(e) => {
                                        if (e.target.value !== 'Other (Custom Reason)') setCancelReason(e.target.value);
                                        else setCancelReason('');
                                    }}
                                    className="toss-input"
                                    style={{ colorScheme: 'dark' }}
                                    required
                                >
                                    <option value="" disabled style={{ background: '#1e293b', color: '#94a3b8' }}>Select a reason...</option>
                                    {cancellationReasons.map((reason, idx) => (
                                        <option key={idx} value={reason} style={{ background: '#1e293b', color: '#f8fafc' }}>{reason}</option>
                                    ))}
                                </select>

                                {(!cancellationReasons.includes(cancelReason) && cancelReason !== '' || cancelReason === '' && document.querySelector('select')?.value === 'Other (Custom Reason)') && (
                                    <input
                                        type="text"
                                        placeholder="Enter custom reason..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                        className="toss-input"
                                        required
                                        autoFocus
                                    />
                                )}

                                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                                    <button
                                        type="button"
                                        onClick={() => { setCancelModalVisible(false); setCancelReason(''); }}
                                        disabled={actionLoading}
                                        style={{ padding: '10px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: actionLoading ? 0.6 : 1 }}
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={actionLoading || !cancelReason}
                                        style={{ padding: '10px 16px', borderRadius: 8, background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800, opacity: (actionLoading || !cancelReason) ? 0.6 : 1 }}
                                    >
                                        {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Cancel'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Step 1: Toss Configuration */}
                {match.status === 'Scheduled' && (
                    <div className="toss-container">
                        <h2 className="toss-title"><Swords size={20} /> Match Toss Configuration</h2>

                        <div className="toss-group">
                            <label>Who won the toss?</label>
                            <div className="toss-options">
                                <button className={`toss-btn ${tossWonBy === match.teamA?._id ? 'active' : ''}`} onClick={() => setTossWonBy(match.teamA?._id)}>
                                    {match.teamA?.name}
                                </button>
                                <button className={`toss-btn ${tossWonBy === match.teamB?._id ? 'active' : ''}`} onClick={() => setTossWonBy(match.teamB?._id)}>
                                    {match.teamB?.name}
                                </button>
                            </div>
                        </div>

                        <div className="toss-group">
                            <label>Decision to?</label>
                            <div className="toss-options">
                                <button className={`toss-btn ${tossDecision === 'Bat' ? 'active' : ''}`} onClick={() => setTossDecision('Bat')}>🏏 Bat</button>
                                <button className={`toss-btn ${tossDecision === 'Bowl' ? 'active' : ''}`} onClick={() => setTossDecision('Bowl')}>🎯 Bowl</button>
                            </div>
                        </div>

                        <div className="toss-group">
                            <label>Match Overs</label>
                            <select value={matchOvers} onChange={e => setMatchOvers(e.target.value)} className="toss-input" style={{ marginBottom: matchOvers === 'Custom' ? 10 : 0 }}>
                                <option value="20">T20 (20 Overs)</option>
                                <option value="50">ODI (50 Overs)</option>
                                <option value="10">T10 (10 Overs)</option>
                                <option value="Custom">Custom</option>
                            </select>
                            {matchOvers === 'Custom' && (
                                <input
                                    type="number"
                                    placeholder="Enter custom overs..."
                                    className="toss-input"
                                    value={customOvers}
                                    onChange={e => setCustomOvers(e.target.value)}
                                    min="1"
                                />
                            )}
                        </div>

                        <button className="start-match-btn" onClick={handleStartMatch} disabled={startingMatch}>
                            {startingMatch ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" size={16} />}
                            CONFIRM TOSS & START
                        </button>
                    </div>
                )}

                {/* Step 2: Player Selection */}
                {match.status === 'Live' && !isPlayersSet && (
                    <div className="toss-container">
                        <h2 className="toss-title"><Users size={20} /> Select Opening Players</h2>
                        <p style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20 }}>
                            Toss won by <b>{match.toss?.wonBy?.name}</b> who decided to <b>{match.toss?.decision}</b>.
                        </p>

                        <div className="toss-group">
                            <label>Batting Team: {match.battingTeam?.name} 🏏</label>
                            <select value={striker} onChange={e => setStriker(e.target.value)} className="toss-input">
                                <option value="">Select Striker...</option>
                                {match.battingTeam?.players?.map((p: any) => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>

                            <select value={nonStriker} onChange={e => setNonStriker(e.target.value)} className="toss-input">
                                <option value="">Select Non-Striker...</option>
                                {match.battingTeam?.players?.map((p: any) => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="toss-group" style={{ marginTop: 24 }}>
                            <label>Bowling Team: {match.bowlingTeam?.name} 🎯</label>
                            <select value={bowler} onChange={e => setBowler(e.target.value)} className="toss-input">
                                <option value="">Select Opening Bowler...</option>
                                {match.bowlingTeam?.players?.map((p: any) => (
                                    <option key={p.name} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <button className="start-match-btn" onClick={handleSelectPlayers} disabled={settingPlayers} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                            {settingPlayers ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" size={16} />}
                            START LIVE SCORING
                        </button>
                    </div>
                )}

                {/* Step 3: Main Scoreboard Area (Live or Completed) */}
                {(match.status === 'Live' && isPlayersSet || match.status === 'Completed') && (
                    <div className="live-container">
                        {/* Huge Scoreboard */}
                        <div className={`huge-scoreboard ${match.status === 'Completed' ? 'completed' : ''} ${match.isSuperOver ? 'super-over-active' : ''}`}>
                            <div className="huge-inning">
                                {match.status === 'Completed' ? 'Match Completed' : match.isSuperOver ? `Super Over Inning ${match.currentInning}` : `Innings ${match.currentInning}`}
                            </div>
                            <div className="huge-score">
                                {match.isSuperOver
                                    ? (match.currentInning === 1 ? match.superOver?.inning1?.runs : match.superOver?.inning2?.runs)
                                    : score.runs}
                                <span className="huge-wickets">/ {match.isSuperOver
                                    ? (match.currentInning === 1 ? match.superOver?.inning1?.wickets : match.superOver?.inning2?.wickets)
                                    : score.wickets}</span>
                            </div>
                            <div className="huge-overs">
                                Overs: <span>{match.isSuperOver
                                    ? (match.currentInning === 1 ? match.superOver?.inning1?.overs : match.superOver?.inning2?.overs)
                                    : score.overs}</span>
                                {match.currentInning === 2 && match.status !== 'Completed' && (
                                    <span style={{ marginLeft: 16, borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 16 }}>
                                        Target: <b>{match.target}</b>
                                    </span>
                                )}
                            </div>
                            {match.status === 'Completed' ? (
                                <div className="huge-batting-team" style={{ color: '#fbbf24', fontSize: 20 }}>
                                    🏆 {match.result?.winningTeam?.name ? `${match.result.winningTeam.name} ${match.result.margin}` : match.result?.margin}
                                </div>
                            ) : (
                                <div className="huge-batting-team">
                                    🏏 {match.battingTeam?.name} is batting.
                                </div>
                            )}

                            {/* Current Players Mini-Table (Only if Live) */}
                            {match.status === 'Live' && (
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

                        {/* Controls / Modals */}
                        {match.status === 'Completed' ? (
                            <div className="pd-completed-actions">
                                {match.result.margin === 'Match Tied' && !match.isSuperOver && (
                                    <button className="pd-cta-primary super-over-btn" onClick={handleStartSuperOver}>
                                        <Swords size={20} /> START SUPER OVER
                                    </button>
                                )}
                                <Link href={`/dashboard/organizer/tournaments/${tournamentId}`} className="pd-cta-secondary" style={{ textDecoration: 'none' }}>
                                    <ArrowLeft size={18} /> Back to Tournament
                                </Link>
                            </div>
                        ) : (match.isSuperOver
                            ? ((match.currentInning === 1 && (match.superOver.inning1.wickets >= 2 || match.superOver.inning1.overs >= 1)) ||
                                (match.currentInning === 2 && (match.superOver.inning2.wickets >= 2 || match.superOver.inning2.overs >= 1)))
                            : (score.wickets >= 10 || score.overs >= match.overs)) ? (
                            <div className="toss-container" style={{ marginTop: 24, border: '1px solid #10b981', textAlign: 'center' }}>
                                <h2 className="toss-title" style={{ justifyContent: 'center', color: '#10b981' }}><Trophy size={24} /> Innings Complete!</h2>
                                <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 20 }}>
                                    {match.battingTeam?.name} scored <b>
                                        {match.isSuperOver
                                            ? (match.currentInning === 1 ? match.superOver.inning1.runs : match.superOver.inning2.runs)
                                            : score.runs}/{match.isSuperOver
                                                ? (match.currentInning === 1 ? match.superOver.inning1.wickets : match.superOver.inning2.wickets)
                                                : score.wickets}</b> in <b>{match.isSuperOver
                                                    ? (match.currentInning === 1 ? match.superOver.inning1.overs : match.superOver.inning2.overs)
                                                    : score.overs}</b> overs.
                                </p>
                                {match.currentInning === 1 && (
                                    <button className="pd-cta-primary innings-btn" onClick={handleSwitchInning} disabled={actionLoading}>
                                        {actionLoading ? <Loader2 className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                                        START 2ND INNINGS
                                    </button>
                                )}
                            </div>
                        ) : needsNewBowler ? (
                            <div className="toss-container" style={{ marginTop: 24, border: '1px solid #3b82f6' }}>
                                <h2 className="toss-title"><Shield size={20} color="#3b82f6" /> Over Complete!</h2>
                                <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 20 }}>
                                    Select the next bowler. The strike has been automatically rotated.
                                </p>
                                <div className="toss-group">
                                    <select value={nextBowler} onChange={e => setNextBowler(e.target.value)} className="toss-input">
                                        <option value="">Select Next Bowler...</option>
                                        {match.bowlingTeam?.players?.filter((p: any) => p.name !== match.activePlayers.bowler).map((p: any) => (
                                            <option key={p.name} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button className="start-match-btn" onClick={handleNewOver} disabled={settingPlayers} style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}>
                                    {settingPlayers ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" size={16} />}
                                    START NEXT OVER
                                </button>
                            </div>
                        ) : pendingWicket ? (
                            <div className="toss-container" style={{ marginTop: 24, border: '1px solid #ef4444' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                    <h2 className="toss-title" style={{ margin: 0, color: '#ef4444' }}><AlertCircle size={20} /> Wicket Fallen!</h2>
                                    <button onClick={() => setPendingWicket(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Cancel</button>
                                </div>

                                <div className="toss-group">
                                    <label>Who got out?</label>
                                    <div className="toss-options">
                                        <button className={`toss-btn ${dismissedPlayer === match.activePlayers.striker ? 'active' : ''}`} onClick={() => setDismissedPlayer(match.activePlayers.striker)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span>{match.activePlayers.striker} (Striker)</span>
                                            <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{strikerStats.batRuns} runs ({strikerStats.batBalls} balls)</span>
                                        </button>
                                        <button className={`toss-btn ${dismissedPlayer === match.activePlayers.nonStriker ? 'active' : ''}`} onClick={() => setDismissedPlayer(match.activePlayers.nonStriker)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <span>{match.activePlayers.nonStriker} (Non-Striker)</span>
                                            <span style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{nonStrikerStats.batRuns} runs ({nonStrikerStats.batBalls} balls)</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="toss-group">
                                    <label>Dismissal Type</label>
                                    <select value={wicketType} onChange={e => setWicketType(e.target.value)} className="toss-input">
                                        <option value="bowled">Bowled</option>
                                        <option value="caught">Caught</option>
                                        <option value="lbw">LBW</option>
                                        <option value="run out">Run Out</option>
                                        <option value="stumped">Stumped</option>
                                        <option value="hit wicket">Hit Wicket</option>
                                    </select>
                                </div>

                                <div className="toss-group">
                                    <label style={{ color: '#60a5fa' }}>New Batsman</label>
                                    <select value={newBatsman} onChange={e => setNewBatsman(e.target.value)} className="toss-input" style={{ borderColor: '#3b82f6' }}>
                                        <option value="">Select incoming batsman...</option>
                                        {match.battingTeam?.players?.filter((p: any) =>
                                            p.name !== match.activePlayers.striker &&
                                            p.name !== match.activePlayers.nonStriker &&
                                            !(match.isSuperOver
                                                ? (match.currentInning === 1 ? match.superOver.inning1.dismissedPlayers : match.superOver.inning2.dismissedPlayers)
                                                : (score.dismissedPlayers || [])).includes(p.name)
                                        ).map((p: any) => (
                                            <option key={p.name} value={p.name}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <button className="start-match-btn" onClick={submitWicket} disabled={scoringBall} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                                    {scoringBall ? <Loader2 className="animate-spin" /> : <CheckCircle2 fill="currentColor" size={16} />}
                                    CONFIRM WICKET
                                </button>
                            </div>
                        ) : (
                            <div className="scoring-pad">
                                <h3 style={{ marginBottom: 16, color: '#f8fafc', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Play size={16} color="#ef4444" /> Standard Delivery
                                </h3>
                                <div className="run-buttons">
                                    {[0, 1, 2, 3, 4, 6].map(r => (
                                        <button key={r} disabled={scoringBall} className={`run-btn run-${r}`} onClick={() => handleScoreBall(r)}>
                                            {r} {r === 4 || r === 6 ? '🔥' : ''}
                                        </button>
                                    ))}
                                </div>

                                <h3 style={{ margin: '24px 0 16px', color: '#f8fafc', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <AlertCircle size={16} color="#eab308" /> Extras & Wickets
                                </h3>
                                <div className="extra-buttons">
                                    <button disabled={scoringBall} className="extra-btn" onClick={() => handleScoreBall(0, 1, 'wd')}>WD</button>
                                    <button disabled={scoringBall} className="extra-btn" onClick={() => handleScoreBall(0, 1, 'nb')}>NB</button>
                                    <button disabled={scoringBall} className="extra-btn" onClick={() => handleScoreBall(1, 0, 'b')}>BYE</button>
                                    <button disabled={scoringBall} className="extra-btn" onClick={() => handleScoreBall(1, 0, 'lb')}>L-BYE</button>
                                    <button disabled={scoringBall} className="wicket-btn" onClick={triggerWicket}>WICKET</button>
                                </div>
                            </div>
                        )}

                        {/* Mini Scorecard for Organizer */}
                        {match.status !== 'Scheduled' && (
                            <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Trophy size={18} color="#fbbf24" /> Mini Scorecard
                                </h3>

                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#22c55e', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        BATTING: {match.battingTeam?.name}
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <th style={{ padding: '10px 16px' }}>Batter</th>
                                                <th style={{ padding: '10px 8px' }}>R</th>
                                                <th style={{ padding: '10px 8px' }}>B</th>
                                                <th style={{ padding: '10px 8px' }}>4s</th>
                                                <th style={{ padding: '10px 8px' }}>6s</th>
                                                <th style={{ padding: '10px 8px' }}>SR</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isPlayersSet && [match.activePlayers.striker, match.activePlayers.nonStriker].map(name => {
                                                const stats = pStats[name] || { batRuns: 0, batBalls: 0, batFours: 0, batSixes: 0 };
                                                return (
                                                    <tr key={name} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                        <td style={{ padding: '10px 16px', fontWeight: 600 }}>{name} {name === match.activePlayers.striker && '🏏'}</td>
                                                        <td style={{ padding: '10px 8px', fontWeight: 700 }}>{stats.batRuns}</td>
                                                        <td style={{ padding: '10px 8px', color: '#94a3b8' }}>{stats.batBalls}</td>
                                                        <td style={{ padding: '10px 8px' }}>{stats.batFours || 0}</td>
                                                        <td style={{ padding: '10px 8px' }}>{stats.batSixes || 0}</td>
                                                        <td style={{ padding: '10px 8px', color: '#64748b' }}>{stats.batBalls > 0 ? ((stats.batRuns / stats.batBalls) * 100).toFixed(1) : '0.0'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 16px', fontSize: 12, fontWeight: 700, color: '#3b82f6', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        BOWLING: {match.bowlingTeam?.name}
                                    </div>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                                        <thead>
                                            <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <th style={{ padding: '10px 16px' }}>Bowler</th>
                                                <th style={{ padding: '10px 8px' }}>O</th>
                                                <th style={{ padding: '10px 8px' }}>M</th>
                                                <th style={{ padding: '10px 8px' }}>R</th>
                                                <th style={{ padding: '10px 8px' }}>W</th>
                                                <th style={{ padding: '10px 8px' }}>Econ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {isPlayersSet && [match.activePlayers.bowler].map(name => {
                                                const stats = pStats[name] || { bowlRuns: 0, bowlBalls: 0, bowlWickets: 0, bowlMaidens: 0 };
                                                return (
                                                    <tr key={name} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                                        <td style={{ padding: '10px 16px', fontWeight: 600 }}>{name} 🎯</td>
                                                        <td style={{ padding: '10px 8px' }}>{formatOvers(stats.bowlBalls)}</td>
                                                        <td style={{ padding: '10px 8px' }}>0</td>
                                                        <td style={{ padding: '10px 8px' }}>{stats.bowlRuns}</td>
                                                        <td style={{ padding: '10px 8px', fontWeight: 700, color: '#3b82f6' }}>{stats.bowlWickets}</td>
                                                        <td style={{ padding: '10px 8px', color: '#64748b' }}>{stats.bowlBalls > 0 ? ((stats.bowlRuns / (stats.bowlBalls / 6))).toFixed(2) : '0.00'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style>{`
                .pd-shell { min-height: 100vh; background: #080c18; color: #f8fafc; font-family: 'Inter', sans-serif; }
                .pd-navbar { position: sticky; top: 0; z-index: 100; background: rgba(8,12,24,0.92); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(255,255,255,0.05); }
                .pd-navbar-inner { max-width: 1200px; margin: 0 auto; padding: 14px 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
                .pd-back-btn { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.05); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; width: 100px; justify-content: center; }
                .pd-back-btn:hover { background: rgba(255,255,255,0.1); }
                .pd-brand { display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 16px; }
                .pd-content { margin: 0 auto; padding: 24px 16px; }

                /* Header */
                .score-header { background: linear-gradient(135deg, rgba(13,20,36,0.9), rgba(10,16,32,0.8)); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 20px; margin-bottom: 24px; }
                .score-teams { display: flex; align-items: center; justify-content: space-between; }
                .score-team { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
                .score-logo { width: 50px; height: 50px; border-radius: 12px; background: #1e293b; display: flex; align-items: center; justify-content: center; font-size: 24px; overflow: hidden; }
                .score-logo img { width: 100%; height: 100%; object-fit: cover; }
                .score-name { font-weight: 800; font-size: 15px; text-align: center; }
                .score-vs { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; color: #64748b; }

                /* Toss */
                .toss-container { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 24px; border-radius: 20px; }
                .toss-title { font-size: 18px; font-weight: 800; margin-bottom: 24px; display: flex; align-items: center; gap: 8px; color: #e2e8f0; }
                .toss-group { margin-bottom: 20px; }
                .toss-group label { display: block; font-size: 13px; font-weight: 700; color: #94a3b8; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em; }
                .toss-options { display: flex; gap: 10px; }
                .toss-btn { flex: 1; padding: 12px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #f8fafc; font-weight: 700; cursor: pointer; transition: all 0.2s; }
                .toss-btn.active { background: rgba(59,130,246,0.15); border-color: #3b82f6; color: #60a5fa; box-shadow: 0 0 20px rgba(59,130,246,0.2); }
                .toss-input { display: block; width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 12px; border-radius: 12px; color: white; font-family: inherit; margin-bottom: 10px; }
                .toss-input:focus { outline: none; border-color: #3b82f6; }
                
                .start-match-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; font-weight: 800; padding: 16px; border-radius: 14px; border: none; font-size: 15px; cursor: pointer; transition: all 0.2s; margin-top: 10px; }
                .start-match-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(239,68,68,0.4); }

                /* Premium Action Buttons */
                .pd-completed-actions { display: flex; flex-direction: column; gap: 16px; align-items: center; margin-top: 24px; padding: 32px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 24px; backdrop-filter: blur(10px); }
                .pd-cta-primary { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; max-width: 320px; margin: 0 auto; padding: 18px 32px; border-radius: 16px; border: none; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); color: white; background: #3b82f6; box-shadow: 0 10px 30px rgba(59,130,246,0.3); }
                .pd-cta-primary.super-over-btn { background: linear-gradient(135deg, #ef4444, #b91c1c); box-shadow: 0 10px 40px rgba(239,68,68,0.3); }
                .pd-cta-primary.innings-btn { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 10px 40px rgba(16,185,129,0.3); }
                .pd-cta-primary:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 20px 50px rgba(239,68,68,0.5); }
                .pd-cta-primary:active { transform: translateY(-2px) scale(1); }
                
                .pd-cta-secondary { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; max-width: 320px; padding: 16px 32px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #e2e8f0; font-size: 15px; font-weight: 700; cursor: pointer; transition: all 0.3s; backdrop-filter: blur(5px); }
                .pd-cta-secondary:hover { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); color: #fff; transform: translateY(-2px); }
                
                @media (min-width: 640px) {
                    .pd-completed-actions { flex-direction: row; justify-content: center; }
                    .pd-cta-primary, .pd-cta-secondary { width: auto; }
                }

                /* Live Scoreboard */
                .live-container { display: flex; flex-direction: column; gap: 24px; }
                .huge-scoreboard { background: radial-gradient(circle at top, rgba(34,197,94,0.15), rgba(8,12,24,0.9)); border: 1px solid rgba(34,197,94,0.3); border-radius: 24px; padding: 40px 20px; text-align: center; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .huge-scoreboard.completed { background: radial-gradient(circle at top, rgba(251,191,36,0.15), rgba(8,12,24,0.9)); border: 1px solid rgba(251,191,36,0.3); }
                .huge-scoreboard.super-over-active { background: radial-gradient(circle at top, rgba(239,68,68,0.15), rgba(8,12,24,0.9)); border: 1px solid rgba(239,68,68,0.3); }
                .huge-inning { font-size: 12px; font-weight: 800; color: #22c55e; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px; background: rgba(34,197,94,0.1); display: inline-block; padding: 4px 12px; border-radius: 100px; border: 1px solid rgba(34,197,94,0.2); }
                .huge-scoreboard.completed .huge-inning { color: #fbbf24; background: rgba(251,191,36,0.1); border-color: rgba(251,191,36,0.2); }
                .huge-scoreboard.super-over-active .huge-inning { color: #ef4444; background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); }
                .huge-score { font-size: clamp(4rem, 15vw, 6rem); font-weight: 900; line-height: 1; color: #fff; text-shadow: 0 0 40px rgba(34,197,94,0.4); display: flex; align-items: baseline; justify-content: center; gap: 5px; }
                .huge-scoreboard.completed .huge-score { text-shadow: 0 0 40px rgba(251,191,36,0.4); }
                .huge-wickets { font-size: clamp(2rem, 8vw, 3rem); color: #cbd5e1; }
                .huge-overs { font-size: 18px; font-weight: 600; color: #94a3b8; margin-top: 10px; }
                .huge-overs span { color: #f8fafc; font-weight: 800; font-size: 22px; }
                .huge-batting-team { margin-top: 20px; font-size: 15px; font-weight: 700; color: #f8fafc; display: flex; align-items: center; justify-content: center; gap: 8px; }

                /* Controls */
                .scoring-pad { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 20px; }
                .run-buttons { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
                .run-btn { aspect-ratio: 2/1; border-radius: 14px; border: none; font-size: 22px; font-weight: 900; color: white; cursor: pointer; transition: all 0.1s; display: flex; align-items: center; justify-content: center; gap: 4px; }
                .run-btn:active { transform: scale(0.95); }
                .run-0 { background: #334155; }
                .run-1 { background: #1e293b; border: 1px solid #334155; }
                .run-2 { background: #1e293b; border: 1px solid #475569; }
                .run-3 { background: #1e293b; border: 1px solid #64748b; }
                .run-4 { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 4px 15px rgba(59,130,246,0.4); }
                .run-6 { background: linear-gradient(135deg, #a855f7, #7c3aed); box-shadow: 0 4px 15px rgba(168,85,247,0.4); }

                .extra-buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
                .extra-btn { background: #1e293b; border: 1px solid rgba(255,255,255,0.1); color: #cbd5e1; font-weight: 800; font-size: 13px; padding: 14px 0; border-radius: 12px; cursor: pointer; transition: background 0.1s; }
                .extra-btn:active { background: #334155; }
                .wicket-btn { grid-column: span 4; background: linear-gradient(135deg, #ef4444, #dc2626); color: white; font-weight: 900; font-size: 18px; padding: 16px; border-radius: 14px; border: none; cursor: pointer; margin-top: 10px; box-shadow: 0 8px 25px rgba(239,68,68,0.4); }
                .wicket-btn:active { transform: scale(0.98); }
                
                @media (min-width: 640px) {
                    .run-btn { aspect-ratio: auto; padding: 20px; font-size: 28px; }
                }
            `}</style>
        </div>
    );
}

export default function MatchScoringPage() {
    return (
        <ProtectedRoute allowedRoles={['organizer', 'admin']}>
            <MatchScoringContent />
        </ProtectedRoute>
    );
}
