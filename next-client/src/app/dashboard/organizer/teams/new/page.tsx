"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Trash2, ArrowLeft, Loader2, Image as ImageIcon, Crown, Shield } from 'lucide-react';
import Link from 'next/link';
import api from '../../../../../utils/api';
import ProtectedRoute from '../../../../../components/ProtectedRoute';

function CreateTeamForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({
        name: '',
        players: [{ name: '', role: 'Batsman', isCaptain: false, isViceCaptain: false }]
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');

    const handleTeamNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, name: e.target.value }));
    };

    const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePlayerChange = (index: number, field: string, value: any) => {
        const newPlayers = [...form.players];
        if (field === 'isCaptain' && value === true) {
            newPlayers.forEach((p, i) => { p.isCaptain = (i === index); if (i === index) p.isViceCaptain = false; });
        } else if (field === 'isViceCaptain' && value === true) {
            newPlayers.forEach((p, i) => { p.isViceCaptain = (i === index); if (i === index) p.isCaptain = false; });
        } else {
            (newPlayers[index] as any)[field] = value;
        }
        setForm(prev => ({ ...prev, players: newPlayers }));
    };

    const addPlayer = () => setForm(prev => ({ ...prev, players: [...prev.players, { name: '', role: 'Batsman', isCaptain: false, isViceCaptain: false }] }));
    const removePlayer = (index: number) => {
        if (form.players.length <= 1) return;
        setForm(prev => ({ ...prev, players: prev.players.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (form.players.some(p => !p.name.trim())) {
            setError('Please provide names for all players');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', form.name);
            if (logoFile) {
                formData.append('logo', logoFile);
            }
            formData.append('players', JSON.stringify(form.players));

            await api.post('/teams', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            router.push('/dashboard/organizer/teams');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create team');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc' }}>
            <div className="cnew-container">
                <Link href="/dashboard/organizer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#94a3b8', textDecoration: 'none', marginBottom: 24, fontSize: 14, fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="cnew-card"
                >
                    <div style={{ marginBottom: 28, textAlign: 'center' }}>
                        <div style={{ width: 60, height: 60, borderRadius: 18, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                            <Users size={30} color="#22c55e" />
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 800, marginBottom: 6 }}>Register New Team</h1>
                        <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Assemble your squad and set the leadership.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Team info fields */}
                        <div className="cnew-top-row">
                            <div>
                                <label style={labelStyle}>Team Name</label>
                                <div style={{ position: 'relative' }}>
                                    <Users size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input name="name" value={form.name} onChange={handleTeamNameChange} required placeholder="Kings XI Punjab" style={inputStyle} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <label style={labelStyle}>Team Logo</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{
                                        width: 64, height: 64, borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        overflow: 'hidden', flexShrink: 0
                                    }}>
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <ImageIcon size={24} color="#475569" />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoFileChange}
                                            style={{
                                                fontSize: 13, color: '#94a3b8',
                                                cursor: 'pointer'
                                            }}
                                        />
                                        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#64748b' }}>JPG, PNG or GIF. Max 5MB.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Squad header */}
                        <div style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>Squad Members ({form.players.length})</h3>
                            <button type="button" onClick={addPlayer} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', padding: '8px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <UserPlus size={15} /> Add Player
                            </button>
                        </div>

                        {/* Players list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 28 }}>
                            <AnimatePresence>
                                {form.players.map((player, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}
                                    >
                                        {/* Name + Role row */}
                                        <div className="player-row">
                                            <input
                                                placeholder={`Player ${index + 1} Name`}
                                                value={player.name}
                                                onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                                                style={{ ...inputStyle, paddingLeft: 16 }}
                                                required
                                            />
                                            <select
                                                value={player.role}
                                                onChange={(e) => handlePlayerChange(index, 'role', e.target.value)}
                                                style={{ ...inputStyle, paddingLeft: 16 }}
                                            >
                                                <option value="Batsman">Batsman</option>
                                                <option value="Bowler">Bowler</option>
                                                <option value="All-rounder">All-rounder</option>
                                                <option value="Wicket-keeper">Wicket-keeper</option>
                                            </select>
                                        </div>

                                        {/* Checkboxes + Delete */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 12, flexWrap: 'wrap' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: player.isCaptain ? '#facc15' : '#64748b' }}>
                                                <input type="checkbox" checked={player.isCaptain} onChange={(e) => handlePlayerChange(index, 'isCaptain', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#facc15' }} />
                                                <Crown size={13} /> Captain (C)
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: player.isViceCaptain ? '#3b82f6' : '#64748b' }}>
                                                <input type="checkbox" checked={player.isViceCaptain} onChange={(e) => handlePlayerChange(index, 'isViceCaptain', e.target.checked)} style={{ width: 16, height: 16, accentColor: '#3b82f6' }} />
                                                <Shield size={13} /> VC
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => removePlayer(index)}
                                                disabled={form.players.length <= 1}
                                                style={{ marginLeft: 'auto', padding: '6px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: 'none', cursor: 'pointer', color: '#ef4444', opacity: form.players.length <= 1 ? 0.4 : 1 }}
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {error && (
                            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#ef4444', fontSize: 13, marginBottom: 20 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                            background: loading ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: '#000', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            boxShadow: '0 4px 20px rgba(34,197,94,0.3)'
                        }}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Team 🏟️'}
                        </button>
                    </form>
                </motion.div>
            </div>

            <style>{`
                .cnew-container { max-width: 800px; margin: 0 auto; padding: 20px 16px; }
                .cnew-card {
                    background: rgba(15,22,41,0.6); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 24px; padding: 22px;
                }
                .cnew-top-row { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 28px; }
                .player-row { display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 0; }
                @media (min-width: 480px) {
                    .player-row { grid-template-columns: 1fr 140px; }
                }
                @media (min-width: 600px) {
                    .cnew-top-row { grid-template-columns: 3fr 2fr; }
                }
                @media (min-width: 640px) {
                    .cnew-container { padding: 36px 24px; }
                    .cnew-card { padding: 36px; }
                }
            `}</style>
        </div>
    );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 };
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px 12px 42px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, color: '#f8fafc', fontSize: 15,
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
};

export default function CreateTeamPage() {
    return (
        <ProtectedRoute allowedRoles={['organizer']}>
            <CreateTeamForm />
        </ProtectedRoute>
    );
}
