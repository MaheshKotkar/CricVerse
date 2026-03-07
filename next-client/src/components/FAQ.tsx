"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';

const faqs = [
    { q: 'Is CricVerse free to use?', a: 'CricVerse offers a generous free tier with full team creation and match tracking features. Premium plans unlock advanced analytics, unlimited tournaments, and priority support.' },
    { q: 'Can I use CricVerse for informal street cricket?', a: 'Absolutely! CricVerse works for everything from casual gully cricket to professional club matches. Just create your team and start scoring.' },
    { q: 'How does live scoring work?', a: 'The scorer enters ball-by-ball data via the mobile or web app. All connected devices update instantly — spectators, coaches, and players see results in real time.' },
    { q: 'Can I manage multiple teams?', a: 'Yes! You can create and manage multiple teams as a captain or player. Easily switch between teams from your dashboard.' },
    { q: 'How are player statistics calculated?', a: "All stats — batting averages, bowling economy, strike rates — are automatically computed from match data you enter. They update instantly after each game." },
    { q: 'Is CricVerse available on mobile?', a: 'Yes! CricVerse is fully responsive and works seamlessly in the browser on any device. Native iOS and Android apps are coming soon.' },
];

export default function FAQ() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section id="faq" style={{ padding: 'clamp(60px, 8vw, 100px) 0' }}>
            <div className="container" style={{ maxWidth: 820 }}>
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: 'center', marginBottom: 'clamp(32px, 5vw, 56px)' }}>
                    <div className="section-tag">❓ FAQ</div>
                    <h2 className="section-title">Frequently Asked <span className="gradient-text">Questions</span></h2>
                </motion.div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: i * 0.06 }}
                        >
                            <div
                                className="glass-card"
                                style={{ overflow: 'hidden', cursor: 'pointer' } as any}
                                onClick={() => setOpen(open === i ? null : i)}
                            >
                                <div style={{ padding: 'clamp(16px, 3vw, 20px) 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                                    <span style={{ fontWeight: 600, fontSize: 'clamp(14px, 2vw, 16px)', color: open === i ? '#22c55e' : '#f8fafc', transition: 'color 0.2s', lineHeight: 1.4 }}>
                                        {faq.q}
                                    </span>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: open === i ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' }}>
                                        {open === i ? <Minus size={14} color="#22c55e" /> : <Plus size={14} color="#94a3b8" />}
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {open === i && (
                                        <motion.div
                                            key="answer"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        >
                                            <div style={{ padding: '0 24px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                                <p style={{ fontSize: 'clamp(13px, 1.8vw, 14px)', color: '#94a3b8', lineHeight: 1.7, paddingTop: 16 }}>{faq.a}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
