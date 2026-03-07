"use client";
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, loading, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (!isAuthenticated) {
            router.replace('/auth');
            return;
        }

        // If allowedRoles is specified and user's role is not in it, redirect back to /dashboard
        // (the role redirector will send them to their correct dashboard)
        if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) {
            router.replace('/dashboard');
        }
    }, [isAuthenticated, loading, user, router, allowedRoles]);

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite' }}>🏏</div>
                    <p style={{ color: '#94a3b8', fontSize: 14 }}>Loading CricVerse...</p>
                </div>
                <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    // While role redirect is happening, render nothing
    if (allowedRoles && user?.role && !allowedRoles.includes(user.role)) return null;

    return <>{children}</>;
}
