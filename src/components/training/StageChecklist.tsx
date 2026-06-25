import Link from 'next/link';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import { SeasonRank } from '@/lib/seasons';
import { stagesForRank } from '@/lib/seasons';
import {
  isStageComplete,
  isStageUnlocked,
  missionTrainPath,
} from '@/lib/seasonProgression';

export default function StageChecklist({
  rank,
  completions,
  limit,
}: {
  rank: SeasonRank;
  completions: Set<string>;
  limit?: number;
}) {
  const stages = stagesForRank(rank);
  const visible = limit ? stages.slice(0, limit) : stages;

  return (
    <ul className="fit-stage-list">
      {visible.map((stage) => {
        const done = isStageComplete(completions, rank, stage.index);
        const unlocked = isStageUnlocked(completions, rank, stage.index);
        const active = unlocked && !done;

        return (
          <li key={stage.index} className={`fit-stage-row ${active ? 'fit-stage-row--active' : ''}`}>
            <span className="fit-stage-row__icon">
              {done ? (
                <CheckCircle2 size={18} className="text-green-400" />
              ) : unlocked ? (
                <Circle size={18} className={active ? 'text-orange-400' : 'text-muted'} />
              ) : (
                <Lock size={16} className="text-muted" />
              )}
            </span>
            <div className="fit-stage-row__body">
              <p className="fit-stage-row__num">Stage {stage.index + 1}</p>
              <p className="fit-stage-row__name">{stage.name}</p>
              <p className="fit-stage-row__reps">{stage.reps} reps</p>
            </div>
            {unlocked && !done && (
              <Link href={missionTrainPath(rank, stage.index)} className="fit-stage-row__action">
                Start →
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}
