"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../utils/api';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('cricverse_token');
        }
        return null;
    });
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // On mount, verify token with backend
    useEffect(() => {
        const verifyToken = async () => {
            const savedToken = localStorage.getItem('cricverse_token');
            if (!savedToken) {
                setLoading(false);
                return;
            }
            try {
                const res = await api.get('/auth/me');
                setUser(res.data.user);
                setToken(savedToken);
            } catch {
                localStorage.removeItem('cricverse_token');
                localStorage.removeItem('cricverse_user');
                setUser(null);
                setToken(null);
            } finally {
                setLoading(false);
            }
        };
        verifyToken();
    }, []);

    const login = (tokenValue: string, userData: any) => {
        localStorage.setItem('cricverse_token', tokenValue);
        localStorage.setItem('cricverse_user', JSON.stringify(userData));
        setToken(tokenValue);
        setUser(userData);
        router.push('/dashboard'); // Role redirector will handle sub-routing
    };

    const logout = () => {
        localStorage.removeItem('cricverse_token');
        localStorage.removeItem('cricverse_user');
        setToken(null);
        setUser(null);
        router.push('/auth'); // Redirect to login after logout
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}
