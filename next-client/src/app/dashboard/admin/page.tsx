"use client";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import {
    LayoutDashboard, Users, Trophy, Shield, LogOut,
    Trash2, Pencil, X, Check, ChevronDown, Loader2, UsersRound
} from 'lucide-react';
import api from '../../../utils/api';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────
type Tab = 'overview' | 'users' | 'tournaments' | 'teams';

function AdminDashboardContent() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState<any>(null);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, tournamentsRes, teamsRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/tournaments'),
                api.get('/admin/teams'),
            ]);
            setStats(statsRes.data.data);
            setUsers(usersRes.data.data);
            setTournaments(tournamentsRes.data.data);
            setTeams(teamsRes.data.data);
        } catch {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const deleteUser = async (id: string, name: string) => {
        const t = toast.loading(`Deleting ${name}...`);
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u._id !== id));
            toast.success(`${name} deleted`, { id: t });
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to delete user', { id: t });
        }
    };

    const updateUser = async () => {
        if (!editingUser) return;
        const t = toast.loading('Saving changes...');
        try {
            const res = await api.put(`/admin/users/${editingUser._id}`, { name: editingUser.name, role: editingUser.role });
            setUsers(prev => prev.map(u => u._id === editingUser._id ? res.data.data : u));
            setEditingUser(null);
            toast.success('User updated!', { id: t });
        } catch (e: any) {
            toast.error(e.response?.data?.message || 'Failed to update user', { id: t });
        }
    };

    const deleteTournament = async (id: string, name: string) => {
        const t = toast.loading(`Deleting ${name}...`);
        try {
            await api.delete(`/admin/tournaments/${id}`);
            setTournaments(prev => prev.filter(t => t._id !== id));
            toast.success(`${name} deleted`, { id: t });
        } catch {
            toast.error('Failed to delete tournament', { id: t });
        }
    };

    const deleteTeam = async (id: string, name: string) => {
        const t = toast.loading(`Deleting ${name}...`);
        try {
            await api.delete(`/admin/teams/${id}`);
            setTeams(prev => prev.filter(t => t._id !== id));
            toast.success(`${name} deleted`, { id: t });
        } catch {
            toast.error('Failed to delete team', { id: t });
        }
    };

    const navItems = [
        { key: 'overview', label: 'Overview', icon: LayoutDashboard },
        { key: 'users', label: 'Users', icon: Users },
        { key: 'tournaments', label: 'Tournaments', icon: Trophy },
        { key: 'teams', label: 'Teams', icon: UsersRound },
    ];

    return (
        <div className="admin-shell">
            {/* ── Desktop Sidebar ──────────────────────── */}
            <aside className="admin-sidebar">
                <div className="sidebar-logo">
                    <div className="logo-icon">⚡</div>
                    <span>CricVerse</span>
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#f97316', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 16px', marginBottom: 12 }}>
                    Admin Panel
                </div>
                <nav className="sidebar-nav">
                    {navItems.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            className={`sidebar-link${activeTab === key ? ' active' : ''}`}
                            onClick={() => setActiveTab(key as Tab)}
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: 13 }}>{user?.name}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>Administrator</div>
                        </div>
                    </div>
                    <button onClick={logout} className="sidebar-logout">
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* ── Main content ───────────────────────── */}
            <main className="admin-main">
                {/* Top bar (desktop only) */}
                <div className="admin-topbar">
                    <h1 className="admin-topbar-title">
                        {navItems.find(n => n.key === activeTab)?.label}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Shield size={14} color="#f97316" />
                        <span style={{ fontSize: 12, color: '#f97316', fontWeight: 700 }}>God Mode</span>
                    </div>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                        <Loader2 size={40} color="#f97316" className="animate-spin" />
                    </div>
                ) : (
                    <>
                        {/* ─── Overview ─── */}
                        {activeTab === 'overview' && (
                            <div>
                                <div className="stats-grid">
                                    {[
                                        { label: 'Total Users', value: stats?.totalUsers ?? 0, color: '#3b82f6', icon: '👤' },
                                        { label: 'Tournaments', value: stats?.totalTournaments ?? 0, color: '#f97316', icon: '🏆' },
                                        { label: 'Active Tournaments', value: stats?.activeTournaments ?? 0, color: '#22c55e', icon: '🟢' },
                                        { label: 'Total Teams', value: stats?.totalTeams ?? 0, color: '#a855f7', icon: '👥' },
                                    ].map((s, i) => (
                                        <div key={i} className="stat-card" style={{ borderColor: s.color + '30' }}>
                                            <div style={{ fontSize: 28 }}>{s.icon}</div>
                                            <div style={{ fontSize: 36, fontWeight: 900, color: s.color }}>{s.value}</div>
                                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>{s.label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="overview-grid">
                                    <div className="admin-card">
                                        <div className="card-header"><Users size={18} color="#3b82f6" />Recent Users</div>
                                        {users.slice(0, 5).map(u => (
                                            <div key={u._id} className="list-row">
                                                <div className="row-avatar">{u.name?.[0]?.toUpperCase()}</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</div>
                                                    <div style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                                                </div>
                                                <span className={`role-badge role-${u.role}`}>{u.role}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="admin-card">
                                        <div className="card-header"><Trophy size={18} color="#f97316" />Recent Tournaments</div>
                                        {tournaments.slice(0, 5).map(t => (
                                            <div key={t._id} className="list-row">
                                                <div style={{ fontSize: 22 }}>🏆</div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                                                    <div style={{ fontSize: 12, color: '#64748b' }}>{t.format} · {t.teams?.length || 0} teams</div>
                                                </div>
                                                <StatusBadge status={t.status} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ─── Users ─── */}
                        {activeTab === 'users' && (
                            <div className="admin-card">
                                <div className="card-header"><Users size={18} color="#3b82f6" />All Users <span className="count-badge">{users.length}</span></div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u._id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <div className="row-avatar">{u.name?.[0]?.toUpperCase()}</div>
                                                            <span style={{ fontWeight: 700 }}>{u.name}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ color: '#94a3b8', fontSize: 13 }}>{u.email}</td>
                                                    <td><span className={`role-badge role-${u.role}`}>{u.role}</span></td>
                                                    <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                            <button className="action-btn edit" onClick={() => setEditingUser({ ...u })}><Pencil size={14} /></button>
                                                            <button className="action-btn delete" onClick={() => deleteUser(u._id, u.name)}><Trash2 size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ─── Tournaments ─── */}
                        {activeTab === 'tournaments' && (
                            <div className="admin-card">
                                <div className="card-header"><Trophy size={18} color="#f97316" />All Tournaments <span className="count-badge">{tournaments.length}</span></div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="admin-table">
                                        <thead>
                                            <tr><th>Name</th><th>Format</th><th>Status</th><th>Organizer</th><th>Teams</th><th style={{ textAlign: 'right' }}>Actions</th></tr>
                                        </thead>
                                        <tbody>
                                            {tournaments.map(t => (
                                                <tr key={t._id}>
                                                    <td style={{ fontWeight: 700 }}>{t.name}</td>
                                                    <td style={{ color: '#94a3b8' }}>{t.format}</td>
                                                    <td><StatusBadge status={t.status} /></td>
                                                    <td style={{ color: '#94a3b8', fontSize: 13 }}>{t.organizer?.name || '—'}</td>
                                                    <td style={{ color: '#f8fafc', fontWeight: 700 }}>{t.teams?.length || 0}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                            <button className="action-btn delete" onClick={() => deleteTournament(t._id, t.name)}><Trash2 size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ─── Teams ─── */}
                        {activeTab === 'teams' && (
                            <div className="admin-card">
                                <div className="card-header"><UsersRound size={18} color="#a855f7" />All Teams <span className="count-badge">{teams.length}</span></div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                                    {teams.map(t => (
                                        <div key={t._id} className="team-card">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                                                {t.logo ? (
                                                    <img src={`http://localhost:5000/${t.logo}`} alt={t.name} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }} />
                                                ) : (
                                                    <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #a855f7, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 900, color: '#fff' }}>
                                                        {t.name?.[0]?.toUpperCase()}
                                                    </div>
                                                )}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ fontWeight: 800, fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                                                    <div style={{ fontSize: 12, color: '#64748b' }}>{t.players?.length || 0} players · by {t.organizer?.name || '—'}</div>
                                                </div>
                                            </div>
                                            <button className="action-btn delete full" onClick={() => deleteTeam(t._id, t.name)}>
                                                <Trash2 size={14} /> Delete Team
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ── Mobile Bottom Nav ───────────────────── */}
            <nav className="bottom-nav">
                {navItems.map(({ key, label, icon: Icon }) => (
                    <button key={key} className={`bottom-nav-item${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(key as Tab)}>
                        <Icon size={22} />
                        <span>{label}</span>
                    </button>
                ))}
                <button className="bottom-nav-item" onClick={logout}>
                    <LogOut size={22} />
                    <span>Logout</span>
                </button>
            </nav>

            {/* ── Edit User Modal ─────────────────────── */}
            {editingUser && (
                <div className="modal-overlay" onClick={() => setEditingUser(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                            <h2 style={{ fontWeight: 800, fontSize: 20 }}>Edit User</h2>
                            <button onClick={() => setEditingUser(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <label className="form-label">Full Name</label>
                        <input className="form-input" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
                        <label className="form-label" style={{ marginTop: 16 }}>Role</label>
                        <div style={{ position: 'relative' }}>
                            <select
                                className="form-input"
                                value={editingUser.role}
                                onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                style={{ appearance: 'none', paddingRight: 40 }}
                            >
                                <option value="player">Player</option>
                                <option value="organizer">Organizer</option>
                                <option value="admin">Admin</option>
                            </select>
                            <ChevronDown size={18} color="#64748b" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                            <button className="btn-cancel" onClick={() => setEditingUser(null)}>Cancel</button>
                            <button className="btn-save" onClick={updateUser}><Check size={16} /> Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Global Styles ─────────────────────── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #0a0e1a; }

                .admin-shell {
                    display: flex; min-height: 100vh;
                    background: #0a0e1a; color: #f8fafc; font-family: 'Inter', sans-serif;
                }

                /* ── Sidebar ── */
                .admin-sidebar {
                    display: none; position: fixed; left: 0; top: 0; bottom: 0; width: 240px;
                    background: #0f172a; border-right: 1px solid rgba(255,255,255,0.06);
                    flex-direction: column; padding: 28px 16px; z-index: 200; overflow-y: auto;
                    transition: width 0.25s cubic-bezier(0.4,0,0.2,1), padding 0.25s;
                }
                .admin-sidebar.collapsed {
                    width: 68px; padding: 28px 10px; overflow: visible;
                }
                .sidebar-logo {
                    display: flex; align-items: center; gap: 10px; margin-bottom: 32px;
                    font-size: 20px; font-weight: 900; white-space: nowrap; overflow: hidden;
                }
                .logo-icon {
                    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    display: flex; align-items: center; justify-content: center; font-size: 18px;
                }
                .sidebar-nav { display: flex; flex-direction: column; gap: 6px; flex: 1; }
                .sidebar-link {
                    display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: 14px;
                    border: none; cursor: pointer; font-size: 14px; font-weight: 600;
                    background: transparent; color: #64748b; width: 100%; text-align: left;
                    transition: all 0.15s; white-space: nowrap; overflow: hidden;
                }
                .sidebar-link.icon-only {
                    justify-content: center; padding: 14px 0; gap: 0;
                }
                .sidebar-link:hover { background: rgba(255,255,255,0.05); color: #f8fafc; }
                .sidebar-link.active { background: rgba(249,115,22,0.12); color: #f97316; }
                .sidebar-link.active.icon-only { background: rgba(249,115,22,0.15); }
                .sidebar-footer { padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.06); }
                .sidebar-user { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; overflow: hidden; }
                .sidebar-avatar {
                    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; font-size: 14px; color: #000;
                }
                .sidebar-logout {
                    display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px;
                    border-radius: 12px; border: none; cursor: pointer; font-size: 14px; font-weight: 700;
                    background: rgba(239,68,68,0.08); color: #ef4444; white-space: nowrap;
                }
                .sidebar-logout.icon-only { justify-content: center; padding: 12px 0; }
                .sidebar-logout:hover { background: rgba(239,68,68,0.15); }
                .sidebar-toggle {
                    position: absolute; bottom: 80px; right: -14px;
                    width: 28px; height: 28px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.12);
                    background: #0f172a; color: #94a3b8; cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    transition: all 0.15s; z-index: 300;
                }
                .sidebar-toggle:hover { background: rgba(249,115,22,0.15); color: #f97316; border-color: rgba(249,115,22,0.3); }

                /* ── Main ── */
                .admin-main {
                    flex: 1; padding: 16px; padding-bottom: 90px;
                    min-width: 0; overflow-x: hidden; transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1);
                }
                .admin-topbar {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 28px; padding-bottom: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .admin-topbar-title { font-size: clamp(1.4rem, 5vw, 2rem); font-weight: 900; }

                /* ── Stats ── */
                .stats-grid {
                    display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 28px;
                }
                .stat-card {
                    background: #0f172a; border: 1px solid transparent; border-radius: 20px;
                    padding: 24px; display: flex; flex-direction: column; gap: 8; align-items: flex-start;
                }
                .overview-grid { display: grid; gap: 20px; }

                /* ── Cards ── */
                .admin-card {
                    background: #0f172a; border: 1px solid rgba(255,255,255,0.06); border-radius: 20px;
                    padding: 24px; overflow: hidden;
                }
                .card-header {
                    display: flex; align-items: center; gap: 10; font-size: 16px; font-weight: 800;
                    margin-bottom: 20px;
                }
                .count-badge {
                    background: rgba(255,255,255,0.06); color: #94a3b8;
                    font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 100px;
                    margin-left: 4px;
                }

                /* ── Table ── */
                .admin-table { width: 100%; border-collapse: collapse; min-width: 600px; }
                .admin-table th {
                    text-align: left; padding: 12px 16px; font-size: 11px; font-weight: 800;
                    color: #475569; text-transform: uppercase; letter-spacing: 0.05em;
                    background: rgba(255,255,255,0.02); white-space: nowrap;
                }
                .admin-table td {
                    padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 14px;
                }
                .admin-table tr:last-child td { border-bottom: none; }
                .admin-table tr:hover td { background: rgba(255,255,255,0.02); }

                /* ── Row items ── */
                .list-row {
                    display: flex; align-items: center; gap: 12; padding: 12px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.04);
                }
                .list-row:last-child { border-bottom: none; }
                .row-avatar {
                    width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
                    background: linear-gradient(135deg, #3b82f6, #6366f1);
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; font-size: 14px; color: #fff;
                }

                /* ── Badges ── */
                .role-badge {
                    font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 100px;
                    text-transform: uppercase; white-space: nowrap;
                }
                .role-admin { background: rgba(249,115,22,0.15); color: #f97316; border: 1px solid rgba(249,115,22,0.25); }
                .role-organizer { background: rgba(59,130,246,0.15); color: #3b82f6; border: 1px solid rgba(59,130,246,0.25); }
                .role-player { background: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.25); }
                .status-active { background: rgba(34,197,94,0.12); color: #22c55e; border: 1px solid rgba(34,197,94,0.25); }
                .status-draft { background: rgba(148,163,184,0.12); color: #94a3b8; border: 1px solid rgba(148,163,184,0.2); }
                .status-completed { background: rgba(99,102,241,0.12); color: #818cf8; border: 1px solid rgba(99,102,241,0.2); }

                /* ── Action Buttons ── */
                .action-btn {
                    width: 32px; height: 32px; border-radius: 8px; border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
                }
                .action-btn.edit { background: rgba(59,130,246,0.1); color: #3b82f6; }
                .action-btn.edit:hover { background: rgba(59,130,246,0.2); }
                .action-btn.delete { background: rgba(239,68,68,0.1); color: #ef4444; }
                .action-btn.delete:hover { background: rgba(239,68,68,0.2); }
                .action-btn.full {
                    width: 100%; height: 38px; gap: 8px; font-size: 13px; font-weight: 700;
                }

                /* ── Team Cards ── */
                .team-card {
                    background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 20px;
                }

                /* ── Modal ── */
                .modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.7);
                    display: flex; align-items: center; justify-content: center;
                    z-index: 500; padding: 16px;
                }
                .modal {
                    background: #0f172a; border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 24px; padding: 28px; width: 100%; max-width: 440px;
                }
                .form-label { display: block; font-size: 12px; font-weight: 700; color: #64748b; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em; }
                .form-input {
                    width: 100%; padding: 14px 16px; border-radius: 12px;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    color: #f8fafc; font-size: 15px; outline: none; font-family: 'Inter', sans-serif;
                }
                .form-input:focus { border-color: #f97316; }
                .btn-cancel {
                    flex: 1; padding: 14px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
                    background: transparent; color: #94a3b8; cursor: pointer; font-weight: 700; font-size: 14px;
                }
                .btn-save {
                    flex: 1; padding: 14px; border-radius: 12px; border: none;
                    background: linear-gradient(135deg, #f97316, #ea580c); color: #fff;
                    cursor: pointer; font-weight: 700; font-size: 14px;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                }

                /* ── Bottom Nav (mobile) ── */
                .bottom-nav {
                    display: flex; position: fixed; bottom: 0; left: 0; right: 0;
                    background: rgba(15,23,42,0.97); border-top: 1px solid rgba(255,255,255,0.06);
                    backdrop-filter: blur(20px); z-index: 200; padding: 8px 0 12px;
                }
                .bottom-nav-item {
                    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4;
                    padding: 8px 4px; border: none; background: none; cursor: pointer;
                    color: #64748b; font-size: 10px; font-weight: 700; transition: color 0.15s;
                }
                .bottom-nav-item.active { color: #f97316; }
                .bottom-nav-item:last-child { color: #ef4444; }

                /* ── Responsive ── */
                @media (min-width: 640px) {
                    .admin-main { padding: 28px 28px 90px; }
                    .stats-grid { grid-template-columns: repeat(4, 1fr); }
                    .overview-grid { grid-template-columns: 1fr 1fr; }
                }
                @media (min-width: 1024px) {
                    .admin-sidebar { display: flex; }
                    .admin-main { margin-left: 240px; padding: 36px; padding-bottom: 36px; }
                    .admin-main.collapsed { margin-left: 68px; }
                    .bottom-nav { display: none; }
                }
            `}</style>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const cls = status === 'Active' ? 'status-active' : status === 'Completed' ? 'status-completed' : 'status-draft';
    return <span className={`role-badge ${cls}`}>{status}</span>;
}

export default function AdminDashboard() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardContent />
        </ProtectedRoute>
    );
}
