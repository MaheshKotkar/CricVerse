"use client";
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

// This page handles the Google OAuth callback redirect
// URL: /auth/callback?token=...&name=...&email=...&avatar=...

export default function GoogleCallback() {
    const { login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const error = searchParams.get('error');
        const token = searchParams.get('token');
        const name = searchParams.get('name');
        const email = searchParams.get('email');
        const avatar = searchParams.get('avatar');

        if (error || !token) {
            router.push('/auth?error=google_failed');
            return;
        }

        login(token, { name, email, avatar });
        router.push('/dashboard');
    }, [login, router, searchParams]);

    return (
        <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite' }}>🏏</div>
                <p style={{ color: '#94a3b8', fontSize: 14 }}>Authenticating...</p>
            </div>
        </div>
    );
}
