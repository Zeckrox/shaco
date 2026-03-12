'use client';

import React, { useEffect, useState } from 'react';
import { getTree, getAdminEmails, Member } from '@/lib/api';
import dynamic from 'next/dynamic';

const OrgChart = dynamic(() => import('@/components/OrgChart'), {
    ssr: false,
    loading: () => (
        <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-slate-500 font-medium">Loading visualization...</p>
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
            setError('Failed to load organigram. Please ensure the backend is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <main className="relative flex min-h-screen flex-col items-center overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none -z-10" />

            <nav className="w-full max-w-7xl px-8 py-6 flex justify-between items-center border-b border-slate-800/50 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20">
                        <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Shaco Core
                        </h1>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Organizational Chart</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            <Link 
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-800 transition-all text-sm font-medium"
                            >
                                {userIsAdmin
                                    ? <Settings className="w-4 h-4 text-slate-400" />
                                    : <User className="w-4 h-4 text-slate-400" />
                                }
                                <span>{userIsAdmin ? 'Admin Panel' : 'My Profile'}</span>
                            </Link>
                            <button 
                                onClick={logout}
                                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 transition-all"
                                title="Sign Out"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <Link 
                            href="/login"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 shadow-lg shadow-blue-500/20 text-white hover:bg-blue-500 transition-all text-sm font-bold"
                        >
                            <LogIn className="w-4 h-4" />
                            <span>Sign In</span>
                        </Link>
                    )}
                </div>
            </nav>

            <div className="flex-1 w-full max-w-[95vw] mt-10">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-slate-500 font-medium">Building organization structure...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4 text-center">
                        <div className="p-4 rounded-full bg-red-500/10 border border-red-500/20">
                            <span className="text-red-500 font-bold">!</span>
                        </div>
                        <p className="text-slate-400 max-w-sm">{error}</p>
                        <button 
                            onClick={fetchData}
                            className="px-6 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-slate-500 transition-all text-sm font-medium"
                        >
                            Retry Connection
                        </button>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
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
            
            <footer className="w-full py-8 text-center text-slate-600 border-t border-slate-900 mt-20">
                <p className="text-xs font-medium tracking-widest uppercase opacity-50">&copy; 2026 Shaco Labs &bull; Internal Tool</p>
            </footer>
        </main>
    );
}
