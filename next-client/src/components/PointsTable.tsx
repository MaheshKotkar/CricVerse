"use client";
import { useState, useEffect } from 'react';
import { Trophy, Loader2, Info } from 'lucide-react';
import api from '../utils/api';
import { getImageUrl } from '../utils/imageUrl';

interface PointsTableProps {
    tournamentId: string;
}

export default function PointsTable({ tournamentId }: PointsTableProps) {
    const [loading, setLoading] = useState(true);
    const [standings, setStandings] = useState<any[]>([]);

    useEffect(() => {
        const fetchStandings = async () => {
            try {
                const res = await api.get(`/tournaments/${tournamentId}/points-table`);
                setStandings(res.data.data);
            } catch (err) {
                console.error("Failed to fetch points table", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStandings();
        const interval = setInterval(fetchStandings, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, [tournamentId]);

    if (loading) return (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Loader2 className="animate-spin" color="#f97316" size={32} style={{ margin: '0 auto' }} />
        </div>
    );

    if (standings.length === 0) return (
        <div style={{ padding: '32px', background: 'rgba(255,255,255,0.02)', borderRadius: 20, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Info size={24} color="#64748b" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>No standings available yet.</p>
        </div>
    );

    return (
        <div className="pt-modern-wrapper">
            <style>{`
                .pt-modern-wrapper { width: 100%; }
                
                /* Desktop Table Styles */
                .pt-modern-table { width: 100%; border-collapse: separate; border-spacing: 0 10px; min-width: 500px; }
                .pt-th { padding: 12px 16px; color: #475569; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; text-align: center; }
                .pt-th.align-left { text-align: left; }
                
                .pt-row { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .pt-row:hover .pt-td { background: rgba(255, 255, 255, 0.06); transform: translateY(-1px); }
                
                .pt-td { 
                    padding: 16px; background: rgba(255, 255, 255, 0.02); text-align: center; font-weight: 700; color: #cbd5e1;
                    border-top: 1px solid rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.03);
                    transition: all 0.3s;
                }
                .pt-td.pos { border-left: 1px solid rgba(255,255,255,0.03); border-radius: 16px 0 0 16px; width: 60px; font-weight: 950; font-size: 16px; }
                .pt-td.team { text-align: left; }
                .pt-td.nrr { border-right: 1px solid rgba(255,255,255,0.03); border-radius: 0 16px 16px 0; font-weight: 800; }
                .pt-td.pts { color: #facc15; font-weight: 950; font-size: 16px; }
                
                .team-cell-v3 { display: flex; align-items: center; gap: 14px; }
                .team-logo-v3 { width: 32px; height: 32px; border-radius: 10px; background: #0f172a; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgba(255,255,255,0.05); }
                .team-logo-v3 img { width: 100%; height: 100%; object-fit: cover; }
                .team-name-v3 { font-size: 15px; font-weight: 800; color: #fff; }

                .stat-tag { padding: 4px 10px; border-radius: 8px; font-size: 12px; font-weight: 800; display: inline-block; min-width: 24px; text-align: center; }
                .tag-green { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
                .tag-red { background: rgba(239, 68, 68, 0.1); color: #f87171; }

                /* Mobile Card Styles */
                .pt-mobile-cards { display: none; flex-direction: column; gap: 12px; }
                .pt-mobile-card { 
                    background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px; padding: 16px;
                }
                .pt-m-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.03); padding-bottom: 12px; }
                .pt-m-team { display: flex; align-items: center; gap: 12px; }
                .pt-m-rank { font-size: 14px; font-weight: 900; color: #475569; }
                .pt-m-name { font-size: 15px; font-weight: 800; color: #fff; }
                .pt-m-pts { font-size: 18px; font-weight: 950; color: #facc15; }
                
                .pt-m-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
                .pt-m-stat-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
                .pt-m-label { font-size: 9px; font-weight: 900; color: #475569; text-transform: uppercase; letter-spacing: 0.05em; }
                .pt-m-val { font-size: 13px; font-weight: 800; color: #cbd5e1; }
                .pt-m-nrr { grid-column: span 4; margin-top: 8px; padding-top: 8px; border-top: 1px dashed rgba(255,255,255,0.05); text-align: right; font-size: 12px; font-weight: 800; }

                @media (max-width: 768px) {
                    .pt-desktop-view { display: none; }
                    .pt-mobile-cards { display: flex; }
                }
            `}</style>

            {/* Desktop View */}
            <div className="pt-desktop-view">
                <table className="pt-modern-table">
                    <thead>
                        <tr>
                            <th className="pt-th">Rank</th>
                            <th className="pt-th align-left">Team</th>
                            <th className="pt-th">P</th>
                            <th className="pt-th">W</th>
                            <th className="pt-th">L</th>
                            <th className="pt-th">T</th>
                            <th className="pt-th">Pts</th>
                            <th className="pt-th">NRR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((team, index) => (
                            <tr key={team.teamId} className="pt-row">
                                <td className="pt-td pos" style={{ color: index < 4 ? '#f97316' : '#475569' }}>
                                    #{index + 1}
                                </td>
                                <td className="pt-td team">
                                    <div className="team-cell-v3">
                                        <div className="team-logo-v3">
                                            {team.logo ? (
                                                <img src={getImageUrl(team.logo)} alt="" />
                                            ) : (
                                                '🛡️'
                                            )}
                                        </div>
                                        <span className="team-name-v3">{team.name}</span>
                                    </div>
                                </td>
                                <td className="pt-td">{team.played}</td>
                                <td className="pt-td"><span className="stat-tag tag-green">{team.won}</span></td>
                                <td className="pt-td"><span className="stat-tag tag-red">{team.lost}</span></td>
                                <td className="pt-td" style={{ color: '#475569' }}>{team.tied}</td>
                                <td className="pt-td pts">{team.points}</td>
                                <td className="pt-td nrr" style={{ color: team.nrr >= 0 ? '#22c55e' : '#ef4444' }}>
                                    {team.nrr > 0 ? `+${team.nrr}` : team.nrr}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="pt-mobile-cards">
                {standings.map((team, index) => (
                    <div key={team.teamId} className="pt-mobile-card">
                        <div className="pt-m-header">
                            <div className="pt-m-team">
                                <span className="pt-m-rank" style={{ color: index < 4 ? '#f97316' : '#475569' }}>#{index + 1}</span>
                                <div className="team-logo-v3" style={{ width: 28, height: 28 }}>
                                    {team.logo ? <img src={getImageUrl(team.logo)} alt="" /> : '🛡️'}
                                </div>
                                <span className="pt-m-name">{team.name}</span>
                            </div>
                            <div className="pt-m-pts">{team.points} <span style={{ fontSize: 10, color: '#475569', fontWeight: 800 }}>PTS</span></div>
                        </div>
                        <div className="pt-m-stats">
                            <div className="pt-m-stat-item">
                                <span className="pt-m-label">P</span>
                                <span className="pt-m-val">{team.played}</span>
                            </div>
                            <div className="pt-m-stat-item">
                                <span className="pt-m-label">W</span>
                                <span className="pt-m-val" style={{ color: '#4ade80' }}>{team.won}</span>
                            </div>
                            <div className="pt-m-stat-item">
                                <span className="pt-m-label">L</span>
                                <span className="pt-m-val" style={{ color: '#f87171' }}>{team.lost}</span>
                            </div>
                            <div className="pt-m-stat-item">
                                <span className="pt-m-label">T</span>
                                <span className="pt-m-val">{team.tied}</span>
                            </div>
                            <div className="pt-m-nrr" style={{ color: team.nrr >= 0 ? '#22c55e' : '#ef4444' }}>
                                <span style={{ color: '#475569', fontSize: 10, marginRight: 8 }}>NET RUN RATE</span>
                                {team.nrr > 0 ? `+${team.nrr}` : team.nrr}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
