"use client";
import { motion } from 'framer-motion';
import { Users, Activity, Trophy, BarChart2, Calendar, Star } from 'lucide-react';

const features = [
    { Icon: Users, color: '#22c55e', title: 'Team Builder', desc: 'Create custom teams, assign player roles, and manage your squad with a powerful intuitive interface.', tag: 'Teams' },
    { Icon: Activity, color: '#3b82f6', title: 'Live Match Scoring', desc: 'Real-time score updates, ball-by-ball commentary, and a dynamic match dashboard for every game.', tag: 'Live' },
    { Icon: Trophy, color: '#f97316', title: 'Tournament Management', desc: 'Organize leagues, knockouts, and round-robin fixtures with automated bracket generation and scheduling.', tag: 'Tournaments' },
    { Icon: BarChart2, color: '#a3e635', title: 'Player Stats & Analytics', desc: 'Deep performance insights, charts, leaderboards, and career stats updated after every match.', tag: 'Analytics' },
    { Icon: Calendar, color: '#8b5cf6', title: 'Match Scheduling', desc: 'Plan fixtures, manage ground bookings, and get automated reminders sent to all participants.', tag: 'Scheduling' },
    { Icon: Star, color: '#fbbf24', title: 'Live Leaderboards', desc: 'Track rankings across tournaments, seasons, and all-time records on real-time live leaderboards.', tag: 'Rankings' },
];

const cardVariants: any = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' } }),
};

export default function Features() {
    return (
        <section id="features" style={{ padding: 'clamp(60px, 8vw, 100px) 0', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 800, height: 600, background: 'radial-gradient(ellipse, rgba(34,197,94,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div className="container" style={{ textAlign: 'center' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                    <div className="section-tag">🚀 Everything You Need</div>
                    <h2 className="section-title">Packed with <span className="gradient-text">Powerful Features</span></h2>
                    <p className="section-sub">
                        Everything a cricket organizer, player, or fan needs — from team creation to live match analytics, all in one place.
                    </p>
                </motion.div>

                <div className="features-grid">
                    {features.map(({ Icon, color, title, desc, tag }, i) => (
                        <motion.div
                            key={title}
                            className="glass-card"
                            custom={i}
                            variants={cardVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            style={{ padding: 'clamp(20px, 3vw, 28px)', textAlign: 'left', position: 'relative', overflow: 'hidden' } as any}
                        >
                            <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${color}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 10, flexWrap: 'wrap' }}>
                                <div style={{ width: 50, height: 50, borderRadius: 14, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <Icon size={22} color={color} />
                                </div>
                                <span style={{ fontSize: 11, fontWeight: 700, color, background: `${color}15`, border: `1px solid ${color}30`, borderRadius: 100, padding: '3px 12px', letterSpacing: '0.05em', textTransform: 'uppercase', alignSelf: 'flex-start' }}>
                                    {tag}
                                </span>
                            </div>

                            <h3 style={{ fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 800, marginBottom: 10, color: '#f8fafc' }}>{title}</h3>
                            <p style={{ fontSize: 'clamp(13px, 1.5vw, 14px)', color: '#94a3b8', lineHeight: 1.65 }}>{desc}</p>

                            <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 6, color, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                                Learn more →
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
