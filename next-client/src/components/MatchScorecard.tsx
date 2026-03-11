"use client";
import React from 'react';
import { User, Activity, Shield, Swords, Trophy } from 'lucide-react';

interface MatchScorecardProps {
    match: any;
}

export default function MatchScorecard({ match }: MatchScorecardProps) {
    if (!match) return null;

    const pStats = match.playerStats || {};

    // 1. Determine which team batted in which inning
    let inn1BatTeam = match.teamA;
    let inn1BowlTeam = match.teamB;

    const tossWonByTeamA = match.toss?.wonBy?._id === match.teamA?._id || match.toss?.wonBy === match.teamA?._id;
    const tossDecision = match.toss?.decision;

    if (tossWonByTeamA) {
        if (tossDecision === 'Bat') {
            inn1BatTeam = match.teamA;
            inn1BowlTeam = match.teamB;
        } else {
            inn1BatTeam = match.teamB;
            inn1BowlTeam = match.teamA;
        }
    } else {
        if (tossDecision === 'Bat') {
            inn1BatTeam = match.teamB;
            inn1BowlTeam = match.teamA;
        } else {
            inn1BatTeam = match.teamA;
            inn1BowlTeam = match.teamB;
        }
    }

    const inn2BatTeam = inn1BowlTeam;
    const inn2BowlTeam = inn1BatTeam;

    const formatOvers = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`;

    // Helper to check if a player belongs to a team
    const isPlayerInTeam = (playerName: string, team: any) => {
        return team?.players?.some((p: any) => p.name === playerName);
    };

    const renderInningScorecard = (batTeam: any, bowlTeam: any, inningNum: number, currentScore: any, isSuperOverStats: boolean = false) => {
        if (!currentScore || (inningNum === 2 && match.currentInning < 2 && match.status !== 'Completed')) return null;

        // Use the appropriate stats object based on context
        const statsToUse = isSuperOverStats ? (match.superOverPlayerStats || {}) : pStats;

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={{ background: inningNum === 1 ? '#22c55e' : '#3b82f6', color: '#000', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 900 }}>
                        INNING {inningNum}
                    </div>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.05)' }}></div>
                </div>

                {/* Batting Table */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px 24px', fontSize: 14, fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#22c55e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Swords size={16} /> <span>Batting: {batTeam?.name}</span>
                        </div>
                        <div style={{ fontSize: 16, color: '#f8fafc' }}>
                            {currentScore.runs}/{currentScore.wickets} <span style={{ fontSize: 12, color: '#64748b' }}>({currentScore.overs} ov)</span>
                        </div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                                    <th style={{ padding: '14px 24px' }}>Batter</th>
                                    <th style={{ padding: '14px 12px' }}>R</th>
                                    <th style={{ padding: '14px 12px' }}>B</th>
                                    <th style={{ padding: '14px 12px' }}>4s</th>
                                    <th style={{ padding: '14px 12px' }}>6s</th>
                                    <th style={{ padding: '14px 12px' }}>SR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(statsToUse)
                                    .filter(([name, stats]: any) => isPlayerInTeam(name, batTeam) && (stats.batBalls > 0 || stats.batRuns > 0))
                                    .map(([name, stats]: any) => (
                                        <tr key={name} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '14px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>{name} {(match.activePlayers?.striker === name || match.activePlayers?.nonStriker === name) && <span style={{ color: '#22c55e' }}>*</span>}</div>
                                                </div>
                                                <div style={{ fontSize: 11, color: stats.isOut ? '#94a3b8' : '#22c55e', marginTop: 2, fontWeight: 500 }}>
                                                    {stats.isOut ? (stats.dismissalType || 'out') : 'not out'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '14px 12px', fontWeight: 800, fontSize: 15, color: '#fff' }}>{stats.batRuns}</td>
                                            <td style={{ padding: '14px 12px', color: '#94a3b8' }}>{stats.batBalls}</td>
                                            <td style={{ padding: '14px 12px', color: '#f8fafc' }}>{stats.batFours || 0}</td>
                                            <td style={{ padding: '14px 12px', color: '#f8fafc' }}>{stats.batSixes || 0}</td>
                                            <td style={{ padding: '14px 12px', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                                                {stats.batBalls > 0 ? ((stats.batRuns / stats.batBalls) * 100).toFixed(1) : '0.0'}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bowling Table */}
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px 24px', fontSize: 14, fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Shield size={16} /> <span>Bowling: {bowlTeam?.name}</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, minWidth: 600 }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                                    <th style={{ padding: '14px 24px' }}>Bowler</th>
                                    <th style={{ padding: '14px 12px' }}>O</th>
                                    <th style={{ padding: '14px 12px' }}>M</th>
                                    <th style={{ padding: '14px 12px' }}>R</th>
                                    <th style={{ padding: '14px 12px' }}>W</th>
                                    <th style={{ padding: '14px 12px' }}>Econ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(statsToUse)
                                    .filter(([name, stats]: any) => isPlayerInTeam(name, bowlTeam) && stats.bowlBalls > 0)
                                    .map(([name, stats]: any) => (
                                        <tr key={name} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                                            <td style={{ padding: '14px 24px', fontWeight: 700, color: '#f8fafc' }}>
                                                {name} {match.activePlayers?.bowler === name && <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginLeft: 6, verticalAlign: 'middle' }}></span>}
                                            </td>
                                            <td style={{ padding: '14px 12px', color: '#fff', fontWeight: 600 }}>{formatOvers(stats.bowlBalls)}</td>
                                            <td style={{ padding: '14px 12px', color: '#f8fafc' }}>{stats.bowlMaidens || 0}</td>
                                            <td style={{ padding: '14px 12px', color: '#f8fafc' }}>{stats.bowlRuns}</td>
                                            <td style={{ padding: '14px 12px', fontWeight: 900, color: '#3b82f6', fontSize: 15 }}>{stats.bowlWickets}</td>
                                            <td style={{ padding: '14px 12px', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>
                                                {stats.bowlBalls > 0 ? ((stats.bowlRuns / (stats.bowlBalls / 6))).toFixed(2) : '0.00'}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {renderInningScorecard(inn1BatTeam, inn1BowlTeam, 1, match.score?.inning1, false)}
            {renderInningScorecard(inn2BatTeam, inn2BowlTeam, 2, match.score?.inning2, false)}

            {/* Super Over Section (Optional but good to have) */}
            {match.isSuperOver && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                        <div style={{ background: '#ef4444', color: '#fff', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 900 }}>
                            SUPER OVER
                        </div>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(239,68,68,0.2)' }}></div>
                    </div>
                    {/* Reuse current logic - for super over we show separate stats */}
                    {renderInningScorecard(match.battingTeam, match.bowlingTeam, 1, match.superOver?.inning1, true)}
                    {renderInningScorecard(match.bowlingTeam, match.battingTeam, 2, match.superOver?.inning2, true)}
                </>
            )}
        </div>
    );
}
