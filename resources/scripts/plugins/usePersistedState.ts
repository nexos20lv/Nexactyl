import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export function usePersistedState<S = undefined>(key: string, defaultValue: S): [S, Dispatch<SetStateAction<S>>] {
    const [state, setState] = useState<S>(() => {
        try {
            const item = localStorage.getItem(key);

            return item !== null ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.warn('Failed to retrieve persisted value from store.', e);

            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (e) {
            console.warn('Failed to save persisted value to store.', e);
        }
    }, [key, state]);

    return [state, setState];
}
