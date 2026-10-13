import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { NavLink, useLocation } from 'react-router-dom';
import { encodePathSegments, hashToPath } from '@/helpers';
import tw from 'twin.macro';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faFolder } from '@fortawesome/free-solid-svg-icons';

interface Props {
    renderLeft?: JSX.Element;
    withinFileEditor?: boolean;
    isNewFile?: boolean;
}

export default ({ renderLeft, withinFileEditor, isNewFile }: Props) => {
    const [file, setFile] = useState<string | null>(null);
    const id = ServerContext.useStoreState((state) => state.server.data!.id);
    const directory = ServerContext.useStoreState((state) => state.files.directory);
    const { hash } = useLocation();

    useEffect(() => {
        const path = hashToPath(hash);

        if (withinFileEditor && !isNewFile) {
            const name = path.split('/').pop() || null;
            setFile(name);
        }
    }, [withinFileEditor, isNewFile, hash]);

    const breadcrumbs = (): { name: string; path?: string }[] =>
        directory
            .split('/')
            .filter((directory) => !!directory)
            .map((directory, index, dirs) => {
                if (!withinFileEditor && index === dirs.length - 1) {
                    return { name: directory };
                }

                return { name: directory, path: `/${dirs.slice(0, index + 1).join('/')}` };
            });

    return (
        <div
            className={
                'flex flex-wrap items-center gap-2 text-xs text-neutral-400 bg-[#0e0c18] border border-violet-500/20 px-3.5 py-2 rounded-xl shadow-sm'
            }
        >
            {renderLeft}
            <NavLink
                to={`/server/${id}/files`}
                css={tw`flex items-center gap-1.5 text-violet-300 font-semibold no-underline hover:text-violet-200 transition-colors px-2 py-1 rounded-lg hover:bg-violet-950/40`}
            >
                <FontAwesomeIcon icon={faFolderOpen} css={tw`text-violet-400 text-sm`} />
                <span>/</span>
            </NavLink>
            {breadcrumbs().map((crumb, index) =>
                crumb.path ? (
                    <React.Fragment key={index}>
                        <span css={tw`text-violet-500/40 font-bold`}>/</span>
                        <NavLink
                            to={`/server/${id}/files#${encodePathSegments(crumb.path)}`}
                            css={tw`text-neutral-300 no-underline hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-neutral-800`}
                        >
                            {crumb.name}
                        </NavLink>
                    </React.Fragment>
                ) : (
                    <React.Fragment key={index}>
                        <span css={tw`text-violet-500/40 font-bold`}>/</span>
                        <span
                            css={tw`flex items-center gap-1 text-white font-medium bg-violet-950/40 border border-violet-500/20 px-2 py-1 rounded-lg`}
                        >
                            <FontAwesomeIcon icon={faFolder} css={tw`text-violet-400 text-xs mr-1`} />
                            {crumb.name}
                        </span>
                    </React.Fragment>
                )
            )}
            {file && (
                <React.Fragment>
                    <span css={tw`text-violet-500/40 font-bold`}>/</span>
                    <span
                        css={tw`text-fuchsia-300 font-semibold bg-fuchsia-950/30 border border-fuchsia-500/20 px-2 py-1 rounded-lg`}
                    >
                        {file}
                    </span>
                </React.Fragment>
            )}
        </div>
    );
};
