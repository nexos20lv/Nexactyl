import React from 'react';
import Skeleton from '@/elements/Skeleton';
import classNames from 'classnames';
import { useStoreState } from '@/state/hooks';

export default function ServerRowSkeleton() {
    const colors = useStoreState(state => state.theme.data!.colors);

    return (
        <div
            className={classNames(
                'group relative w-full my-2 rounded-xl border border-white/5',
            )}
            style={{ backgroundColor: colors.sidebar }}
        >
            <div className={'flex flex-col lg:flex-row lg:items-center gap-4 p-4 lg:p-5'}>
                <div className={'flex items-start gap-3 flex-1 min-w-0'}>
                    <Skeleton className={'w-10 h-10 rounded-lg flex-shrink-0'} />
                    <div className={'min-w-0 flex-1 flex flex-col gap-2 mt-1'}>
                        <div className={'flex items-center gap-2'}>
                            <Skeleton className={'w-48 h-5'} />
                            <Skeleton className={'w-16 h-5 rounded-full'} />
                        </div>
                        <div className={'flex items-center gap-3'}>
                            <Skeleton className={'w-24 h-4'} />
                            <Skeleton className={'w-32 h-4'} />
                        </div>
                    </div>
                </div>
                <div className={'flex-shrink-0 w-full lg:w-72 xl:w-80'}>
                    <div className={'flex justify-between gap-x-5 bg-white/[0.03] rounded-lg border border-white/5 px-4 py-3'}>
                        <div className={'w-full'}>
                            <Skeleton className={'w-12 h-3 mb-2'} />
                            <Skeleton className={'w-full h-1.5 rounded-full'} />
                        </div>
                        <div className={'w-full'}>
                            <Skeleton className={'w-12 h-3 mb-2'} />
                            <Skeleton className={'w-full h-1.5 rounded-full'} />
                        </div>
                    </div>
                </div>
                <div className={'flex-shrink-0 hidden xl:flex items-center'}>
                    <Skeleton className={'w-20 h-8 rounded-lg'} />
                </div>
            </div>
        </div>
    );
}
