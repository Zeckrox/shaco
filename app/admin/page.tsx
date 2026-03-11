'use client';

import React, { useEffect, useState } from 'react';
import { getMembers, createMember, updateMember, deleteMember, Member } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
    ArrowLeft, 
    Plus, 
    Trash2, 
    Edit2, 
    UserPlus, 
    Save, 
    X,
    LayoutGrid,
    Database,
    ChevronDown,
    LogOut,
    Camera,
    Loader2
} from 'lucide-react';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingMember, setEditingMember] = useState<Partial<Member> | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    const ADMIN_EMAILS = ['tefanoboschetti@gmail.com'];
    const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const fetchData = async () => {
        try {
            const data = await getMembers();
            setMembers(data);
        } catch (err) {
            console.error('Error fetching members:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    if (authLoading || !user) return null;

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingMember?.id) {
                await updateMember(editingMember.id, editingMember);
            } else if (editingMember) {
                await createMember(editingMember);
            }
            setEditingMember(null);
            setIsAdding(false);
            fetchData();
        } catch (err) {
            console.error('Error saving member:', err);
            alert('Error saving member. Check your permissions.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) {
            alert('Only super-admin can delete personnel.');
            return;
        }

        if (confirm('Are you sure you want to remove this member?')) {
            try {
                await deleteMember(id);
                fetchData();
            } catch (err) {
                console.error('Error deleting member:', err);
            }
        }
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingMember) return;

        try {
            setUploading(true);
            const fileName = `${Date.now()}_${file.name}`;
            const { data, error } = await supabase.storage
                .from('photos')
                .upload(fileName, file);

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from('photos')
                .getPublicUrl(fileName);

            setEditingMember({ ...editingMember, photo_url: publicUrl });
        } catch (err: any) {
            console.error('Error uploading photo:', err);
            alert(`Failed to upload photo: ${err.message || 'Unknown error'}. Check your Supabase Storage Policies.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 p-6 md:p-12 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-6">
                        <Link 
                            href="/"
                            className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
                                Management Console
                            </h1>
                            <p className="text-slate-500 font-medium pb-2">Control the organizational structure of Shaco Core.</p>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
                                <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {isAdmin ? 'System Super Admin' : 'Standard Access'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={logout}
                            className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-red-400 transition-all shadow-sm"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                        {isAdmin && (
                            <button 
                                onClick={() => {
                                    setEditingMember({ name: '', role: '', email: '', manager_id: null });
                                    setIsAdding(true);
                                }}
                                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 shadow-xl shadow-blue-500/20 text-white hover:bg-blue-500 transition-all text-sm font-bold"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Add Member</span>
                            </button>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Members List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 mb-4 px-2">
                            <LayoutGrid className="w-4 h-4 text-slate-500" />
                            <h2 className="text-xs uppercase tracking-[0.2em] font-black text-slate-500">Active Personnel</h2>
                        </div>
                        
                        <div className="space-y-3">
                            {members.map((member) => {
                                const isSelf = user?.email === member.email;
                                const canEdit = isAdmin || isSelf;

                                return (
                                    <motion.div 
                                        layout
                                        key={member.id}
                                        className="flex items-center justify-between p-5 rounded-3xl bg-slate-900/50 border border-slate-800/50 backdrop-blur-sm hover:border-slate-700/80 transition-all group shadow-sm hover:shadow-xl hover:shadow-black/20"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 relative">
                                                {member.photo_url ? (
                                                    <img src={member.photo_url} className="w-full h-full rounded-2xl object-cover" />
                                                ) : (
                                                    <UserPlus className="w-6 h-6" />
                                                )}
                                                {isSelf && (
                                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 border-2 border-slate-950 rounded-full" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-bold text-white leading-tight">{member.name}</h3>
                                                    {isSelf && <span className="text-[9px] font-black uppercase tracking-tighter text-blue-500 px-1.5 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20">You</span>}
                                                </div>
                                                <p className="text-xs font-bold uppercase tracking-widest text-blue-400/80 mt-0.5">{member.role}</p>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-2 transition-opacity ${canEdit ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}`}>
                                            <button 
                                                onClick={() => {
                                                    setEditingMember(member);
                                                    setIsAdding(false);
                                                }}
                                                className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
                                                title="Edit Profile"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {isAdmin && (
                                                <button 
                                                    onClick={() => handleDelete(member.id)}
                                                    className="p-2.5 rounded-xl bg-slate-800 text-red-400 hover:text-white hover:bg-red-500 transition-all"
                                                    title="Remove Member"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {members.length === 0 && !loading && (
                                <div className="p-20 border-2 border-dashed border-slate-800 rounded-[40px] text-center">
                                    <p className="text-slate-500 font-medium italic">The organization is currently empty.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Edit/Add Form */}
                    <div className="lg:col-span-1">
                        <AnimatePresence mode="wait">
                            {editingMember ? (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="sticky top-12 p-8 rounded-[40px] bg-slate-900 border-2 border-slate-800 shadow-2xl"
                                >
                                    <div className="flex justify-between items-center mb-10">
                                        <h2 className="text-xl font-black text-white">{isAdding ? 'New Talent' : 'Edit Member'}</h2>
                                        <button 
                                            onClick={() => {
                                                setEditingMember(null);
                                                setIsAdding(false);
                                            }}
                                            className="text-slate-500 hover:text-white"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSave} className="space-y-8">
                                        <div className="space-y-6">
                                            {/* Photo Upload */}
                                            <div className="flex flex-col items-center gap-4 py-4 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
                                                <div className="relative w-24 h-24 rounded-3xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-lg">
                                                    {editingMember.photo_url ? (
                                                        <img src={editingMember.photo_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Camera className="w-10 h-10 text-slate-600" />
                                                    )}
                                                    {uploading && (
                                                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                                                            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                                                        </div>
                                                    )}
                                                </div>
                                                <label className="cursor-pointer group">
                                                    <span className="px-4 py-2 rounded-xl bg-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400 group-hover:bg-slate-700 group-hover:text-white transition-all">
                                                        {uploading ? 'Uploading...' : 'Upload Photo'}
                                                    </span>
                                                    <input 
                                                        type="file" 
                                                        className="hidden" 
                                                        accept="image/*" 
                                                        onChange={handlePhotoUpload}
                                                        disabled={uploading}
                                                    />
                                                </label>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Full Name</label>
                                                <input 
                                                    required
                                                    className="w-full px-5 py-4 rounded-2xl bg-slate-800 border-none text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                    value={editingMember.name || ''}
                                                    onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
                                                    placeholder="e.g. Marcus Shaco"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Work Email</label>
                                                <input 
                                                    required
                                                    type="email"
                                                    disabled={!isAdmin}
                                                    className={`w-full px-5 py-4 rounded-2xl bg-slate-800 border-none text-white focus:ring-2 focus:ring-blue-500 transition-all ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    value={editingMember.email || ''}
                                                    onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                                                    placeholder="e.g. marcus@shaco.com"
                                                />
                                                {!isAdmin && <p className="text-[9px] text-slate-500 italic ml-1">* Email is managed by System Admin</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Current Role</label>
                                                <input 
                                                    required
                                                    className="w-full px-5 py-4 rounded-2xl bg-slate-800 border-none text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                    value={editingMember.role || ''}
                                                    onChange={(e) => setEditingMember({...editingMember, role: e.target.value})}
                                                    placeholder="e.g. Lead Designer"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Manager</label>
                                                <div className="relative">
                                                    <select 
                                                        disabled={!isAdmin}
                                                        className={`w-full px-5 py-4 rounded-2xl bg-slate-800 border-none text-white appearance-none focus:ring-2 focus:ring-blue-500 transition-all ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                        value={editingMember.manager_id || ''}
                                                        onChange={(e) => setEditingMember({...editingMember, manager_id: e.target.value || null})}
                                                    >
                                                        <option value="">No Manager (Root)</option>
                                                        {members.filter(m => m.id !== editingMember.id).map(m => (
                                                            <option key={m.id} value={m.id}>{m.name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                                </div>
                                                {!isAdmin && <p className="text-[9px] text-slate-500 italic ml-1">* Hierarchy is managed by System Admin</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Birthday</label>
                                                <input 
                                                    className="w-full px-5 py-4 rounded-2xl bg-slate-800 border-none text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                    value={editingMember.birthday || ''}
                                                    onChange={(e) => setEditingMember({...editingMember, birthday: e.target.value})}
                                                    placeholder="e.g. October 24th"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Education</label>
                                                <input 
                                                    className="w-full px-5 py-4 rounded-2xl bg-slate-800 border-none text-white focus:ring-2 focus:ring-blue-500 transition-all"
                                                    value={editingMember.education || ''}
                                                    onChange={(e) => setEditingMember({...editingMember, education: e.target.value})}
                                                    placeholder="e.g. MS in Computer Science"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-500 ml-1">Work History</label>
                                                <textarea 
                                                    className="w-full px-5 py-4 rounded-2xl bg-slate-800 border-none text-white focus:ring-2 focus:ring-blue-500 transition-all min-h-[100px] resize-none"
                                                    value={editingMember.work_history || ''}
                                                    onChange={(e) => setEditingMember({...editingMember, work_history: e.target.value})}
                                                    placeholder="e.g. 5 years at Google, 2 years at Netflix"
                                                />
                                            </div>
                                        </div>

                                        <button 
                                            type="submit"
                                            className="w-full py-5 rounded-3xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Save className="w-5 h-5" />
                                            <span>Save Record</span>
                                        </button>
                                    </form>
                                </motion.div>
                            ) : (
                                <div className="sticky top-12 p-12 border-2 border-dashed border-slate-800 rounded-[40px] text-center space-y-4">
                                    <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-2">
                                        <Edit2 className="w-6 h-6 text-slate-700" />
                                    </div>
                                    <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Editor Console</p>
                                    <p className="text-slate-500 text-sm">Select a member to edit their profile or create a new entry.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </main>
    );
}
