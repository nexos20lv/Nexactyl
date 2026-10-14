import React from 'react';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

export default ({ title, legend, children }: ChartBlockProps) => (
    <div
        style={{
            transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease',
        }}
        className='bg-[#0d0b16] border border-white/[0.07] hover:border-violet-500/40 rounded-2xl p-5 shadow-lg hover:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(124,58,237,0.15)] hover:-translate-y-0.5 relative overflow-hidden group'
    >
        <div className='flex items-center justify-between pb-3.5 mb-2.5 border-b border-white/[0.06]'>
            <h3 className='text-xs font-bold uppercase tracking-wider text-neutral-200 flex items-center gap-2.5'>
                <span className='w-2 h-2 rounded-full bg-violet-500 inline-block shadow-[0_0_8px_rgba(139,92,246,0.9)]' />
                {title}
            </h3>
            {legend && <div className='text-xs flex items-center text-neutral-400 font-mono'>{legend}</div>}
        </div>
        <div className='z-10'>{children}</div>
    </div>
);
