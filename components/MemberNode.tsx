'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase } from 'lucide-react';

interface MemberNodeProps {
    name: string;
    role: string;
    photoUrl?: string | null;
    isRoot?: boolean;
    onClick?: () => void;
}

const MemberNode: React.FC<MemberNodeProps> = ({ name, role, photoUrl, isRoot, onClick }) => {
    return (
        <motion.div
            whileHover={{ scale: 1.05, translateY: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`
                relative inline-flex flex-col items-center p-4 rounded-2xl
                bg-slate-900/40 backdrop-blur-md border border-slate-700/50
                shadow-xl shadow-blue-500/5 transition-all cursor-pointer
                min-w-[180px] max-w-[220px]
                ${isRoot ? 'ring-2 ring-blue-500/50 ring-offset-4 ring-offset-slate-950' : ''}
            `}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl -z-10" />
            
            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                {photoUrl ? (
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <User className="w-8 h-8 text-slate-500" />
                )}
            </div>

            <h3 className="text-sm font-bold text-white text-center leading-tight mb-1">{name}</h3>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/50">
                <Briefcase className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-300">{role}</span>
            </div>

            {/* Micro-animations */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-0.5 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </motion.div>
    );
};

export default MemberNode;
