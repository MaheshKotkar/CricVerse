"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Activity, BarChart2, Users } from 'lucide-react';

function PhoneMockup() {
    return (
        <div className="phone-mockup" style={{
            width: '100%', maxWidth: 280, aspectRatio: '9/19', borderRadius: 36,
            background: 'rgba(10,14,26,0.95)', border: '2px solid rgba(34,197,94,0.3)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(34,197,94,0.15)',
            padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: 12,
            position: 'relative', overflow: 'hidden', margin: '0 auto'
        }}>
            <div style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, margin: '0 auto' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 800 }}>🏏 CricVerse</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                    <span style={{ fontSize: 10, color: '#22c55e', fontWeight: 700 }}>LIVE</span>
                </div>
            </div>

            <div style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '16px' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 12 }}>T20 | Over 16.3</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>Mumbai XI</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e' }}>163<span style={{ fontSize: 13, color: '#94a3b8' }}>/3</span></div>
                    </div>
                    <div style={{ fontSize: 22 }}>⚡</div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>Delhi CC</div>
                        <div style={{ fontSize: 24, fontWeight: 900, color: '#94a3b8' }}>148<span style={{ fontSize: 13 }}>/6</span></div>
                    </div>
                </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 10 }}>Run Rate per Over</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 44 }}>
                    {[40, 60, 55, 80, 70, 90, 75, 85, 60, 95, 70, 88, 65, 100, 80, 72].map((h, i) => (
                        <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 2, background: i === 15 ? 'linear-gradient(180deg, #22c55e, #16a34a)' : 'rgba(34,197,94,0.25)' }} />
                    ))}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
                {([['R. Patel', 'BAT', 72, '#22c55e'], ['M. Kumar', 'BOWL', '3/24', '#3b82f6']] as const).map(([name, role, stat, color]) => (
                    <div key={name as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '12px 16px' }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{name}</div>
                            <div style={{ fontSize: 11, color: '#94a3b8' }}>{role}</div>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: color as string }}>{stat}</div>
                    </div>
                ))}
            </div>

            <div style={{ position: 'absolute', bottom: -20, left: '50%', transform: 'translateX(-50%)', width: 200, height: 100, background: 'radial-gradient(ellipse, rgba(34,197,94,0.2) 0%, transparent 70%)', pointerEvents: 'none' }} />
        </div>
    );
}

export default function AppPreview() {
    return (
        <section id="preview" style={{ padding: 'clamp(60px, 8vw, 100px) 0', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(14,20,40,0.8) 0%, rgba(10,14,26,0.8) 100%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', left: '-10%', top: '20%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="preview-grid">

                    <motion.div
                        initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                        className="preview-phones"
                    >
                        <motion.div style={{ flex: 1, maxWidth: 300, width: '100%' }} animate={{ y: [0, -12, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}>
                            <PhoneMockup />
                        </motion.div>

                        <motion.div
                            className="preview-phone-side"
                            animate={{ y: [0, -8, 0] }}
                            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
                            style={{ width: '100%', maxWidth: 260 }}
                        >
                            <div className="analytics-card" style={{ background: 'rgba(15,22,41,0.9)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 20, padding: '24px', backdropFilter: 'blur(20px)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <BarChart2 size={16} color="#3b82f6" /> Analytics
                                </div>
                                <div style={{ fontSize: 36, fontWeight: 900, color: '#3b82f6', marginBottom: 4 }}>52.4</div>
                                <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Batting Average</div>
                                <div style={{ display: 'flex', gap: 12 }}>
                                    {[['SR', '138', '#a3e635'], ['100s', '4', '#f97316']].map(([l, v, c]) => (
                                        <div key={l} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px', textAlign: 'center' }}>
                                            <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
                                            <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{l}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right — Text */}
                    <motion.div
                        initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
                    >
                        <div className="section-tag" style={{ alignSelf: 'flex-start' }}>📱 Mobile-First</div>
                        <h2 className="section-title" style={{ textAlign: 'left', alignSelf: 'flex-start' }}>
                            Cricket in Your <span className="gradient-text">Pocket</span>
                        </h2>
                        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)', color: '#94a3b8', lineHeight: 1.7, marginBottom: 32 }}>
                            Manage your team, score live matches, and track every stat from the palm of your hand. CricVerse works beautifully on any device, any time.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40, width: '100%' }}>
                            {[
                                { Icon: Activity, color: '#22c55e', text: 'Live ball-by-ball scoring from your phone' },
                                { Icon: BarChart2, color: '#3b82f6', text: 'Instant performance analytics after each game' },
                                { Icon: Users, color: '#f97316', text: 'Manage your entire squad on the go' },
                            ].map(({ Icon, color, text }) => (
                                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Icon size={22} color={color} />
                                    </div>
                                    <span style={{ fontSize: 'clamp(15px, 2vw, 16px)', color: '#cbd5e1' }}>{text}</span>
                                </div>
                            ))}
                        </div>

                        <div className="btn-wrap" style={{ display: 'flex', width: '100%' }}>
                            <Link href="/auth?mode=signup" className="btn-primary">
                                Start Your Cricket Journey <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}


