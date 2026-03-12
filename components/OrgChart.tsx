'use client';

import React from 'react';
import { Tree, TreeNode } from 'react-organizational-chart';
import MemberNode from './MemberNode';
import { Member } from '@/lib/api';

interface OrgChartProps {
    data: Member[];
    onMemberClick?: (member: Member) => void;
}

interface RecursiveNodeProps {
    member: Member;
    onMemberClick?: (member: Member) => void;
    depth?: number;
}

const RecursiveNode: React.FC<RecursiveNodeProps> = ({ member, onMemberClick, depth = 0 }) => {
    const hasSubordinates = member.subordinates && member.subordinates.length > 0;

    const label = (
        <MemberNode
            name={member.name}
            role={member.role}
            photoUrl={member.photo_url}
            isRoot={depth === 0}
            onClick={() => onMemberClick?.(member)}
        />
    );

    if (!hasSubordinates) {
        return <TreeNode label={label} />;
    }

    return (
        <TreeNode label={label}>
            {member.subordinates?.map((sub) => (
                <RecursiveNode key={sub.id} member={sub} onMemberClick={onMemberClick} depth={depth + 1} />
            ))}
        </TreeNode>
    );
};

const OrgChart: React.FC<OrgChartProps> = ({ data, onMemberClick }) => {
    if (!data || data.length === 0) return (
        <div className="flex flex-col items-center justify-center p-20 font-mono text-sm text-[#8b949e] italic">
            // sin datos de organización.
        </div>
    );

    return (
        <div className="w-full overflow-auto py-10 px-4">
            <Tree
                lineWidth={'1px'}
                lineColor={'rgba(48, 54, 61, 0.8)'}
                lineBorderRadius={'8px'}
                label={<div className="hidden" />}
            >
                {data.map((root) => (
                    <RecursiveNode key={root.id} member={root} onMemberClick={onMemberClick} depth={0} />
                ))}
            </Tree>
        </div>
    );
};

export default OrgChart;
