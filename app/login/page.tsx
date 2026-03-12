'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogIn, Terminal } from 'lucide-react';

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
        <main className="min-h-screen flex items-center justify-center bg-[#0d1117] p-6">
            {/* Subtle radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(34,211,238,0.04),transparent_60%)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm"
            >
                {/* Terminal header bar */}
                <div className="flex items-center gap-2 px-4 py-3 bg-[#161b22] border border-[#30363d] rounded-t-xl border-b-0">
                    <div className="flex gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-[#f85149]/60" />
                        <span className="w-3 h-3 rounded-full bg-[#e3b341]/60" />
                        <span className="w-3 h-3 rounded-full bg-[#3fb950]/60" />
                    </div>
                    <span className="text-xs font-mono text-[#8b949e] ml-2">shaco — auth.sh</span>
                </div>

                {/* Card body */}
                <div className="p-8 bg-[#161b22] border border-[#30363d] rounded-b-xl rounded-tr-xl space-y-8">
                    {/* Icon */}
                    <div className="flex items-center justify-center">
                        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/20 glow-cyan">
                            <Terminal className="w-8 h-8 text-cyan-400" />
                        </div>
                    </div>

                    {/* Text */}
                    <div className="space-y-2 text-center">
                        <h1 className="text-2xl font-bold text-[#e6edf3]">Acceso Restringido</h1>
                        <p className="text-sm text-[#8b949e] leading-relaxed">
                            Inicia sesión para gestionar la estructura de <span className="text-cyan-400 font-semibold">Shaco Core</span>.
                        </p>
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={loginWithGoogle}
                        className="w-full py-3 rounded-lg bg-[#e6edf3] text-[#0d1117] font-bold text-sm flex items-center justify-center gap-3 hover:bg-white transition-all shadow-lg"
                    >
                        <LogIn className="w-4 h-4" />
                        <span>Ingresar con Google</span>
                    </button>

                    {/* Footer hint */}
                    <p className="text-center text-[10px] font-mono text-[#30363d] tracking-widest uppercase">
                        // solo personal autorizado
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
