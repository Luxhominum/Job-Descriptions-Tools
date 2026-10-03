import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Info, Sparkles, Users, UserPlus, Check } from 'lucide-react';
import type { JobDescription } from '../../types/job';
import type { DraggedJobPayload, DragSourceType } from '../../types/dnd';
import { useAppStore } from '../../context/AppContext';

interface DraggableJobCardProps {
  job: JobDescription;
  sourceType: DragSourceType;
  sourceEmployeeId?: string;
  sourceSlot?: 'main' | 'secondary';
  compact?: boolean;
  isAssigned?: boolean;
  assignedCount?: number;
  assignedEmployeeNames?: string[];
}

export const DraggableJobCard: React.FC<DraggableJobCardProps> = ({
  job,
  sourceType,
  sourceEmployeeId,
  sourceSlot,
  compact = false,
  isAssigned = false,
  assignedCount = 0,
  assignedEmployeeNames = [],
}) => {
  const { setSelectedJobForModal, departmentsMap, employees, assignRole } = useAppStore();
  const [isAssignMenuOpen, setIsAssignMenuOpen] = useState(false);

  const dragPayload: DraggedJobPayload = {
    job,
    sourceType,
    sourceEmployeeId,
    sourceSlot,
  };

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `job-drag-${job.id}-${sourceType}-${sourceEmployeeId || 'pool'}-${sourceSlot || 'any'}`,
    data: dragPayload,
  });

  const dept = departmentsMap.get(job.departmentId);

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedJobForModal(job);
  };

  const handleQuickAssign = (e: React.MouseEvent, employeeId: string, slot: 'main' | 'secondary') => {
    e.stopPropagation();
    assignRole(employeeId, job.id, slot);
    setIsAssignMenuOpen(false);
  };

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing bg-white dark:bg-obsidian-card hover:border-slate-300 dark:hover:border-obsidian-subtle hover:shadow-xs ${
          isDragging
            ? 'opacity-25 border-dashed border-zinc-400 scale-95'
            : sourceSlot === 'main'
            ? 'border-brand-100/80 dark:border-zinc-700 bg-brand-50/20 dark:bg-zinc-800/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]'
            : 'border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/60'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <GripVertical className="w-3 h-3 text-slate-300 dark:text-zinc-600 group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-800 dark:text-zinc-100 truncate">{job.title}</span>
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                {job.code}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
            {sourceSlot === 'main' ? `${job.defaultMainWorkloadPercent}%` : `${job.defaultSecondaryWorkloadPercent}%`}
          </span>
          <button
            onClick={handleInfoClick}
            className="p-1 text-slate-300 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-obsidian-hover rounded-md transition-colors cursor-pointer"
            title="Detail jabatan"
          >
            <Info className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`group relative p-4 rounded-2xl border bg-white dark:bg-obsidian-elevated transition-all cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 dark:hover:border-obsidian-subtle ${
        isDragging
          ? 'opacity-20 border-dashed border-orange-500 scale-95'
          : 'border-slate-200/80 dark:border-obsidian-border shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-zinc-500">
            {job.code}
          </span>
          {dept && (
            <span
              className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300 border border-transparent dark:border-zinc-700"
            >
              {dept.name}
            </span>
          )}
          {job.isCritical && (
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-white shrink-0" title="Critical role" />
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleInfoClick}
            className="p-1 text-slate-300 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-obsidian-hover rounded-md transition-colors cursor-pointer"
            title="Inspect Job Description"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
          <GripVertical className="w-3.5 h-3.5 text-slate-300 dark:text-zinc-600 group-hover:text-slate-500 dark:group-hover:text-zinc-400 transition-colors" />
        </div>
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-slate-950 dark:group-hover:text-white transition-colors line-clamp-1 mb-1.5">
        {job.title}
      </h4>

      {/* Summary */}
      <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
        {job.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-obsidian-border text-xs relative">
        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium">
          {job.defaultMainWorkloadPercent}% FTE
        </span>

        <div className="flex items-center gap-1.5">
          {isAssigned ? (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 dark:border dark:border-zinc-700 px-2 py-0.5 rounded-full"
              title={assignedEmployeeNames.length > 0 ? `Assigned to: ${assignedEmployeeNames.join(', ')}` : 'Assigned'}
            >
              <Users className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
              {assignedCount > 1 ? `${assignedCount} Owners` : 'Assigned'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-200 dark:bg-zinc-700 px-2 py-0.5 rounded-full font-semibold">
              <Sparkles className="w-3 h-3 text-zinc-600 dark:text-zinc-300" />
              Vacant
            </span>
          )}

          {/* Quick Assign Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsAssignMenuOpen(!isAssignMenuOpen);
              }}
              className="p-1 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
              title="Tugaskan ke Karyawan (Tanpa Drag)"
            >
              <UserPlus className="w-3.5 h-3.5" />
            </button>

            {isAssignMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAssignMenuOpen(false);
                  }}
                />
                <div
                  className="absolute right-0 bottom-full mb-1 z-40 bg-white dark:bg-obsidian-card rounded-xl shadow-xl border border-slate-200 dark:border-obsidian-border py-1.5 w-64 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-100 dark:border-obsidian-border mb-1 flex items-center justify-between">
                    <span>Tugaskan ke Karyawan</span>
                    <span className="text-slate-400 dark:text-zinc-500 font-normal">Primary / Sec</span>
                  </div>
                  {employees.map((emp) => {
                    const isMain = emp.mainJobId === job.id;
                    const isSec = emp.secondaryJobIds?.includes(job.id);
                    return (
                      <div
                        key={emp.id}
                        className="px-3 py-1.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-obsidian-hover transition-colors"
                      >
                        <span className="font-medium text-slate-800 dark:text-zinc-200 truncate pr-2">
                          {emp.fullName}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => handleQuickAssign(e, emp.id, 'main')}
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded cursor-pointer ${
                              isMain
                                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold'
                                : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                            }`}
                            title="Tugaskan sebagai Primary Role"
                          >
                            Main
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleQuickAssign(e, emp.id, 'secondary')}
                            className={`px-1.5 py-0.5 text-[10px] font-semibold rounded cursor-pointer ${
                              isSec
                                ? 'bg-slate-700 text-white dark:bg-zinc-300 dark:text-zinc-950 font-bold'
                                : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300'
                            }`}
                            title="Tugaskan sebagai Secondary Duty"
                          >
                            Sec
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
