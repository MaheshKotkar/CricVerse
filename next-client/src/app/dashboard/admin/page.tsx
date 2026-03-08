"use client";
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import ProtectedRoute from '../../../components/ProtectedRoute';
import {
    LayoutDashboard, Users, Trophy, Shield, LogOut,
    Trash2, Pencil, X, Check, ChevronDown, Loader2, UsersRound,
    ChevronLeft, ChevronRight, Eye, TrendingUp, Activity,
    UserCheck, Star, Zap
} from 'lucide-react';
import Link from 'next/link';
import api from '../../../utils/api';
import toast from 'react-hot-toast';

type Tab = 'overview' | 'users' | 'tournaments' | 'teams';

function AdminDashboardContent() {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
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

    const statCards = [
        { label: 'Total Users', value: stats?.totalUsers ?? 0, color: '#3b82f6', gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', icon: Users, glow: 'rgba(59,130,246,0.25)' },
        { label: 'Tournaments', value: stats?.totalTournaments ?? 0, color: '#f97316', gradient: 'linear-gradient(135deg,#f97316,#ea580c)', icon: Trophy, glow: 'rgba(249,115,22,0.25)' },
        { label: 'Active Now', value: stats?.activeTournaments ?? 0, color: '#22c55e', gradient: 'linear-gradient(135deg,#22c55e,#16a34a)', icon: Activity, glow: 'rgba(34,197,94,0.25)' },
        { label: 'Total Teams', value: stats?.totalTeams ?? 0, color: '#a855f7', gradient: 'linear-gradient(135deg,#a855f7,#7c3aed)', icon: UsersRound, glow: 'rgba(168,85,247,0.25)' },
    ];

    return (
        <div className="ad-shell">
            {/* ── Sidebar ── */}
            <aside className={`ad-sidebar${isSidebarCollapsed ? ' collapsed' : ''}`}>
                <div className="ad-sidebar-header">
                    <div className="ad-logo">
                        <div className="ad-logo-icon"><Zap size={18} /></div>
                        {!isSidebarCollapsed && <span className="ad-logo-text">CricVerse</span>}
                    </div>
                    <button className="ad-toggle-btn" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} title="Toggle Sidebar">
                        {isSidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                    </button>
                </div>

                {!isSidebarCollapsed && (
                    <div className="ad-panel-label">Admin Panel</div>
                )}

                <nav className="ad-nav">
                    {navItems.map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            className={`ad-nav-item${activeTab === key ? ' active' : ''}${isSidebarCollapsed ? ' icon-only' : ''}`}
                            onClick={() => setActiveTab(key as Tab)}
                            title={isSidebarCollapsed ? label : undefined}
                        >
                            <Icon size={19} />
                            {!isSidebarCollapsed && <span>{label}</span>}
                        </button>
                    ))}
                </nav>

                <div className="ad-sidebar-footer">
                    <div className={`ad-user-row${isSidebarCollapsed ? ' icon-only' : ''}`}>
                        <div className="ad-user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
                        {!isSidebarCollapsed && (
                            <div className="ad-user-info">
                                <div className="ad-user-name">{user?.name}</div>
                                <div className="ad-user-role">
                                    <Shield size={10} /> Administrator
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={logout}
                        className={`ad-logout-btn${isSidebarCollapsed ? ' icon-only' : ''}`}
                        title={isSidebarCollapsed ? 'Logout' : undefined}
                    >
                        <LogOut size={17} />
                        {!isSidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* ── Main ── */}
            <main className={`ad-main${isSidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
                {/* Topbar */}
                <div className="ad-topbar">
                    <div>
                        <h1 className="ad-page-title">{navItems.find(n => n.key === activeTab)?.label}</h1>
                        <p className="ad-page-sub">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
                    </div>
                    <div className="ad-topbar-badge">
                        <Shield size={13} />
                        <span>God Mode</span>
                    </div>
                </div>

                {loading ? (
                    <div className="ad-loader">
                        <Loader2 size={44} color="#f97316" className="animate-spin" />
                        <p>Loading data…</p>
                    </div>
                ) : (
                    <>
                        {/* ── Overview ── */}
                        {activeTab === 'overview' && (
                            <div>
                                <div className="ad-stats-grid">
                                    {statCards.map((s, i) => (
                                        <div key={i} className="ad-stat-card" style={{ '--glow': s.glow, '--gradient': s.gradient } as any}>
                                            <div className="ad-stat-icon" style={{ background: s.gradient }}>
                                                <s.icon size={20} color="#fff" />
                                            </div>
                                            <div className="ad-stat-value" style={{ color: s.color }}>{s.value}</div>
                                            <div className="ad-stat-label">{s.label}</div>
                                            <div className="ad-stat-trend">
                                                <TrendingUp size={12} /> Active
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="ad-overview-grid">
                                    <div className="ad-card">
                                        <div className="ad-card-header">
                                            <Users size={18} color="#3b82f6" />
                                            <span>Recent Users</span>
                                            <span className="ad-badge-count">{users.length}</span>
                                        </div>
                                        <div className="ad-card-body">
                                            {users.slice(0, 6).map(u => (
                                                <div key={u._id} className="ad-list-row">
                                                    <div className="ad-row-avatar blue">{u.name?.[0]?.toUpperCase()}</div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div className="ad-row-name">{u.name}</div>
                                                        <div className="ad-row-sub">{u.email}</div>
                                                    </div>
                                                    <span className={`ad-role-badge role-${u.role}`}>{u.role}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="ad-card">
                                        <div className="ad-card-header">
                                            <Trophy size={18} color="#f97316" />
                                            <span>Recent Tournaments</span>
                                            <span className="ad-badge-count">{tournaments.length}</span>
                                        </div>
                                        <div className="ad-card-body">
                                            {tournaments.slice(0, 6).map(t => (
                                                <div key={t._id} className="ad-list-row">
                                                    <div className="ad-row-avatar orange">🏆</div>
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div className="ad-row-name">{t.name}</div>
                                                        <div className="ad-row-sub">{t.format} · {t.teams?.length || 0} teams</div>
                                                    </div>
                                                    <StatusBadge status={t.status} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Users ── */}
                        {activeTab === 'users' && (
                            <div className="ad-card">
                                <div className="ad-card-header">
                                    <Users size={18} color="#3b82f6" />
                                    <span>All Users</span>
                                    <span className="ad-badge-count">{users.length}</span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="ad-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Role</th>
                                                <th>Joined</th>
                                                <th style={{ textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u._id}>
                                                    <td>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                            <div className="ad-row-avatar blue">{u.name?.[0]?.toUpperCase()}</div>
                                                            <span className="ad-row-name">{u.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="ad-table-sub">{u.email}</td>
                                                    <td><span className={`ad-role-badge role-${u.role}`}>{u.role}</span></td>
                                                    <td className="ad-table-sub">{new Date(u.createdAt).toLocaleDateString()}</td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                            <button className="ad-action-btn edit" onClick={() => setEditingUser({ ...u })}><Pencil size={14} /></button>
                                                            <button className="ad-action-btn delete" onClick={() => deleteUser(u._id, u.name)}><Trash2 size={14} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── Tournaments ── */}
                        {activeTab === 'tournaments' && (
                            <div className="ad-card">
                                <div className="ad-card-header">
                                    <Trophy size={18} color="#f97316" />
                                    <span>All Tournaments</span>
                                    <span className="ad-badge-count">{tournaments.length}</span>
                                </div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table className="ad-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Format</th>
                                                <th>Status</th>
                                                <th>Organizer</th>
                                                <th>Teams</th>
                                                <th style={{ textAlign: 'right' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tournaments.map(t => (
                                                <tr key={t._id}>
                                                    <td className="ad-row-name">{t.name}</td>
                                                    <td className="ad-table-sub">{t.format}</td>
                                                    <td><StatusBadge status={t.status} /></td>
                                                    <td className="ad-table-sub">{t.organizer?.name || '—'}</td>
                                                    <td><span className="ad-teams-count">{t.teams?.length || 0}</span></td>
                                                    <td>
                                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                                                            <Link href={`/dashboard/admin/tournaments/${t._id}`} className="ad-action-btn edit" title="View Details">
                                                                <Eye size={14} />
                                                            </Link>
                                                            <button className="ad-action-btn delete" onClick={() => deleteTournament(t._id, t.name)} title="Delete Tournament">
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* ── Teams ── */}
                        {activeTab === 'teams' && (
                            <div className="ad-card">
                                <div className="ad-card-header">
                                    <UsersRound size={18} color="#a855f7" />
                                    <span>All Teams</span>
                                    <span className="ad-badge-count">{teams.length}</span>
                                </div>
                                <div className="ad-teams-grid">
                                    {teams.map(t => (
                                        <div key={t._id} className="ad-team-card">
                                            <div className="ad-team-card-top">
                                                <div className="ad-team-logo">
                                                    {t.logo ? (
                                                        <img
                                                            src={t.logo.startsWith('http') ? t.logo : `http://localhost:5000/${t.logo.replace(/^\//, '')}`}
                                                            alt={t.name}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                    ) : (
                                                        <span style={{ fontSize: 22, fontWeight: 900 }}>{t.name?.[0]?.toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div className="ad-team-name">{t.name}</div>
                                                    <div className="ad-team-meta">
                                                        <UserCheck size={12} /> {t.players?.length || 0} players
                                                    </div>
                                                    <div className="ad-team-meta" style={{ marginTop: 2 }}>
                                                        <Star size={12} /> {t.organizer?.name || '—'}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ad-team-actions">
                                                <Link href={`/dashboard/admin/teams/${t._id}`} className="ad-team-btn view">
                                                    <Eye size={14} /> View Details
                                                </Link>
                                                <button className="ad-team-btn delete" onClick={() => deleteTeam(t._id, t.name)}>
                                                    <Trash2 size={14} /> Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* ── Mobile Bottom Nav ── */}
            <nav className="ad-bottom-nav">
                {navItems.map(({ key, label, icon: Icon }) => (
                    <button key={key} className={`ad-bottom-item${activeTab === key ? ' active' : ''}`} onClick={() => setActiveTab(key as Tab)}>
                        <Icon size={22} />
                        <span>{label}</span>
                    </button>
                ))}
                <button className="ad-bottom-item logout" onClick={logout}>
                    <LogOut size={22} />
                    <span>Logout</span>
                </button>
            </nav>

            {/* ── Edit User Modal ── */}
            {editingUser && (
                <div className="ad-modal-overlay" onClick={() => setEditingUser(null)}>
                    <div className="ad-modal" onClick={e => e.stopPropagation()}>
                        <div className="ad-modal-header">
                            <h2>Edit User</h2>
                            <button onClick={() => setEditingUser(null)} className="ad-modal-close"><X size={20} /></button>
                        </div>
                        <label className="ad-label">Full Name</label>
                        <input className="ad-input" value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
                        <label className="ad-label" style={{ marginTop: 16 }}>Role</label>
                        <div style={{ position: 'relative' }}>
                            <select className="ad-input" value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value })} style={{ appearance: 'none', paddingRight: 40 }}>
                                <option value="player">Player</option>
                                <option value="organizer">Organizer</option>
                                <option value="admin">Admin</option>
                            </select>
                            <ChevronDown size={16} color="#64748b" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        </div>
                        <div className="ad-modal-footer">
                            <button className="ad-btn-cancel" onClick={() => setEditingUser(null)}>Cancel</button>
                            <button className="ad-btn-save" onClick={updateUser}><Check size={16} /> Save Changes</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

                /* ── Shell ── */
                .ad-shell {
                    display: flex; min-height: 100vh;
                    background: #080c18; color: #f8fafc; font-family: 'Inter', sans-serif;
                }

                /* ── Sidebar ── */
                .ad-sidebar {
                    display: none; position: fixed; left: 0; top: 0; bottom: 0; width: 248px;
                    background: linear-gradient(180deg, #0d1424 0%, #0a1020 100%);
                    border-right: 1px solid rgba(255,255,255,0.05);
                    flex-direction: column; padding: 20px 14px 24px; z-index: 200;
                    transition: width 0.25s cubic-bezier(0.4,0,0.2,1);
                    box-shadow: 4px 0 32px rgba(0,0,0,0.4);
                }
                .ad-sidebar.collapsed { width: 72px; }

                /* ── Sidebar Header ── */
                .ad-sidebar-header {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-bottom: 24px; gap: 8px;
                }
                .ad-logo { display: flex; align-items: center; gap: 10px; overflow: hidden; flex: 1; min-width: 0; }
                .ad-logo-icon {
                    width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    display: flex; align-items: center; justify-content: center; color: #fff;
                    box-shadow: 0 4px 16px rgba(249,115,22,0.4);
                }
                .ad-logo-text {
                    font-size: 18px; font-weight: 900; white-space: nowrap;
                    background: linear-gradient(90deg, #fff, #94a3b8);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
                }
                .ad-toggle-btn {
                    width: 28px; height: 28px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.04); color: #64748b; cursor: pointer; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
                }
                .ad-toggle-btn:hover { border-color: rgba(249,115,22,0.4); color: #f97316; background: rgba(249,115,22,0.08); }

                /* ── Panel Label ── */
                .ad-panel-label {
                    font-size: 9px; font-weight: 800; color: #f97316; text-transform: uppercase;
                    letter-spacing: 0.1em; padding: 0 12px; margin-bottom: 10px;
                }

                /* ── Nav ── */
                .ad-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
                .ad-nav-item {
                    display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px;
                    border: none; cursor: pointer; font-size: 13.5px; font-weight: 600;
                    background: transparent; color: #4a5568; width: 100%; text-align: left;
                    transition: all 0.15s; white-space: nowrap; overflow: hidden;
                    position: relative;
                }
                .ad-nav-item.icon-only { justify-content: center; padding: 12px 0; }
                .ad-nav-item:hover { background: rgba(255,255,255,0.04); color: #94a3b8; }
                .ad-nav-item.active {
                    background: rgba(249,115,22,0.1); color: #f97316;
                    box-shadow: inset 3px 0 0 #f97316;
                }
                .ad-nav-item.active.icon-only { box-shadow: none; }

                /* ── Sidebar Footer ── */
                .ad-sidebar-footer { padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
                .ad-user-row {
                    display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 12px;
                    background: rgba(255,255,255,0.03); margin-bottom: 10px; overflow: hidden;
                }
                .ad-user-row.icon-only { justify-content: center; }
                .ad-user-avatar {
                    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
                    background: linear-gradient(135deg, #f97316, #ea580c);
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; font-size: 15px; color: #fff;
                    box-shadow: 0 4px 12px rgba(249,115,22,0.3);
                }
                .ad-user-info { flex: 1; min-width: 0; }
                .ad-user-name { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .ad-user-role {
                    display: flex; align-items: center; gap: 4px;
                    font-size: 10px; color: #f97316; font-weight: 600; margin-top: 1px;
                }
                .ad-logout-btn {
                    display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 11px 14px;
                    border-radius: 12px; border: none; cursor: pointer; font-size: 13px; font-weight: 700;
                    background: rgba(239,68,68,0.06); color: #ef4444;
                    transition: all 0.15s; white-space: nowrap;
                }
                .ad-logout-btn.icon-only { justify-content: center; }
                .ad-logout-btn:hover { background: rgba(239,68,68,0.14); }

                /* ── Main ── */
                .ad-main {
                    flex: 1; padding: 20px 16px 100px; min-width: 0;
                    transition: margin-left 0.25s cubic-bezier(0.4,0,0.2,1);
                }

                /* ── Topbar ── */
                .ad-topbar {
                    display: flex; align-items: flex-start; justify-content: space-between;
                    margin-bottom: 32px; padding-bottom: 24px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .ad-page-title { font-size: clamp(1.6rem, 5vw, 2.2rem); font-weight: 900; line-height: 1.1; }
                .ad-page-sub { font-size: 13px; color: #475569; margin-top: 4px; font-weight: 500; }
                .ad-topbar-badge {
                    display: flex; align-items: center; gap: 6px;
                    background: linear-gradient(135deg, rgba(249,115,22,0.12), rgba(234,88,12,0.08));
                    border: 1px solid rgba(249,115,22,0.25); color: #f97316;
                    font-size: 11px; font-weight: 800; padding: 7px 14px; border-radius: 100px;
                    text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap;
                }

                /* ── Loader ── */
                .ad-loader { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 100px 0; gap: 16px; }
                .ad-loader p { color: #475569; font-size: 14px; }

                /* ── Stats Grid ── */
                .ad-stats-grid {
                    display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 28px;
                }
                .ad-stat-card {
                    background: linear-gradient(135deg, rgba(15,23,42,0.9), rgba(20,30,55,0.7));
                    border: 1px solid rgba(255,255,255,0.06); border-radius: 22px;
                    padding: 24px; display: flex; flex-direction: column; gap: 10px;
                    transition: all 0.2s; position: relative; overflow: hidden;
                }
                .ad-stat-card::before {
                    content: ''; position: absolute; inset: 0; border-radius: 22px;
                    background: var(--gradient); opacity: 0; transition: opacity 0.2s;
                }
                .ad-stat-card:hover::before { opacity: 0.04; }
                .ad-stat-card:hover { box-shadow: 0 8px 32px var(--glow); transform: translateY(-2px); }
                .ad-stat-icon {
                    width: 48px; height: 48px; border-radius: 14px;
                    display: flex; align-items: center; justify-content: center;
                    box-shadow: 0 6px 20px rgba(0,0,0,0.3);
                }
                .ad-stat-value { font-size: 40px; font-weight: 900; line-height: 1; }
                .ad-stat-label { font-size: 13px; color: #475569; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; }
                .ad-stat-trend { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #22c55e; font-weight: 700; }

                /* ── Overview Grid ── */
                .ad-overview-grid { display: grid; gap: 20px; }

                /* ── Cards ── */
                .ad-card {
                    background: linear-gradient(135deg, rgba(13,20,36,0.95), rgba(10,16,32,0.9));
                    border: 1px solid rgba(255,255,255,0.06); border-radius: 22px; padding: 24px;
                    overflow: hidden;
                }
                .ad-card-header {
                    display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 800;
                    margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.05);
                }
                .ad-badge-count {
                    background: rgba(255,255,255,0.06); color: #64748b;
                    font-size: 11px; font-weight: 700; padding: 2px 9px; border-radius: 100px; margin-left: auto;
                }
                .ad-card-body { display: flex; flex-direction: column; gap: 4px; }

                /* ── List Rows ── */
                .ad-list-row {
                    display: flex; align-items: center; gap: 12px; padding: 10px 8px; border-radius: 12px;
                    transition: background 0.1s;
                }
                .ad-list-row:hover { background: rgba(255,255,255,0.03); }
                .ad-row-avatar {
                    width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 900; font-size: 14px; color: #fff;
                }
                .ad-row-avatar.blue { background: linear-gradient(135deg, #3b82f6, #6366f1); }
                .ad-row-avatar.orange { background: linear-gradient(135deg, #f97316, #ea580c); font-size: 18px; }
                .ad-row-name { font-size: 13px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .ad-row-sub { font-size: 12px; color: #475569; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

                /* ── Table ── */
                .ad-table { width: 100%; border-collapse: collapse; min-width: 560px; }
                .ad-table th {
                    text-align: left; padding: 10px 14px; font-size: 10px; font-weight: 800;
                    color: #334155; text-transform: uppercase; letter-spacing: 0.06em;
                    background: rgba(255,255,255,0.02); white-space: nowrap;
                }
                .ad-table td { padding: 13px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13.5px; }
                .ad-table tr:last-child td { border-bottom: none; }
                .ad-table tr:hover td { background: rgba(255,255,255,0.02); }
                .ad-table-sub { color: #475569; font-size: 12.5px; }
                .ad-teams-count { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; background: rgba(249,115,22,0.1); color: #f97316; font-weight: 800; font-size: 13px; }

                /* ── Roles ── */
                .ad-role-badge { font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 100px; text-transform: uppercase; white-space: nowrap; }
                .role-admin { background: rgba(249,115,22,0.12); color: #f97316; border: 1px solid rgba(249,115,22,0.2); }
                .role-organizer { background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); }
                .role-player { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }

                /* ── Action Buttons ── */
                .ad-action-btn {
                    width: 34px; height: 34px; border-radius: 10px; border: none; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; transition: all 0.15s;
                }
                .ad-action-btn.edit { background: rgba(59,130,246,0.08); color: #60a5fa; }
                .ad-action-btn.edit:hover { background: rgba(59,130,246,0.18); }
                .ad-action-btn.delete { background: rgba(239,68,68,0.08); color: #f87171; }
                .ad-action-btn.delete:hover { background: rgba(239,68,68,0.18); }

                /* ── Status Badge ── */
                .ad-status-badge { font-size: 10px; font-weight: 800; padding: 3px 10px; border-radius: 100px; text-transform: uppercase; white-space: nowrap; }
                .status-active { background: rgba(34,197,94,0.1); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
                .status-draft { background: rgba(100,116,139,0.1); color: #64748b; border: 1px solid rgba(100,116,139,0.15); }
                .status-completed { background: rgba(99,102,241,0.1); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.2); }

                /* ── Teams Grid ── */
                .ad-teams-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; margin-top: 4px; }
                .ad-team-card {
                    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 18px; padding: 18px; transition: all 0.2s;
                }
                .ad-team-card:hover { border-color: rgba(249,115,22,0.2); transform: translateY(-2px); box-shadow: 0 12px 36px rgba(0,0,0,0.3); }
                .ad-team-card-top { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
                .ad-team-logo {
                    width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0;
                    background: linear-gradient(135deg, #a855f7, #7c3aed);
                    display: flex; align-items: center; justify-content: center;
                    overflow: hidden; color: #fff; box-shadow: 0 4px 16px rgba(168,85,247,0.25);
                }
                .ad-team-name { font-size: 15px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .ad-team-meta { display: flex; align-items: center; gap: 5px; font-size: 11px; color: #475569; font-weight: 600; margin-top: 3px; }
                .ad-team-actions { display: flex; gap: 8px; }
                .ad-team-btn {
                    flex: 1; display: flex; align-items: center; justify-content: center; gap: 7px;
                    padding: 9px 12px; border-radius: 10px; border: none; cursor: pointer;
                    font-size: 12px; font-weight: 700; text-decoration: none; transition: all 0.15s;
                }
                .ad-team-btn.view { background: rgba(249,115,22,0.1); color: #f97316; border: 1px solid rgba(249,115,22,0.2); }
                .ad-team-btn.view:hover { background: rgba(249,115,22,0.18); }
                .ad-team-btn.delete { background: rgba(239,68,68,0.08); color: #f87171; }
                .ad-team-btn.delete:hover { background: rgba(239,68,68,0.18); }

                /* ── Modal ── */
                .ad-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(6px);
                    display: flex; align-items: center; justify-content: center; z-index: 500; padding: 20px;
                }
                .ad-modal {
                    background: linear-gradient(135deg, #0d1424, #111827);
                    border: 1px solid rgba(255,255,255,0.1); border-radius: 24px;
                    padding: 28px; width: 100%; max-width: 440px;
                    box-shadow: 0 24px 80px rgba(0,0,0,0.5);
                }
                .ad-modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .ad-modal-header h2 { font-size: 20px; font-weight: 900; }
                .ad-modal-close { background: rgba(255,255,255,0.06); border: none; color: #475569; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.15s; }
                .ad-modal-close:hover { color: #f8fafc; background: rgba(255,255,255,0.1); }
                .ad-label { display: block; font-size: 11px; font-weight: 800; color: #475569; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
                .ad-input {
                    width: 100%; padding: 13px 16px; border-radius: 12px;
                    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
                    color: #f8fafc; font-size: 14px; outline: none; font-family: 'Inter', sans-serif;
                    transition: border-color 0.15s;
                }
                .ad-input:focus { border-color: rgba(249,115,22,0.5); }
                .ad-modal-footer { display: flex; gap: 12px; margin-top: 24px; }
                .ad-btn-cancel {
                    flex: 1; padding: 13px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.04); color: #64748b; cursor: pointer; font-weight: 700; font-size: 13px; transition: all 0.15s;
                }
                .ad-btn-cancel:hover { background: rgba(255,255,255,0.08); }
                .ad-btn-save {
                    flex: 1; padding: 13px; border-radius: 12px; border: none;
                    background: linear-gradient(135deg, #f97316, #ea580c); color: #fff;
                    cursor: pointer; font-weight: 700; font-size: 13px;
                    display: flex; align-items: center; justify-content: center; gap: 8px;
                    transition: all 0.15s; box-shadow: 0 4px 16px rgba(249,115,22,0.35);
                }
                .ad-btn-save:hover { box-shadow: 0 6px 24px rgba(249,115,22,0.5); transform: translateY(-1px); }

                /* ── Bottom Nav ── */
                .ad-bottom-nav {
                    display: flex; position: fixed; bottom: 0; left: 0; right: 0;
                    background: rgba(10,16,32,0.97); border-top: 1px solid rgba(255,255,255,0.05);
                    backdrop-filter: blur(24px); z-index: 200; padding: 8px 0 12px;
                }
                .ad-bottom-item {
                    flex: 1; display: flex; flex-direction: column; align-items: center; gap: 3px;
                    padding: 8px 4px; border: none; background: none; cursor: pointer;
                    color: #334155; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; transition: color 0.15s;
                }
                .ad-bottom-item.active { color: #f97316; }
                .ad-bottom-item.logout { color: #ef4444; }

                /* ── Responsive ── */
                @media (min-width: 640px) {
                    .ad-main { padding: 28px 28px 100px; }
                    .ad-stats-grid { grid-template-columns: repeat(4, 1fr); }
                    .ad-overview-grid { grid-template-columns: 1fr 1fr; }
                }
                @media (min-width: 1024px) {
                    .ad-sidebar { display: flex; }
                    .ad-main { margin-left: 248px; padding: 40px; padding-bottom: 40px; }
                    .ad-main.sidebar-collapsed { margin-left: 72px; }
                    .ad-bottom-nav { display: none; }
                }
            `}</style>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const cls = status === 'Active' ? 'status-active' : status === 'Completed' ? 'status-completed' : 'status-draft';
    return <span className={`ad-status-badge ${cls}`}>{status}</span>;
}

export default function AdminDashboard() {
    return (
        <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboardContent />
        </ProtectedRoute>
    );
}
