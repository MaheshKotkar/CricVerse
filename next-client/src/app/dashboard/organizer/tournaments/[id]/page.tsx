"use client";
import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, MapPin, Play, ArrowLeft, Loader2, CheckCircle2, Activity, Info } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../../../../utils/api';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import PointsTable from '../../../../../components/PointsTable';
import { getImageUrl } from '../../../../../utils/imageUrl';

function TournamentDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [availableTeams, setAvailableTeams] = useState<any[]>([]);
    const [showAddTeam, setShowAddTeam] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState('');

    // Match State
    const [matches, setMatches] = useState<any[]>([]);
    const [showCreateMatch, setShowCreateMatch] = useState(false);
    const [newMatch, setNewMatch] = useState({ teamA: '', teamB: '', date: '', venue: '' });

    // Cancellation State
    const [cancelModalVisible, setCancelModalVisible] = useState(false);
    const [cancelingMatchId, setCancelingMatchId] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');
    const cancellationReasons = [
        "Heavy rain",
        "Poor visibility due to fog",
        "Wet outfield that is unsafe for players",
        "Poor lighting in stadiums without floodlights",
        "Thunderstorms or lightning",
        "Other (Custom Reason)"
    ];

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                const [tRes, teamRes, mRes] = await Promise.all([
                    api.get(`/tournaments/${id}`),
                    api.get('/teams'),
                    api.get(`/tournaments/${id}/matches`)
                ]);
                setData(tRes.data.data);
                setAvailableTeams(teamRes.data.data);
                setMatches(mRes.data.data);
            } catch (err: any) {
                console.error("Failed to fetch tournament details", err);
                toast.error("Failed to load tournament data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, [id]);

    const handleStartTournament = () => {
        toast.custom((t) => (
            <div className="glass-panel" style={{ width: 340, padding: 24, background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: 18, fontWeight: 900 }}>Start Tournament?</h3>
                <p style={{ margin: '0 0 20px 0', fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
                    Are you sure you want to start <b>{data.name}</b>? Teams cannot be removed once started.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button onClick={() => toast.dismiss(t.id)} className="status-badge" style={{ cursor: 'pointer' }}>Cancel</button>
                    <button onClick={() => { toast.dismiss(t.id); confirmStartTournament(); }} className="tdetail-start-btn" style={{ padding: '8px 16px', borderRadius: 10 }}>Start</button>
                </div>
            </div>
        ), { duration: Infinity });
    };

    const confirmStartTournament = async () => {
        setActionLoading(true);
        const loadingToast = toast.loading('Starting tournament...');
        try {
            const res = await api.patch(`/tournaments/${id}/start`);
            setData(res.data.data);
            toast.success('Tournament started!', { id: loadingToast });
        } catch {
            toast.error('Failed to start tournament', { id: loadingToast });
        } finally {
            setActionLoading(false);
        }
    };

    const handleAddTeam = async () => {
        if (!selectedTeam) return;
        setActionLoading(true);
        try {
            await api.post(`/tournaments/${id}/teams`, { teamIds: [selectedTeam] });
            const tRes = await api.get(`/tournaments/${id}`);
            setData(tRes.data.data);
            setShowAddTeam(false);
            setSelectedTeam('');
            toast.success('Team added successfully!');
        } catch {
            toast.error('Failed to add team');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMatch.teamA === newMatch.teamB) {
            return toast.error("Teams cannot play against themselves");
        }
        setActionLoading(true);
        const loadingToast = toast.loading('Scheduling Match...');
        try {
            const res = await api.post(`/tournaments/${id}/matches`, newMatch);
            setMatches(prev => [...prev, res.data.data]);
            toast.success('Match Scheduled!', { id: loadingToast });
            setShowCreateMatch(false);
            setNewMatch({ teamA: '', teamB: '', date: '', venue: '' });
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to schedule match', { id: loadingToast });
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancelMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cancelingMatchId || !cancelReason) return;
        setActionLoading(true);
        const loadingToast = toast.loading('Cancelling Match...');
        try {
            await api.patch(`/matches/${cancelingMatchId}/cancel`, { reason: cancelReason });
            setMatches(prev => prev.map(m => m._id === cancelingMatchId ? { ...m, status: 'Cancelled' } : m));
            toast.success('Match Cancelled!', { id: loadingToast });
            setCancelModalVisible(false);
            setCancelingMatchId(null);
            setCancelReason('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to cancel match', { id: loadingToast });
        } finally {
            setActionLoading(false);
        }
    };

    const getTeamColor = (name: string) => {
        if (!name) return '#f8fafc';
        const colors = ['#60a5fa', '#f87171', '#fbbf24', '#34d399', '#a78bfa', '#f472b6', '#fb923c', '#2dd4bf'];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#080c18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" color="#3b82f6" size={40} />
        </div>
    );

    if (!data) return (
        <div style={{ minHeight: '100vh', background: '#080c18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8fafc' }}>
            Tournament not found
        </div>
    );

    return (
        <div className="premium-bg">
            <style>{`
                .premium-bg { min-height: 100vh; background: radial-gradient(circle at top left, #0f172a, #080c18); color: #f8fafc; padding-bottom: 80px; }
                .td-container { max-width: 1200px; margin: 0 auto; padding: 40px 24px; }
                
                .back-btn { 
                    display: inline-flex; align-items: center; gap: 10px; color: #94a3b8; text-decoration: none; 
                    margin-bottom: 32px; font-size: 14px; font-weight: 700; transition: color 0.2s;
                }
                .back-btn:hover { color: #3b82f6; }

                /* Header Card */
                .t-header-card {
                    background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 32px; padding: 40px; margin-bottom: 40px;
                    display: flex; justify-content: space-between; align-items: flex-end;
                    backdrop-filter: blur(20px); box-shadow: 0 20px 50px rgba(0,0,0,0.3);
                }
                .t-header-main { flex: 1; }
                .t-badges { display: flex; gap: 12px; margin-bottom: 20px; }
                .status-badge {
                    display: inline-flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 900;
                    padding: 6px 16px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em;
                    background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .status-badge.active { color: #22c55e; border-color: rgba(34, 197, 94, 0.3); background: rgba(34, 197, 94, 0.1); }
                .status-badge.live { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.1); }
                .status-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
                .format-badge {
                    font-size: 11px; font-weight: 900; padding: 6px 16px; border-radius: 100px;
                    background: rgba(255, 255, 255, 0.05); color: #94a3b8; text-transform: uppercase;
                }
                .t-title { font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 900; line-height: 1.1; margin: 0 0 20px 0; letter-spacing: -0.02em; }
                .t-meta { display: flex; flex-wrap: wrap; gap: 24px; }
                .meta-item { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-weight: 600; font-size: 15px; }
                .icon-blue { color: #3b82f6; }

                .t-actions-box { padding: 20px; background: rgba(0,0,0,0.2); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.05); display: flex; flex-direction: column; gap: 12px; }
                .tdetail-start-btn {
                    background: linear-gradient(135deg, #22c55e, #16a34a); color: #000; border: none;
                    border-radius: 14px; padding: 14px 24px; font-weight: 800; cursor: pointer;
                    display: flex; align-items: center; gap: 10px; font-size: 15px;
                    box-shadow: 0 8px 24px rgba(34,197,94,0.3); transition: all 0.2s;
                }
                .tdetail-start-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(34,197,94,0.4); }

                /* Grid System */
                .org-main-grid { display: grid; grid-template-columns: 1fr 360px; gap: 40px; align-items: start; }
                .dashboard-section { margin-bottom: 48px; }
                .section-header { margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; }
                .header-title { display: flex; align-items: center; gap: 16px; }
                .header-title h2 { font-size: 24px; font-weight: 900; margin: 0; }
                .icon-bg { 
                    width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                }
                .icon-bg.blue { background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; }
                .icon-bg.yellow { background: linear-gradient(135deg, #facc15, #eab308); color: #000; }
                
                .glass-panel { 
                    background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 32px; backdrop-filter: blur(10px); padding: 32px;
                }
                .glass-panel.no-padding { padding: 0; }

                /* Modals/Form styling */
                .premium-form-box { background: rgba(15, 22, 41, 0.8); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 24px; padding: 24px; margin-bottom: 24px; }
                .premium-input { width: 100%; padding: 14px; border-radius: 12px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: #fff; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
                .premium-input:focus { border-color: #3b82f6; }
                
                .add-btn { background: #3b82f6; color: #fff; border: none; border-radius: 12px; padding: 12px 24px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
                .add-btn:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); }

                /* Responsiveness */
                @media (max-width: 1024px) { .org-main-grid { grid-template-columns: 1fr; } }
                @media (max-width: 768px) {
                    .t-header-card { flex-direction: column; align-items: flex-start; gap: 32px; padding: 28px; }
                    .t-actions-box { width: 100%; }
                    .header-title h2 { font-size: 20px; }
                    .td-container { padding: 32px 20px; }
                }
                @media (max-width: 480px) {
                    .td-container { padding: 20px 16px; }
                    .t-title { font-size: 2.2rem; }
                }
            `}</style>

            <div className="td-container">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <Link href="/dashboard/organizer" className="back-btn">
                        <ArrowLeft size={16} /> <span>Back to Dashboard</span>
                    </Link>
                </motion.div>

                {/* Tournament Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="t-header-card">
                    <div className="t-header-main">
                        <div className="t-badges">
                            <span className={`status-badge ${data.status.toLowerCase() === 'active' ? 'active' : ''}`}>
                                <span className="dot"></span> {data.status}
                            </span>
                            <span className="format-badge">{data.format}</span>
                        </div>
                        <h1 className="t-title">{data.name}</h1>
                        <div className="t-meta">
                            <div className="meta-item">
                                <Calendar size={18} className="icon-blue" />
                                <span>{new Date(data.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                            </div>
                            <div className="meta-item">
                                <MapPin size={18} className="icon-blue" />
                                <span>{data.venue || 'Multiple Venues'}</span>
                            </div>
                        </div>
                    </div>

                    {data.status === 'Draft' && (
                        <div className="t-actions-box">
                            <button
                                onClick={handleStartTournament}
                                disabled={actionLoading || data.teams.length < 2}
                                className="tdetail-start-btn"
                                style={{ opacity: (actionLoading || data.teams.length < 2) ? 0.6 : 1 }}
                            >
                                {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <><Play size={18} fill="currentColor" /> Start Tournament</>}
                            </button>
                            {data.teams.length < 2 && <p style={{ fontSize: 11, color: '#ef4444', margin: 0, textAlign: 'center', fontWeight: 700 }}>Add at least 2 teams to start</p>}
                        </div>
                    )}
                </motion.div>

                {/* Body Grid */}
                <div className="org-main-grid">
                    <div className="org-left-col">
                        {/* Participating Teams */}
                        <section className="dashboard-section">
                            <div className="section-header">
                                <div className="header-title">
                                    <div className="icon-bg blue">
                                        <Users size={20} />
                                    </div>
                                    <h2>Participating Teams</h2>
                                    <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 900 }}>{data.teams.length}</span>
                                </div>
                                <button onClick={() => setShowAddTeam(!showAddTeam)} className="add-btn" style={{ fontSize: 12, padding: '8px 16px' }}>
                                    {showAddTeam ? 'Cancel' : '+ Add Team'}
                                </button>
                            </div>

                            {showAddTeam && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="premium-form-box">
                                    <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 12, fontWeight: 700 }}>Select a team to add:</label>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        <select
                                            value={selectedTeam}
                                            onChange={(e) => setSelectedTeam(e.target.value)}
                                            className="premium-input"
                                            style={{ flex: 1, minWidth: 200 }}
                                        >
                                            <option value="">Choose a team...</option>
                                            {availableTeams.filter(team => !data.teams.find((t: any) => (t._id || t) === team._id)).map(team => (
                                                <option key={team._id} value={team._id}>{team.name}</option>
                                            ))}
                                        </select>
                                        <button onClick={handleAddTeam} disabled={!selectedTeam || actionLoading} className="add-btn">
                                            {actionLoading ? <Loader2 className="animate-spin" size={18} /> : 'Add Team'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            <div className="glass-panel no-padding overflow-hidden">
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 1, background: 'rgba(255,255,255,0.05)' }}>
                                    {data.teams.length > 0 ? data.teams.map((team: any, index: number) => (
                                        <div key={team._id || index} style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#0f172a', padding: '24px' }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                                {team.logo ? <img src={getImageUrl(team.logo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Info size={20} color="#475569" />}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: 15, fontWeight: 800, color: getTeamColor(team.name) }}>{team.name}</div>
                                                <div style={{ fontSize: 12, color: '#475569', fontWeight: 700 }}>{team.players?.length || 0} Players</div>
                                            </div>
                                            <CheckCircle2 size={18} color="#22c55e" />
                                        </div>
                                    )) : (
                                        <div style={{ padding: 60, textAlign: 'center', background: '#0f172a', gridColumn: '1 / -1' }}>
                                            <Info size={32} color="#334155" style={{ margin: '0 auto 16px' }} />
                                            <p style={{ color: '#475569', fontSize: 14, fontWeight: 700 }}>Tournament requires at least 2 teams.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Points Table Section */}
                        {data.status === 'Active' && (
                            <section className="dashboard-section">
                                <div className="section-header">
                                    <div className="header-title">
                                        <div className="icon-bg yellow">
                                            <Trophy size={18} />
                                        </div>
                                        <h2>Points Table</h2>
                                    </div>
                                </div>
                                <div className="glass-panel no-padding overflow-hidden">
                                    <div style={{ padding: '8px 20px 24px' }}>
                                        <PointsTable tournamentId={id} />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Matches List */}
                        {data.status === 'Active' && (
                            <section className="dashboard-section">
                                <div className="section-header">
                                    <div className="header-title">
                                        <div className="icon-bg blue">
                                            <Activity size={20} />
                                        </div>
                                        <h2>Scheduled Matches</h2>
                                        <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 900 }}>{matches.length}</span>
                                    </div>
                                </div>

                                {matches.length === 0 ? (
                                    <div className="glass-panel" style={{ padding: 48, textAlign: 'center' }}>
                                        <Activity size={40} color="#334155" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
                                        <p style={{ color: '#475569', fontSize: 15, fontWeight: 700 }}>No matches scheduled yet.</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {matches.map((m: any) => (
                                            <div key={m._id} className="glass-panel" style={{ padding: 24 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div className={`status-badge ${m.status.toLowerCase() === 'live' ? 'live' : ''}`}>
                                                            <span className="dot"></span> {m.status}
                                                        </div>
                                                        <div className="meta-item" style={{ fontSize: 12 }}>
                                                            <Calendar size={14} /> {new Date(m.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: 8 }}>
                                                        {(m.status === 'Scheduled' || m.status === 'Live') && (
                                                            <button onClick={() => { setCancelingMatchId(m._id); setCancelModalVisible(true); }} className="status-badge" style={{ cursor: 'pointer', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444' }}>Cancel</button>
                                                        )}
                                                        {(m.status === 'Scheduled' || m.status === 'Live') && (
                                                            <Link href={`/dashboard/organizer/tournaments/${data._id}/matches/${m._id}/score`}>
                                                                <button className="tdetail-start-btn" style={{ padding: '8px 16px', fontSize: 12 }}>
                                                                    <Play size={14} fill="currentColor" /> {m.status === 'Live' ? 'Scoring' : 'Start'}
                                                                </button>
                                                            </Link>
                                                        )}
                                                        {m.status === 'Completed' && (
                                                            <Link href={`/dashboard/organizer/matches/${m._id}`}>
                                                                <button className="status-badge" style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: '#fff' }}>Scorecard</button>
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                                                    {/* Team A */}
                                                    <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'center' }}>
                                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                {m.teamA?.logo ? (
                                                                    <img src={getImageUrl(m.teamA.logo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <Users size={20} color="#475569" />
                                                                )}
                                                            </div>
                                                            <div style={{ fontSize: 16, fontWeight: 900, color: getTeamColor(m.teamA?.name), textAlign: 'center' }}>{m.teamA?.name}</div>
                                                        </div>
                                                        {m.status === 'Completed' && (
                                                            <div style={{ fontSize: 24, fontWeight: 950, color: m.result?.winningTeam?._id === m.teamA?._id ? '#22c55e' : '#94a3b8' }}>
                                                                {m.isSuperOver ? m.superOver?.inning1?.runs : m.score?.inning1?.runs || 0}
                                                                <span style={{ fontSize: 12, opacity: 0.5, marginLeft: 4 }}>({m.score?.inning1?.overs})</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div style={{ fontSize: 10, fontWeight: 900, color: '#475569', background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: 12 }}>VS</div>

                                                    {/* Team B */}
                                                    <div style={{ flex: 1, minWidth: 140, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', justifyContent: 'center' }}>
                                                            <div style={{ fontSize: 16, fontWeight: 900, color: getTeamColor(m.teamB?.name), textAlign: 'center' }}>{m.teamB?.name}</div>
                                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                {m.teamB?.logo ? (
                                                                    <img src={getImageUrl(m.teamB.logo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                                ) : (
                                                                    <Users size={20} color="#475569" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        {m.status === 'Completed' && (
                                                            <div style={{ fontSize: 24, fontWeight: 950, color: m.result?.winningTeam?._id === m.teamB?._id ? '#22c55e' : '#94a3b8' }}>
                                                                {m.isSuperOver ? m.superOver?.inning2?.runs : m.score?.inning2?.runs || 0}
                                                                <span style={{ fontSize: 12, opacity: 0.5, marginLeft: 4 }}>({m.score?.inning2?.overs})</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                {(m.status === 'Completed' || m.result?.margin) && (
                                                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                                        <span style={{ color: '#facc15', fontSize: 13, fontWeight: 900 }}>🏆 {m.result?.margin}</span>
                                                    </div>
                                                )}
                                                {m.venue && (
                                                    <div style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                                        <MapPin size={12} /> {m.venue}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="org-sidebar">
                        <section className="dashboard-section">
                            <div className="section-header">
                                <h3 style={{ fontSize: 18, fontWeight: 900 }}>Tournament Info</h3>
                            </div>
                            <div className="glass-panel" style={{ padding: 24 }}>
                                <h4 style={{ fontSize: 11, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Description</h4>
                                <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>{data.description || 'No description provided.'}</p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 12 }}>
                                    <span style={{ color: '#475569', fontWeight: 700 }}>Created</span>
                                    <span style={{ fontWeight: 800 }}>{new Date(data.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                    <span style={{ color: '#475569', fontWeight: 700 }}>Winner</span>
                                    <span style={{ color: '#facc15', fontWeight: 900 }}>TBD 🏆</span>
                                </div>
                            </div>
                        </section>

                        {data.status === 'Active' && (
                            <section className="dashboard-section">
                                <div className="section-header">
                                    <h3 style={{ fontSize: 18, fontWeight: 900 }}>Live Controls</h3>
                                </div>
                                {!showCreateMatch ? (
                                    <div className="glass-panel" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                                        <button onClick={() => setShowCreateMatch(true)} className="tdetail-start-btn" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>Schedule Match</button>
                                        <button className="add-btn" style={{ width: '100%', background: 'rgba(59,130,246,0.1)', color: '#3b82f6', border: '1px solid rgba(59,130,246,0.2)' }}>Live Scoring 📈</button>
                                    </div>
                                ) : (
                                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="premium-form-box">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                                            <h4 style={{ margin: 0, color: '#3b82f6' }}>New Match</h4>
                                            <button onClick={() => setShowCreateMatch(false)} style={{ background: 'transparent', border: 'none', color: '#475569', fontSize: 12, fontWeight: 700 }}>Cancel</button>
                                        </div>
                                        <form onSubmit={handleCreateMatch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                            <select required value={newMatch.teamA} onChange={e => setNewMatch({ ...newMatch, teamA: e.target.value })} className="premium-input">
                                                <option value="">Select Team A</option>
                                                {data.teams.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                            </select>
                                            <div style={{ textAlign: 'center', fontSize: 10, fontWeight: 900, color: '#475569' }}>VS</div>
                                            <select required value={newMatch.teamB} onChange={e => setNewMatch({ ...newMatch, teamB: e.target.value })} className="premium-input">
                                                <option value="">Select Team B</option>
                                                {data.teams.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                            </select>
                                            <input type="datetime-local" required value={newMatch.date} onChange={e => setNewMatch({ ...newMatch, date: e.target.value })} className="premium-input" />
                                            <input type="text" placeholder="Venue" value={newMatch.venue} onChange={e => setNewMatch({ ...newMatch, venue: e.target.value })} className="premium-input" />
                                            <button type="submit" disabled={actionLoading} className="add-btn" style={{ width: '100%' }}>Schedule</button>
                                        </form>
                                    </motion.div>
                                )}
                            </section>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Match Modal */}
            {cancelModalVisible && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ width: '100%', maxWidth: 400, padding: 32 }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: 20, fontWeight: 900 }}>Cancel Match</h3>
                        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>Reason for cancellation:</p>
                        <form onSubmit={handleCancelMatch} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <select value={cancellationReasons.includes(cancelReason) ? cancelReason : 'Other (Custom Reason)'} onChange={e => setCancelReason(e.target.value === 'Other (Custom Reason)' ? '' : e.target.value)} className="premium-input">
                                {cancellationReasons.map((r, i) => <option key={i} value={r}>{r}</option>)}
                            </select>
                            {!cancellationReasons.includes(cancelReason) && (
                                <input type="text" placeholder="Custom reason..." value={cancelReason} onChange={e => setCancelReason(e.target.value)} className="premium-input" required autoFocus />
                            )}
                            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
                                <button type="button" onClick={() => { setCancelModalVisible(false); setCancelReason(''); }} className="status-badge" style={{ cursor: 'pointer' }}>Back</button>
                                <button type="submit" disabled={!cancelReason || actionLoading} className="add-btn" style={{ background: '#ef4444' }}>Confirm</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
}

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
    return (
        <ProtectedRoute allowedRoles={['organizer']}>
            <TournamentDetail params={params} />
        </ProtectedRoute>
    );
}
