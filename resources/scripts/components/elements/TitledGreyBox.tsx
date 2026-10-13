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
        css={tw`rounded-2xl shadow-xl bg-neutral-900/90 border border-violet-500/20 overflow-hidden transition-all duration-200`}
        className={className}
    >
        <div css={tw`bg-neutral-800/60 px-5 py-3.5 border-b border-violet-500/10 flex items-center`}>
            {typeof title === 'string' ? (
                <p css={tw`text-xs font-semibold uppercase tracking-wider text-violet-300 flex items-center`}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2.5 text-violet-400`} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div css={tw`p-5 text-neutral-300`}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
