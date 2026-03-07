"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { ArrowLeft, User, Mail, Calendar, MapPin, Activity, Award } from 'lucide-react';
import { motion } from 'framer-motion';

function PlayerProfileContent() {
    const { user, logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', fontFamily: 'Inter, sans-serif', color: '#f8fafc' }}>
            {/* Navbar */}
            <nav style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,14,26,0.95)', position: 'sticky', top: 0, zIndex: 100 }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Link href="/dashboard/player" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏏</div>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.02em' }}>CricVerse</span>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(34,197,94,0.2)' }}>
                            Player
                        </span>
                    </div>
                </div>
            </nav>

            <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 16px' }}>
                <Link href="/dashboard/player" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#94a3b8', textDecoration: 'none', marginBottom: 28, fontSize: 14, fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
                    {/* Main Profile Card */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                        <div style={{ width: 120, height: 120, borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 900, color: '#000', marginBottom: 16, boxShadow: '0 10px 25px -5px rgba(34,197,94,0.4)', border: '4px solid rgba(15,22,41,1)' }}>
                            {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>{user?.name}</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 14, marginBottom: 24 }}>
                            <Mail size={16} /> {user?.email}
                        </div>
                        <div style={{ width: '100%', padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-around' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#f8fafc' }}>Top-Order</div>
                                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Role</div>
                            </div>
                            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }}></div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#22c55e' }}>Right</div>
                                <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Batting</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Stats & History */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Activity size={20} color="#3b82f6" /> Career Statistics
                            </h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                <div style={{ padding: 16, background: 'rgba(59,130,246,0.05)', borderRadius: 12, border: '1px solid rgba(59,130,246,0.1)' }}>
                                    <div style={{ fontSize: 28, fontWeight: 900, color: '#3b82f6', marginBottom: 4 }}>42.5</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Avg Score</div>
                                </div>
                                <div style={{ padding: 16, background: 'rgba(249,115,22,0.05)', borderRadius: 12, border: '1px solid rgba(249,115,22,0.1)' }}>
                                    <div style={{ fontSize: 28, fontWeight: 900, color: '#f97316', marginBottom: 4 }}>145.2</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Strike Rate</div>
                                </div>
                                <div style={{ padding: 16, background: 'rgba(163,230,53,0.05)', borderRadius: 12, border: '1px solid rgba(163,230,53,0.1)' }}>
                                    <div style={{ fontSize: 28, fontWeight: 900, color: '#a3e635', marginBottom: 4 }}>3</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Centuries</div>
                                </div>
                                <div style={{ padding: 16, background: 'rgba(236,72,153,0.05)', borderRadius: 12, border: '1px solid rgba(236,72,153,0.1)' }}>
                                    <div style={{ fontSize: 28, fontWeight: 900, color: '#ec4899', marginBottom: 4 }}>14</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Wickets</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 32 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Award size={20} color="#eab308" /> Recent Awards
                            </h2>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
                                <div style={{ fontSize: 24 }}>🏆</div>
                                <div>
                                    <div style={{ fontWeight: 700, fontSize: 14 }}>Man of the Match</div>
                                    <div style={{ fontSize: 12, color: '#64748b' }}>T20 Summer Cup 2025</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default function PlayerProfile() {
    return (
        <ProtectedRoute allowedRoles={['player']}>
            <PlayerProfileContent />
        </ProtectedRoute>
    );
}
