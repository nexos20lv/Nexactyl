import type { ReactNode } from 'react';
import { useStoreState } from '@/state/hooks';
import { hasAdminPermission } from '@/plugins/adminPermissions';

interface Props {
    action: string | string[];
    matchAny?: boolean;
    renderOnError?: ReactNode | null;
    children: ReactNode;
}

export default function Can({ action, matchAny = false, renderOnError, children }: Props) {
    const adminPermissions = useStoreState(state => state.user.data!.adminPermissions);

    const hasPermission = (Array.isArray(action) ? action : [action])[matchAny ? 'some' : 'every'](
        p => hasAdminPermission(adminPermissions, p)
    );

    if (hasPermission) {
        return <>{children}</>;
    }

    return <>{renderOnError}</>;
}
