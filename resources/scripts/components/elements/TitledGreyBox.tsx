import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <div
        style={{
            background: '#0d0b16',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
        css={tw`rounded-3xl overflow-hidden transition-all duration-200`}
        className={className}
    >
        <div css={tw`bg-white/[0.03] px-6 py-4 border-b border-white/[0.06] flex items-center`}>
            {typeof title === 'string' ? (
                <p css={tw`text-xs font-bold uppercase tracking-wider text-violet-300 flex items-center gap-2`}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`text-violet-400`} />}
                    <span>{title}</span>
                </p>
            ) : (
                title
            )}
        </div>
        <div css={tw`p-6 text-neutral-200`}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
