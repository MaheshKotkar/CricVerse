"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Zap } from 'lucide-react';

export default function CTABanner() {
    return (
        <section style={{ padding: 'clamp(40px, 6vw, 60px) 0' }}>
            <div className="container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    style={{
                        background: 'linear-gradient(135deg, rgba(22,163,74,0.15) 0%, rgba(30,58,138,0.2) 50%, rgba(22,163,74,0.1) 100%)',
                        border: '1px solid rgba(34,197,94,0.25)',
                        borderRadius: 28,
                        padding: 'clamp(32px, 6vw, 64px) clamp(20px, 4vw, 40px)',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '100%', height: '100%', maxWidth: 600, maxHeight: 300, background: 'radial-gradient(ellipse, rgba(34,197,94,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: 'clamp(36px, 5vw, 48px)', marginBottom: 16 }}>🏆</div>
                        <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 3rem)', fontWeight: 900, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.02em' }}>
                            Ready to <span className="gradient-text">Rule the Pitch?</span>
                        </h2>
                        <p style={{ fontSize: 'clamp(1rem, 2vw, 1.1rem)', color: '#94a3b8', maxWidth: 500, margin: '0 auto 36px', lineHeight: 1.6 }}>
                            Join over 10,000 players already using CricVerse. Create your team, schedule your first match, and track every ball today.
                        </p>
                        <div className="cta-btns" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/auth?mode=signup" className="btn-primary" style={{ padding: '14px 32px' }}>
                                <Zap size={18} /> Get Started Free
                            </Link>
                            <Link href="#" className="btn-secondary" style={{ padding: '14px 32px' }}>
                                View Demo <ArrowRight size={18} />
                            </Link>
                        </div>
                        <p style={{ fontSize: 12, color: '#475569', marginTop: 24 }}>No credit card required • Free forever for casual play</p>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}


