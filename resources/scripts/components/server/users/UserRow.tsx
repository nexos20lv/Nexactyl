import React, { useState } from 'react';
import { Subuser } from '@/state/server/subusers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencilAlt, faUnlockAlt, faShieldAlt } from '@fortawesome/free-solid-svg-icons';
import RemoveSubuserButton from '@/components/server/users/RemoveSubuserButton';
import EditSubuserModal from '@/components/server/users/EditSubuserModal';
import Can from '@/components/elements/Can';
import { useStoreState } from 'easy-peasy';
import tw from 'twin.macro';
import GreyRowBox from '@/components/elements/GreyRowBox';

interface Props {
    subuser: Subuser;
}

export default ({ subuser }: Props) => {
    const uuid = useStoreState((state) => state.user!.data!.uuid);
    const [visible, setVisible] = useState(false);

    return (
        <GreyRowBox css={tw`mb-2.5 items-center`}>
            <EditSubuserModal subuser={subuser} visible={visible} onModalDismissed={() => setVisible(false)} />
            <div
                css={tw`w-10 h-10 rounded-xl bg-violet-950/40 border border-violet-500/20 overflow-hidden flex items-center justify-center hidden md:flex flex-none mr-4`}
            >
                <img css={tw`w-full h-full object-cover`} src={`${subuser.image}?s=400`} alt={subuser.email} />
            </div>
            <div css={tw`flex-1 truncate mr-4`}>
                <p css={tw`text-sm font-semibold text-white truncate`}>{subuser.email}</p>
                <p css={tw`text-2xs text-neutral-400 font-mono mt-0.5`}>Sous-utilisateur</p>
            </div>
            <div css={tw`ml-4 flex items-center`}>
                {subuser.twoFactorEnabled ? (
                    <span
                        css={tw`bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5`}
                    >
                        <FontAwesomeIcon icon={faShieldAlt} css={tw`text-xs`} />
                        2FA Activé
                    </span>
                ) : (
                    <span
                        css={tw`bg-rose-500/20 border border-rose-500/30 text-rose-300 px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5`}
                    >
                        <FontAwesomeIcon icon={faUnlockAlt} css={tw`text-xs`} />
                        2FA Désactivé
                    </span>
                )}
            </div>
            <div css={tw`ml-6 hidden md:block`}>
                <span
                    css={tw`bg-violet-950/40 border border-violet-500/20 text-violet-300 px-2.5 py-1 rounded-lg text-xs font-medium`}
                >
                    {subuser.permissions.filter((permission) => permission !== 'websocket.connect').length} permissions
                </span>
            </div>
            {subuser.uuid !== uuid && (
                <div css={tw`ml-auto flex items-center gap-2 pl-4`}>
                    <Can action={'user.update'}>
                        <button
                            type={'button'}
                            aria-label={'Modifier le sous-utilisateur'}
                            css={tw`p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors duration-150`}
                            onClick={() => setVisible(true)}
                        >
                            <FontAwesomeIcon icon={faPencilAlt} />
                        </button>
                    </Can>
                    <Can action={'user.delete'}>
                        <RemoveSubuserButton subuser={subuser} />
                    </Can>
                </div>
            )}
        </GreyRowBox>
    );
};
