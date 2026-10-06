import { ElementType, ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useStoreState } from '@/state/hooks';
import { HomeIcon } from '@heroicons/react/outline';
import { withSubComponents } from '@/lib/helpers';

const MobileSidebar = ({ children }: { children: ReactNode[] }) => {
    return (
        <div
            className={
                'fixed bottom-0 z-50 block h-16 w-full rounded-t-2xl border-t border-white/10 bg-black/70 shadow-[0_-8px_24px_rgba(0,0,0,0.3)] backdrop-blur-lg md:hidden'
            }
        >
            <div className={'flex h-full space-x-8 overflow-x-auto px-8'}>{children}</div>
        </div>
    );
};

const Link = ({
    icon: Icon,
    text,
    linkTo,
    end,
}: {
    icon: ElementType;
    text?: string;
    linkTo: string;
    end?: boolean;
}) => {
    const [active, setActive] = useState<boolean>(false);
    const { colors } = useStoreState(s => s.theme.data!);

    return (
        <NavLink
            to={linkTo}
            end={end}
            className={({ isActive }) =>
                `flex h-full items-center justify-center font-semibold transition-all duration-300 active:scale-90 ${
                    isActive ? setActive(true) : setActive(false)
                } ${isActive ? 'scale-105' : ''}`
            }
            style={{ color: active ? colors.primary : '' }}
        >
            {Icon && <Icon className={'mr-2 h-4 w-4 transition-transform duration-300'} />}
            {text}
        </NavLink>
    );
};

const Home = () => {
    const { colors } = useStoreState(s => s.theme.data!);
    return (
        <>
            <NavLink to={'/'} className={'transition-transform duration-200 active:scale-90'}>
                <div className={'my-auto flex h-full items-center justify-center font-semibold'}>
                    <HomeIcon className={'h-5 w-5 brightness-150'} style={{ color: colors.primary }} />
                </div>
            </NavLink>
            <div className={'mx-3 my-auto'}>&bull;</div>
        </>
    );
};

export default withSubComponents(MobileSidebar, { Link, Home });
