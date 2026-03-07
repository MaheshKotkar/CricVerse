"use client";
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const stats = [
    { value: '10,000+', label: 'Active Players', icon: '🏏' },
    { value: '500+', label: 'Tournaments', icon: '🏆' },
    { value: '50K+', label: 'Matches Tracked', icon: '📊' },
    { value: '4.9★', label: 'Average Rating', icon: '⭐' },
];

const testimonials = [
    { name: 'Arjun Mehta', role: 'Cricket Club Captain', avatar: '🧢', text: 'CricVerse completely changed how we run our club. Scheduling matches and viewing player stats has never been easier. Our members love it!' },
    { name: 'Priya Chandran', role: 'Tournament Organizer', avatar: '👩‍💼', text: "I organized a 16-team knockout in a weekend — all fixtures, scorecards, and standings were updated automatically. It's insane how smooth it is." },
    { name: 'Rohit Singh', role: 'Pro Player', avatar: '🏏', text: 'The stats and analytics section helped me identify weakness in my batting. My average improved by 18% over the last season thanks to CricVerse.' },
];

const clubs = ['Mumbai Indians', 'Delhi Capitals', 'Royal Strikers', 'Kings XI', 'Chennai Bulls'];

export default function SocialProof() {
    return (
        <section id="stats" style={{ padding: 'clamp(60px, 8vw, 100px) 0', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(34,197,94,0.04) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 60 }}>
                    <div className="section-tag">💪 Trusted by Players</div>
                    <h2 className="section-title">Loved by <span className="gradient-text">Cricket Communities</span></h2>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
                    className="stats-grid"
                >
                    {stats.map((s) => (
                        <div key={s.label} className="glass-card" style={{ padding: 'clamp(20px, 3vw, 28px) 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: 'clamp(24px, 3vw, 32px)', marginBottom: 8 }}>{s.icon}</div>
                            <div style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 900, color: '#22c55e', marginBottom: 4 }}>{s.value}</div>
                            <div style={{ fontSize: 'clamp(12px, 1.5vw, 13px)', color: '#94a3b8' }}>{s.label}</div>
                        </div>
                    ))}
                </motion.div>

                <div className="testimonials-grid">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={t.name}
                            className="glass-card"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.12 }}
                            style={{ padding: 'clamp(20px, 3vw, 28px)' }}
                        >
                            <Quote size={24} color="#22c55e" style={{ opacity: 0.5, marginBottom: 14 }} />
                            <p style={{ fontSize: 'clamp(13px, 1.8vw, 14px)', color: '#cbd5e1', lineHeight: 1.7, marginBottom: 20 }}>{t.text}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div>
                                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{t.role}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 2 }}>
                                    {[...Array(5)].map((_, j) => <Star key={j} size={13} fill="#fbbf24" color="#fbbf24" />)}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 12, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 20 }}>Trusted by leading clubs</p>
                    <div className="clubs-row" style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
                        {clubs.map(club => (
                            <div key={club} style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 100, fontSize: 'clamp(12px, 1.5vw, 13px)', fontWeight: 600, color: '#94a3b8' }}>
                                {club}
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
