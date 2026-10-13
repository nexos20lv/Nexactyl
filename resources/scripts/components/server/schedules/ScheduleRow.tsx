import React from 'react';
import { Schedule } from '@/api/server/schedules/getServerSchedules';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { format } from 'date-fns';
import tw from 'twin.macro';
import ScheduleCronRow from '@/components/server/schedules/ScheduleCronRow';

export default ({ schedule }: { schedule: Schedule }) => (
    <>
        <div
            css={tw`w-10 h-10 rounded-xl bg-violet-950/40 border border-violet-500/20 flex items-center justify-center text-violet-400 hidden md:flex mr-4 flex-none`}
        >
            <FontAwesomeIcon icon={faClock} fixedWidth />
        </div>
        <div css={tw`flex-1 md:ml-2`}>
            <p css={tw`text-base font-semibold text-white`}>{schedule.name}</p>
            <p css={tw`text-xs text-neutral-400 mt-0.5`}>
                Dernière exécution :{' '}
                {schedule.lastRunAt ? format(schedule.lastRunAt, "dd/MM/yyyy 'à' HH:mm") : 'jamais'}
            </p>
        </div>
        <ScheduleCronRow cron={schedule.cron} css={tw`mx-auto sm:mx-6 w-full sm:w-auto mt-3 sm:mt-0`} />
        <div css={tw`ml-auto flex items-center`}>
            <span
                css={[
                    tw`py-1 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider`,
                    schedule.isProcessing
                        ? tw`bg-violet-500/20 text-violet-300 border border-violet-500/40 animate-pulse`
                        : schedule.isActive
                        ? tw`bg-emerald-500/20 text-emerald-300 border border-emerald-500/30`
                        : tw`bg-neutral-800 text-neutral-400 border border-white/5`,
                ]}
            >
                {schedule.isProcessing ? 'En cours' : schedule.isActive ? 'Actif' : 'Inactif'}
            </span>
        </div>
    </>
);
