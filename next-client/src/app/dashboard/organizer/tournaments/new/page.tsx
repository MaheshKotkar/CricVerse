"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Calendar, MapPin, AlignLeft, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import api from '../../../../../utils/api';
import ProtectedRoute from '../../../../../components/ProtectedRoute';

function CreateTournamentForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', format: 'T20', startDate: '', venue: '', description: '' });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await api.post('/tournaments', form);
            router.push('/dashboard/organizer');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create tournament');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc' }}>
            <div className="tnew-container">
                <Link href="/dashboard/organizer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#94a3b8', textDecoration: 'none', marginBottom: 28, fontSize: 14, fontWeight: 600 }}>
                    <ArrowLeft size={16} /> Back to Dashboard
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(15,22,41,0.6)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: '24px' }}
                    className="tnew-card"
                >
                    <div style={{ marginBottom: 28 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                            <Trophy size={24} color="#3b82f6" />
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.3rem, 5vw, 1.6rem)', fontWeight: 800, marginBottom: 6 }}>Launch New Tournament</h1>
                        <p style={{ color: '#94a3b8', fontSize: 14, margin: 0 }}>Create a new cricket event and start inviting teams.</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: 18 }}>
                            <label style={labelStyle}>Tournament Name</label>
                            <div style={{ position: 'relative' }}>
                                <Trophy size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                <input name="name" value={form.name} onChange={handleChange} required placeholder="Mega Cricket League 2024" style={inputStyle} />
                            </div>
                        </div>

                        <div className="tnew-row">
                            <div>
                                <label style={labelStyle}>Format</label>
                                <select name="format" value={form.format} onChange={handleChange} style={{ ...inputStyle, paddingLeft: 14 }}>
                                    <option value="T20">T20</option>
                                    <option value="ODI">ODI (50 Overs)</option>
                                    <option value="Test">Test Match</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Start Date</label>
                                <div style={{ position: 'relative' }}>
                                    <Calendar size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                    <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required style={inputStyle} />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: 18 }}>
                            <label style={labelStyle}>Venue</label>
                            <div style={{ position: 'relative' }}>
                                <MapPin size={16} color="#475569" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                <input name="venue" value={form.venue} onChange={handleChange} placeholder="Mumbai Cricket Stadium" style={inputStyle} />
                            </div>
                        </div>

                        <div style={{ marginBottom: 28 }}>
                            <label style={labelStyle}>Description (Optional)</label>
                            <div style={{ position: 'relative' }}>
                                <AlignLeft size={16} color="#475569" style={{ position: 'absolute', left: 14, top: 20 }} />
                                <textarea name="description" value={form.description} onChange={handleChange} placeholder="Briefly describe the tournament rules or details..." style={{ ...inputStyle, minHeight: 100, paddingTop: 16, resize: 'vertical' }} />
                            </div>
                        </div>

                        {error && (
                            <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12, color: '#ef4444', fontSize: 13, marginBottom: 20 }}>
                                ⚠️ {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} style={{
                            width: '100%', padding: '15px', borderRadius: 12, border: 'none',
                            background: loading ? 'rgba(34,197,94,0.4)' : 'linear-gradient(135deg, #22c55e, #16a34a)',
                            color: '#000', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            boxShadow: '0 4px 20px rgba(34,197,94,0.3)'
                        }}>
                            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Tournament 🚀'}
                        </button>
                    </form>
                </motion.div>
            </div>

            <style>{`
                .tnew-container { max-width: 640px; margin: 0 auto; padding: 24px 16px; }
                .tnew-row { display: grid; grid-template-columns: 1fr; gap: 16px; margin-bottom: 18px; }
                @media (min-width: 480px) {
                    .tnew-row { grid-template-columns: 1fr 1fr; }
                }
                @media (min-width: 640px) {
                    .tnew-container { padding: 40px 24px; }
                    .tnew-card { padding: 40px !important; }
                }
            `}</style>
        </div>
    );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 8 };
const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px 12px 42px', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.09)', borderRadius: 12, color: '#f8fafc', fontSize: 15,
    outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box'
};

export default function CreateTournamentPage() {
    return (
        <ProtectedRoute allowedRoles={['organizer']}>
            <CreateTournamentForm />
        </ProtectedRoute>
    );
}
