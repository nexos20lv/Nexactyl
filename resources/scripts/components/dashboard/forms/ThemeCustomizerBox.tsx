import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPalette, faCheck, faUndo, faMagic } from '@fortawesome/free-solid-svg-icons';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

interface ThemeOption {
    id: string;
    name: string;
    description: string;
    previewGradient: string;
    accentHex: string;
    glowRgba: string;
}

const THEMES: ThemeOption[] = [
    {
        id: 'violet',
        name: 'Obsidian Violet',
        description: 'Ambiance néon cyberpunk violette et sombre, style signature NXSLab.',
        previewGradient: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
        accentHex: '#8b5cf6',
        glowRgba: 'rgba(139, 92, 246, 0.4)',
    },
    {
        id: 'azure',
        name: 'Neon Azure',
        description: 'Bleu azur électrique éclatant, moderne et rafraîchissant.',
        previewGradient: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
        accentHex: '#38bdf8',
        glowRgba: 'rgba(56, 189, 248, 0.4)',
    },
    {
        id: 'emerald',
        name: 'Matrix Emerald',
        description: 'Vert émeraude matrix pur, symbole de performance et fluidité.',
        previewGradient: 'linear-gradient(135deg, #34d399 0%, #059669 100%)',
        accentHex: '#34d399',
        glowRgba: 'rgba(52, 211, 153, 0.4)',
    },
    {
        id: 'crimson',
        name: 'Cyber Crimson',
        description: 'Rouge carmin vif et passionné, inspiré des interfaces gaming extrêmes.',
        previewGradient: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
        accentHex: '#f43f5e',
        glowRgba: 'rgba(244, 63, 94, 0.4)',
    },
    {
        id: 'amber',
        name: 'Sunset Amber',
        description: 'Teinte ambrée dorée chaleureuse, rappelant les couchers de soleil californiens.',
        previewGradient: 'linear-gradient(135deg, #fcd34d 0%, #d97706 100%)',
        accentHex: '#fbbf24',
        glowRgba: 'rgba(251, 191, 36, 0.4)',
    },
    {
        id: 'fuchsia',
        name: 'Neon Fuchsia',
        description: 'Rose fuchsia néon vibrant à haute saturation visuelle.',
        previewGradient: 'linear-gradient(135deg, #f472b6 0%, #c026d3 100%)',
        accentHex: '#e879f9',
        glowRgba: 'rgba(232, 121, 249, 0.4)',
    },
];

const ThemeCustomizerBox: React.FC = () => {
    const settings = useStoreState((state: ApplicationStore) => state.settings.data);
    const defaultAccent = settings?.accentColor || 'violet';

    const [currentTheme, setCurrentTheme] = useState<string>('violet');
    const [justChanged, setJustChanged] = useState<boolean>(false);

    useEffect(() => {
        const stored = localStorage.getItem('nxslab_theme_accent');
        const active = stored || defaultAccent;
        setCurrentTheme(active);
    }, [defaultAccent]);

    const handleSelectTheme = (themeId: string) => {
        setCurrentTheme(themeId);
        localStorage.setItem('nxslab_theme_accent', themeId);
        document.documentElement.setAttribute('data-theme', themeId);
        setJustChanged(true);
        setTimeout(() => setJustChanged(false), 2500);
    };

    const handleResetToDefault = () => {
        localStorage.removeItem('nxslab_theme_accent');
        setCurrentTheme(defaultAccent);
        document.documentElement.setAttribute('data-theme', defaultAccent);
        setJustChanged(true);
        setTimeout(() => setJustChanged(false), 2500);
    };

    const currentThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

    return (
        <div
            style={{
                background: 'rgba(14, 12, 24, 0.82)',
                backdropFilter: 'blur(24px) saturate(160%)',
                WebkitBackdropFilter: 'blur(24px) saturate(160%)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            }}
            className='rounded-3xl p-6 sm:p-8 select-none'
        >
            {/* Header */}
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-white/[0.08]'>
                <div className='flex items-center gap-3.5'>
                    <div
                        style={{
                            background: currentThemeObj.previewGradient,
                            boxShadow: `0 0 16px ${currentThemeObj.glowRgba}`,
                        }}
                        className='w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0 transition-all duration-300'
                    >
                        <FontAwesomeIcon icon={faPalette} className='text-sm' />
                    </div>
                    <div>
                        <h2 className='text-lg font-bold text-white tracking-tight flex items-center gap-2'>
                            <span>Thème Visuel &amp; Couleur d&apos;Accent</span>
                            <span className='text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-neutral-300 border border-white/[0.08]'>
                                Apple Fluid
                            </span>
                        </h2>
                        <p className='text-xs text-neutral-400 mt-0.5'>
                            Personnalisez l&apos;ambiance lumineuse de votre espace de contrôle. Vos préférences sont
                            appliquées en temps réel.
                        </p>
                    </div>
                </div>

                <div className='flex items-center gap-2 self-start sm:self-auto'>
                    {currentTheme !== defaultAccent && (
                        <button
                            type='button'
                            onClick={handleResetToDefault}
                            style={{
                                transition:
                                    'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.15s ease',
                            }}
                            className='px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] active:scale-95 border border-white/[0.06] flex items-center gap-1.5 transition-all cursor-pointer'
                        >
                            <FontAwesomeIcon icon={faUndo} className='text-[10px]' />
                            <span>Rétablir le défaut hébergeur</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Notification on live change */}
            {justChanged && (
                <div
                    style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        borderColor: currentThemeObj.accentHex,
                    }}
                    className='mt-4 px-4 py-2.5 rounded-2xl border text-xs text-neutral-200 flex items-center gap-2 animate-pulse'
                >
                    <FontAwesomeIcon icon={faMagic} style={{ color: currentThemeObj.accentHex }} />
                    <span>
                        Ambiance <strong>{currentThemeObj.name}</strong> appliquée instantanément !
                    </span>
                </div>
            )}

            {/* Color Palette Grid */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
                {THEMES.map((theme) => {
                    const isSelected = currentTheme === theme.id;
                    const isDefault = theme.id === defaultAccent;

                    return (
                        <button
                            key={theme.id}
                            type='button'
                            onClick={() => handleSelectTheme(theme.id)}
                            style={{
                                background: isSelected ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                                borderColor: isSelected ? theme.accentHex : 'rgba(255, 255, 255, 0.06)',
                                boxShadow: isSelected
                                    ? `0 0 24px ${theme.glowRgba}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                                    : 'none',
                                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                            }}
                            className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 relative overflow-hidden group cursor-pointer hover:border-white/20 active:scale-[0.98] ${
                                isSelected ? 'ring-1' : ''
                            }`}
                        >
                            {/* Color Sphere */}
                            <div
                                style={{
                                    background: theme.previewGradient,
                                    boxShadow: `0 0 14px ${theme.glowRgba}`,
                                }}
                                className='w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white font-bold transition-transform duration-200 group-hover:scale-105'
                            >
                                {isSelected ? (
                                    <FontAwesomeIcon icon={faCheck} className='text-xs' />
                                ) : (
                                    <span className='w-2 h-2 rounded-full bg-white/40' />
                                )}
                            </div>

                            {/* Details */}
                            <div className='flex flex-col min-w-0 pr-6'>
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm font-bold text-white tracking-tight truncate'>
                                        {theme.name}
                                    </span>
                                    {isDefault && (
                                        <span className='text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full bg-white/[0.06] text-neutral-400 border border-white/[0.08]'>
                                            Défaut
                                        </span>
                                    )}
                                </div>
                                <p className='text-[11px] text-neutral-400 mt-1 leading-snug line-clamp-2'>
                                    {theme.description}
                                </p>
                            </div>

                            {/* Active Indicator dot */}
                            {isSelected && (
                                <div
                                    style={{ background: theme.accentHex }}
                                    className='absolute top-3 right-3 w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]'
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ThemeCustomizerBox;
