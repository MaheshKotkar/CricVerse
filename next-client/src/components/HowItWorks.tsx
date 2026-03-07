"use client";
import { motion } from 'framer-motion';
import { UserPlus, CalendarDays, BarChart2 } from 'lucide-react';

const steps = [
    { number: '01', Icon: UserPlus, color: '#22c55e', title: 'Create Your Team', desc: 'Sign up, build your squad, assign batting and bowling roles, set team colors and logo — all in minutes.' },
    { number: '02', Icon: CalendarDays, color: '#3b82f6', title: 'Schedule a Match', desc: 'Challenge opponents, pick your venue and format, set the date — reminders go out automatically.' },
    { number: '03', Icon: BarChart2, color: '#f97316', title: 'Track Live & Compete', desc: 'Score ball-by-ball in real time, climb the leaderboard, and unlock detailed performance analytics after every match.' },
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" style={{ padding: 'clamp(60px, 8vw, 100px) 0', position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent, rgba(14,20,40,0.6) 50%, transparent)', pointerEvents: 'none' }} />

            <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                    <div className="section-tag">⚡ Quick Start</div>
                    <h2 className="section-title">Up and Running in <span className="gradient-text">3 Simple Steps</span></h2>
                    <p className="section-sub">No complicated setup. Go from zero to live match in under 10 minutes.</p>
                </motion.div>

                <div className="steps-grid">
                    <div className="steps-connector" />

                    {steps.map((step, i) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.15 }}
                            style={{ padding: '0 24px', textAlign: 'center', position: 'relative', zIndex: 1 }}
                        >
                            <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px', position: 'relative', background: `${step.color}15`, border: `2px solid ${step.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 30px ${step.color}20` }}>
                                <step.Icon size={32} color={step.color} />
                                <div style={{ position: 'absolute', top: -10, right: -10, width: 28, height: 28, borderRadius: '50%', background: step.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#000' }}>
                                    {step.number.slice(1)}
                                </div>
                            </div>

                            <h3 style={{ fontSize: 'clamp(18px, 2.5vw, 20px)', fontWeight: 800, marginBottom: 12, color: '#f8fafc' }}>{step.title}</h3>
                            <p style={{ fontSize: 'clamp(13px, 1.5vw, 14px)', color: '#94a3b8', lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
