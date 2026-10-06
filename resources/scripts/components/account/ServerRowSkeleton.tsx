import Skeleton from '@/elements/Skeleton';
import classNames from 'classnames';
import { useStoreState } from '@/state/hooks';

export default function ServerRowSkeleton() {
    const colors = useStoreState(state => state.theme.data!.colors);

    return (
        <div
            className={classNames('group relative my-2 w-full rounded-xl border border-white/5')}
            style={{ backgroundColor: colors.sidebar }}
        >
            <div className={'flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:p-5'}>
                <div className={'flex min-w-0 flex-1 items-start gap-3'}>
                    <Skeleton className={'h-10 w-10 flex-shrink-0 rounded-lg'} />
                    <div className={'mt-1 flex min-w-0 flex-1 flex-col gap-2'}>
                        <div className={'flex items-center gap-2'}>
                            <Skeleton className={'h-5 w-48'} />
                            <Skeleton className={'h-5 w-16 rounded-full'} />
                        </div>
                        <div className={'flex items-center gap-3'}>
                            <Skeleton className={'h-4 w-24'} />
                            <Skeleton className={'h-4 w-32'} />
                        </div>
                    </div>
                </div>
                <div className={'w-full flex-shrink-0 lg:w-72 xl:w-80'}>
                    <div
                        className={
                            'flex justify-between gap-x-5 rounded-lg border border-white/5 bg-white/[0.03] px-4 py-3'
                        }
                    >
                        <div className={'w-full'}>
                            <Skeleton className={'mb-2 h-3 w-12'} />
                            <Skeleton className={'h-1.5 w-full rounded-full'} />
                        </div>
                        <div className={'w-full'}>
                            <Skeleton className={'mb-2 h-3 w-12'} />
                            <Skeleton className={'h-1.5 w-full rounded-full'} />
                        </div>
                    </div>
                </div>
                <div className={'hidden flex-shrink-0 items-center xl:flex'}>
                    <Skeleton className={'h-8 w-20 rounded-lg'} />
                </div>
            </div>
        </div>
    );
}
