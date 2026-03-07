"use client";
import Link from 'next/link';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Play, TrendingUp, Users, Activity, ChevronRight } from 'lucide-react';

function ScoreCard() {
    return (
        <div style={{
            background: 'rgba(15,22,41,0.9)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 16,
            padding: '16px 20px',
            width: 230,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(34,197,94,0.1)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>LIVE</span>
                <span style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%', boxShadow: '0 0 8px #22c55e', display: 'inline-block' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#f8fafc' }}>Mumbai XI</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e' }}>186<span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 400 }}>/4</span></div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#f8fafc' }}>Delhi CC</div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#94a3b8' }}>162<span style={{ fontSize: 13, fontWeight: 400 }}>/7</span></div>
                </div>
            </div>
            <div style={{ background: 'rgba(34,197,94,0.1)', borderRadius: 8, padding: '6px 10px', fontSize: 11, color: '#4ade80' }}>
                18.3 ov • Req: 25 off 9 balls
            </div>
        </div>
    );
}

function PlayerCard() {
    return (
        <div style={{
            background: 'rgba(15,22,41,0.9)',
            border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 16,
            padding: '14px 18px',
            width: 210,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(59,130,246,0.1)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #1e3a8a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🏏</div>
                <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>Rahul Sharma</div>
                    <div style={{ fontSize: 11, color: '#94a3b8' }}>Opening Batsman</div>
                </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                {[['Runs', '1,248'], ['Avg', '52.4'], ['SR', '138']].map(([label, val]) => (
                    <div key={label} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '6px 4px' }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#3b82f6' }}>{val}</div>
                        <div style={{ fontSize: 10, color: '#94a3b8' }}>{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function AnalyticsCard() {
    const bars = [60, 80, 45, 90, 70, 55, 85];
    return (
        <div style={{
            background: 'rgba(15,22,41,0.9)',
            border: '1px solid rgba(163,230,53,0.25)',
            borderRadius: 16,
            padding: '14px 18px',
            width: 195,
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>Performance</span>
                <TrendingUp size={14} color="#a3e635" />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 48 }}>
                {bars.map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: 3, background: i === 3 ? 'linear-gradient(180deg, #a3e635, #22c55e)' : 'rgba(163,230,53,0.2)' }} />
                ))}
            </div>
            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 10, color: '#94a3b8' }}>Last 7 matches</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#a3e635' }}>▲ 18%</span>
            </div>
        </div>
    );
}

const float: any = { animate: { y: [0, -12, 0], transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } } };
const float2: any = { animate: { y: [0, -8, 0], transition: { duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 } } };
const float3: any = { animate: { y: [0, -10, 0], transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } } };

export default function Hero() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref });
    const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);

    return (
        <section
            id="hero"
            ref={ref}
            style={{ minHeight: '100vh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: 70 }}
        >
            <motion.div style={{ position: 'absolute', inset: 0, y: bgY, backgroundImage: `url('/assets/hero-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,14,26,0.95) 0%, rgba(10,14,26,0.75) 50%, rgba(10,14,26,0.92) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 50% 100%, rgba(34,197,94,0.12) 0%, transparent 70%)' }} />
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)', backgroundSize: '60px 60px', maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent)' }} />

            <div className="container" style={{ position: 'relative', zIndex: 2, paddingTop: 60, paddingBottom: 60 }}>
                <div className="hero-content-grid">

                    {/* ── TEXT COLUMN ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    >
                        <div className="section-tag" style={{ marginBottom: 20 }}>
                            <span className="glow-dot" />
                            Cricket&apos;s Most Powerful Platform
                        </div>

                        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: '-0.03em' }}>
                            Build Your Team.<br />
                            <span className="gradient-text">Rule the Match.</span><br />
                            Own the Game.
                        </h1>

                        <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)', color: '#94a3b8', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                            Create teams, host matches, and track live cricket scores — all in one powerful platform built for players, organizers, and fans.
                        </p>

                        <div className="hero-text-btns" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
                            <Link href="/auth?mode=signup" className="btn-primary">
                                <Users size={17} /> Create Your Team
                            </Link>
                            <Link href="/auth" className="btn-secondary">
                                <Play size={17} style={{ fill: 'currentColor' }} /> Live Matches
                            </Link>
                        </div>

                        <div className="hero-stats-row" style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                            {[['10,000+', 'Active Players'], ['500+', 'Tournaments'], ['50K+', 'Matches']].map(([num, label]) => (
                                <div key={label}>
                                    <div style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>{num}</div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{label}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ── FLOATING CARDS COLUMN ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                        className="hero-cards-col"
                    >
                        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(34,197,94,0.15) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }} />

                        <motion.div
                            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ position: 'absolute', fontSize: 110, filter: 'drop-shadow(0 0 40px rgba(34,197,94,0.3))', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
                        >🏏</motion.div>

                        <motion.div {...float} style={{ position: 'absolute', top: 10, right: -10 } as any}><ScoreCard /></motion.div>
                        <motion.div {...float2} style={{ position: 'absolute', bottom: 20, left: -10 } as any}><PlayerCard /></motion.div>
                        <motion.div {...float3} style={{ position: 'absolute', bottom: 40, right: 5 } as any}><AnalyticsCard /></motion.div>

                        <motion.div
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                            style={{ position: 'absolute', top: 55, left: 0, background: 'rgba(15,22,41,0.9)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, backdropFilter: 'blur(20px)' }}
                        >
                            <Activity size={15} color="#f97316" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#f97316' }}>12 Live Matches</span>
                        </motion.div>
                    </motion.div>

                </div>
            </div>

            <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 2 }}
            >
                <span style={{ fontSize: 10, color: '#475569', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</span>
                <ChevronRight style={{ transform: 'rotate(90deg)', color: '#475569' }} size={16} />
            </motion.div>
        </section>
    );
}


