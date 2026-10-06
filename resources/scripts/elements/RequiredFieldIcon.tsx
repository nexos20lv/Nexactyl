import Tooltip from '@/elements/tooltip/Tooltip';
import { ExclamationIcon } from '@heroicons/react/solid';

export default () => (
    <Tooltip content={'You must enter a value for this field for this module to work.'}>
        <span className={'ml-1 inline-flex align-middle'}>
            <ExclamationIcon className={'h-4 w-4 text-yellow-500 duration-300 hover:text-yellow-300'} />
        </span>
    </Tooltip>
);
