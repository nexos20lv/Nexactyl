import React, { createRef } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components/macro';
import tw from 'twin.macro';
import Fade from '@/components/elements/Fade';

interface Props {
    children: React.ReactNode;
    renderToggle: (onClick: (e: React.MouseEvent<any, MouseEvent>) => void) => React.ReactChild;
}

export const DropdownButtonRow = styled.button<{ danger?: boolean }>`
    ${tw`p-2.5 flex items-center rounded-xl w-full text-xs font-medium text-neutral-300 transition-all cursor-pointer select-none border-0 bg-transparent text-left`};
    transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease, color 0.15s ease;

    &:active {
        transform: scale(0.98);
    }

    &:hover {
        ${(props) => (props.danger ? tw`text-white bg-rose-600 shadow-md` : tw`text-white bg-violet-600 shadow-md`)};
    }
`;

interface State {
    posX: number;
    posY: number;
    visible: boolean;
    isContext: boolean;
}

class DropdownMenu extends React.PureComponent<Props, State> {
    container = createRef<HTMLDivElement>();
    menu = createRef<HTMLDivElement>();
    listenerTimeout: number | null = null;

    state: State = {
        posX: 0,
        posY: 0,
        visible: false,
        isContext: false,
    };

    componentWillUnmount() {
        this.removeListeners();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
        if (this.state.visible && !prevState.visible) {
            // Defer listener registration to next tick so the click that opened the menu
            // does not immediately bubble into windowListener and close it in the same event tick.
            this.listenerTimeout = window.setTimeout(() => {
                document.addEventListener('click', this.windowListener);
                document.addEventListener('contextmenu', this.contextMenuListener);
                window.addEventListener('keydown', this.keyListener);
                window.addEventListener('scroll', this.scrollListener, true);
            }, 0);
        }

        if (!this.state.visible && prevState.visible) {
            this.removeListeners();
        }
    }

    removeListeners = () => {
        if (this.listenerTimeout !== null) {
            window.clearTimeout(this.listenerTimeout);
            this.listenerTimeout = null;
        }
        document.removeEventListener('click', this.windowListener);
        document.removeEventListener('contextmenu', this.contextMenuListener);
        window.removeEventListener('keydown', this.keyListener);
        window.removeEventListener('scroll', this.scrollListener, true);
    };

    onClickHandler = (e: React.MouseEvent<any, MouseEvent>) => {
        e.preventDefault();
        e.stopPropagation();
        this.triggerMenu();
    };

    contextMenuListener = () => this.setState({ visible: false, isContext: false });

    scrollListener = () => {
        if (this.state.visible) {
            this.setState({ visible: false, isContext: false });
        }
    };

    keyListener = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.state.visible) {
            this.setState({ visible: false, isContext: false });
        }
    };

    windowListener = (e: MouseEvent) => {
        const menu = this.menu.current;
        const container = this.container.current;

        if (e.button === 2 || !this.state.visible || !menu) {
            return;
        }

        // Clicks inside the menu or inside the toggle container are handled separately
        if (menu.contains(e.target as Node) || container?.contains(e.target as Node)) {
            return;
        }

        this.setState({ visible: false, isContext: false });
    };

    triggerMenu = (pos?: number | { x: number; y: number }, posY?: number) => {
        if (this.state.visible) {
            this.setState({ visible: false, isContext: false });
            return;
        }

        let isContext = false;
        let x = 0;
        let y = 0;

        if (typeof pos === 'object' && pos !== null) {
            x = pos.x;
            y = pos.y;
            isContext = true;
        } else if (typeof pos === 'number') {
            x = pos;
            y = typeof posY === 'number' ? posY : 0;
            isContext = true;
        }

        if (!isContext && this.container.current) {
            const rect = this.container.current.getBoundingClientRect();
            x = rect.right;
            y = rect.bottom + 6;
        }

        this.setState({
            posX: x,
            posY: y,
            isContext,
            visible: true,
        });
    };

    render() {
        const { posX, posY, visible, isContext } = this.state;
        const menuWidth = 208; // 13rem
        const menuEstimatedHeight = 280;
        const screenW = typeof window !== 'undefined' ? window.innerWidth : 1920;
        const screenH = typeof window !== 'undefined' ? window.innerHeight : 1080;

        let left = 0;
        let top = 0;

        if (isContext) {
            // Context menu positioned at cursor
            left = posX + menuWidth > screenW - 12 ? Math.max(12, posX - menuWidth) : Math.max(12, posX);
            top =
                posY + menuEstimatedHeight > screenH - 12
                    ? Math.max(12, posY - menuEstimatedHeight)
                    : Math.max(12, posY);
        } else if (this.container.current) {
            // Anchored directly to toggle button
            const rect = this.container.current.getBoundingClientRect();
            left = Math.max(12, Math.min(rect.right - menuWidth, screenW - menuWidth - 12));
            const opensUpward = screenH - rect.bottom < menuEstimatedHeight + 10;
            top = opensUpward ? Math.max(12, rect.top - menuEstimatedHeight - 6) : rect.bottom + 6;
        } else {
            left = Math.max(12, Math.min(posX - menuWidth, screenW - menuWidth - 12));
            top = Math.max(12, Math.min(posY, screenH - menuEstimatedHeight - 12));
        }

        const portalTarget =
            typeof document !== 'undefined' ? document.getElementById('modal-portal') || document.body : null;

        const menuContent = (
            <Fade timeout={150} in={visible} unmountOnExit>
                <div
                    ref={this.menu}
                    onClick={(e) => {
                        e.stopPropagation();
                        this.setState({ visible: false, isContext: false });
                    }}
                    style={{
                        position: 'fixed',
                        top: `${top}px`,
                        left: `${left}px`,
                        width: '13rem',
                        backdropFilter: 'blur(24px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                        zIndex: 9999,
                    }}
                    className={
                        'bg-[#0e0c18]/95 p-1.5 rounded-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_16px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(124,58,237,0.15)] text-neutral-300'
                    }
                >
                    {this.props.children}
                </div>
            </Fade>
        );

        return (
            <div ref={this.container} className={'relative inline-block'}>
                {this.props.renderToggle(this.onClickHandler)}
                {portalTarget ? createPortal(menuContent, portalTarget) : menuContent}
            </div>
        );
    }
}

export default DropdownMenu;
