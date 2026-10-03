import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../context/AppContext';
import { SearchInput } from '../common/SearchInput';
import { calculateEmployeeCapacity } from '../../utils/capacityCalculator';
import {
  Briefcase,
  Users,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Check,
  Mail,
  MapPin,
  Clock,
  Calendar,
  Phone,
  User,
  Sparkles,
  ChevronRight,
  ExternalLink,
  Edit3,
  GraduationCap,
  Award,
  FileText,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import type { Employee } from '../../types/employee';
import type { JobDescription } from '../../types/job';
import { EmployeeAvatar } from '../common/EmployeeAvatar';

export const DashboardBentoView: React.FC = () => {
  const {
    jobsMap,
    departments,
    departmentsMap,
    employees,
    updateEmployee,
    setSelectedJobForModal,
    setSelectedEmployeeForModal,
    unassignRole,
  } = useAppStore();

  const [search, setSearch] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [capacityFilter, setCapacityFilter] = useState<'all' | 'assigned' | 'unassigned' | 'overloaded'>('all');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [imageErrorMap, setImageErrorMap] = useState<Record<string, boolean>>({});

  // Overall organization metrics
  const totalEmployees = employees.length;
  const assignedEmployeesCount = employees.filter(
    (e) => Boolean(e.mainJobId) || (e.secondaryJobIds && e.secondaryJobIds.length > 0)
  ).length;
  
  const overloadedCount = employees.filter((e) => {
    const cap = calculateEmployeeCapacity(e, jobsMap);
    return cap.isOverloaded;
  }).length;

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const cap = calculateEmployeeCapacity(emp, jobsMap);
      const mainJob = emp.mainJobId ? jobsMap.get(emp.mainJobId) : null;
      const secondaryJobs = (emp.secondaryJobIds || []).map((id) => jobsMap.get(id)).filter(Boolean);
      const isAssigned = Boolean(emp.mainJobId) || (emp.secondaryJobIds && emp.secondaryJobIds.length > 0);

      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = emp.fullName.toLowerCase().includes(q);
        const matchCode = emp.employeeCode.toLowerCase().includes(q);
        const matchMain = mainJob?.title.toLowerCase().includes(q);
        const matchSec = secondaryJobs.some((j) => j?.title.toLowerCase().includes(q));

        if (!matchName && !matchCode && !matchMain && !matchSec) {
          return false;
        }
      }

      // Department filter
      if (selectedDeptId !== 'all' && emp.departmentId !== selectedDeptId) {
        return false;
      }

      // Capacity filter
      if (capacityFilter === 'assigned' && !isAssigned) return false;
      if (capacityFilter === 'unassigned' && isAssigned) return false;
      if (capacityFilter === 'overloaded' && !cap.isOverloaded) return false;

      return true;
    });
  }, [employees, search, selectedDeptId, capacityFilter, jobsMap]);

  // Active Selected Employee
  const activeEmployee: Employee | null = useMemo(() => {
    if (selectedEmployeeId) {
      const found = employees.find((e) => e.id === selectedEmployeeId);
      if (found) return found;
    }
    return filteredEmployees[0] || employees[0] || null;
  }, [selectedEmployeeId, employees, filteredEmployees]);

  // Selected Employee Calculations
  const activeDept = activeEmployee ? departmentsMap.get(activeEmployee.departmentId) : null;
  const activeCapacity = activeEmployee ? calculateEmployeeCapacity(activeEmployee, jobsMap) : null;
  const activeMainJob: JobDescription | null = activeEmployee?.mainJobId
    ? jobsMap.get(activeEmployee.mainJobId) || null
    : null;
  const activeSecondaryJobs: JobDescription[] = (activeEmployee?.secondaryJobIds || [])
    .map((id) => jobsMap.get(id))
    .filter((j): j is JobDescription => Boolean(j));

  // Department color helper (pure monochrome in dark mode)
  const getDeptTagClasses = (deptName?: string) => {
    return 'bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300 dark:border dark:border-zinc-700';
  };

  const handleImageError = (empId: string) => {
    setImageErrorMap((prev) => ({ ...prev, [empId]: true }));
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#f8f9fb] dark:bg-obsidian-bg text-slate-900 dark:text-zinc-100 flex flex-col gap-5 transition-colors duration-200">
      <div className="w-full max-w-7xl mx-auto flex flex-col gap-5">

        {/* ======================================================== */}
        {/* COMPACT TOP TOOLBAR: Eliminates AI-Slop Hero Banner      */}
        {/* ======================================================== */}
        <div className="bg-white dark:bg-obsidian-card border border-[#eaecf0] dark:border-obsidian-border rounded-xl p-3 px-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-wrap items-center justify-between gap-3 transition-colors">
          
          {/* Department Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none text-xs font-semibold">
            <span className="text-[11px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mr-1 hidden sm:inline">
              Divisi:
            </span>
            <button
              onClick={() => setSelectedDeptId('all')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                selectedDeptId === 'all'
                  ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              Semua ({employees.length})
            </button>
            {departments.map((d) => {
              const count = employees.filter((e) => e.departmentId === d.id).length;
              const isSelected = selectedDeptId === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDeptId(d.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold border-transparent shadow-xs'
                      : 'border-[#eaecf0] dark:border-obsidian-border bg-white dark:bg-obsidian-elevated text-slate-600 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 bg-slate-400 dark:bg-zinc-500"
                  />
                  <span>{d.name}</span>
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Quick Capacity Filters */}
          <div className="flex items-center bg-slate-100/80 dark:bg-obsidian-elevated p-1 rounded-lg text-xs font-semibold border border-[#eaecf0] dark:border-obsidian-border">
            <button
              onClick={() => setCapacityFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                capacityFilter === 'all'
                  ? 'bg-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-slate-900 shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setCapacityFilter('assigned')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                capacityFilter === 'assigned'
                  ? 'bg-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-slate-900 shadow-2xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
              }`}
            >
              Aktif
            </button>
            {overloadedCount > 0 && (
              <button
                onClick={() => setCapacityFilter('overloaded')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  capacityFilter === 'overloaded'
                    ? 'bg-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-slate-900 shadow-2xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                }`}
              >
                <span>Overload</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 rounded-full font-mono font-bold">
                  {overloadedCount}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* TWO-PANEL WORKSPACE GRID                                 */}
        {/* ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* ======================================================== */}
          {/* LEFT PANEL: User Directory / Profile Switcher (4 cols)   */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 bg-white dark:bg-obsidian-card border border-[#eaecf0] dark:border-obsidian-border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col sticky top-4 max-h-[calc(100vh-7rem)] transition-colors">
            
            {/* Sticky Search Header */}
            <div className="p-3.5 border-b border-[#eaecf0] dark:border-obsidian-border bg-white dark:bg-obsidian-card sticky top-0 z-10 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
                  Daftar Karyawan
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-zinc-500">
                  {filteredEmployees.length} dari {totalEmployees}
                </span>
              </div>
              
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Cari nama karyawan atau kode..."
                className="w-full text-xs"
              />
            </div>

            {/* Employee Directory List Items */}
            <div className="divide-y divide-[#eaecf0] dark:divide-obsidian-border overflow-y-auto flex-1">
              {filteredEmployees.length === 0 ? (
                <div className="p-10 text-center text-slate-400 text-xs">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  <p className="font-semibold text-slate-600 dark:text-zinc-400">Tidak ada karyawan yang cocok</p>
                  <p className="text-[11px] text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian.</p>
                </div>
              ) : (
                filteredEmployees.map((emp) => {
                  const isSelected = activeEmployee?.id === emp.id;
                  const dept = departmentsMap.get(emp.departmentId);
                  const cap = calculateEmployeeCapacity(emp, jobsMap);
                  const mainJob = emp.mainJobId ? jobsMap.get(emp.mainJobId) : null;
                  const secCount = emp.secondaryJobIds?.length || 0;
                  const deptClasses = getDeptTagClasses(dept?.name);
                  const hasImageError = imageErrorMap[emp.id];

                  return (
                    <div
                      key={emp.id}
                      onClick={() => setSelectedEmployeeId(emp.id)}
                      className={`p-3.5 cursor-pointer transition-all duration-200 relative flex items-start gap-3 active:scale-[0.98] ${
                        isSelected
                          ? 'bg-slate-50 dark:bg-obsidian-elevated/95 border-l-4 border-slate-900 dark:border-zinc-100 shadow-sm translate-x-1.5'
                          : 'hover:bg-slate-50/70 dark:hover:bg-obsidian-hover border-l-4 border-transparent hover:translate-x-0.5'
                      }`}
                    >
                      {/* Avatar Thumbnail with Grey Silhouette fallback */}
                      <EmployeeAvatar
                        avatarUrl={emp.avatarUrl}
                        fullName={emp.fullName}
                        size="sm"
                        shape="rounded"
                        showStatusDot={true}
                        statusDotColor="bg-zinc-400 dark:bg-zinc-300"
                        className="shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        {/* Top Badges Row */}
                        <div className="flex items-center justify-between gap-1.5 mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-[#eaecf0] dark:border-zinc-700 px-1.5 py-0.5 rounded">
                              {emp.employeeCode}
                            </span>
                            {dept && (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-transparent ${deptClasses}`}
                              >
                                {dept.name}
                              </span>
                            )}
                          </div>

                          {/* Capacity FTE Badge */}
                          <span
                            className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                              cap.isOverloaded
                                ? 'bg-[#fee4e2] text-[#d92d20] dark:bg-zinc-100 dark:text-zinc-950 font-black'
                                : cap.totalWorkloadPercent >= 60
                                ? 'bg-[#d1fadf] text-[#027a48] dark:bg-zinc-800 dark:text-zinc-200 dark:border dark:border-zinc-700'
                                : 'bg-[#fef0c7] text-[#b54708] dark:bg-zinc-900 dark:text-zinc-400 dark:border dark:border-zinc-800'
                            }`}
                          >
                            {cap.totalWorkloadPercent}% FTE
                          </span>
                        </div>

                        {/* Employee Name */}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 tracking-tight leading-snug truncate">
                          {emp.fullName}
                        </h4>

                        {/* Primary Role preview */}
                        <p className="text-xs font-medium text-slate-500 dark:text-zinc-400 truncate mt-0.5">
                          {mainJob?.title || 'Belum ada jabatan utama'}
                        </p>

                        {/* Secondary roles count indicator */}
                        <div className="flex items-center gap-2.5 text-[11px] text-slate-400 dark:text-zinc-500 mt-1.5">
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {mainJob ? '1 Utama' : '0 Utama'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {secCount} Sekunder
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT PANEL: Executive Profile Card + Full JD (8 cols)   */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            {activeEmployee ? (
              <div key={activeEmployee.id} className="flex flex-col gap-5">
                
                {/* 1. EXECUTIVE USER PROFILE CARD */}
                <div
                  key={`${activeEmployee.id}-card1`}
                  className="animate-card-shift-1 bg-white dark:bg-obsidian-card border border-[#eaecf0] dark:border-obsidian-border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden transition-colors"
                >
                  
                  {/* Subtle Studio Cover Backdrop Banner */}
                  <div className="h-12 bg-slate-50 dark:bg-obsidian-elevated/70 border-b border-[#eaecf0] dark:border-obsidian-border px-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-300" />
                      <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                        CV Pusat Grosir Eceran (PGE) • Personel Aktif
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const base64 = ev.target?.result as string;
                                if (base64) updateEmployee({ ...activeEmployee, avatarUrl: base64 });
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-750 transition-all cursor-pointer shadow-2xs"
                        title="Upload Foto Karyawan"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-400" />
                        <span>Upload Foto</span>
                      </button>

                      <button
                        onClick={() => setSelectedEmployeeForModal(activeEmployee)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-obsidian-elevated border border-[#eaecf0] dark:border-obsidian-border text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 dark:hover:border-zinc-600 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
                        title="Edit Data Personel"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Edit Profil</span>
                      </button>
                    </div>
                  </div>

                  {/* Profile Header & Real Photo Avatar */}
                  <div className="p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                      
                      {/* Avatar with Status Ring & Upload Capability */}
                      <div className="flex items-start gap-4">
                        <EmployeeAvatar
                          avatarUrl={activeEmployee.avatarUrl}
                          fullName={activeEmployee.fullName}
                          size="2xl"
                          shape="squircle"
                          canUpload={true}
                          onUpload={(base64) => updateEmployee({ ...activeEmployee, avatarUrl: base64 })}
                          showUploadBadge={true}
                          title="Klik untuk upload / ganti foto profil"
                          className="shrink-0"
                        />

                        {/* Primary Identity */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                              {activeEmployee.fullName}
                            </h2>
                            <span className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border border-[#eaecf0] dark:border-zinc-700 px-2 py-0.5 rounded-md">
                              {activeEmployee.employeeCode}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-600 dark:text-zinc-400 flex items-center gap-2 flex-wrap">
                            <span>{activeMainJob?.title || 'Belum Ada Jabatan Utama'}</span>
                            {activeDept && (
                              <>
                                <span className="opacity-40">•</span>
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded-full border border-transparent ${getDeptTagClasses(
                                    activeDept.name
                                  )}`}
                                >
                                  {activeDept.name}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Workload Metric Gauge */}
                      <div className="text-right pb-1">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                          Beban Kerja FTE
                        </span>
                        <div className="flex items-baseline justify-end gap-1.5">
                          <span
                            className={`text-2xl font-black font-mono tracking-tight ${
                              activeCapacity?.isOverloaded
                                ? 'text-[#d92d20] dark:text-zinc-100 font-black'
                                : activeCapacity && activeCapacity.totalWorkloadPercent >= 60
                                ? 'text-[#027a48] dark:text-zinc-100'
                                : 'text-[#b54708] dark:text-zinc-400'
                            }`}
                          >
                            {activeCapacity?.totalWorkloadPercent}%
                          </span>
                          <span className="text-xs font-medium text-slate-400 dark:text-zinc-500">
                            / {activeEmployee.maxCapacityPercent || 100}%
                          </span>
                        </div>
                        {activeCapacity?.isOverloaded && (
                          <span className="text-[10px] font-bold text-[#d92d20] dark:text-zinc-300 block">
                            Overload +{(activeCapacity.totalWorkloadPercent) - (activeEmployee.maxCapacityPercent || 100)}%
                          </span>
                        )}
                      </div>

                    </div>

                    {/* Personnel Metadata 6-Tile Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-3.5 bg-slate-50/70 dark:bg-obsidian-elevated/60 border border-[#eaecf0] dark:border-obsidian-border rounded-xl text-xs mb-4">
                      
                      {/* Email */}
                      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-obsidian-card border border-[#eaecf0]/80 dark:border-obsidian-border">
                        <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                            Email Kantor
                          </span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200 truncate block">
                            {activeEmployee.email || 'Email belum diisi'}
                          </span>
                        </div>
                      </div>

                      {/* Work Location */}
                      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-obsidian-card border border-[#eaecf0]/80 dark:border-obsidian-border">
                        <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                            Lokasi Kerja
                          </span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200 truncate block">
                            {activeEmployee.location || 'Workshop & Gudang Pusat'}
                          </span>
                        </div>
                      </div>

                      {/* Shift */}
                      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-obsidian-card border border-[#eaecf0]/80 dark:border-obsidian-border">
                        <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                            Jam Kerja / Shift
                          </span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200 truncate block">
                            {activeEmployee.shift || '08:00 - 17:00 WIB'}
                          </span>
                        </div>
                      </div>

                      {/* Tenure */}
                      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-obsidian-card border border-[#eaecf0]/80 dark:border-obsidian-border">
                        <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                            Masa Kerja
                          </span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200 truncate block">
                            {activeEmployee.tenure || 'Bergabung Jan 2024 (2+ thn)'}
                          </span>
                        </div>
                      </div>

                      {/* Reports To */}
                      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-obsidian-card border border-[#eaecf0]/80 dark:border-obsidian-border">
                        <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                            Atasan Langsung
                          </span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200 truncate block">
                            {activeEmployee.reportsTo || 'Direktur Operasional / Owner'}
                          </span>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-2.5 p-2 rounded-lg bg-white dark:bg-obsidian-card border border-[#eaecf0]/80 dark:border-obsidian-border">
                        <div className="w-7 h-7 rounded-md bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 shrink-0">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                            Kontak Langsung
                          </span>
                          <span className="font-medium text-slate-800 dark:text-zinc-200 truncate block">
                            {activeEmployee.phone || '+62 812-9011-2201'}
                          </span>
                        </div>
                      </div>

                    </div>

                    {/* Segmented Workload Progress Bar */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-zinc-300 mb-1.5">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Alokasi Jam Kerja Efektif</span>
                        </span>
                        <span className="font-mono text-slate-400 dark:text-zinc-500 text-[11px]">
                          {activeMainJob ? `${activeMainJob.defaultMainWorkloadPercent}% Utama` : '0% Utama'}
                          {activeSecondaryJobs.length > 0 && ` + ${activeSecondaryJobs.reduce((acc, j) => acc + j.defaultSecondaryWorkloadPercent, 0)}% Sekunder`}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                        {activeMainJob && (
                          <div
                            className="h-full bg-slate-900 dark:bg-zinc-200 transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(100, activeMainJob.defaultMainWorkloadPercent)}%` }}
                            title={`Tugas Utama: ${activeMainJob.defaultMainWorkloadPercent}%`}
                          />
                        )}
                        {activeSecondaryJobs.map((sec) => (
                          <div
                            key={sec.id}
                            className="h-full bg-slate-600 dark:bg-zinc-500 transition-all duration-500 ease-out border-l border-white/20"
                            style={{ width: `${Math.min(100, sec.defaultSecondaryWorkloadPercent)}%` }}
                            title={`${sec.title}: ${sec.defaultSecondaryWorkloadPercent}%`}
                          />
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* 2. PRIMARY ROLE FULL JD & SPECIFICATIONS CARD */}
                <div
                  key={`${activeEmployee.id}-card2`}
                  className="animate-card-shift-2 bg-white dark:bg-obsidian-card border border-[#eaecf0] dark:border-obsidian-border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden transition-colors"
                >
                  
                  {/* Primary Section Header */}
                  <div className="p-6 border-b border-[#eaecf0] dark:border-obsidian-border">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-300" />
                        <span className="text-xs font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider">
                          Uraian Tugas Utama (Primary Role Specification)
                        </span>
                      </div>
                      {activeMainJob && (
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-200 dark:border dark:border-zinc-700 px-2.5 py-0.5 rounded-full">
                          {activeMainJob.defaultMainWorkloadPercent}% Alokasi Waktu
                        </span>
                      )}
                    </div>

                    {activeMainJob ? (
                      <>
                        <div className="flex items-baseline justify-between gap-4 mb-2 flex-wrap">
                          <h3 className="text-xl font-black text-slate-900 dark:text-zinc-100 tracking-tight">
                            {activeMainJob.title}
                          </h3>
                          <span className="text-xs font-mono font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 border border-[#eaecf0] dark:border-zinc-700 px-2.5 py-1 rounded-md">
                            {activeMainJob.code}
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                          {activeMainJob.summary}
                        </p>

                        {/* Two-Column Specification Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 pt-6 border-t border-[#eaecf0] dark:border-obsidian-border">
                          
                          {/* Col 1: Core Responsibilities Checklist (6 cols) */}
                          <div className="lg:col-span-6 space-y-3.5">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
                              <ShieldCheck className="w-4 h-4 text-slate-700 dark:text-zinc-300" />
                              <span>Tanggung Jawab Utama (Duties)</span>
                            </div>
                            
                            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300">
                              {activeMainJob.keyResponsibilities && activeMainJob.keyResponsibilities.length > 0 ? (
                                activeMainJob.keyResponsibilities.map((resp, i) => (
                                  <li key={i} className="flex items-start gap-2.5 leading-relaxed bg-slate-50/50 dark:bg-obsidian-elevated/40 p-2.5 rounded-lg border border-[#eaecf0]/60 dark:border-obsidian-border/60">
                                    <span className="w-4 h-4 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center shrink-0 mt-0.5">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </span>
                                    <span>{resp}</span>
                                  </li>
                                ))
                              ) : (
                                <li className="text-slate-400 italic">Belum ada rincian tanggung jawab.</li>
                              )}
                            </ul>
                          </div>

                          {/* Col 2: Comprehensive Qualifications & Requirements Specification (6 cols) */}
                          <div className="lg:col-span-6 space-y-4 border-t lg:border-t-0 lg:border-l border-[#eaecf0] dark:border-obsidian-border pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
                                  <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                                  <span>Kualifikasi & Persyaratan Jabatan</span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-obsidian-elevated border border-[#eaecf0] dark:border-obsidian-border px-2 py-0.5 rounded">
                                  {activeMainJob.level || 'Mid'} Level
                                </span>
                              </div>

                              {/* 1. Formal Background (Pendidikan & Pengalaman 2-Tile Grid) */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-obsidian-elevated/70 border border-[#eaecf0] dark:border-obsidian-border">
                                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 mb-1">
                                    <GraduationCap className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Pendidikan Minimal</span>
                                  </div>
                                  <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-snug">
                                    {activeMainJob.educationRequirement || 
                                      (activeMainJob.level === 'Lead' || activeMainJob.level === 'Senior'
                                        ? 'Min. D3 / S1 Manajemen / Bidang Terkait'
                                        : 'Min. SMA / SMK Sederajat')}
                                  </p>
                                </div>

                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-obsidian-elevated/70 border border-[#eaecf0] dark:border-obsidian-border">
                                  <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 mb-1">
                                    <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Pengalaman Kerja</span>
                                  </div>
                                  <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 leading-snug">
                                    {activeMainJob.experienceRequirement || 
                                      (activeMainJob.level === 'Lead'
                                        ? 'Min. 3-5 tahun supervisi bidang terkait'
                                        : activeMainJob.level === 'Senior'
                                        ? 'Min. 2-3 tahun pengalaman spesialis'
                                        : 'Min. 1-2 tahun pengalaman operasional')}
                                  </p>
                                </div>
                              </div>

                              {/* 2. Technical Hard Skills & Tools */}
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-2">
                                  Kompetensi Teknis & Alat Kerja (Hard Skills)
                                </span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                  {(activeMainJob.technicalRequirements && activeMainJob.technicalRequirements.length > 0
                                    ? activeMainJob.technicalRequirements
                                    : activeMainJob.requiredSkills || []
                                  ).map((skill, i) => (
                                    <div
                                      key={i}
                                      className="flex items-center gap-2 p-2 rounded-md bg-white dark:bg-obsidian-card border border-[#eaecf0] dark:border-obsidian-border text-xs font-medium text-slate-800 dark:text-zinc-200 shadow-2xs"
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-zinc-400 shrink-0" />
                                      <span className="truncate">{skill}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 3. Soft Skills & Behavioral Competencies */}
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-1.5">
                                  Kompetensi Perilaku & Karakter (Soft Skills)
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {(activeMainJob.softSkills && activeMainJob.softSkills.length > 0
                                    ? activeMainJob.softSkills
                                    : ['Ketelitian tinggi', 'Komunikasi koordinatif', 'Tanggung jawab target']
                                  ).map((soft, i) => (
                                    <span
                                      key={i}
                                      className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-slate-100/80 dark:bg-obsidian-elevated px-2.5 py-1 rounded-md text-slate-700 dark:text-zinc-300 border border-slate-200/70 dark:border-obsidian-border"
                                    >
                                      <span className="text-emerald-500 font-bold">✓</span>
                                      <span>{soft}</span>
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* 4. Special Working Conditions / Requirements */}
                              {(activeMainJob.specialRequirements || 'Mematuhi standar SOP, etika kerja, dan target operasional divisi') && (
                                <div className="p-3 bg-slate-50/70 dark:bg-obsidian-elevated/50 rounded-lg border border-[#eaecf0] dark:border-obsidian-border text-xs text-slate-600 dark:text-zinc-300 flex items-start gap-2.5">
                                  <FileText className="w-4 h-4 text-slate-400 dark:text-zinc-500 shrink-0 mt-0.5" />
                                  <div>
                                    <span className="font-bold text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 block mb-0.5">
                                      Persyaratan Khusus & Kondisi Kerja:
                                    </span>
                                    <p className="leading-relaxed text-[11px]">
                                      {activeMainJob.specialRequirements || 'Mematuhi standar SOP, etika kerja, dan target operasional divisi'}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Footer Link */}
                            <div className="pt-3 border-t border-[#eaecf0] dark:border-obsidian-border text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-between mt-2">
                              <span>Standar Kualifikasi: <strong className="text-slate-800 dark:text-zinc-200">Terstandarisasi PGE</strong></span>
                              <button
                                onClick={() => setSelectedJobForModal(activeMainJob)}
                                className="group text-slate-900 dark:text-zinc-100 hover:dark:text-white font-bold hover:underline cursor-pointer flex items-center gap-1"
                              >
                                <span>Buka Full JD</span>
                                <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                              </button>
                            </div>
                          </div>

                        </div>
                      </>
                    ) : (
                      <div className="py-10 text-center border border-dashed border-[#eaecf0] dark:border-obsidian-border rounded-xl bg-slate-50/50 dark:bg-obsidian-elevated/30">
                        <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                        <h4 className="text-sm font-bold text-slate-700 dark:text-zinc-200">Belum Ada Tugas Utama</h4>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                          Karyawan ini belum memegang tugas utama. Anda dapat menetapkan tugas melalui Board View atau menu penugasan.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. SECONDARY DUTIES STACK */}
                <div
                  key={`${activeEmployee.id}-card3`}
                  className="animate-card-shift-3 bg-white dark:bg-obsidian-card border border-[#eaecf0] dark:border-obsidian-border rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.02)] p-6 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-slate-600 dark:text-zinc-400" />
                        <span className="text-xs font-bold text-slate-900 dark:text-zinc-200 uppercase tracking-wider">
                          Tugas Sekunder Aktif ({activeSecondaryJobs.length})
                        </span>
                      </div>
                      {activeSecondaryJobs.length > 0 && (
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 dark:bg-zinc-800 dark:text-zinc-200 dark:border dark:border-zinc-700 px-2.5 py-1 rounded-full">
                          +{activeSecondaryJobs.reduce((acc, j) => acc + j.defaultSecondaryWorkloadPercent, 0)}% Jam Kerja Tambahan
                        </span>
                      )}
                    </div>

                    {activeSecondaryJobs.length === 0 ? (
                      <div className="py-6 text-center border border-dashed border-[#eaecf0] dark:border-obsidian-border rounded-xl bg-white/70 dark:bg-obsidian-card text-xs text-slate-400">
                        Tidak ada tugas sekunder yang ditugaskan kepada karyawan ini.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeSecondaryJobs.map((secJob) => (
                          <div
                            key={secJob.id}
                            className="bg-white dark:bg-obsidian-card border border-[#eaecf0] dark:border-obsidian-border rounded-xl p-4 shadow-2xs hover:border-purple-300 dark:hover:border-purple-500/50 hover:-translate-y-0.5 transition-all duration-150"
                          >
                            <div className="flex items-start justify-between gap-2 mb-1.5">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-zinc-100 leading-snug">
                                {secJob.title}
                              </h5>
                              <span className="text-[10px] font-mono font-bold text-[#6941c6] bg-[#f4ebff] dark:bg-purple-500/10 dark:text-purple-300 px-2 py-0.5 rounded-full shrink-0">
                                +{secJob.defaultSecondaryWorkloadPercent}% FTE
                              </span>
                            </div>
                            
                            <p className="text-xs text-slate-500 dark:text-zinc-400 leading-normal line-clamp-2 mb-3">
                              {secJob.summary}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-[#eaecf0] dark:border-obsidian-border text-[11px]">
                              <span className="font-mono text-slate-400 dark:text-zinc-500">
                                {secJob.code}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedJobForModal(secJob)}
                                  className="text-slate-600 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 font-semibold cursor-pointer"
                                >
                                  Rincian
                                </button>
                                <button
                                  onClick={() => unassignRole(activeEmployee.id, secJob.id)}
                                  className="text-rose-600 dark:text-rose-400 hover:text-rose-800 font-semibold cursor-pointer"
                                  title="Lepas peran sekunder ini"
                                >
                                  Lepas
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              ) : (
              <div className="py-20 text-center bg-white dark:bg-obsidian-card rounded-xl border border-dashed border-[#eaecf0] dark:border-obsidian-border">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700 dark:text-zinc-200">Pilih Karyawan</h3>
                <p className="text-xs text-slate-400 mt-1">Pilih salah satu karyawan di daftar kiri untuk melihat spesifikasi jabatan lengkap.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
