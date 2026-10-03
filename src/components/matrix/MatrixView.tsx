import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../context/AppContext';
import { SearchInput } from '../common/SearchInput';
import { Briefcase, Plus } from 'lucide-react';
import { calculateEmployeeCapacity } from '../../utils/capacityCalculator';
import { EmployeeAvatar } from '../common/EmployeeAvatar';

export const MatrixView: React.FC = () => {
  const {
    employees,
    jobs,
    departments,
    departmentsMap,
    jobsMap,
    assignRole,
    unassignRole,
    updateEmployee,
    setSelectedJobForModal,
    setSelectedEmployeeForModal,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = emp.fullName.toLowerCase().includes(q);
        const matchTitle = (emp.jobTitleDisplay || '').toLowerCase().includes(q);
        if (!matchName && !matchTitle) return false;
      }
      if (selectedDeptId !== 'all' && emp.departmentId !== selectedDeptId) {
        return false;
      }
      return true;
    });
  }, [employees, search, selectedDeptId]);

  const filteredJobs = useMemo(() => {
    if (selectedDeptId === 'all') return jobs;
    return jobs.filter((j) => j.departmentId === selectedDeptId);
  }, [jobs, selectedDeptId]);

  return (
    <div className="flex flex-col gap-6 p-8 bg-slate-50 dark:bg-obsidian-bg flex-1 overflow-auto transition-colors duration-200">
      {/* Matrix Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight">
            Role Matrix & Responsibility Heatmap
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
            Cross-functional overview mapping every employee against active organizational roles.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search employee in matrix..."
            className="w-64"
          />

          <select
            value={selectedDeptId}
            onChange={(e) => setSelectedDeptId(e.target.value)}
            className="text-xs bg-white dark:bg-obsidian-card border border-slate-200 dark:border-obsidian-border rounded-lg px-3 py-1.5 text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500/50 font-medium shadow-xs cursor-pointer"
          >
            <option value="all">All Departments ({departments.length})</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id} className="dark:bg-obsidian-card">
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="bg-white dark:bg-obsidian-card rounded-2xl border border-slate-200/80 dark:border-obsidian-border shadow-xs overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50/60 dark:bg-obsidian-elevated/80 border-b border-slate-200/80 dark:border-obsidian-border text-xs font-semibold text-slate-500 dark:text-zinc-400">
              <th className="p-4 sticky left-0 bg-slate-50/90 dark:bg-obsidian-card backdrop-blur-xs z-10 w-64 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.03)] border-r border-slate-200/80 dark:border-obsidian-border">
                Team Member
              </th>
              <th className="p-4 text-center w-28 border-r border-slate-100 dark:border-obsidian-border">FTE Workload</th>
              {filteredJobs.map((job) => {
                const dept = departmentsMap.get(job.departmentId);
                return (
                  <th
                    key={job.id}
                    className="p-4 text-center cursor-pointer hover:bg-slate-100/60 dark:hover:bg-obsidian-hover transition-colors border-l border-slate-100 dark:border-obsidian-border max-w-[160px]"
                    onClick={() => setSelectedJobForModal(job)}
                    title={job.summary}
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 mb-0.5">
                        {job.code}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-zinc-100 truncate max-w-[140px]">
                        {job.title}
                      </span>
                      {dept && (
                        <span
                          className="text-[9px] font-medium px-1.5 rounded-full mt-1 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 border border-transparent dark:border-zinc-700"
                        >
                          {dept.name.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-obsidian-border text-xs">
            {filteredEmployees.map((emp) => {
              const cap = calculateEmployeeCapacity(emp, jobsMap);
              const dept = departmentsMap.get(emp.departmentId);

              return (
                <tr key={emp.id} className="hover:bg-slate-50/60 dark:hover:bg-obsidian-hover/50 transition-colors group">
                  <td className="p-4 sticky left-0 bg-white dark:bg-obsidian-card group-hover:bg-slate-50/60 dark:group-hover:bg-obsidian-hover/50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.03)] border-r border-slate-100 dark:border-obsidian-border">
                    <div className="flex items-center gap-3">
                      <EmployeeAvatar
                        avatarUrl={emp.avatarUrl}
                        fullName={emp.fullName}
                        size="sm"
                        shape="rounded"
                        canUpload={true}
                        onUpload={(base64) => updateEmployee({ ...emp, avatarUrl: base64 })}
                        title="Klik untuk upload / ganti foto"
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <button
                          onClick={() => setSelectedEmployeeForModal(emp)}
                          className="font-bold text-slate-900 dark:text-zinc-100 hover:text-brand-600 dark:hover:text-orange-400 transition-colors text-left truncate block cursor-pointer"
                        >
                          {emp.fullName}
                        </button>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 truncate block">
                          {dept?.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-4 text-center border-r border-slate-100 dark:border-obsidian-border">
                    <span
                      className={`inline-block font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                        cap.isOverloaded
                          ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-black'
                          : cap.isUnderutilized
                          ? 'bg-slate-100 text-slate-600 border border-slate-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
                          : 'bg-slate-200 text-slate-800 border border-slate-300 dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700'
                      }`}
                    >
                      {cap.totalWorkloadPercent}%
                    </span>
                  </td>

                  {filteredJobs.map((job) => {
                    const isMain = emp.mainJobId === job.id;
                    const isSecondary = (emp.secondaryJobIds || []).includes(job.id);

                    if (isMain) {
                      return (
                        <td
                          key={job.id}
                          className="p-3 text-center border-l border-slate-100 dark:border-obsidian-border bg-slate-100/50 dark:bg-zinc-800/40"
                        >
                          <button
                            onClick={() => unassignRole(emp.id, job.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 border border-transparent dark:border-zinc-300 rounded-lg text-[11px] font-bold shadow-xs hover:bg-slate-800 dark:hover:bg-zinc-200 dark:hover:text-zinc-950 transition-colors cursor-pointer"
                            title="Primary Role (Click to unassign)"
                          >
                            <Briefcase className="w-3 h-3" />
                            Main ({emp.customWorkloadOverrides?.[job.id] ?? job.defaultMainWorkloadPercent}%)
                          </button>
                        </td>
                      );
                    }

                    if (isSecondary) {
                      return (
                        <td
                          key={job.id}
                          className="p-3 text-center border-l border-slate-100 dark:border-obsidian-border bg-slate-50 dark:bg-zinc-900/40"
                        >
                          <button
                            onClick={() => unassignRole(emp.id, job.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 rounded-lg text-[11px] font-medium hover:bg-slate-200 dark:hover:bg-zinc-700 dark:hover:text-white transition-colors cursor-pointer"
                            title="Secondary Role (Click to unassign)"
                          >
                            Sec ({emp.customWorkloadOverrides?.[job.id] ?? job.defaultSecondaryWorkloadPercent}%)
                          </button>
                        </td>
                      );
                    }

                    return (
                      <td
                        key={job.id}
                        className="p-3 text-center border-l border-slate-100 dark:border-obsidian-border text-slate-300 dark:text-zinc-700 hover:bg-slate-100/40 dark:hover:bg-obsidian-hover/40 transition-colors"
                      >
                        <button
                          onClick={() => assignRole(emp.id, job.id, 'secondary')}
                          className="opacity-0 group-hover:opacity-40 hover:opacity-100 p-1 text-slate-400 dark:text-zinc-500 hover:text-slate-900 dark:hover:text-white rounded transition-all cursor-pointer"
                          title={`Assign ${job.title} as secondary`}
                        >
                          <Plus className="w-3.5 h-3.5 mx-auto" />
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
