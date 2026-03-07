"use client";
import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, MapPin, Play, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../../../../utils/api';
import ProtectedRoute from '../../../../../components/ProtectedRoute';

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

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '12px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#f8fafc',
        outline: 'none',
        fontSize: '14px',
        boxSizing: 'border-box'
    };

    useEffect(() => {
        if (!id) return; // wait until the param is resolved
        const fetchData = async () => {
            try {
                // Fetch tournament details
                const tRes = await api.get(`/tournaments/${id}`);
                setData(tRes.data.data);
            } catch (err: any) {
                console.error(`❌ GET /tournaments/${id} failed:`, err?.response?.status, err?.response?.data);
            }

            try {
                // Fetch available teams (independent — don't let this block the tournament view)
                const teamRes = await api.get('/teams');
                setAvailableTeams(teamRes.data.data);
            } catch (err: any) {
                console.error('❌ GET /teams failed:', err?.response?.status, err?.response?.data);
            }

            try {
                // Fetch Matches
                const mRes = await api.get(`/tournaments/${id}/matches`);
                setMatches(mRes.data.data);
            } catch (err: any) {
                console.error('❌ GET /matches failed:', err?.response?.status, err?.response?.data);
            }

            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handleStartTournament = () => {
        toast.custom((t) => (
            <div
                style={{
                    background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16,
                    padding: 24, display: 'flex', flexDirection: 'column', gap: 16, width: 340, maxWidth: '100%',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4)'
                }}
            >
                <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: 17, fontWeight: 800, color: '#f8fafc' }}>Start Tournament?</h3>
                    <p style={{ margin: 0, fontSize: 14, color: '#94a3b8', lineHeight: 1.5 }}>
                        Are you sure you want to start <b>{data.name}</b>? Once started, you cannot remove teams.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', color: '#f8fafc', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => { toast.dismiss(t.id); confirmStartTournament(); }}
                        style={{ padding: '8px 16px', borderRadius: 8, background: '#22c55e', color: '#000', border: 'none', cursor: 'pointer', fontWeight: 800 }}
                    >
                        Yes, Start
                    </button>
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
        } catch {
            toast.error('Failed to add team');
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateMatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMatch.teamA === newMatch.teamB) {
            return toast.error("A team cannot play against itself");
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

    if (loading) return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 className="animate-spin" color="#3b82f6" size={40} />
        </div>
    );

    if (!data) return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f8fafc' }}>
            Tournament not found
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc' }}>
            <div className="tdetail-container">
                <Link href="/dashboard/organizer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#94a3b8', textDecoration: 'none', marginBottom: 28, fontSize: 14, fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                {/* Header */}
                <div className="tdetail-header">
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                            <span style={{
                                fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap',
                                background: data.status === 'Active' ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.15)',
                                color: data.status === 'Active' ? '#22c55e' : '#94a3b8',
                                border: `1px solid ${data.status === 'Active' ? 'rgba(34,197,94,0.3)' : 'rgba(148,163,184,0.3)'}`
                            }}>● {data.status}</span>
                            <span style={{ color: '#475569', fontSize: 13, fontWeight: 600 }}>Format: {data.format}</span>
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.4rem, 5vw, 2.2rem)', fontWeight: 900, marginBottom: 10 }}>{data.name}</h1>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13 }}>
                                <Calendar size={15} /> {new Date(data.startDate).toLocaleDateString()}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13 }}>
                                <MapPin size={15} /> {data.venue || 'No venue set'}
                            </div>
                        </div>
                    </div>

                    {data.status === 'Draft' && (
                        <button
                            onClick={handleStartTournament}
                            disabled={actionLoading || data.teams.length < 2}
                            className="tdetail-start-btn"
                            style={{ opacity: (actionLoading || data.teams.length < 2) ? 0.6 : 1 }}
                        >
                            {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <><Play size={18} fill="currentColor" /> Start Tournament</>}
                        </button>
                    )}
                </div>

                {/* Body Grid */}
                <div className="tdetail-grid">
                    {/* Teams Section */}
                    <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                            <h2 style={{ fontSize: 17, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
                                <Users size={20} color="#3b82f6" /> Teams ({data.teams.length})
                            </h2>
                            <button onClick={() => setShowAddTeam(!showAddTeam)} style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                {showAddTeam ? 'Cancel' : '+ Add Team'}
                            </button>
                        </div>

                        {showAddTeam && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px', marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: 13, color: '#94a3b8', marginBottom: 10 }}>Select a team to add:</label>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    <select
                                        value={selectedTeam}
                                        onChange={(e) => setSelectedTeam(e.target.value)}
                                        style={{ flex: 1, minWidth: 160, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#f8fafc', padding: '10px', outline: 'none' }}
                                    >
                                        <option value="">Choose a team...</option>
                                        {availableTeams.filter(team => !data.teams.find((t: any) => (t._id || t) === team._id)).map(team => (
                                            <option key={team._id} value={team._id}>{team.name}</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAddTeam}
                                        disabled={!selectedTeam || actionLoading}
                                        style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontWeight: 700, cursor: 'pointer', opacity: (!selectedTeam || actionLoading) ? 0.6 : 1 }}
                                    >
                                        Add
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {data.teams.length > 0 ? data.teams.map((team: any, index: number) => (
                                <div key={team._id ? `${team._id}-${index}` : index} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px' }}>
                                    <div style={{ width: 42, height: 42, borderRadius: 10, background: 'linear-gradient(135deg, #1e293b, #0f172a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🛡️</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 15, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</div>
                                        <div style={{ fontSize: 12, color: '#64748b' }}>{team.players?.length || 0} Players</div>
                                    </div>
                                    <CheckCircle2 size={18} color="#22c55e" style={{ flexShrink: 0 }} />
                                </div>
                            )) : (
                                <div style={{ textAlign: 'center', padding: '32px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 14, border: '1px dashed rgba(255,255,255,0.08)' }}>
                                    <p style={{ color: '#475569', fontSize: 14, margin: 0 }}>Minimum 2 teams required to start.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Section */}
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                        <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 18 }}>Tournament Details</h2>
                        <div style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: '22px' }}>
                            <h4 style={{ fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Description</h4>
                            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
                                {data.description || 'No description provided for this tournament.'}
                            </p>
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 20 }}>
                                <h4 style={{ fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>At a glance</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                        <span style={{ color: '#64748b' }}>Created On</span>
                                        <span style={{ fontWeight: 600 }}>{new Date(data.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                                        <span style={{ color: '#64748b' }}>Winner</span>
                                        <span style={{ color: '#facc15', fontWeight: 700 }}>TBD 🏆</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Match Scheduling Form inside Info Section */}
                        {data.status === 'Active' && showCreateMatch && (
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ marginBottom: 20, background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 16, padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#3b82f6' }}>Schedule New Match</h3>
                                    <button onClick={() => setShowCreateMatch(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>Cancel</button>
                                </div>
                                <form onSubmit={handleCreateMatch} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                        <select required value={newMatch.teamA} onChange={e => setNewMatch({ ...newMatch, teamA: e.target.value })} style={{ ...inputStyle, flex: 1, minWidth: '130px' }}>
                                            <option value="">Select Team A...</option>
                                            {data.teams.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                        </select>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#475569', fontSize: 12, width: 24, flexShrink: 0 }}>VS</div>
                                        <select required value={newMatch.teamB} onChange={e => setNewMatch({ ...newMatch, teamB: e.target.value })} style={{ ...inputStyle, flex: 1, minWidth: '130px' }}>
                                            <option value="">Select Team B...</option>
                                            {data.teams.map((t: any) => <option key={t._id} value={t._id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <input type="datetime-local" required value={newMatch.date} onChange={e => setNewMatch({ ...newMatch, date: e.target.value })} style={inputStyle} />
                                    <input type="text" placeholder="Venue (Optional)" value={newMatch.venue} onChange={e => setNewMatch({ ...newMatch, venue: e.target.value })} style={inputStyle} />
                                    <button type="submit" disabled={actionLoading} style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontWeight: 800, cursor: 'pointer', opacity: actionLoading ? 0.6 : 1 }}>
                                        {actionLoading ? 'Scheduling...' : 'Save Match'}
                                    </button>
                                </form>
                            </motion.div>
                        )}

                        {data.status === 'Active' && !showCreateMatch && (
                            <div style={{ marginTop: 20, background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 18, padding: '20px', textAlign: 'center' }}>
                                <p style={{ color: '#22c55e', fontSize: 14, fontWeight: 700, marginBottom: 12 }}>🚀 Tournament is Live!</p>
                                <button onClick={() => setShowCreateMatch(true)} style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(34,197,94,0.2)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontSize: 14, fontWeight: 800, cursor: 'pointer', marginBottom: 12 }}>
                                    + Schedule Match
                                </button>
                                <button style={{ width: '100%', padding: '12px', borderRadius: 12, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#3b82f6', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}>
                                    Go to Live Scoring 📈
                                </button>
                            </div>
                        )}

                        {/* Matches List */}
                        {data.status === 'Active' && matches.length > 0 && (
                            <div style={{ marginTop: 24 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, color: '#f8fafc', paddingLeft: 4 }}>Scheduled Matches</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {matches.map((m: any) => (
                                        <div key={m._id} style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 16 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                                                <span>{new Date(m.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                                                <span style={{ background: m.status === 'Live' ? '#ef4444' : 'rgba(255,255,255,0.05)', color: m.status === 'Live' ? '#fff' : '#94a3b8', padding: '2px 8px', borderRadius: 6 }}>{m.status}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#f8fafc', wordBreak: 'break-word' }}>
                                                    {m.teamA?.name || 'Team A'}
                                                </div>
                                                <div style={{ fontSize: 10, fontWeight: 900, color: '#64748b', padding: '4px 8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, flexShrink: 0 }}>VS</div>
                                                <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#f8fafc', wordBreak: 'break-word' }}>
                                                    {m.teamB?.name || 'Team B'}
                                                </div>
                                            </div>
                                            {m.venue && (
                                                <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                                                    <MapPin size={12} /> {m.venue}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .tdetail-container { max-width: 1000px; margin: 0 auto; padding: 24px 16px; overflow-x: hidden; width: 100%; box-sizing: border-box; }
                .tdetail-header { display: flex; flex-direction: column; gap: 20px; margin-bottom: 36px; }
                .tdetail-start-btn {
                    background: linear-gradient(135deg, #22c55e, #16a34a); color: #000; border: none;
                    border-radius: 14px; padding: 14px 24px; font-weight: 800; cursor: pointer;
                    display: flex; align-items: center; gap: 10px; font-size: 15px;
                    box-shadow: 0 8px 24px rgba(34,197,94,0.3); align-self: flex-start; white-space: nowrap; max-width: 100%;
                }
                .tdetail-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 28px; width: 100%; }
                @media (min-width: 640px) {
                    .tdetail-container { padding: 36px 24px; }
                    .tdetail-header { flex-direction: row; justify-content: space-between; align-items: flex-start; }
                }
                @media (min-width: 768px) {
                    .tdetail-grid { grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); }
                }
            `}</style>
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
