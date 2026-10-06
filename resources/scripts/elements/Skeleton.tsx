import React from 'react';
import classNames from 'classnames';

interface SkeletonProps {
    className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={classNames('animate-pulse bg-white/10 rounded', className)}
        />
    );
}
