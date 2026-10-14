import React from 'react';
import Icon from '@/components/elements/Icon';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import classNames from 'classnames';
import styles from './style.module.css';
import useFitText from 'use-fit-text';
import CopyOnClick from '@/components/elements/CopyOnClick';

interface StatBlockProps {
    title: string;
    copyOnClick?: string;
    color?: string | undefined;
    icon: IconDefinition;
    children: React.ReactNode;
    className?: string;
}

export default ({ title, copyOnClick, icon, color, className, children }: StatBlockProps) => {
    const { fontSize, ref } = useFitText({ minFontSize: 40, maxFontSize: 500 });

    return (
        <CopyOnClick text={copyOnClick}>
            <div
                style={{
                    transition:
                        'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, border-color 0.2s ease',
                }}
                className={classNames(styles.stat_block, 'cursor-pointer active:scale-[0.98]', className)}
            >
                <div className={classNames(styles.status_bar, color || 'bg-violet-600')} />
                <div className={classNames(styles.icon, color || 'bg-violet-600/15')}>
                    <Icon
                        icon={icon}
                        className={classNames({
                            'text-violet-300': !color,
                            'text-white': color,
                        })}
                    />
                </div>
                <div className={'flex flex-col justify-center overflow-hidden w-full min-w-0'}>
                    <p className={'font-medium leading-tight text-xs text-neutral-400 tracking-tight'}>{title}</p>
                    <div
                        ref={ref}
                        className={'h-[1.75rem] w-full font-bold text-neutral-100 font-mono truncate'}
                        style={{ fontSize }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </CopyOnClick>
    );
};
