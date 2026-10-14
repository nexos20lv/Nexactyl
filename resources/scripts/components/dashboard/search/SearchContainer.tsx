import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import useEventListener from '@/plugins/useEventListener';
import SearchModal from '@/components/dashboard/search/SearchModal';

export default () => {
    const [visible, setVisible] = useState(false);

    useEventListener('keydown', (e: KeyboardEvent) => {
        if (['input', 'textarea'].indexOf(((e.target as HTMLElement).tagName || 'input').toLowerCase()) < 0) {
            if (!visible && (e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === '/' || e.key.toLowerCase() === 'k')) {
                e.preventDefault();
                setVisible(true);
            }
        }
    });

    return (
        <>
            {visible && <SearchModal appear visible={visible} onDismissed={() => setVisible(false)} />}
            <button
                type='button'
                onClick={() => setVisible(true)}
                style={{
                    transition:
                        'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, border-color 0.15s ease',
                }}
                className='flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.07] text-neutral-400 hover:text-white text-xs select-none cursor-pointer'
                title='Rechercher un serveur (⌘K / ⌘/)'
            >
                <FontAwesomeIcon icon={faSearch} className='text-violet-400 text-[11px]' />
                <span className='hidden sm:inline text-neutral-400 font-medium'>Rechercher...</span>
                <kbd className='hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono text-neutral-400 bg-white/[0.06] rounded border border-white/[0.08]'>
                    ⌘K
                </kbd>
            </button>
        </>
    );
};
