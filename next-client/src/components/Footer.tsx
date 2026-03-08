"use client";
import Link from 'next/link';
import { Github, Twitter, Instagram, Mail, Youtube } from 'lucide-react';

export default function Footer() {
    return (
        <footer style={{ background: '#0a0e1a', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 'clamp(50px, 8vw, 80px)', paddingBottom: 24, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 800, height: 1, background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), transparent)' }} />
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translate(-50%, -50%)', width: 300, height: 150, background: 'radial-gradient(ellipse, rgba(34,197,94,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

            <div className="container">
                <div className="footer-grid">

                    <div className="footer-brand" style={{ paddingRight: 40 }}>
                        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🏏</div>
                            <span style={{ fontSize: 20, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>CricVerse</span>
                        </Link>
                        <p style={{ fontSize: '14px', color: '#94a3b8', lineHeight: 1.7, marginBottom: 24 }}>
                            The ultimate digital ecosystem for cricket. Build teams, score matches, and track your career stats anywhere, anytime.
                        </p>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <Link href="#" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => (e.target as HTMLElement).style.color = '#22c55e'} onMouseLeave={e => (e.target as HTMLElement).style.color = '#94a3b8'}><Twitter size={20} /></Link>
                            <Link href="#" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => (e.target as HTMLElement).style.color = '#22c55e'} onMouseLeave={e => (e.target as HTMLElement).style.color = '#94a3b8'}><Instagram size={20} /></Link>
                            <Link href="#" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => (e.target as HTMLElement).style.color = '#22c55e'} onMouseLeave={e => (e.target as HTMLElement).style.color = '#94a3b8'}><Youtube size={20} /></Link>
                            <Link href="#" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => (e.target as HTMLElement).style.color = '#22c55e'} onMouseLeave={e => (e.target as HTMLElement).style.color = '#94a3b8'}><Github size={20} /></Link>
                            <Link href="#" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseEnter={e => (e.target as HTMLElement).style.color = '#22c55e'} onMouseLeave={e => (e.target as HTMLElement).style.color = '#94a3b8'}><Mail size={20} /></Link>
                        </div>
                    </div>

                    {[
                        {
                            title: 'Platform', links: [
                                { label: 'Features', href: '/#features' },
                                { label: 'Live Scoring', href: '/#how-it-works' },
                                { label: 'Tournaments', href: '/dashboard/player/tournaments' },
                                { label: 'Pricing', href: '/#pricing' }
                            ]
                        },
                        {
                            title: 'Resources', links: [
                                { label: 'Help Center', href: '#' },
                                { label: 'Cricket Rules', href: '#' },
                                { label: 'Community', href: '#' },
                                { label: 'Blog', href: '#' }
                            ]
                        },
                        {
                            title: 'Company', links: [
                                { label: 'About Us', href: '#' },
                                { label: 'Careers', href: '#' },
                                { label: 'Contact', href: '#' },
                                { label: 'Partners', href: '#' }
                            ]
                        },
                        {
                            title: 'Legal', links: [
                                { label: 'Terms of Service', href: '#' },
                                { label: 'Privacy Policy', href: '#' },
                                { label: 'Cookie Policy', href: '#' }
                            ]
                        }
                    ].map(col => (
                        <div key={col.title}>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: '#f8fafc', marginBottom: 20 }}>{col.title}</h4>
                            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {col.links.map(link => (
                                    <li key={link.label}>
                                        <Link href={link.href} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14, transition: 'color 0.2s' }}
                                            onMouseEnter={e => (e.target as HTMLElement).style.color = '#fff'}
                                            onMouseLeave={e => (e.target as HTMLElement).style.color = '#94a3b8'}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <p style={{ fontSize: 13, color: '#64748b' }}>© 2026 CricVerse. All rights reserved.</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
                        <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>All Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}


