import React, { useState } from 'react';
import EditSubuserModal from '@/components/server/users/EditSubuserModal';
import { Button } from '@/components/elements/button/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus } from '@fortawesome/free-solid-svg-icons';

export default () => {
    const [visible, setVisible] = useState(false);

    return (
        <>
            <EditSubuserModal visible={visible} onModalDismissed={() => setVisible(false)} />
            <Button onClick={() => setVisible(true)}>
                <FontAwesomeIcon icon={faUserPlus} className='mr-2 text-xs' />
                Ajouter un utilisateur
            </Button>
        </>
    );
};
