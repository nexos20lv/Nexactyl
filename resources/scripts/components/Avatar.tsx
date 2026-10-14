import React, { useState } from 'react';
import BoringAvatar, { AvatarProps } from 'boring-avatars';
import { useStoreState } from '@/state/hooks';

const palette = ['#7c3aed', '#a855f7', '#6366f1', '#3b82f6', '#ec4899'];

export interface CustomAvatarProps extends AvatarProps {
    url?: string | null;
}

type Props = Omit<CustomAvatarProps, 'colors'>;

const _Avatar = ({ variant = 'beam', url, ...props }: CustomAvatarProps) => {
    const [failed, setFailed] = useState(false);

    if (url && !failed) {
        return (
            <img
                src={url}
                alt={props.name || 'Avatar'}
                className={'w-full h-full object-cover'}
                onError={() => setFailed(true)}
            />
        );
    }

    return <BoringAvatar colors={palette} variant={variant} {...props} />;
};

const _UserAvatar = ({ variant = 'beam', url, ...props }: Omit<Props, 'name'>) => {
    const uuid = useStoreState((state) => state.user.data?.uuid);
    const storeAvatarUrl = useStoreState((state) => state.user.data?.avatarUrl);
    const activeUrl = url !== undefined ? url : storeAvatarUrl;
    const [failed, setFailed] = useState(false);

    // Reset error state if avatar URL changes
    React.useEffect(() => {
        setFailed(false);
    }, [activeUrl]);

    if (activeUrl && !failed) {
        return (
            <img
                src={activeUrl}
                alt={'Avatar'}
                className={'w-full h-full object-cover'}
                onError={() => setFailed(true)}
            />
        );
    }

    return <BoringAvatar colors={palette} name={uuid || 'system'} variant={variant} {...props} />;
};

_Avatar.displayName = 'Avatar';
_UserAvatar.displayName = 'Avatar.User';

const Avatar = Object.assign(_Avatar, {
    User: _UserAvatar,
});

export default Avatar;
