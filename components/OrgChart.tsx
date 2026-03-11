'use client';

import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import MemberNode from './MemberNode';
import { Member } from '@/lib/api';

interface OrgChartProps {
    data: Member[];
    onMemberClick?: (member: Member) => void;
}

const RecursiveNode: React.FC<{ member: Member; onMemberClick?: (member: Member) => void }> = ({ member, onMemberClick }) => {
    const hasSubordinates = member.subordinates && member.subordinates.length > 0;

    const label = (
        <MemberNode 
            name={member.name} 
            role={member.role} 
            photoUrl={member.photo_url} 
            onClick={() => onMemberClick?.(member)}
        />
    );

    if (!hasSubordinates) {
        return <TreeNode label={label} />;
    }

    return (
        <TreeNode label={label}>
            {member.subordinates?.map((sub) => (
                <RecursiveNode key={sub.id} member={sub} onMemberClick={onMemberClick} />
            ))}
        </TreeNode>
    );
};

const OrgChart: React.FC<OrgChartProps> = ({ data, onMemberClick }) => {
    if (!data || data.length === 0) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-500 italic">
            No organization data found.
        </div>
    );

    return (
        <div className="w-full overflow-auto py-10 px-4 custom-scrollbar">
            <Tree
                lineWidth={'2px'}
                lineColor={'rgba(71, 85, 105, 0.4)'}
                lineBorderRadius={'12px'}
                label={<div className="hidden" />} // Dummy root to handle multiple roots if any
            >
                {data.map((root) => (
                    <RecursiveNode key={root.id} member={root} onMemberClick={onMemberClick} />
                ))}
            </Tree>
        </div>
    );
};

export default OrgChart;
