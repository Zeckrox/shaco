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
                h1: ({ children }) => <h1 className="text-lg font-bold text-[#e6edf3] mb-2 mt-4 first:mt-0 border-b border-[#30363d] pb-1">{children}</h1>,
                h2: ({ children }) => <h2 className="text-base font-bold text-[#e6edf3] mb-2 mt-3 first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-bold text-cyan-400 mb-1.5 mt-3 first:mt-0">{children}</h3>,
                h4: ({ children }) => <h4 className="text-sm font-semibold text-[#8b949e] mb-1 mt-2 first:mt-0">{children}</h4>,
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                strong: ({ children }) => <strong className="font-bold text-[#e6edf3]">{children}</strong>,
                a: ({ href, children }) => <a href={href} className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>,
            }}
        >
            {content}
        </ReactMarkdown>
    </div>
);

const InfoRow: React.FC<{
    icon: React.ReactNode;
    label: string;
    accentClass: string;
    children: React.ReactNode;
}> = ({ icon, label, accentClass, children }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-[#21262d] border border-[#30363d]">
        <div className={`p-2 rounded-md ${accentClass} shrink-0`}>
            {icon}
        </div>
        <div className="space-y-1 flex-1 min-w-0">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#8b949e]">// {label}</p>
            <div className="text-sm text-[#e6edf3] leading-relaxed">
                {children}
            </div>
        </div>
    </div>
);

const ProfileModal: React.FC<ProfileModalProps> = ({ member, onClose }) => {
    if (!member) return null;

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0d1117]/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="relative w-full max-w-lg bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
                >
                    {/* Header – cyan accent top border + gradient */}
                    <div className="relative h-28 bg-gradient-to-br from-[#21262d] to-[#161b22]">
                        {/* Top accent line */}
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
                        {/* Subtle glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,0.06),transparent_70%)]" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#21262d] border border-[#30363d] text-[#8b949e] hover:text-[#e6edf3] hover:border-[#8b949e]/40 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Profile Section */}
                    <div className="px-6 pb-8">
                        {/* Avatar overlapping header */}
                        <div className="relative -mt-12 mb-5">
                            <div className="w-24 h-24 rounded-xl bg-[#21262d] border-4 border-[#161b22] shadow-xl overflow-hidden flex items-center justify-center ring-1 ring-cyan-400/20">
                                {member.photo_url ? (
                                    <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-12 h-12 text-[#8b949e]" />
                                )}
                            </div>
                        </div>

                        {/* Name & Role */}
                        <div className="space-y-1 mb-6">
                            <h2 className="text-2xl font-bold text-[#e6edf3]">{member.name}</h2>
                            <p className="text-sm font-mono text-cyan-400">&gt; {member.role}</p>
                        </div>

                        {/* Info rows */}
                        <div className="grid gap-3">
                            {member.description && (
                                <InfoRow
                                    icon={<FileText className="w-4 h-4 text-[#8b949e]" />}
                                    label="acerca de"
                                    accentClass="bg-[#30363d]"
                                >
                                    <MarkdownBlock content={member.description} />
                                </InfoRow>
                            )}

                            <InfoRow
                                icon={<Calendar className="w-4 h-4 text-[#f78166]" />}
                                label="cumpleaños"
                                accentClass="bg-[#f85149]/10"
                            >
                                <span className="text-[#e6edf3]">{member.birthday || <span className="text-[#8b949e] italic">No especificado</span>}</span>
                            </InfoRow>

                            <InfoRow
                                icon={<GraduationCap className="w-4 h-4 text-cyan-400" />}
                                label="educación"
                                accentClass="bg-cyan-500/10"
                            >
                                {member.education
                                    ? <MarkdownBlock content={member.education} />
                                    : <span className="text-[#8b949e] italic">No especificado</span>
                                }
                            </InfoRow>

                            <InfoRow
                                icon={<Briefcase className="w-4 h-4 text-[#a78bfa]" />}
                                label="historial laboral"
                                accentClass="bg-[#a78bfa]/10"
                            >
                                {member.work_history
                                    ? <MarkdownBlock content={member.work_history} />
                                    : <span className="text-[#8b949e] italic">No especificado</span>
                                }
                            </InfoRow>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ProfileModal;
