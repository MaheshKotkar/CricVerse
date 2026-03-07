"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';
import { ArrowLeft, Zap, Play, Loader2, Calendar, MapPin, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function LiveMatchesDirectory() {
    const router = useRouter();
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLiveMatches = async () => {
            try {
                // A specialized route could be added, but for now we poll 'upcoming' 
                // and filter for 'Live' since it fetches upcoming and live matches
                const res = await api.get('/matches/upcoming');
                setMatches(res.data.data.filter((m: any) => m.status === 'Live'));
            } catch (err: any) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveMatches();
        const interval = setInterval(fetchLiveMatches, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="pd-shell">
            <nav className="pd-navbar">
                <div className="pd-navbar-inner">
                    <button onClick={() => router.back()} className="pd-back-btn">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <Link href="/" className="pd-brand">
                        <div className="pd-brand-icon" style={{ width: 28, height: 28, borderRadius: 8 }}><Zap size={14} /></div>
                        <span className="pd-brand-text" style={{ fontSize: 16 }}>Live Dashboard</span>
                    </Link>
                    <div style={{ width: 70 }} />
                </div>
            </nav>

            <div className="pd-content">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 10px #ef4444', animation: 'pulse 2s infinite' }} />
                    <h1 style={{ fontSize: 24, fontWeight: 800 }}>Ongoing Matches</h1>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                        <Loader2 className="animate-spin" size={32} color="#f97316" />
                    </div>
                ) : matches.length === 0 ? (
                    <div className="pd-empty-card">
                        <div className="pd-empty-icon" style={{ filter: 'grayscale(1)', opacity: 0.5 }}>🏏</div>
                        <h3 className="pd-empty-title">No matches are live right now</h3>
                        <p className="pd-empty-sub">
                            Check back later or browse upcoming tournaments.
                        </p>
                    </div>
                ) : (
                    <div className="pd-matches-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
                        {matches.map((m: any) => (
                            <Link href={`/matches/${m._id}/live`} key={m._id} className="pd-match-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="pd-match-header">
                                    <div className="pd-match-tour">
                                        <Trophy size={14} color="#a855f7" />
                                        <span>{m.tournament?.name || 'Tournament'}</span>
                                    </div>
                                    <div className="pd-match-status live">● LIVE</div>
                                </div>

                                <div className="pd-match-teams">
                                    <div className="pd-team">
                                        <div className="pd-team-logo">{m.teamA?.logo ? <img src={m.teamA.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}</div>
                                        <div className="pd-team-name">{m.teamA?.name || 'Team A'}</div>
                                    </div>
                                    <div className="pd-match-vs">VS</div>
                                    <div className="pd-team">
                                        <div className="pd-team-logo">{m.teamB?.logo ? <img src={m.teamB.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🛡️'}</div>
                                        <div className="pd-team-name">{m.teamB?.name || 'Team B'}</div>
                                    </div>
                                </div>

                                <div className="pd-match-footer" style={{ background: 'transparent', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '16px 0 0', marginTop: 10 }}>
                                    <div className="pd-match-meta">
                                        <Calendar size={13} /> {new Date(m.date).toLocaleDateString()}
                                    </div>
                                    <button className="pd-match-live-btn" style={{ marginLeft: 'auto' }}>
                                        <Play size={12} fill="currentColor" /> Watch
                                    </button>
                                </div>
                            </Link>
                        ))}
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
                .pd-content { max-width: 1200px; margin: 0 auto; padding: 32px 16px; }

                /* Match Cards */
                .pd-match-card {
                    background: linear-gradient(135deg, rgba(13,20,36,0.9), rgba(10,16,32,0.8));
                    border: 1px solid rgba(255,255,255,0.06); border-radius: 20px;
                    padding: 24px; transition: all 0.2s; display: flex; flex-direction: column;
                }
                .pd-match-card:hover { border-color: rgba(255,255,255,0.2); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .pd-match-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
                .pd-match-tour { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #e2e8f0; }
                .pd-match-status { font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 100px; text-transform: uppercase; background: rgba(255,255,255,0.05); color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }
                .pd-match-status.live { background: rgba(239,68,68,0.15); color: #ef4444; border-color: rgba(239,68,68,0.3); animation: pulse 2s infinite; }
                
                .pd-match-teams { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 16px; }
                .pd-team { display: flex; flex-direction: column; align-items: center; gap: 12px; flex: 1; min-width: 0; }
                .pd-team-logo { width: 60px; height: 60px; border-radius: 16px; background: linear-gradient(135deg, #1e293b, #0f172a); border: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-size: 28px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); overflow: hidden; }
                .pd-team-name { font-size: 15px; font-weight: 800; text-align: center; color: #f8fafc; line-height: 1.3; }
                .pd-match-vs { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; color: #64748b; flex-shrink: 0; }
                
                .pd-match-footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: auto; }
                .pd-match-meta { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #94a3b8; font-weight: 600; }
                .pd-match-live-btn { display: flex; align-items: center; gap: 6px; background: #ef4444; color: #fff; border: none; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 800; cursor: pointer; transition: background 0.2s; }
                .pd-match-live-btn:hover { background: #dc2626; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4); }

                /* Empty state */
                .pd-empty-card { background: rgba(255,255,255,0.02); border: 1px dashed rgba(255,255,255,0.1); border-radius: 24px; padding: 60px 24px; text-align: center; }
                .pd-empty-icon { font-size: 40px; margin-bottom: 14px; }
                .pd-empty-title { font-size: 18px; font-weight: 800; margin-bottom: 8px; color: #e2e8f0; }
                .pd-empty-sub { color: #64748b; font-size: 14px; max-width: 440px; margin: 0 auto; line-height: 1.6; }

                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }
            `}</style>
        </div>
    );
}
