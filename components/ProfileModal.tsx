'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, GraduationCap, Briefcase, User, FileText } from 'lucide-react';
import { Member } from '@/lib/api';

interface ProfileModalProps {
    member: Member | null;
    onClose: () => void;
}

const MarkdownBlock: React.FC<{ content: string; className?: string }> = ({ content, className = '' }) => (
    <div className={`prose prose-invert prose-sm max-w-none ${className}`}>
        <ReactMarkdown
            components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                a: ({ href, children }) => <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
            }}
        >
            {content}
        </ReactMarkdown>
    </div>
);

const ProfileModal: React.FC<ProfileModalProps> = ({ member, onClose }) => {
    if (!member) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl"
                >
                    {/* Header/Cover */}
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 text-white transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Profile Section */}
                    <div className="px-8 pb-10">
                        <div className="relative -mt-16 mb-6">
                            <div className="w-32 h-32 rounded-3xl bg-slate-800 border-4 border-slate-900 shadow-xl overflow-hidden flex items-center justify-center">
                                {member.photo_url ? (
                                    <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-slate-600" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-1 mb-8">
                            <h2 className="text-3xl font-black text-white">{member.name}</h2>
                            <p className="text-blue-400 font-bold uppercase tracking-widest text-sm">{member.role}</p>
                        </div>

                        <div className="grid gap-6">
                            {/* Description */}
                            {member.description && (
                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                                    <div className="p-2 rounded-xl bg-slate-500/10 text-slate-400">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">About</p>
                                        <div className="text-slate-200 font-medium leading-relaxed">
                                            <MarkdownBlock content={member.description} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Birthday */}
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                                <div className="p-2 rounded-xl bg-pink-500/10 text-pink-500">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Birthday</p>
                                    <p className="text-slate-200 font-medium">{member.birthday || 'Not specified'}</p>
                                </div>
                            </div>

                            {/* Education */}
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Education</p>
                                    <div className="text-slate-200 font-medium">
                                        {member.education ? <MarkdownBlock content={member.education} /> : <span>Not specified</span>}
                                    </div>
                                </div>
                            </div>

                            {/* Work history */}
                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                                    <Briefcase className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Work History</p>
                                    <div className="text-slate-200 font-medium leading-relaxed">
                                        {member.work_history ? <MarkdownBlock content={member.work_history} /> : <span>Not specified</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProfileModal;
