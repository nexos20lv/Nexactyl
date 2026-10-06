import * as React from 'react';
import classNames from 'classnames';
import styles from '@server/console/style.module.css';

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    children: React.ReactNode;
}

export default ({ title, legend, children }: ChartBlockProps) => {
    return (
        <div
            className={classNames(
                styles.chart_container,
                'group',
                'border border-white/10 bg-white/5 shadow-lg backdrop-blur-md',
            )}
        >
            <div className={'flex items-center justify-between px-4 py-2'}>
                <h3 className={'font-header transition-colors duration-100 group-hover:text-slate-50'}>{title}</h3>
                {legend && <p className={'flex items-center text-sm'}>{legend}</p>}
            </div>
            <div className={'z-10 ml-2'}>{children}</div>
        </div>
    );
};
