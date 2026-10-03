import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Plus,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { SearchInput } from '../common/SearchInput';
import { DraggableJobCard } from '../dnd/DraggableJobCard';
import { DroppableSlot } from '../dnd/DroppableSlot';
import type { RoleSeniority } from '../../types/job';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const {
    jobs,
    departments,
    employees,
    setIsNewJobModalOpen,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'vacant' | 'assigned' | 'critical'>('all');
  const [levelFilter, setLevelFilter] = useState<RoleSeniority | 'all'>('all');

  // Compute assignment status for each job
  const jobAssignmentInfo = useMemo(() => {
    const map = new Map<string, { assignedCount: number; employeeNames: string[] }>();

    jobs.forEach((job) => {
      map.set(job.id, { assignedCount: 0, employeeNames: [] });
    });

    employees.forEach((emp) => {
      if (emp.mainJobId && map.has(emp.mainJobId)) {
        const info = map.get(emp.mainJobId)!;
        info.assignedCount += 1;
        info.employeeNames.push(emp.fullName);
      }
      if (emp.secondaryJobIds) {
        emp.secondaryJobIds.forEach((secId) => {
          if (map.has(secId)) {
            const info = map.get(secId)!;
            info.assignedCount += 1;
            if (!info.employeeNames.includes(emp.fullName)) {
              info.employeeNames.push(emp.fullName);
            }
          }
        });
      }
    });

    return map;
  }, [jobs, employees]);

  // Filtered Jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchCode = job.code.toLowerCase().includes(q);
        const matchSummary = job.summary.toLowerCase().includes(q);
        const matchSkills = job.requiredSkills?.some((s) => s.toLowerCase().includes(q));
        if (!matchTitle && !matchCode && !matchSummary && !matchSkills) return false;
      }

      if (selectedDept !== 'all' && job.departmentId !== selectedDept) {
        return false;
      }

      if (levelFilter !== 'all' && job.level !== levelFilter) {
        return false;
      }

      const assignInfo = jobAssignmentInfo.get(job.id);
      const isAssigned = (assignInfo?.assignedCount || 0) > 0;

      if (statusFilter === 'vacant' && isAssigned) return false;
      if (statusFilter === 'assigned' && !isAssigned) return false;
      if (statusFilter === 'critical' && (!job.isCritical || isAssigned)) return false;

      return true;
    });
  }, [jobs, search, selectedDept, statusFilter, levelFilter, jobAssignmentInfo]);

  const vacantCount = jobs.filter((j) => (jobAssignmentInfo.get(j.id)?.assignedCount || 0) === 0).length;

  if (isCollapsed) {
    return (
      <aside className="w-16 bg-white dark:bg-obsidian-card border-r border-slate-200/70 dark:border-obsidian-border flex flex-col items-center py-5 gap-4 shrink-0 transition-colors duration-200">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-obsidian-hover rounded-xl transition-colors cursor-pointer"
          title="Expand Job Pool"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-obsidian-elevated text-slate-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs" title={`${jobs.length} Roles`}>
            {jobs.length}
          </div>
          {vacantCount > 0 && (
            <div className="w-6 h-6 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold text-[10px]" title={`${vacantCount} Vacant Roles`}>
              {vacantCount}
            </div>
          )}
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 2xl:w-96 bg-white dark:bg-obsidian-card border-r border-slate-200/70 dark:border-obsidian-border flex flex-col h-full min-h-0 shrink-0 transition-colors duration-200">
      {/* Sidebar Header */}
      <div className="p-5 border-b border-slate-100 dark:border-obsidian-border flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight">Role Library</h2>
            <p className="text-xs text-slate-400 dark:text-zinc-500">
              {jobs.length} Roles • {vacantCount} Vacant
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsNewJobModalOpen(true)}
              className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-obsidian-hover rounded-lg transition-colors cursor-pointer"
              title="Add New Job Description"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-obsidian-hover rounded-lg transition-colors cursor-pointer"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search */}
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search roles or skills..."
        />

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter('vacant')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 flex items-center gap-1 cursor-pointer ${
              statusFilter === 'vacant'
                ? 'bg-slate-900 text-white dark:bg-zinc-300 dark:text-zinc-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Vacant ({vacantCount})
          </button>
          <button
            onClick={() => setStatusFilter('assigned')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
              statusFilter === 'assigned'
                ? 'bg-slate-900 text-white dark:bg-zinc-300 dark:text-zinc-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Assigned
          </button>
        </div>
      </div>

      {/* Unassign Zone */}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-obsidian-border bg-slate-50/50 dark:bg-obsidian-elevated/40">
        <DroppableSlot
          id="sidebar-unassign-zone"
          targetType="SIDEBAR_UNASSIGN_ZONE"
          className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-obsidian-border hover:border-slate-400 dark:hover:border-zinc-600 bg-white dark:bg-obsidian-elevated/80 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 text-center transition-all cursor-pointer group"
          activeClassName="ring-2 ring-zinc-400 bg-zinc-100 dark:bg-zinc-800/80 border-zinc-400"
        >
          <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-zinc-500 group-hover:text-slate-900 dark:group-hover:text-zinc-100 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">Drop role here to unassign</span>
          </div>
        </DroppableSlot>
      </div>

      {/* Draggable Cards List */}
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3.5">
        {filteredJobs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No job descriptions match.</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const assignInfo = jobAssignmentInfo.get(job.id);
            const isAssigned = (assignInfo?.assignedCount || 0) > 0;
            return (
              <DraggableJobCard
                key={job.id}
                job={job}
                sourceType="SIDEBAR_POOL"
                isAssigned={isAssigned}
                assignedCount={assignInfo?.assignedCount || 0}
                assignedEmployeeNames={assignInfo?.employeeNames || []}
              />
            );
          })
        )}
      </div>
    </aside>
  );
};
