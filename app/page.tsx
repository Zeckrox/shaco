'use client';

import React, { useEffect, useState } from 'react';
import { getTree, getAdminEmails, Member } from '@/lib/api';
import dynamic from 'next/dynamic';

const OrgChart = dynamic(() => import('@/components/OrgChart'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-[#8b949e] font-mono text-sm">// cargando visualización...</p>
        </div>
    ),
});
import ProfileModal from '@/components/ProfileModal';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { Settings, Users, Loader2, LogOut, LogIn, User } from 'lucide-react';

export default function Home() {
    const { user, logout } = useAuth();
    const [tree, setTree] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [userIsAdmin, setUserIsAdmin] = useState(false);

    useEffect(() => {
        if (!user?.email) { setUserIsAdmin(false); return; }
        getAdminEmails().then(emails => setUserIsAdmin(emails.includes(user.email!)));
    }, [user?.uid]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const data = await getTree();
            setTree(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching tree:', err);
            setError('Error al cargar el organigrama. Verifica que el backend esté activo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <main className="relative flex min-h-screen flex-col items-center overflow-hidden">
            {/* Background glows */}
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/5 blur-[140px] rounded-full pointer-events-none -z-10" />

            {/* Nav */}
            <nav className="w-full px-6 py-4 flex justify-between items-center border-b border-[#30363d] backdrop-blur-md sticky top-0 z-50 bg-[#0d1117]/80">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#161b22] border border-[#30363d] shadow-lg">
                        <Users className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight text-[#e6edf3]">
                            Shaco Core
                        </h1>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">// organigrama</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            <Link
                                href="/admin"
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-cyan-400/40 hover:text-cyan-400 transition-all text-sm font-medium text-[#e6edf3]"
                            >
                                {userIsAdmin
                                    ? <Settings className="w-4 h-4" />
                                    : <User className="w-4 h-4" />
                                }
                                <span>{userIsAdmin ? 'Panel Admin' : 'Mi Perfil'}</span>
                            </Link>
                            <button
                                onClick={logout}
                                className="p-2 rounded-lg bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-[#f85149] hover:border-[#f85149]/40 transition-all"
                                title="Cerrar sesión"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all text-sm font-semibold glow-cyan-sm"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Ingresar</span>
                        </Link>
                    )}
                </div>
            </nav>

            <div className="flex-1 w-full max-w-[95vw] mt-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        <p className="text-[#8b949e] font-mono text-sm">// construyendo estructura...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
                        <div className="p-4 rounded-lg bg-[#f85149]/10 border border-[#f85149]/20 font-mono text-[#f85149] text-sm">
                            ✗ {error}
                        </div>
                        <button
                            onClick={fetchData}
                            className="px-5 py-2 rounded-lg bg-[#161b22] border border-[#30363d] hover:border-cyan-400/40 hover:text-cyan-400 transition-all text-sm font-medium"
                        >
                            Reintentar
                        </button>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <OrgChart
                            data={tree}
                            onMemberClick={(member) => setSelectedMember(member)}
                        />
                    </motion.div>
                )}
            </div>

            <ProfileModal
                member={selectedMember}
                onClose={() => setSelectedMember(null)}
            />

            <footer className="w-full py-6 text-center border-t border-[#21262d] mt-20">
                <p className="text-xs font-mono text-[#30363d] tracking-widest">// &copy; 2026 shaco labs &bull; herramienta interna</p>
            </footer>
        </main>
    );
}
