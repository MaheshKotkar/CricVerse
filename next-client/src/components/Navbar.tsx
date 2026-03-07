"use client";
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Zap } from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Stats', href: '#stats' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        padding: '0 24px',
        height: '70px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: scrolled ? 'rgba(10,14,26,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.4s ease',
      }}
    >
      <div style={{ maxWidth: 1200, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link href="#" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(34,197,94,0.5)' }}>
            <span style={{ fontSize: 18 }}>🏏</span>
          </div>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Cric<span style={{ color: '#22c55e' }}>Verse</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="nav-links" style={{ display: 'flex', gap: 36, alignItems: 'center' }}>
          {navLinks.map(link => (
            <Link
              key={link.label}
              href={link.href}
              style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500, fontSize: 15, transition: 'color 0.2s' }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = '#f8fafc'}
              onMouseLeave={e => (e.target as HTMLElement).style.color = '#94a3b8'}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="nav-cta" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/auth" style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500, fontSize: 15 }}>Log in</Link>
          <Link href="/auth?mode=signup" className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
            <Zap size={15} /> Get Started
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: 'none', border: 'none', color: '#f8fafc', cursor: 'pointer', display: 'none', padding: 4 }}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              position: 'absolute', top: '70px', left: 0, right: 0,
              background: 'rgba(10,14,26,0.97)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {navLinks.map(link => (
                <Link key={link.label} href={link.href} onClick={() => setMenuOpen(false)}
                  style={{ color: '#f8fafc', textDecoration: 'none', fontWeight: 600, fontSize: 18 }}>
                  {link.label}
                </Link>
              ))}
              <Link href="/auth?mode=signup" className="btn-primary" style={{ textAlign: 'center', justifyContent: 'center', marginTop: 8 }}>
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .nav-links, .nav-cta { display: none !important; }
          .menu-toggle { display: flex !important; }
        }
      `}</style>
    </motion.nav>
  );
}


