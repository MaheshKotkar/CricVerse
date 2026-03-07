"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../../context/AuthContext';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import { ArrowLeft, Trophy, Calendar, MapPin, Search, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../../../utils/api';
import toast from 'react-hot-toast';

function FindTournamentsContent() {
    const { user } = useAuth();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [joiningId, setJoiningId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTournaments = async () => {
            try {
                const res = await api.get('/tournaments/public');
                setTournaments(res.data.data);
            } catch (err) {
                console.error("Failed to fetch tournaments:", err);
                toast.error("Failed to load tournaments");
            } finally {
                setLoading(false);
            }
        };
        fetchTournaments();
    }, []);

    const handleJoin = async (id: string, name: string) => {
        setJoiningId(id);
        const joinToast = toast.loading(`Joining ${name}...`);
        try {
            await api.post(`/tournaments/${id}/join`);
            toast.success(`Successfully joined ${name}!`, { id: joinToast });
            // Update local state to show joined
            setTournaments(prev => prev.map(t => {
                if (t._id === id) {
                    return { ...t, registeredPlayers: [...(t.registeredPlayers || []), user?.id] };
                }
                return t;
            }));
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to join tournament', { id: joinToast });
        } finally {
            setJoiningId(null);
        }
    };

    const filteredTournaments = tournaments.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.venue && t.venue.toLowerCase().includes(searchQuery.toLowerCase()))
    );

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

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.5rem)', fontWeight: 900, margin: '0 0 8px 0', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Trophy color="#3b82f6" /> Find Tournaments
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: 15, margin: 0 }}>Browse and register for upcoming cricket events.</p>
                    </div>

                    <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: 400 }}>
                        <Search size={18} color="#64748b" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Search by name or venue..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%', padding: '14px 14px 14px 44px', borderRadius: 14, background: 'rgba(15,22,41,0.8)',
                                border: '1px solid rgba(255,255,255,0.1)', color: '#f8fafc', outline: 'none', fontSize: 15, boxSizing: 'border-box'
                            }}
                        />
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
                        <Loader2 className="animate-spin" color="#3b82f6" size={40} />
                    </div>
                ) : filteredTournaments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(15,22,41,0.6)', borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)' }}>
                        <Trophy size={48} color="#475569" style={{ margin: '0 auto 16px auto' }} />
                        <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 8px 0' }}>No Tournaments Found</h3>
                        <p style={{ color: '#64748b', fontSize: 14, margin: 0 }}>{searchQuery ? "Try adjusting your search filters." : "There are currently no tournaments on the platform."}</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                        {filteredTournaments.map((t, index) => {
                            const isJoined = t.registeredPlayers?.includes(user?.id);
                            const isJoining = joiningId === t._id;

                            return (
                                <motion.div
                                    key={t._id}
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: 24, display: 'flex', flexDirection: 'column' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                        <div style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 100, textTransform: 'uppercase' }}>
                                            {t.format}
                                        </div>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: t.status === 'Active' ? '#22c55e' : '#94a3b8', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: t.status === 'Active' ? '#22c55e' : '#94a3b8' }}></span>
                                            {t.status}
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: 20, fontWeight: 800, margin: '0 0 12px 0', lineHeight: 1.3 }}>{t.name}</h3>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24, flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13 }}>
                                            <Calendar size={15} /> Starts: {new Date(t.startDate).toLocaleDateString()}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13 }}>
                                            <MapPin size={15} /> {t.venue || 'TBD'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13, marginTop: 4 }}>
                                            <span style={{ color: '#f8fafc', fontWeight: 700 }}>{t.registeredPlayers?.length || 0}</span> players joined
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleJoin(t._id, t.name)}
                                        disabled={isJoined || isJoining || t.status === 'Completed'}
                                        style={{
                                            width: '100%', padding: '14px', borderRadius: 12, fontWeight: 800, cursor: (isJoined || t.status === 'Completed') ? 'default' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s',
                                            background: isJoined ? 'rgba(34,197,94,0.1)' : t.status === 'Completed' ? 'rgba(255,255,255,0.05)' : '#3b82f6',
                                            color: isJoined ? '#22c55e' : t.status === 'Completed' ? '#64748b' : '#fff',
                                            border: isJoined ? '1px solid rgba(34,197,94,0.2)' : 'none',
                                            opacity: isJoining ? 0.7 : 1
                                        }}
                                    >
                                        {isJoining ? <Loader2 size={18} className="animate-spin" /> : null}
                                        {isJoined ? '✓ Joined' : t.status === 'Completed' ? 'Completed' : 'Join Tournament'}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function FindTournaments() {
    return (
        <ProtectedRoute allowedRoles={['player']}>
            <FindTournamentsContent />
        </ProtectedRoute>
    );
}
