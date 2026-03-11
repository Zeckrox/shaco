'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
    const { user, loginWithGoogle, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/admin');
        }
    }, [user, loading, router]);

    if (loading) return null;

    return (
        <main className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)] pointer-events-none" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-10 rounded-[40px] bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-8"
            >
                <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-2">
                    <ShieldAlert className="w-10 h-10 text-blue-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-white">Restricted Access</h1>
                    <p className="text-slate-500 font-medium">Please sign in to manage the organizational structure of Shaco Core.</p>
                </div>

                <button 
                    onClick={loginWithGoogle}
                    className="w-full py-5 rounded-3xl bg-white text-slate-950 font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-slate-200 transition-all shadow-xl shadow-white/5"
                >
                    <LogIn className="w-5 h-5" />
                    <span>Sign in with Google</span>
                </button>

                <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">
                    Authorized Personnel Only
                </p>
            </motion.div>
        </main>
    );
}
