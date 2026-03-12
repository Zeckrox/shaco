'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

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
            whileHover={{ scale: 1.04, translateY: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClick}
            className={`
                relative inline-flex flex-col items-center p-4 rounded-xl cursor-pointer
                bg-[#161b22] border transition-all duration-200
                min-w-[160px] max-w-[200px]
                ${isRoot
                    ? 'border-cyan-400/50 shadow-[0_0_24px_rgba(34,211,238,0.15)]'
                    : 'border-[#30363d] hover:border-cyan-400/40 hover:shadow-[0_0_16px_rgba(34,211,238,0.1)]'
                }
            `}
        >
            {/* Top accent line for root node */}
            {isRoot && (
                <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
            )}

            {/* Photo */}
            <div className={`
                w-14 h-14 rounded-full flex items-center justify-center overflow-hidden mb-3
                bg-[#21262d] border-2
                ${isRoot ? 'border-cyan-400/40' : 'border-[#30363d]'}
            `}>
                {photoUrl ? (
                    <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <User className="w-6 h-6 text-[#8b949e]" />
                )}
            </div>

            {/* Name */}
            <h3 className="text-sm font-semibold text-[#e6edf3] text-center leading-tight mb-2">{name}</h3>

            {/* Role badge – monospace, terminal style */}
            <div className={`
                flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono
                ${isRoot
                    ? 'bg-cyan-500/10 border border-cyan-400/20 text-cyan-400'
                    : 'bg-[#21262d] border border-[#30363d] text-[#8b949e]'
                }
            `}>
                <span className="opacity-60">&gt;</span>
                <span>{role}</span>
            </div>
        </motion.div>
    );
};

export default MemberNode;
