"use client";
import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Calendar, MapPin, Play, ArrowLeft, Loader2, CheckCircle2, Activity, Info } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../../../../utils/api';
import ProtectedRoute from '../../../../../components/ProtectedRoute';
import { getImageUrl } from '../../../../../utils/imageUrl';
import PointsTable from '../../../../../components/PointsTable';

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
        <div className="premium-bg">
            <div className="adm-container">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link href="/dashboard/admin" className="back-btn">
                        <ArrowLeft size={16} /> <span>Back to Dashboard</span>
                    </Link>
                </motion.div>

                {/* Tournament Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="t-header-card"
                >
                    <div className="t-header-main">
                        <div className="t-badges">
                            <span className={`status-badge ${data.status.toLowerCase()}`}>
                                <span className="dot"></span> {data.status}
                            </span>
                            <span className="format-badge">{data.format}</span>
                        </div>
                        <h1 className="t-title">{data.name}</h1>
                        <div className="t-meta">
                            <div className="meta-item">
                                <Calendar size={18} className="icon-orange" />
                                <span>{new Date(data.startDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
                            </div>
                            <div className="meta-item">
                                <MapPin size={18} className="icon-orange" />
                                <span>{data.venue || 'Multiple Venues'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="t-organizer-box">
                        <div className="org-indicator">
                            <Info size={14} /> Organized By
                        </div>
                        <div className="org-name">{data.organizer?.name || 'Administrator'}</div>
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="adm-main-grid">
                    <div className="adm-left-col">
                        {/* Points Table Section */}
                        <section className="dashboard-section">
                            <div className="section-header">
                                <div className="header-title">
                                    <div className="icon-bg yellow">
                                        <Trophy size={18} />
                                    </div>
                                    <h2>Points Table</h2>
                                </div>
                            </div>
                            <div className="premium-card glass-panel no-padding overflow-hidden">
                                <div style={{ padding: '8px 20px 24px' }}>
                                    <PointsTable tournamentId={id} />
                                </div>
                            </div>
                        </section>

                        {/* Matches Section */}
                        <section className="dashboard-section">
                            <div className="section-header">
                                <div className="header-title">
                                    <div className="icon-bg orange">
                                        <Activity size={18} />
                                    </div>
                                    <h2>Tournament Matches</h2>
                                    <span className="count-pill">{matches.length}</span>
                                </div>
                            </div>

                            {matches.length === 0 ? (
                                <div className="empty-state">
                                    <div className="empty-icon-box">
                                        <Info size={40} />
                                    </div>
                                    <h3>No matches scheduled</h3>
                                    <p>Tournament matches will appear here once they are scheduled by the organizer.</p>
                                </div>
                            ) : (
                                <div className="matches-grid">
                                    {matches.map((m: any, idx: number) => (
                                        <motion.div
                                            key={m._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="match-card premium-hover"
                                        >
                                            <div className="m-card-header">
                                                <div className="m-date">
                                                    <Calendar size={14} />
                                                    <span>{new Date(m.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                                </div>
                                                <div className={`m-status-pill ${m.status.toLowerCase()}`}>
                                                    {m.status === 'Live' && <span className="live-dot" />}
                                                    {m.status}
                                                </div>
                                            </div>

                                            <div className="m-teams-display">
                                                <div className="m-team-box">
                                                    <div className="team-logo-v2">
                                                        {m.teamA?.logo ? (
                                                            <img src={getImageUrl(m.teamA.logo)} alt="" />
                                                        ) : (
                                                            <Trophy size={20} color="#475569" />
                                                        )}
                                                    </div>
                                                    <span className="team-name-v2">{m.teamA?.name}</span>
                                                    {m.status === 'Completed' && (
                                                        <div className="team-score-v2">
                                                            <div className="main-score" style={{ color: m.result?.winningTeam?._id === m.teamA?._id ? '#22c55e' : '#94a3b8' }}>
                                                                {m.isSuperOver ? m.superOver?.inning1?.runs : m.score?.inning1?.runs}
                                                                <span className="wickets">/{m.isSuperOver ? m.superOver?.inning1?.wickets : m.score?.inning1?.wickets}</span>
                                                            </div>
                                                            <div className="overs">({m.isSuperOver ? 'SO' : m.score?.inning1?.overs})</div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="m-vs-separator">
                                                    <div className="line"></div>
                                                    <span>VS</span>
                                                    <div className="line"></div>
                                                </div>

                                                <div className="m-team-box">
                                                    <div className="team-logo-v2">
                                                        {m.teamB?.logo ? (
                                                            <img src={getImageUrl(m.teamB.logo)} alt="" />
                                                        ) : (
                                                            <Trophy size={20} color="#475569" />
                                                        )}
                                                    </div>
                                                    <span className="team-name-v2">{m.teamB?.name}</span>
                                                    {m.status === 'Completed' && (
                                                        <div className="team-score-v2">
                                                            <div className="main-score" style={{ color: m.result?.winningTeam?._id === m.teamB?._id ? '#22c55e' : '#94a3b8' }}>
                                                                {m.isSuperOver ? m.superOver?.inning2?.runs : m.score?.inning2?.runs}
                                                                <span className="wickets">/{m.isSuperOver ? m.superOver?.inning2?.wickets : m.score?.inning2?.wickets}</span>
                                                            </div>
                                                            <div className="overs">({m.isSuperOver ? 'SO' : m.score?.inning2?.overs})</div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {m.status === 'Completed' && (
                                                <div className="m-result-strip">
                                                    <div className="winner-label">🏆 Result:</div>
                                                    <div className="winner-name">{m.result?.winningTeam?.name ? `${m.result.winningTeam.name} ${m.result.margin}` : m.result?.margin}</div>
                                                </div>
                                            )}

                                            <div className="m-card-footer">
                                                {m.venue && (
                                                    <div className="m-venue-footer">
                                                        <MapPin size={12} /> {m.venue}
                                                    </div>
                                                )}
                                                <div className="m-actions-footer">
                                                    {m.status === 'Completed' && (
                                                        <Link href={`/dashboard/admin/matches/${m._id}`} className="view-btn-sm ripple">
                                                            Scorecard <Activity size={12} />
                                                        </Link>
                                                    )}
                                                    {m.status === 'Live' && (
                                                        <Link href={`/dashboard/player/live-score/${m._id}`} className="live-btn-sm ripple">
                                                            Watch Live <div className="pulse-circle" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="adm-sidebar">
                        {/* Participating Teams Sidebar Card */}
                        <div className="sticky-sidebar">
                            <section className="sidebar-section">
                                <div className="section-header-compact">
                                    <Users size={18} color="#3b82f6" />
                                    <h3>Participating Teams</h3>
                                </div>
                                <div className="team-mini-list">
                                    {data.teams?.map((team: any, idx: number) => (
                                        <motion.div
                                            key={team._id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="team-mini-item"
                                        >
                                            <div className="team-mini-logo">
                                                {team.logo ? (
                                                    <img src={getImageUrl(team.logo)} alt="" />
                                                ) : (
                                                    '🛡️'
                                                )}
                                            </div>
                                            <div className="team-mini-info">
                                                <div className="name">{team.name}</div>
                                                <div className="players-count">{team.players?.length || 0} players</div>
                                            </div>
                                            <CheckCircle2 size={16} className="text-green" />
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* Additional Info box */}
                            <section className="sidebar-section">
                                <div className="info-gradient-card">
                                    <h4>Tournament Rules</h4>
                                    <p>{data.description || 'Professional tournament hosted on CricVerse. Standard ICC playing conditions apply.'}</p>
                                    <div className="info-footer">
                                        <Trophy size={14} className="icon-yellow" /> Official Event
                                    </div>
                                </div>
                            </section>
                        </div>
                    </aside>
                </div>
            </div>

            <style>{`
                .premium-bg { min-height: 100vh; background: radial-gradient(circle at top left, #0f172a, #080c18); color: #f8fafc; padding-bottom: 80px; }
                .adm-container { max-width: 1200px; margin: 0 auto; padding: 40px 24px; }
                
                .back-btn { 
                    display: inline-flex; align-items: center; gap: 10px; color: #94a3b8; text-decoration: none; 
                    margin-bottom: 32px; font-size: 14px; font-weight: 700; transition: color 0.2s;
                }
                .back-btn:hover { color: #f97316; }

                /* Header Card */
                .t-header-card {
                    background: rgba(15, 23, 42, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.08);
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
                .status-badge .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
                .format-badge {
                    font-size: 11px; font-weight: 900; padding: 6px 16px; border-radius: 100px;
                    background: rgba(255, 255, 255, 0.05); color: #94a3b8; text-transform: uppercase;
                }
                .t-title { font-size: clamp(2rem, 6vw, 3.5rem); font-weight: 900; line-height: 1.1; margin: 0 0 20px 0; letter-spacing: -0.02em; }
                .t-meta { display: flex; flex-wrap: wrap; gap: 24px; }
                .meta-item { display: flex; align-items: center; gap: 8px; color: #94a3b8; font-weight: 600; font-size: 15px; }
                .icon-orange { color: #f97316; }

                .t-organizer-box { padding: 20px 32px; background: rgba(0,0,0,0.2); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.05); text-align: right; }
                .org-indicator { display: flex; align-items: center; justify-content: flex-end; gap: 8px; color: #475569; font-size: 11px; font-weight: 900; text-transform: uppercase; margin-bottom: 6px; }
                .org-name { font-size: 18px; font-weight: 900; color: #f97316; }

                /* Grid System */
                .adm-main-grid { display: grid; grid-template-columns: 1fr 340px; gap: 40px; align-items: start; }
                .dashboard-section { margin-bottom: 48px; }
                .section-header { margin-bottom: 24px; }
                .header-title { display: flex; align-items: center; gap: 16px; }
                .header-title h2 { font-size: 24px; font-weight: 900; margin: 0; }
                .icon-bg { 
                    width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
                }
                .icon-bg.yellow { background: linear-gradient(135deg, #facc15, #eab308); color: #000; }
                .icon-bg.orange { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; }
                .count-pill { background: rgba(249,115,22,0.1); color: #f97316; padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 900; }

                .premium-card.glass-panel { 
                    background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 32px; backdrop-filter: blur(10px);
                }
                .no-padding { padding: 0 !important; }
                .overflow-hidden { overflow: hidden; }

                /* Matches */
                .matches-grid { display: flex; flex-direction: column; gap: 20px; }
                .match-card {
                    background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 28px; padding: 28px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .premium-hover:hover { 
                    transform: translateY(-4px) scale(1.01); background: rgba(20, 30, 50, 0.6); 
                    border-color: rgba(249, 115, 22, 0.2); box-shadow: 0 15px 40px rgba(0,0,0,0.4);
                }
                .m-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px dashed rgba(255,255,255,0.08); }
                .m-date { display: flex; align-items: center; gap: 8px; color: #64748b; font-size: 13px; font-weight: 700; }
                .m-status-pill { font-size: 10px; font-weight: 900; padding: 5px 14px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(255,255,255,0.05); color: #94a3b8; }
                .m-status-pill.live { color: #ef4444; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); display: flex; align-items: center; gap: 6px; }
                .live-dot { width: 6px; height: 6px; border-radius: 50%; background: #ef4444; animation: livePulse 1.5s infinite; }
                @keyframes livePulse { 0% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.5); opacity: 0.5; } 100% { transform: scale(1); opacity: 1; } }

                .m-teams-display { display: flex; align-items: center; justify-content: space-between; gap: 15px; margin-bottom: 24px; }
                .m-team-box { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 12px; min-width: 0; }
                .team-logo-v2 { 
                    width: 70px; height: 70px; border-radius: 20px; background: linear-gradient(135deg, #1e293b, #0f172a);
                    display: flex; align-items: center; justify-content: center; font-size: 28px; overflow: hidden;
                    box-shadow: 0 10px 20px rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.05);
                }
                .team-logo-v2 img { width: 100%; height: 100%; object-fit: cover; }
                .team-name-v2 { font-size: 18px; font-weight: 900; text-align: center; color: #fff; line-height: 1.2; }
                .team-score-v2 { margin-top: 8px; text-align: center; }
                .main-score { font-size: 24px; font-weight: 950; display: flex; align-items: baseline; justify-content: center; gap: 2px; }
                .wickets { font-size: 16px; color: #64748b; font-weight: 800; }
                .overs { font-size: 12px; color: #475569; font-weight: 700; margin-top: 2px; }

                .m-vs-separator { display: flex; flex-direction: column; align-items: center; gap: 8px; color: #475569; }
                .m-vs-separator .line { width: 1px; height: 24px; background: linear-gradient(to bottom, transparent, rgba(255,255,255,0.1), transparent); }
                .m-vs-separator span { font-size: 12px; font-weight: 900; letter-spacing: 0.2em; color: #334155; }

                .m-result-strip { 
                    background: rgba(250, 204, 21, 0.05); border: 1px solid rgba(250, 204, 21, 0.1);
                    padding: 12px 20px; border-radius: 16px; display: flex; align-items: center; justify-content: center; gap: 10px;
                    margin-bottom: 24px; color: #facc15; font-weight: 800; font-size: 14px;
                }
                .winner-name { font-weight: 950; }

                .m-card-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
                .m-venue-footer { display: flex; align-items: center; gap: 6px; color: #475569; font-size: 12px; font-weight: 600; }
                .m-actions-footer { display: flex; gap: 10px; }
                .view-btn-sm { 
                    display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 12px;
                    background: rgba(255,255,255,0.05); color: #94a3b8; font-size: 12px; font-weight: 800;
                    text-decoration: none; border: 1px solid rgba(255,255,255,0.1); transition: all 0.2s;
                }
                .view-btn-sm:hover { background: rgba(255,255,255,0.1); color: #fff; }
                .live-btn-sm { 
                    display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px; border-radius: 12px;
                    background: #ef4444; color: #fff; font-size: 12px; font-weight: 900;
                    text-decoration: none; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }
                .pulse-circle { width: 6px; height: 6px; border-radius: 50%; background: #fff; animation: pulse 1s infinite; }

                /* Sidebar */
                .sticky-sidebar { position: sticky; top: 100px; }
                .sidebar-section { margin-bottom: 32px; }
                .section-header-compact { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
                .section-header-compact h3 { font-size: 16px; font-weight: 900; margin: 0; }
                
                .team-mini-list { display: flex; flex-direction: column; gap: 10px; }
                .team-mini-item { 
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05);
                    padding: 12px 16px; border-radius: 16px; display: flex; align-items: center; gap: 12px;
                    transition: all 0.2s;
                }
                .team-mini-item:hover { background: rgba(255,255,255,0.05); transform: translateX(4px); }
                .team-mini-logo { 
                    width: 36px; height: 36px; border-radius: 10px; background: #0f172a; 
                    display: flex; align-items: center; justify-content: center; overflow: hidden;
                }
                .team-mini-logo img { width: 100%; height: 100%; object-fit: cover; }
                .team-mini-info .name { font-size: 13px; font-weight: 800; color: #fff; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }
                .team-mini-info .players-count { font-size: 10px; color: #475569; font-weight: 700; }
                .text-green { color: #22c55e; }

                .info-gradient-card { 
                    padding: 24px; border-radius: 28px; background: linear-gradient(135deg, rgba(30, 41, 59, 0.6), rgba(15, 23, 42, 0.8));
                    border: 1px solid rgba(255,255,255,0.08); position: relative; overflow: hidden;
                }
                .info-gradient-card h4 { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #475569; letter-spacing: 0.1em; margin: 0 0 12px 0; }
                .info-gradient-card p { font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0 0 20px 0; }
                .info-footer { display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 800; color: #cbd5e1; }
                
                /* Empty States */
                .empty-state { text-align: center; padding: 80px 40px; background: rgba(255,255,255,0.02); border-radius: 32px; border: 2px dashed rgba(255,255,255,0.05); }
                .empty-icon-box { width: 80px; height: 80px; border-radius: 24px; background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #334155; }
                .empty-state h3 { font-size: 20px; font-weight: 900; margin: 0 0 12px 0; color: #f8fafc; }
                .empty-state p { color: #475569; font-size: 15px; max-width: 320px; margin: 0 auto; line-height: 1.6; }

                /* Responsiveness */
                @media (max-width: 1024px) {
                    .adm-main-grid { grid-template-columns: 1fr; }
                    .adm-sidebar { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
                    .sticky-sidebar { position: static; }
                }

                @media (max-width: 850px) {
                    .t-header-card { flex-direction: column; align-items: flex-start; gap: 32px; padding: 32px; }
                    .t-organizer-box { width: 100%; text-align: left; }
                    .org-indicator { justify-content: flex-start; }
                }

                @media (max-width: 768px) {
                    .adm-sidebar { grid-template-columns: 1fr; gap: 20px; }
                    .dashboard-section { margin-bottom: 32px; }
                    .header-title h2 { font-size: 20px; }
                    .icon-bg { width: 36px; height: 36px; border-radius: 10px; }
                    .icon-bg svg { width: 16px; height: 16px; }

                    .m-teams-display { gap: 10px; }
                    .team-logo-v2 { width: 60px; height: 60px; border-radius: 16px; }
                    .team-name-v2 { font-size: 15px; }
                    .main-score { font-size: 20px; }
                }

                @media (max-width: 640px) {
                    .adm-container { padding: 20px 16px; }
                    .t-header-card { padding: 24px; border-radius: 24px; margin-bottom: 24px; }
                    .t-title { font-size: 2rem; }
                    .t-meta { gap: 12px; }
                    .meta-item { font-size: 13px; }
                    
                    .match-card { padding: 20px; border-radius: 24px; }
                    .m-card-header { margin-bottom: 20px; }
                    .team-logo-v2 { width: 50px; height: 50px; font-size: 22px; }
                    .team-name-v2 { font-size: 14px; }
                    .main-score { font-size: 18px; }
                }

                @media (max-width: 480px) {
                    .m-teams-display { flex-direction: column; gap: 16px; align-items: stretch; }
                    .m-team-box { flex-direction: row; justify-content: space-between; width: 100%; text-align: left; }
                    .team-logo-v2 { width: 44px; height: 44px; margin: 0; }
                    .team-name-v2 { margin-left: 12px; flex: 1; text-align: left; }
                    .team-score-v2 { margin-top: 0; text-align: right; }
                    
                    .m-vs-separator { flex-direction: row; width: 100%; justify-content: center; height: auto; }
                    .m-vs-separator .line { width: 40px; height: 1px; background: linear-gradient(to right, transparent, rgba(255,255,255,0.1), transparent); }
                    .m-vs-separator span { margin: 0 10px; }

                    .m-result-strip { padding: 10px; font-size: 12px; border-radius: 12px; }
                    .m-actions-footer { width: 100%; }
                    .view-btn-sm, .live-btn-sm { width: 100%; justify-content: center; font-size: 13px; height: 44px; }
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
