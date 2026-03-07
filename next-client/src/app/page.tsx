"use client";
import Hero from '../components/Hero';
import Features from '../components/Features';
import HowItWorks from '../components/HowItWorks';
import SocialProof from '../components/SocialProof';
import AppPreview from '../components/AppPreview';
import FAQ from '../components/FAQ';
import CTABanner from '../components/CTABanner';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';

export default function Home() {
  return (
    <div style={{ background: '#0a0e1a', minHeight: '100vh', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <SocialProof />
        <AppPreview />
        <FAQ />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
