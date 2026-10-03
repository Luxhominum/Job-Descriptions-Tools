import React, { useState } from 'react';
import { X, Plus, Briefcase, Layers, ChevronDown, Check, SlidersHorizontal } from 'lucide-react';
import type { Employee } from '../../types/employee';
import { useAppStore } from '../../context/AppContext';
import { calculateEmployeeCapacity } from '../../utils/capacityCalculator';
import { WorkloadGauge } from './WorkloadGauge';
import { DroppableSlot } from '../dnd/DroppableSlot';
import { DraggableJobCard } from '../dnd/DraggableJobCard';
import { EmployeeAvatar } from '../common/EmployeeAvatar';

interface EmployeeCardProps {
  employee: Employee;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee }) => {
  const {
    jobsMap,
    departments,
    departmentsMap,
    unassignRole,
    updateEmployee,
    setSelectedEmployeeForModal,
  } = useAppStore();

  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);

  const dept = departmentsMap.get(employee.departmentId);
  const capacity = calculateEmployeeCapacity(employee, jobsMap);

  const mainJob = employee.mainJobId ? jobsMap.get(employee.mainJobId) : null;
  const secondaryJobs = (employee.secondaryJobIds || [])
    .map((id) => jobsMap.get(id))
    .filter(Boolean);

  const handleDepartmentChange = (newDeptId: string) => {
    updateEmployee({
      ...employee,
      departmentId: newDeptId,
    });
    setIsDeptDropdownOpen(false);
  };

  const handleAvatarUpload = (base64Url: string) => {
    updateEmployee({
      ...employee,
      avatarUrl: base64Url,
    });
  };

  return (
    <div
      className={`group/card flex flex-col justify-between rounded-3xl border transition-all duration-300 p-6 ${
        capacity.isOverloaded
          ? 'bg-white dark:bg-[#181a20] border-zinc-300 dark:border-white/20 shadow-xl ring-1 ring-zinc-400/40 dark:ring-white/20'
          : 'bg-white dark:bg-[#16181d] border-slate-200/80 dark:border-white/[0.08] shadow-md hover:border-slate-300 dark:hover:border-white/[0.16] hover:shadow-2xl'
      }`}
    >
      <div>
        {/* Top Tactile Bento Stage (Reference aesthetic from uploaded comp) */}
        <div className="bg-slate-50/80 dark:bg-[#111317]/90 rounded-2xl border border-slate-200/60 dark:border-white/[0.05] p-5 flex flex-col items-center justify-center relative shadow-inner mb-4 transition-colors">
          {/* Centered Elevated Avatar with Upload Capability & Grey Silhouette */}
          <div className="relative">
            <EmployeeAvatar
              avatarUrl={employee.avatarUrl}
              fullName={employee.fullName}
              size="xl"
              shape="squircle"
              canUpload={true}
              onUpload={handleAvatarUpload}
              showUploadBadge={true}
              title="Klik untuk upload foto profil"
            />
          </div>

          {/* Department Selector Pill */}
          <div className="mt-3.5 relative flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-full bg-white dark:bg-zinc-800/90 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors cursor-pointer shadow-2xs"
              title="Ubah divisi"
            >
              <span>{dept ? dept.name : 'Pilih Divisi'}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isDeptDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsDeptDropdownOpen(false)}
                />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-40 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-750 py-2 min-w-[210px] animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider border-b border-slate-100 dark:border-zinc-800 mb-1">
                    Pilih Divisi
                  </div>
                  {departments.map((d) => {
                    const isSelected = d.id === employee.departmentId;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDepartmentChange(d.id)}
                        className={`w-full px-3.5 py-2 text-left text-xs font-medium flex items-center justify-between hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                          isSelected
                            ? 'text-slate-950 dark:text-white font-bold bg-slate-100/70 dark:bg-zinc-800'
                            : 'text-slate-600 dark:text-zinc-300'
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-slate-400 dark:bg-zinc-500" />
                          <span className="truncate">{d.name}</span>
                        </span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-slate-900 dark:text-zinc-100 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Workload Meter embedded at the bottom of the top stage */}
          <div className="w-full mt-3.5 pt-3 border-t border-slate-200/60 dark:border-white/[0.05]">
            <WorkloadGauge
              currentPercent={capacity.totalWorkloadPercent}
              maxPercent={employee.maxCapacityPercent || 100}
            />
          </div>
        </div>

        {/* Middle Typography Section (Bold Name + Subtitle) */}
        <div className="text-center mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug truncate">
            {employee.fullName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 truncate mt-0.5 font-medium">
            {mainJob ? mainJob.title : 'Belum Ada Jabatan Utama'} • <span className="font-mono text-[11px]">{employee.employeeCode}</span>
          </p>
        </div>

        {/* Role Slots - Tactical Bento Recessed Blocks */}
        <div className="flex flex-col gap-3">
          {/* MAIN ROLE SLOT */}
          <div className="bg-slate-50/60 dark:bg-[#121418]/60 rounded-xl border border-slate-200/60 dark:border-white/[0.04] p-3">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-bold">
                <Briefcase className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
                Primary Role
              </span>
              {mainJob && (
                <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 font-bold bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                  {employee.customWorkloadOverrides?.[mainJob.id] ?? mainJob.defaultMainWorkloadPercent}% FTE
                </span>
              )}
            </div>

            <DroppableSlot
              id={`slot-main-${employee.id}`}
              targetType="EMPLOYEE_MAIN_SLOT"
              targetEmployeeId={employee.id}
              className="min-h-[42px] rounded-xl transition-all"
              isEmpty={!mainJob}
              emptyPlaceholder={
                <div className="h-10 flex items-center justify-center rounded-xl border border-dashed border-slate-200 dark:border-zinc-700/80 bg-white/60 dark:bg-zinc-900/40 text-slate-400 dark:text-zinc-500 hover:border-slate-400 dark:hover:border-zinc-500 hover:text-slate-800 dark:hover:text-zinc-200 text-xs font-medium transition-all cursor-pointer">
                  <span>+ Drag Primary Role Here</span>
                </div>
              }
            >
              {mainJob && (
                <div className="relative group/main">
                  <DraggableJobCard
                    job={mainJob}
                    sourceType="EMPLOYEE_MAIN"
                    sourceEmployeeId={employee.id}
                    sourceSlot="main"
                    compact
                  />
                  <button
                    onClick={() => unassignRole(employee.id, mainJob.id)}
                    className="absolute -top-1 -right-1 p-0.5 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white rounded-full shadow-xs opacity-0 group-hover/main:opacity-100 transition-all cursor-pointer"
                    title="Lepas peran utama"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </DroppableSlot>
          </div>

          {/* SECONDARY ROLES SLOT */}
          <div className="bg-slate-50/60 dark:bg-[#121418]/60 rounded-xl border border-slate-200/60 dark:border-white/[0.04] p-3 flex flex-col">
            <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-bold">
                <Layers className="w-3 h-3 text-slate-500 dark:text-zinc-400" />
                Secondary Duties
              </span>
              {secondaryJobs.length > 0 && (
                <span className="font-mono text-[10px] text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
                  {secondaryJobs.length} active
                </span>
              )}
            </div>

            <DroppableSlot
              id={`slot-secondary-${employee.id}`}
              targetType="EMPLOYEE_SECONDARY_SLOT"
              targetEmployeeId={employee.id}
              className="flex flex-col gap-1.5 min-h-[42px] rounded-xl transition-all flex-1"
            >
              {secondaryJobs.map((secJob) => (
                <div key={secJob!.id} className="relative group/sec">
                  <DraggableJobCard
                    job={secJob!}
                    sourceType="EMPLOYEE_SECONDARY"
                    sourceEmployeeId={employee.id}
                    sourceSlot="secondary"
                    compact
                  />
                  <button
                    onClick={() => unassignRole(employee.id, secJob!.id)}
                    className="absolute -top-1 -right-1 p-0.5 bg-white dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white rounded-full shadow-xs opacity-0 group-hover/sec:opacity-100 transition-all cursor-pointer"
                    title="Lepas tugas sekunder"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              <div className="h-9 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-200/80 dark:border-zinc-700/80 bg-white/40 dark:bg-zinc-900/30 text-slate-400 dark:text-zinc-500 hover:border-slate-400 dark:hover:border-zinc-500 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-white dark:hover:bg-zinc-800/40 text-xs font-medium transition-colors cursor-pointer mt-auto">
                <Plus className="w-3.5 h-3.5" />
                <span>+ Drag Secondary Duty Here</span>
              </div>
            </DroppableSlot>
          </div>
        </div>
      </div>

      {/* Bottom Tactical Pill Action Button (Matches comp in media_1790327199072.png) */}
      <button
        type="button"
        onClick={() => setSelectedEmployeeForModal(employee)}
        className="w-full mt-5 py-2.5 px-4 rounded-full bg-slate-100 hover:bg-slate-200/80 dark:bg-[#20232a] dark:hover:bg-[#282d36] text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-white/[0.06] text-xs font-semibold tracking-wide transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 opacity-70" />
        <span>Edit Profil & Detail</span>
      </button>
    </div>
  );
};
