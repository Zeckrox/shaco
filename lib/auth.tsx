'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
    onAuthStateChanged, 
    User, 
    signOut,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth } from './firebase';
import { getMemberByEmail, createMember } from './api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!user?.email) return;

        const ensureMemberInOrgChart = async () => {
            try {
                const existing = await getMemberByEmail(user.email!);
                if (existing) return;

                await createMember({
                    name: user.displayName || user.email.split('@')[0],
                    email: user.email,
                    photo_url: user.photoURL || undefined,
                    role: 'Team Member',
                    manager_id: null,
                });
            } catch (err) {
                console.error('Error auto-adding user to org chart:', err);
            }
        };

        ensureMemberInOrgChart();
    }, [user?.uid, user?.email, user?.displayName, user?.photoURL]);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
