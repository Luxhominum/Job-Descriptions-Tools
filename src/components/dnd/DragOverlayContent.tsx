import React from 'react';
import { JobDescription } from '../../types/job';
import { Department } from '../../types/job';
import { GripVertical } from 'lucide-react';

interface DragOverlayContentProps {
  job: JobDescription | null;
  department?: Department;
  sourceSlot?: 'main' | 'secondary';
}

export const DragOverlayContent: React.FC<DragOverlayContentProps> = ({
  job,
  department,
  sourceSlot,
}) => {
  if (!job) return null;

  return (
    <div className="w-72 p-3 bg-white/95 backdrop-blur-md rounded-xl border-2 border-brand-500 shadow-2xl rotate-2 pointer-events-none cursor-grabbing select-none scale-105 transition-transform animate-pulse">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-800">
            {job.code}
          </span>
          {department && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 dark:border dark:border-zinc-700">
              {department.name}
            </span>
          )}
        </div>
        <GripVertical className="w-4 h-4 text-brand-600" />
      </div>

      <h4 className="text-sm font-bold text-slate-900 line-clamp-1 mb-1">{job.title}</h4>
      <p className="text-xs text-slate-500 line-clamp-1 mb-2">{job.summary}</p>

      <div className="flex items-center justify-between text-xs text-brand-700 bg-brand-50 px-2 py-1 rounded-md font-semibold">
        <span>Dragging Role</span>
        <span>
          {sourceSlot === 'secondary'
            ? `${job.defaultSecondaryWorkloadPercent}% FTE`
            : `${job.defaultMainWorkloadPercent}% FTE`}
        </span>
      </div>
    </div>
  );
};
