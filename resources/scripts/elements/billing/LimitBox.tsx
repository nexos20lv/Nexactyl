import { ReactElement } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

interface LimitProps {
    icon: IconDefinition;
    limit: ReactElement;
}

export default ({ icon, limit }: LimitProps) => (
    <div className={'mt-1 text-gray-400'}>
        <FontAwesomeIcon icon={icon} className={'mr-2 h-4 w-4'} />
        {limit}
    </div>
);
