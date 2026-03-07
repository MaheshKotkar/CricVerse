"use client";
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import {
    LayoutDashboard, Users, Trophy, Activity, Settings,
    LogOut, Menu, X, ShieldAlert, ChevronRight, Search
} from 'lucide-react';
import { useState } from 'react';

const stats = [
    { label: 'Total Users', value: '124', change: '+12%', color: '#3b82f6' },
    { label: 'Active Leagues', value: '12', change: '+2', color: '#22c55e' },
    { label: 'Live Matches', value: '4', change: 'Live', color: '#ef4444' },
    { label: 'Revenue', value: '₹42k', change: '+18%', color: '#facc15' },
];

const mockUsers = [
    { name: 'Mahesh Kotkar', email: 'mahesh@example.com', role: 'Organizer', status: 'Active' },
    { name: 'John Doe', email: 'john@example.com', role: 'Player', status: 'Active' },
    { name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Organizer', status: 'Pending' },
];

function AdminDashboardContent() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
            {/* Desktop Sidebar (hidden on mobile) */}
            <aside style={{
                position: 'fixed', left: 0, top: 0, bottom: 0, width: 260,
                background: '#0f172a', borderRight: '1px solid rgba(255,255,255,0.06)',
                display: 'none', lgDisplay: 'flex'
            } as any} className="sidebar">
                <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 48 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚡</div>
                        <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px' }}>CricVerse</span>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <SidebarLink icon={<LayoutDashboard size={20} />} label="Overview" active />
                        <SidebarLink icon={<Users size={20} />} label="User Management" />
                        <SidebarLink icon={<Trophy size={20} />} label="Tournaments" />
                        <SidebarLink icon={<Activity size={20} />} label="System Logs" />
                        <SidebarLink icon={<Settings size={20} />} label="Settings" />
                    </nav>

                    <button onClick={logout} style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, padding: '12px', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        <LogOut size={20} /> Logout
                    </button>
                </div>
            </aside>

            {/* Topbar (Mobile) */}
            <nav style={{
                background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.06)',
                padding: '16px 20px', display: 'flex', lgDisplay: 'none',
                alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100
            } as any}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #f97316, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚡</div>
                    <span style={{ fontSize: 18, fontWeight: 900 }}>Admin</span>
                </div>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', color: '#94a3b8' }}>
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div style={{ position: 'fixed', inset: 0, background: '#0a0e1a', zIndex: 99, padding: '80px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <SidebarLink icon={<LayoutDashboard size={22} />} label="Overview" active />
                    <SidebarLink icon={<Users size={22} />} label="User Management" />
                    <SidebarLink icon={<Trophy size={22} />} label="Tournaments" />
                    <button onClick={logout} style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, padding: '16px', color: '#ef4444', background: 'rgba(239,68,68,0.05)', border: 'none', borderRadius: 12, fontWeight: 700 }}>
                        <LogOut size={22} /> Logout
                    </button>
                </div>
            )}

            {/* Main Content Area */}
            <main style={{ marginLeft: 0, lgMarginLeft: 260, padding: '24px 16px', smPadding: '40px 32px' } as any}>
                <header style={{ marginBottom: 40 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#f97316', marginBottom: 8 }}>
                        <ShieldAlert size={16} /> <span style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Administrator</span>
                    </div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2rem)', fontWeight: 900 }}>Platform Overview</h1>
                </header>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
                    {stats.map((s, i) => (
                        <div key={i} style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 20, padding: '24px' }}>
                            <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{s.label}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                                <div style={{ fontSize: 32, fontWeight: 900 }}>{s.value}</div>
                                <span style={{ fontSize: 12, fontWeight: 700, color: s.change.includes('+') ? '#22c55e' : '#ef4444' }}>{s.change}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Content Sections */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', lgGridTemplateColumns: '2fr 1fr', gap: 32 } as any}>
                    {/* User Table Card */}
                    <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 24, overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: 18, fontWeight: 800 }}>Registered Users</h2>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 12px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Search size={16} color="#475569" />
                                <input placeholder="Search..." style={{ background: 'none', border: 'none', outline: 'none', color: '#f8fafc', fontSize: 13 }} />
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                                        {['User', 'Role', 'Status', ''].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '16px 24px', fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockUsers.map((u, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                            <td style={{ padding: '16px 24px' }}>
                                                <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div>
                                                <div style={{ fontSize: 12, color: '#64748b' }}>{u.email}</div>
                                            </td>
                                            <td style={{ padding: '16px 24px', fontSize: 13 }}>{u.role}</td>
                                            <td style={{ padding: '16px 24px' }}>
                                                <span style={{ fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 6, background: u.status === 'Active' ? '#22c55e15' : '#facc1515', color: u.status === 'Active' ? '#22c55e' : '#facc15' }}>
                                                    {u.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                                <button style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12 }}>Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Side Info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <div style={{ background: 'linear-gradient(135deg, #f9731620, #ea580c10)', border: '1px solid #f9731630', borderRadius: 24, padding: '24px' }}>
                            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 12 }}>System Alerts</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                <Alert message="New organizer pending approval" time="2m ago" />
                                <Alert message="Server load spike detected" time="15m ago" urgent />
                                <Alert message="Database backup successful" time="1h ago" />
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx>{`
                @media (max-width: 1023px) {
                    .sidebar { display: none; }
                }
            `}</style>
        </div>
    );
}

function SidebarLink({ icon, label, active }: any) {
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 14,
            background: active ? 'rgba(249,115,22,0.1)' : 'transparent',
            color: active ? '#f97316' : '#94a3b8',
            cursor: 'pointer', fontWeight: active ? 700 : 500, transition: 'all 0.2s'
        }}>
            {icon} {label}
        </div>
    );
}

function Alert({ message, time, urgent }: any) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 13, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: urgent ? '#ef4444' : '#22c55e' }} />
                {message}
            </div>
            <span style={{ fontSize: 11, color: '#475569' }}>{time}</span>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardContent />
        </ProtectedRoute>
    );
}
