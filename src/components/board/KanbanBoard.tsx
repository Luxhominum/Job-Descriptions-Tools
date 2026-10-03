import React, { useState } from 'react';
import { useAppStore } from '../../context/AppContext';
import { EmployeeCard } from './EmployeeCard';
import { SearchInput } from '../common/SearchInput';
import { Plus } from 'lucide-react';

export const KanbanBoard: React.FC = () => {
  const {
    departments,
    employees,
    jobsMap,
    setIsNewEmployeeModalOpen,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top Filter & Toolbar */}
      <div className="flex items-center justify-between gap-4 px-6 py-3.5 bg-white/80 backdrop-blur-xs border-b border-slate-200/70 shrink-0">
        <div className="flex items-center gap-3 w-full max-w-sm">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Cari karyawan atau jabatan..."
            className="w-full"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewEmployeeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>

      {/* Horizontal Kanban Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-slate-50/70">
        <div className="flex gap-6 h-full min-w-max items-start">
          {departments.map((dept) => {
            const deptEmployees = employees.filter((emp) => {
              if (emp.departmentId !== dept.id) return false;
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const mainJob = emp.mainJobId ? jobsMap.get(emp.mainJobId)?.title.toLowerCase() : '';
                const matchName = emp.fullName.toLowerCase().includes(q);
                const matchCode = emp.employeeCode.toLowerCase().includes(q);
                const matchMain = mainJob?.includes(q);
                if (!matchName && !matchCode && !matchMain) return false;
              }
              return true;
            });

            return (
              <div
                key={dept.id}
                className="w-88 xl:w-96 flex flex-col h-full bg-slate-100/70 rounded-2xl border border-slate-200/80 shrink-0 overflow-hidden shadow-xs"
              >
                {/* Column Header */}
                <div className="p-3.5 px-4 bg-white border-b border-slate-200/80 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 bg-slate-400 dark:bg-zinc-500" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                      {dept.name}
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold font-mono px-2 py-0.5 rounded-full shrink-0 bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 dark:border dark:border-zinc-700">
                    {deptEmployees.length}
                  </span>
                </div>

                {/* Cards Container with smooth independent vertical scrolling */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 scrollbar-thin">
                  {deptEmployees.length === 0 ? (
                    <div className="h-36 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300/80 bg-white/40 text-center p-4 my-auto">
                      <p className="text-xs text-slate-400 font-medium mb-2">
                        Belum ada karyawan di divisi ini
                      </p>
                      <button
                        onClick={() => setIsNewEmployeeModalOpen(true)}
                        className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
                      >
                        + Tambah Karyawan
                      </button>
                    </div>
                  ) : (
                    deptEmployees.map((emp) => (
                      <EmployeeCard key={emp.id} employee={emp} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
