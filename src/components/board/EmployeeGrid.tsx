import React, { useState, useMemo } from 'react';
import { Plus, Users } from 'lucide-react';
import { useAppStore } from '../../context/AppContext';
import { EmployeeCard } from './EmployeeCard';
import { SearchInput } from '../common/SearchInput';
import { calculateEmployeeCapacity } from '../../utils/capacityCalculator';

export const EmployeeGrid: React.FC = () => {
  const {
    employees,
    departments,
    jobsMap,
    setIsNewEmployeeModalOpen,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [capacityFilter, setCapacityFilter] = useState<'all' | 'overloaded' | 'optimal' | 'under'>('all');

  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mainJob = emp.mainJobId ? jobsMap.get(emp.mainJobId)?.title.toLowerCase() : '';
        const matchName = emp.fullName.toLowerCase().includes(q);
        const matchCode = emp.employeeCode.toLowerCase().includes(q);
        const matchTitle = (emp.jobTitleDisplay || '').toLowerCase().includes(q);
        const matchMain = mainJob?.includes(q);
        if (!matchName && !matchCode && !matchTitle && !matchMain) return false;
      }

      // Department
      if (selectedDeptId !== 'all' && emp.departmentId !== selectedDeptId) {
        return false;
      }

      // Capacity Filter
      if (capacityFilter !== 'all') {
        const cap = calculateEmployeeCapacity(emp, jobsMap);
        if (capacityFilter === 'overloaded' && !cap.isOverloaded) return false;
        if (capacityFilter === 'optimal' && (cap.isOverloaded || cap.isUnderutilized)) return false;
        if (capacityFilter === 'under' && !cap.isUnderutilized) return false;
      }

      return true;
    });
  }, [employees, searchQuery, selectedDeptId, capacityFilter, jobsMap]);

  return (
    <div className="flex flex-col gap-6 flex-1 min-w-0">
      {/* Sleek Minimalist Controls Bar - Sticky with blur */}
      <div className="sticky top-0 z-20 bg-slate-50/95 dark:bg-obsidian-bg/95 backdrop-blur-md py-2.5 -my-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/50 dark:border-obsidian-border">
        <div className="flex items-center gap-3 flex-1 min-w-[240px] max-w-md">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Filter team by name or role..."
            className="w-full"
          />
        </div>

        {/* Minimalist Department Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setSelectedDeptId('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
              selectedDeptId === 'all'
                ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            All ({employees.length})
          </button>
          {departments.map((dept) => {
            const count = employees.filter((e) => e.departmentId === dept.id).length;
            const isSelected = selectedDeptId === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setSelectedDeptId(dept.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 flex items-center gap-1.5 cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold border-transparent shadow-xs'
                    : 'border-transparent text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
                }`}
              >
                <span>{dept.name}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Add Employee CTA */}
        <button
          onClick={() => setIsNewEmployeeModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-zinc-200 bg-white dark:bg-obsidian-card hover:bg-slate-50 dark:hover:bg-zinc-800 border border-slate-200/80 dark:border-obsidian-border dark:hover:border-zinc-600 dark:hover:text-white rounded-lg shadow-xs transition-colors shrink-0 ml-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Grid of Employees */}
      {employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">Belum Ada Karyawan</h4>
          <p className="text-xs text-slate-500 max-w-md mb-5 leading-relaxed">
            Semua 29 Uraian Jabatan (FAT, Operasional, Sales, Marketing) sudah siap di Role Library sebelah kiri. Tambahkan nama karyawan pertama untuk mulai drag & drop tugas utama dan sekunder.
          </p>
          <button
            onClick={() => setIsNewEmployeeModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Karyawan Pertama</span>
          </button>
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-dashed border-slate-200 text-center">
          <Users className="w-10 h-10 text-slate-300 mb-3" />
          <h4 className="text-sm font-bold text-slate-700 mb-1">Tidak ada karyawan yang cocok</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-4">
            Coba sesuaikan kata kunci pencarian atau filter divisi.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDeptId('all');
              setCapacityFilter('all');
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3 gap-6 xl:gap-8 pb-12">
          {filteredEmployees.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} />
          ))}
        </div>
      )}
    </div>
  );
};
