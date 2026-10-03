import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ServerContext } from '@/state/server';
import stripAnsi from 'strip-ansi';
import { SocketEvent } from '@/components/server/events';
import CopyOnClick from '@/components/elements/CopyOnClick';

const MAX_BUFFERED_LINES = 5000;
const ICON_GAP_PX = 6;
const ICON_RIGHT_PX = 10;

const containerStyle: React.CSSProperties = {
    fontSize: '15px',
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    zIndex: 50,
};

const iconStyle: React.CSSProperties = {
    fontSize: '15px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    padding: '0.35rem',
    borderRadius: '0.375rem',
};

const tooltipStyle: React.CSSProperties = {
    position: 'absolute',
    right: 0,
    bottom: '100%',
    marginBottom: '0.4rem',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    color: '#ffffff',
    padding: '5px 10px',
    borderRadius: '5px',
    whiteSpace: 'nowrap',
    fontSize: '12px',
    zIndex: 99999,
    opacity: 1,
    transition: 'opacity 0.2s ease-in-out',
    pointerEvents: 'none',
};

/**
 * Blueprint component injected into the Pterodactyl server terminal "CommandRow".
 *
 * We keep a rolling in-memory buffer of recent CONSOLE_OUTPUT lines so copying stays fast and we
 * don't accumulate unbounded memory on long-running servers.
 */
const CopyConsole: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const { connected, instance } = ServerContext.useStoreState((state) => state.socket);
    const [isTooltipVisible, setTooltipVisible] = useState(false);
    const hostRef = useRef<HTMLDivElement | null>(null);
    const iconRootRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const originalInputPaddingRightRef = useRef<string | null>(null);
    const basePaddingRightPxRef = useRef<number | null>(null);
    const [portalHost, setPortalHost] = useState<HTMLElement | null>(null);

    const addLog = useCallback((data: string) => {
        const line = data.startsWith('>') ? data.substring(1) : data;

        setLogs((prevLogs) => {
            const next = [...prevLogs, line];
            return next.length > MAX_BUFFERED_LINES ? next.slice(-MAX_BUFFERED_LINES) : next;
        });
    }, []);

    useEffect(() => {
        if (!connected || !instance) return;

        instance.addListener(SocketEvent.CONSOLE_OUTPUT, addLog);
        return () => instance.removeListener(SocketEvent.CONSOLE_OUTPUT, addLog);
    }, [addLog, connected, instance]);

    const copyText = useMemo(() => stripAnsi(logs.join('\n')), [logs]);

    useEffect(() => {
        let mo: MutationObserver | null = null;

        const tryMount = () => {
            if (hostRef.current) return true;

            const inputs = Array.from(
                document.querySelectorAll<HTMLInputElement>('input[aria-label="Console command input."]')
            );
            const input =
                inputs.find((i) => i.getClientRects().length > 0 && !i.disabled) ?? inputs.find((i) => !i.disabled);

            if (!input) return false;

            const wrapper = (input.closest('div.relative') as HTMLElement | null) ?? (input.parentElement as HTMLElement | null);
            if (!wrapper) return false;

            // Overlay host inside the input wrapper; doesn't affect layout.
            const host = document.createElement('div');
            host.dataset.copyConsoleHost = 'true';
            host.style.position = 'absolute';
            host.style.inset = '0';
            host.style.pointerEvents = 'none';
            wrapper.appendChild(host);

            hostRef.current = host;
            inputRef.current = input;
            setPortalHost(host);
            return true;
        };

        if (!tryMount()) {
            mo = new MutationObserver(() => {
                if (tryMount() && mo) mo.disconnect();
            });
            mo.observe(document.body, { childList: true, subtree: true });
        }

        return () => {
            if (mo) mo.disconnect();
            if (hostRef.current) {
                hostRef.current.remove();
                hostRef.current = null;
            }

            const input = inputRef.current;
            if (input && originalInputPaddingRightRef.current !== null) {
                input.style.paddingRight = originalInputPaddingRightRef.current;
            }
        };
    }, []);

    useEffect(() => {
        if (!portalHost) return;

        const input = inputRef.current;
        const iconRoot = iconRootRef.current;
        if (!input || !iconRoot) return;

        const applyPadding = () => {
            const computed = window.getComputedStyle(input);
            if (originalInputPaddingRightRef.current === null) {
                originalInputPaddingRightRef.current = input.style.paddingRight;
            }
            if (basePaddingRightPxRef.current === null) {
                basePaddingRightPxRef.current = parseFloat(computed.paddingRight) || 0;
            }

            const basePaddingPx = basePaddingRightPxRef.current ?? 0;
            const iconWidthPx = Math.ceil(iconRoot.getBoundingClientRect().width);
            const minPaddingRightPx = ICON_RIGHT_PX + iconWidthPx + ICON_GAP_PX;

            input.style.paddingRight = `${Math.max(basePaddingPx, minPaddingRightPx)}px`;
        };

        applyPadding();

        let ro: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(applyPadding);
            ro.observe(iconRoot);
            ro.observe(input);
        } else {
            window.addEventListener('resize', applyPadding);
        }

        return () => {
            if (ro) ro.disconnect();
            else window.removeEventListener('resize', applyPadding);
        };
    }, [portalHost]);

    if (!portalHost) return null;

    return createPortal(
        <div ref={iconRootRef} style={{ ...containerStyle, right: `${ICON_RIGHT_PX}px` }}>
            <CopyOnClick text={copyText}>
                <i
                    className="fa-solid fa-copy text-white cursor-pointer"
                    onMouseEnter={() => setTooltipVisible(true)}
                    onMouseLeave={() => setTooltipVisible(false)}
                    style={iconStyle}
                />
            </CopyOnClick>
            {isTooltipVisible && <div style={tooltipStyle}>Copy console log</div>}
        </div>,
        portalHost
    );
};

export default CopyConsole;
