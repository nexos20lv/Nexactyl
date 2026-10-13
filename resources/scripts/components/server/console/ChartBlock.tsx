import React from 'react';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

export default ({ title, legend, children }: ChartBlockProps) => (
    <div className='bg-[#0d0b16] border border-[#1f1d2e] hover:border-violet-500/30 rounded-xl p-4 shadow-md transition-all duration-200 relative overflow-hidden group'>
        <div className='flex items-center justify-between pb-3 mb-2 border-b border-[#181624]'>
            <h3 className='text-xs font-bold uppercase tracking-wider text-neutral-200 font-mono flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-violet-500 inline-block shadow-[0_0_8px_rgba(139,92,246,0.8)]' />
                {title}
            </h3>
            {legend && <div className='text-xs flex items-center text-neutral-400 font-mono'>{legend}</div>}
        </div>
        <div className='z-10'>{children}</div>
    </div>
);
