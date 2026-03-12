'use client';

import React, { useEffect, useState } from 'react';
import { getMembers, createMember, updateMember, deleteMember, getAdminEmails, addAdmin, removeAdmin, Member } from '@/lib/api';
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
    ChevronDown,
    LogOut,
    Camera,
    Loader2,
    Shield,
    UserCog
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
    const [adminEmails, setAdminEmails] = useState<string[]>([]);
    const [loadingAdmins, setLoadingAdmins] = useState(true);
    const [newAdminEmail, setNewAdminEmail] = useState('');
    const [adminActionLoading, setAdminActionLoading] = useState(false);

    const isAdmin = user?.email ? adminEmails.includes(user.email) : false;
    const canManageAdmins = isAdmin || (user?.email === 'tefanoboschetti@gmail.com' && adminEmails.length === 0);

    const visibleMembers = isAdmin ? members : members.filter(m => m.email === user?.email);

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

    const fetchAdmins = async () => {
        try {
            const emails = await getAdminEmails();
            setAdminEmails(emails);
        } catch (err) {
            console.error('Error fetching admins:', err);
        } finally {
            setLoadingAdmins(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAdmins();
        } else {
            setLoadingAdmins(false);
        }
    }, [user]);

    const handleAddAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        const email = newAdminEmail.trim().toLowerCase();
        if (!email || adminActionLoading) return;
        if (adminEmails.includes(email)) {
            alert('Ese usuario ya es admin.');
            return;
        }
        try {
            setAdminActionLoading(true);
            await addAdmin(email);
            setNewAdminEmail('');
            await fetchAdmins();
        } catch (err: any) {
            console.error('Error adding admin:', err);
            alert(err?.message || 'Error al agregar admin. Revisa las reglas de Firestore.');
        } finally {
            setAdminActionLoading(false);
        }
    };

    const handleRemoveAdmin = async (email: string) => {
        if (adminEmails.length <= 1) {
            alert('Debes mantener al menos un admin.');
            return;
        }
        if (!confirm(`¿Quitar rol de admin a ${email}?`)) return;
        try {
            setAdminActionLoading(true);
            await removeAdmin(email);
            await fetchAdmins();
        } catch (err: any) {
            console.error('Error removing admin:', err);
            alert(err?.message || 'Error al quitar admin.');
        } finally {
            setAdminActionLoading(false);
        }
    };

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
            alert('Error al guardar. Verifica tus permisos.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!isAdmin) {
            alert('Solo los admins pueden eliminar miembros.');
            return;
        }
        if (confirm('¿Eliminar este miembro?')) {
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
            alert(`Error al subir foto: ${err.message || 'Error desconocido'}.`);
        } finally {
            setUploading(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#0d1117] p-6 md:p-10 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div className="flex items-center gap-5">
                        <Link
                            href="/"
                            className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-cyan-400/40 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-[#e6edf3] mb-0.5">
                                {isAdmin ? 'Panel de Gestión' : 'Mi Perfil'}
                            </h1>
                            <p className="text-sm text-[#8b949e]">
                                {isAdmin ? 'Administra la estructura organizacional de Shaco Core.' : 'Gestiona tu información de perfil.'}
                            </p>
                            <div className="inline-flex items-center gap-2 mt-2 px-2.5 py-1 rounded-md bg-[#161b22] border border-[#30363d]">
                                <span className={`w-1.5 h-1.5 rounded-full ${isAdmin ? 'bg-[#3fb950]' : 'bg-cyan-400'}`} />
                                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">
                                    {loadingAdmins ? 'verificando rol...' : isAdmin ? 'admin' : 'acceso estándar'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={logout}
                            className="p-2.5 rounded-lg bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-[#f85149] hover:border-[#f85149]/40 transition-all"
                            title="Cerrar sesión"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                        {isAdmin && (
                            <button
                                onClick={() => {
                                    setEditingMember({ name: '', role: '', email: '', manager_id: null, description: '' });
                                    setIsAdding(true);
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all text-sm font-semibold glow-cyan-sm"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Agregar Miembro</span>
                            </button>
                        )}
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Members List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <LayoutGrid className="w-3.5 h-3.5 text-[#8b949e]" />
                            <h2 className="text-[11px] font-mono uppercase tracking-widest text-[#8b949e]">// personal activo</h2>
                        </div>

                        {canManageAdmins && (
                            <div className="mb-8 p-5 rounded-xl bg-[#161b22] border border-[#30363d]">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-3.5 h-3.5 text-[#3fb950]" />
                                    <h3 className="text-[11px] font-mono uppercase tracking-widest text-[#8b949e]">// gestionar admins</h3>
                                </div>
                                {adminEmails.length === 0 ? (
                                    <p className="text-sm text-[#8b949e] mb-4">Sin admins aún. Agrégate como el primer admin para gestionar roles.</p>
                                ) : null}
                                {adminEmails.length === 0 && user?.email ? (
                                    <button
                                        type="button"
                                        disabled={adminActionLoading}
                                        onClick={async () => {
                                            if (!user?.email) return;
                                            try {
                                                setAdminActionLoading(true);
                                                await addAdmin(user.email!);
                                                await fetchAdmins();
                                            } catch (err: any) {
                                                alert(err?.message || 'Error al agregar admin.');
                                            } finally {
                                                setAdminActionLoading(false);
                                            }
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] hover:bg-[#3fb950]/20 text-sm font-semibold disabled:opacity-50 transition-all"
                                    >
                                        {adminActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCog className="w-4 h-4" />}
                                        <span>Agregarme como primer admin</span>
                                    </button>
                                ) : null}
                                {adminEmails.length > 0 && (
                                    <ul className="space-y-2 mb-4">
                                        {adminEmails.map((email) => (
                                            <li key={email} className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#21262d] border border-[#30363d]">
                                                <span className="text-sm font-mono text-[#e6edf3] truncate">{email}</span>
                                                <div className="flex items-center gap-2 shrink-0">
                                                    {email === user?.email && (
                                                        <span className="text-[9px] font-mono font-bold uppercase text-[#3fb950] px-2 py-0.5 rounded bg-[#3fb950]/10 border border-[#3fb950]/20">tú</span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        disabled={adminActionLoading || (adminEmails.length === 1 && email === user?.email)}
                                                        onClick={() => handleRemoveAdmin(email)}
                                                        className="p-1.5 rounded-md bg-[#161b22] text-[#8b949e] hover:text-[#f85149] hover:bg-[#f85149]/10 transition-all disabled:opacity-50 disabled:pointer-events-none"
                                                        title="Quitar admin"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {adminEmails.length > 0 && (
                                    <form onSubmit={handleAddAdmin} className="flex flex-wrap gap-2">
                                        <select
                                            value={newAdminEmail}
                                            onChange={(e) => setNewAdminEmail(e.target.value)}
                                            className="flex-1 min-w-[180px] px-4 py-2 rounded-lg bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/50"
                                        >
                                            <option value="">Seleccionar miembro como admin</option>
                                            {members
                                                .filter((m) => m.email && !adminEmails.includes(m.email))
                                                .map((m) => (
                                                    <option key={m.id} value={m.email!}>{m.name} ({m.email})</option>
                                                ))}
                                        </select>
                                        <button
                                            type="submit"
                                            disabled={!newAdminEmail.trim() || adminActionLoading}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] hover:bg-[#3fb950]/20 text-sm font-semibold disabled:opacity-50 disabled:pointer-events-none transition-all"
                                        >
                                            {adminActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCog className="w-4 h-4" />}
                                            <span>Agregar admin</span>
                                        </button>
                                        {members.filter((m) => m.email && !adminEmails.includes(m.email)).length === 0 && members.length > 0 && (
                                            <p className="text-xs font-mono text-[#8b949e] mt-2 w-full">// todos los miembros ya son admins.</p>
                                        )}
                                    </form>
                                )}
                            </div>
                        )}

                        <div className="space-y-2">
                            {visibleMembers.map((member) => {
                                const isSelf = user?.email === member.email;
                                const canEdit = isAdmin || isSelf;

                                return (
                                    <motion.div
                                        layout
                                        key={member.id}
                                        className="flex items-center justify-between p-4 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-cyan-400/30 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-lg bg-[#21262d] border border-[#30363d] flex items-center justify-center text-[#8b949e] relative overflow-hidden">
                                                {member.photo_url ? (
                                                    <img src={member.photo_url} className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserPlus className="w-5 h-5" />
                                                )}
                                                {isSelf && (
                                                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-cyan-400 border-2 border-[#161b22] rounded-full" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-[#e6edf3] leading-tight">{member.name}</h3>
                                                    {isSelf && <span className="text-[9px] font-mono font-bold uppercase text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-400/20">tú</span>}
                                                </div>
                                                <p className="text-[11px] font-mono text-[#8b949e] mt-0.5">&gt; {member.role}</p>
                                            </div>
                                        </div>

                                        <div className={`flex items-center gap-2 ${canEdit ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                            <button
                                                onClick={() => {
                                                    setEditingMember(member);
                                                    setIsAdding(false);
                                                }}
                                                className="p-2 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#30363d] transition-all"
                                                title="Editar perfil"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDelete(member.id)}
                                                    className="p-2 rounded-lg bg-[#21262d] text-[#8b949e] hover:text-[#f85149] hover:bg-[#f85149]/10 transition-all"
                                                    title="Eliminar miembro"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {visibleMembers.length === 0 && !loading && (
                                <div className="p-16 border border-dashed border-[#30363d] rounded-xl text-center">
                                    <p className="text-sm font-mono text-[#8b949e] italic">
                                        {isAdmin ? '// la organización está vacía.' : '// tu perfil no fue encontrado. Asegúrate de que tu correo esté registrado.'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Edit/Add Form – Desktop side panel */}
                    <div className="hidden lg:block lg:col-span-1">
                        <AnimatePresence mode="wait">
                            {editingMember ? (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="sticky top-12 p-6 rounded-xl bg-[#161b22] border border-[#30363d] shadow-2xl"
                                >
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-lg font-bold text-[#e6edf3]">
                                            {isAdding ? 'Nuevo Miembro' : 'Editar Miembro'}
                                        </h2>
                                        <button
                                            onClick={() => { setEditingMember(null); setIsAdding(false); }}
                                            className="text-[#8b949e] hover:text-[#e6edf3] transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <EditFormFields
                                        editingMember={editingMember}
                                        setEditingMember={setEditingMember}
                                        isAdmin={isAdmin}
                                        members={members}
                                        uploading={uploading}
                                        handlePhotoUpload={handlePhotoUpload}
                                        handleSave={handleSave}
                                    />
                                </motion.div>
                            ) : (
                                <div className="sticky top-12 p-10 border border-dashed border-[#30363d] rounded-xl text-center space-y-3">
                                    <div className="w-12 h-12 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-center mx-auto">
                                        <Edit2 className="w-5 h-5 text-[#30363d]" />
                                    </div>
                                    <p className="text-[11px] font-mono text-[#30363d] uppercase tracking-widest">// editor</p>
                                    <p className="text-sm text-[#8b949e]">Selecciona un miembro para editar o crea uno nuevo.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Edit/Add Form – Mobile bottom-sheet */}
            <AnimatePresence>
                {editingMember && (
                    <motion.div
                        className="lg:hidden fixed inset-0 z-50 flex items-end bg-[#0d1117]/80 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => { setEditingMember(null); setIsAdding(false); }}
                    >
                        <motion.div
                            className="w-full bg-[#161b22] border-t border-[#30363d] rounded-t-2xl px-6 pt-4 pb-10 max-h-[92dvh] overflow-y-auto"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="w-8 h-1 rounded-full bg-[#30363d] mx-auto mb-6" />
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-xl font-bold text-[#e6edf3]">{isAdding ? 'Nuevo Miembro' : 'Editar Perfil'}</h2>
                                <button
                                    onClick={() => { setEditingMember(null); setIsAdding(false); }}
                                    className="text-[#8b949e] hover:text-[#e6edf3]"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <EditFormFields
                                editingMember={editingMember}
                                setEditingMember={setEditingMember}
                                isAdmin={isAdmin}
                                members={members}
                                uploading={uploading}
                                handlePhotoUpload={handlePhotoUpload}
                                handleSave={handleSave}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}

interface EditFormFieldsProps {
    editingMember: Partial<Member>;
    setEditingMember: (m: Partial<Member>) => void;
    isAdmin: boolean;
    members: Member[];
    uploading: boolean;
    handlePhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSave: (e: React.FormEvent) => void;
}

function EditFormFields({ editingMember, setEditingMember, isAdmin, members, uploading, handlePhotoUpload, handleSave }: EditFormFieldsProps) {
    const inputClass = "w-full px-4 py-3 rounded-lg bg-[#21262d] border border-[#30363d] text-[#e6edf3] text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400/50 focus:border-cyan-400/50 transition-all placeholder:text-[#8b949e]";
    const labelClass = "text-[10px] font-mono uppercase tracking-widest text-[#8b949e] ml-0.5";

    return (
        <form onSubmit={handleSave} className="space-y-6">
            {/* Photo Upload */}
            <div className="flex flex-col items-center gap-3 py-5 border border-dashed border-[#30363d] rounded-xl bg-[#21262d]/30">
                <div className="relative w-20 h-20 rounded-xl bg-[#21262d] border border-[#30363d] flex items-center justify-center overflow-hidden">
                    {editingMember.photo_url ? (
                        <img src={editingMember.photo_url} className="w-full h-full object-cover" />
                    ) : (
                        <Camera className="w-8 h-8 text-[#30363d]" />
                    )}
                    {uploading && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                        </div>
                    )}
                </div>
                <label className="cursor-pointer">
                    <span className="px-3 py-1.5 rounded-md bg-[#21262d] border border-[#30363d] text-[10px] font-mono uppercase tracking-widest text-[#8b949e] hover:border-cyan-400/40 hover:text-cyan-400 transition-all">
                        {uploading ? 'subiendo...' : 'subir foto'}
                    </span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
                </label>
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Nombre Completo</label>
                <input required className={inputClass} value={editingMember.name || ''} onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })} placeholder="ej. Marcus Shaco" />
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Correo</label>
                <input required type="email" disabled={!isAdmin} className={`${inputClass} ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`} value={editingMember.email || ''} onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })} placeholder="ej. marcus@shaco.com" />
                {!isAdmin && <p className="text-[9px] font-mono text-[#8b949e] italic ml-0.5">// el correo lo gestiona el admin</p>}
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Rol</label>
                <input required className={inputClass} value={editingMember.role || ''} onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })} placeholder="ej. Diseñador Principal" />
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Superior</label>
                <div className="relative">
                    <select disabled={!isAdmin} className={`${inputClass} appearance-none ${!isAdmin ? 'opacity-50 cursor-not-allowed' : ''}`} value={editingMember.manager_id || ''} onChange={(e) => setEditingMember({ ...editingMember, manager_id: e.target.value || null })}>
                        <option value="">Sin Superior (Raíz)</option>
                        {members.filter(m => m.id !== editingMember.id).map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e] pointer-events-none" />
                </div>
                {!isAdmin && <p className="text-[9px] font-mono text-[#8b949e] italic ml-0.5">// la jerarquía la gestiona el admin</p>}
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Descripción (Markdown)</label>
                <textarea className={`${inputClass} min-h-[80px] resize-none`} value={editingMember.description || ''} onChange={(e) => setEditingMember({ ...editingMember, description: e.target.value })} placeholder="ej. **Bio** o *destacados* en Markdown" />
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Cumpleaños</label>
                <input className={inputClass} value={editingMember.birthday || ''} onChange={(e) => setEditingMember({ ...editingMember, birthday: e.target.value })} placeholder="ej. 24 de octubre" />
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Educación (Markdown)</label>
                <input className={inputClass} value={editingMember.education || ''} onChange={(e) => setEditingMember({ ...editingMember, education: e.target.value })} placeholder="ej. Maestría en Ciencias de la Computación" />
            </div>

            <div className="space-y-1.5">
                <label className={labelClass}>Historial Laboral (Markdown)</label>
                <textarea className={`${inputClass} min-h-[90px] resize-none`} value={editingMember.work_history || ''} onChange={(e) => setEditingMember({ ...editingMember, work_history: e.target.value })} placeholder="ej. 5 años en Google, 2 años en Netflix" />
            </div>

            <button
                type="submit"
                className="w-full py-3 rounded-lg bg-cyan-500/10 border border-cyan-400/30 text-cyan-400 font-semibold text-sm hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all flex items-center justify-center gap-2 glow-cyan-sm"
            >
                <Save className="w-4 h-4" />
                <span>Guardar</span>
            </button>
        </form>
    );
}
