import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useAppStore } from '../../context/AppContext';

export const TopAlertBanner: React.FC = () => {
  const { stats, setSelectedJobForModal, setSelectedEmployeeForModal } = useAppStore();
  const [isDismissed, setIsDismissed] = useState(false);

  const hasCriticalVacancies = stats.criticalVacantJobs.length > 0;
  const hasOverloadedEmployees = stats.overloadedEmployees.length > 0;

  if (isDismissed || (!hasCriticalVacancies && !hasOverloadedEmployees)) {
    return null;
  }

  return (
    <div className="bg-slate-900 dark:bg-obsidian-card border-b border-transparent dark:border-obsidian-border text-slate-200 dark:text-zinc-300 px-6 py-2 transition-all text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          {hasCriticalVacancies && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-300 shrink-0" />
              <span>
                <strong>{stats.criticalVacantJobs.length} Vacant Critical Roles:</strong>{' '}
                {stats.criticalVacantJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJobForModal(job)}
                    className="underline text-zinc-300 hover:text-white ml-1.5 cursor-pointer font-medium"
                  >
                    {job.title}
                  </button>
                ))}
              </span>
            </div>
          )}

          {hasOverloadedEmployees && (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-100 dark:bg-white shrink-0" />
              <span>
                <strong>{stats.overloadedEmployees.length} Overloaded Members:</strong>{' '}
                {stats.overloadedEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployeeForModal(emp)}
                    className="underline text-zinc-300 hover:text-white ml-1.5 cursor-pointer font-medium"
                  >
                    {emp.fullName}
                  </button>
                ))}
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1 text-slate-400 hover:text-white rounded transition-colors ml-auto cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
