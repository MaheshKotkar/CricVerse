"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';

function RoleRedirector() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading || !user) return;

        switch (user.role) {
            case 'player':
                router.replace('/dashboard/player');
                break;
            case 'organizer':
                router.replace('/dashboard/organizer');
                break;
            case 'admin':
                router.replace('/dashboard/admin');
                break;
            default:
                router.replace('/dashboard/player');
        }
    }, [user, loading, router]);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite' }}>🏏</div>
                <p style={{ color: '#94a3b8', fontSize: 14 }}>Setting up your dashboard...</p>
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <ProtectedRoute>
            <RoleRedirector />
        </ProtectedRoute>
    );
}
