import { useEffect, useState } from 'react';

const STORAGE_KEY = 'nexactyl:privacy:hide_ip';
const EVENT_NAME = 'nexactyl:privacy_mode_changed';

export const getPrivacyMode = (): boolean => {
    try {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
        return false;
    }
};

export const setPrivacyModeGlobal = (value: boolean) => {
    try {
        localStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
        window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: value }));
    } catch (e) {
        console.error(e);
    }
};

export const usePrivacyMode = (): [boolean, (val: boolean | ((prev: boolean) => boolean)) => void] => {
    const [hidden, setHidden] = useState<boolean>(getPrivacyMode);

    useEffect(() => {
        const handler = (e: any) => {
            if (e?.detail !== undefined) {
                setHidden(Boolean(e.detail));
            } else {
                setHidden(getPrivacyMode());
            }
        };

        window.addEventListener(EVENT_NAME, handler);
        window.addEventListener('storage', handler);
        return () => {
            window.removeEventListener(EVENT_NAME, handler);
            window.removeEventListener('storage', handler);
        };
    }, []);

    const toggle = (val: boolean | ((prev: boolean) => boolean)) => {
        const next = typeof val === 'function' ? val(hidden) : val;
        setHidden(next);
        setPrivacyModeGlobal(next);
    };

    return [hidden, toggle];
};
