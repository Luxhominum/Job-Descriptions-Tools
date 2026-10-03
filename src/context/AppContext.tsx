import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { JobDescription, Department, FilterState } from '../types/job';
import type { Employee } from '../types/employee';
import type { AuditLogEntry } from '../types/audit';
import { DEFAULT_DEPARTMENTS } from '../data/departments';
import { TEMPLATES } from '../data/initialData';
import { generateId } from '../utils/idGenerator';
import { calculateOrganizationStats } from '../utils/capacityCalculator';
import type { OrganizationStats } from '../utils/capacityCalculator';
import type { ExportDataPayload } from '../utils/exportHelpers';

const STORAGE_KEY = 'roleflow_pge_state_v8';

interface AppContextType {
  departments: Department[];
  jobs: JobDescription[];
  employees: Employee[];
  auditLogs: AuditLogEntry[];
  filters: FilterState;
  viewMode: 'board' | 'dashboard' | 'matrix';
  activeTemplateKey: string;
  stats: OrganizationStats;
  jobsMap: Map<string, JobDescription>;
  departmentsMap: Map<string, Department>;
  employeesMap: Map<string, Employee>;
  // UI & Sync state
  syncStatus: 'synced' | 'saving' | 'offline' | 'error';
  lastSavedAt: string | null;
  saveToDatabaseNow: () => Promise<void>;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Assignment Actions
  assignRole: (employeeId: string, jobId: string, slotType: 'main' | 'secondary') => void;
  unassignRole: (employeeId: string, jobId: string) => void;
  transferRole: (jobId: string, fromEmployeeId: string, toEmployeeId: string, targetSlot: 'main' | 'secondary') => void;
  swapMainRoles: (employeeId1: string, employeeId2: string) => void;
  updateWorkloadOverride: (employeeId: string, jobId: string, percent: number) => void;

  // CRUD Actions
  createJob: (jobData: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'>) => JobDescription;
  updateJob: (job: JobDescription) => void;
  deleteJob: (jobId: string) => void;
  createEmployee: (empData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => Employee;
  updateEmployee: (emp: Employee) => void;
  deleteEmployee: (employeeId: string) => void;

  // Template & Storage Actions
  loadTemplate: (templateKey: string) => void;
  importJsonData: (payload: ExportDataPayload) => void;
  resetToDefault: () => void;
  clearAuditLogs: () => void;

  // UI state
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  setViewMode: (mode: 'board' | 'dashboard' | 'matrix') => void;
  
  // Modal controllers
  selectedJobForModal: JobDescription | null;
  setSelectedJobForModal: (job: JobDescription | null) => void;
  selectedEmployeeForModal: Employee | null;
  setSelectedEmployeeForModal: (emp: Employee | null) => void;
  isAuditModalOpen: boolean;
  setIsAuditModalOpen: (open: boolean) => void;
  isExportImportModalOpen: boolean;
  setIsExportImportModalOpen: (open: boolean) => void;
  isNewJobModalOpen: boolean;
  setIsNewJobModalOpen: (open: boolean) => void;
  isNewEmployeeModalOpen: boolean;
  setIsNewEmployeeModalOpen: (open: boolean) => void;
}

const initialFilters: FilterState = {
  searchQuery: '',
  selectedDepartmentId: 'all',
  assignmentStatus: 'all',
  levelFilter: 'all',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load saved state or default template
  const [departments, setDepartments] = useState<Department[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_depts`);
      return saved ? JSON.parse(saved) : DEFAULT_DEPARTMENTS;
    } catch {
      return DEFAULT_DEPARTMENTS;
    }
  });

  const [activeTemplateKey, setActiveTemplateKey] = useState<string>('pge-structure');

  const [jobs, setJobs] = useState<JobDescription[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_jobs`);
      return saved ? JSON.parse(saved) : TEMPLATES[0].jobs;
    } catch {
      return TEMPLATES[0].jobs;
    }
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_employees`);
      const raw = saved ? JSON.parse(saved) : TEMPLATES[0].employees;
      return (raw as Employee[]).map((e) => ({
        ...e,
        avatarUrl: e.avatarUrl && e.avatarUrl.startsWith('data:image/') ? e.avatarUrl : undefined,
      }));
    } catch {
      return TEMPLATES[0].employees;
    }
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_logs`);
      return saved ? JSON.parse(saved) : [
        {
          id: generateId('log'),
          timestamp: new Date().toISOString(),
          actionType: 'RESET_TEMPLATE',
          details: 'Inisialisasi sistem dengan struktur Analisis Jabatan & Job Descriptions CV Pusat Grosir Eceran (PGE).',
        }
      ];
    } catch {
      return [];
    }
  });

  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [viewMode, setViewMode] = useState<'board' | 'dashboard' | 'matrix'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const v = params.get('view');
        if (v === 'board' || v === 'dashboard' || v === 'matrix') return v;
      }
    } catch {
      // fallback
    }
    return 'board';
  });

  // Modals state
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobDescription | null>(null);
  const [selectedEmployeeForModal, setSelectedEmployeeForModal] = useState<Employee | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);
  const [isNewJobModalOpen, setIsNewJobModalOpen] = useState(false);
  const [isNewEmployeeModalOpen, setIsNewEmployeeModalOpen] = useState(false);

  // Database Sync & Persistence
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'offline' | 'error'>('synced');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const isInitialLoadDone = React.useRef(false);

  // Theme State - Default to Executive Titanium Dark Mode
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('roleflow_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('roleflow_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 1. Initial Load from Database Backend
  useEffect(() => {
    async function loadFromDb() {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = await res.json();
          if (data.departments && Array.isArray(data.departments)) {
            setDepartments(data.departments);
          }
          if (data.jobs && Array.isArray(data.jobs)) {
            setJobs(data.jobs);
          }
          if (data.employees && Array.isArray(data.employees)) {
            setEmployees(data.employees.map((e: Employee) => ({
              ...e,
              avatarUrl: e.avatarUrl && e.avatarUrl.startsWith('data:image/') ? e.avatarUrl : undefined,
            })));
          }
          if (data.auditLogs && Array.isArray(data.auditLogs)) {
            setAuditLogs(data.auditLogs);
          }
          if (data.activeTemplateKey) {
            setActiveTemplateKey(data.activeTemplateKey);
          }
          setLastSavedAt(data.updatedAt || new Date().toISOString());
          setSyncStatus('synced');
          console.log('[RoleFlow] Successfully loaded state from database backend');
        } else {
          // If no DB file yet, persist current state to create initial database
          saveToDatabaseNow();
        }
      } catch (err) {
        console.warn('[RoleFlow] Backend server not reachable, using localStorage cache', err);
        setSyncStatus('offline');
      } finally {
        isInitialLoadDone.current = true;
      }
    }

    loadFromDb();
  }, []);

  // 2. Function to explicitly save to database
  const saveToDatabaseNow = async () => {
    try {
      setSyncStatus('saving');
      const payload = {
        departments,
        jobs,
        employees,
        auditLogs,
        activeTemplateKey,
      };

      const res = await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setSyncStatus('synced');
        setLastSavedAt(data.updatedAt || new Date().toISOString());
      } else {
        setSyncStatus('error');
      }
    } catch {
      setSyncStatus('offline');
    }
  };

  // 3. Auto-save debouncer whenever departments, jobs, employees or logs change
  useEffect(() => {
    // Also keep localStorage as instant zero-latency backup
    localStorage.setItem(`${STORAGE_KEY}_depts`, JSON.stringify(departments));
    localStorage.setItem(`${STORAGE_KEY}_jobs`, JSON.stringify(jobs));
    localStorage.setItem(`${STORAGE_KEY}_employees`, JSON.stringify(employees));
    localStorage.setItem(`${STORAGE_KEY}_logs`, JSON.stringify(auditLogs));

    if (!isInitialLoadDone.current) return;

    setSyncStatus('saving');
    const timer = setTimeout(() => {
      saveToDatabaseNow();
    }, 600); // 600ms debounce

    return () => clearTimeout(timer);
  }, [departments, jobs, employees, auditLogs, activeTemplateKey]);

  // Derived maps
  const jobsMap = useMemo(() => new Map(jobs.map((j) => [j.id, j])), [jobs]);
  const departmentsMap = useMemo(() => new Map(departments.map((d) => [d.id, d])), [departments]);
  const employeesMap = useMemo(() => new Map(employees.map((e) => [e.id, e])), [employees]);

  // Organization statistics
  const stats = useMemo(() => calculateOrganizationStats(employees, jobs), [employees, jobs]);

  // Helper to append audit log
  const logAction = (entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: generateId('log'),
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newEntry, ...prev.slice(0, 199)]);
  };

  // ASSIGN ROLE
  const assignRole = (employeeId: string, jobId: string, slotType: 'main' | 'secondary') => {
    const targetEmp = employeesMap.get(employeeId);
    const job = jobsMap.get(jobId);
    if (!targetEmp || !job) return;

    const previousOwner = !job.isShared
      ? employees.find((e) => e.id !== employeeId && (e.mainJobId === jobId || e.secondaryJobIds.includes(jobId)))
      : null;

    setEmployees((prev) =>
      prev.map((emp) => {
        if (previousOwner && emp.id === previousOwner.id) {
          return {
            ...emp,
            mainJobId: emp.mainJobId === jobId ? null : emp.mainJobId,
            secondaryJobIds: emp.secondaryJobIds.filter((id) => id !== jobId),
            updatedAt: new Date().toISOString(),
          };
        }

        if (emp.id === employeeId) {
          if (slotType === 'main') {
            const newSec = emp.secondaryJobIds.filter((id) => id !== jobId);
            return {
              ...emp,
              mainJobId: jobId,
              secondaryJobIds: newSec,
              updatedAt: new Date().toISOString(),
            };
          } else {
            if (emp.mainJobId === jobId) return emp;
            if (!emp.secondaryJobIds.includes(jobId)) {
              return {
                ...emp,
                secondaryJobIds: [...emp.secondaryJobIds, jobId],
                updatedAt: new Date().toISOString(),
              };
            }
          }
        }
        return emp;
      })
    );

    if (previousOwner) {
      logAction({
        actionType: 'TRANSFER_ROLE',
        jobId: job.id,
        jobTitle: job.title,
        fromEmployeeId: previousOwner.id,
        fromEmployeeName: previousOwner.fullName,
        toEmployeeId: targetEmp.id,
        toEmployeeName: targetEmp.fullName,
        slotType,
        details: `Alih tanggung jawab (Handover) "${job.title}" (${job.code}) dari ${previousOwner.fullName} kepada ${targetEmp.fullName} sebagai ${slotType === 'main' ? 'Tugas Utama' : 'Tugas Sekunder'}.`,
      });
    } else {
      logAction({
        actionType: slotType === 'main' ? 'ASSIGN_MAIN' : 'ASSIGN_SECONDARY',
        jobId: job.id,
        jobTitle: job.title,
        toEmployeeId: targetEmp.id,
        toEmployeeName: targetEmp.fullName,
        slotType,
        details: `Penetapan "${job.title}" (${job.code}) kepada ${targetEmp.fullName} sebagai ${slotType === 'main' ? 'Tugas Utama' : 'Tugas Sekunder'}.`,
      });
    }
  };

  // UNASSIGN ROLE
  const unassignRole = (employeeId: string, jobId: string) => {
    const emp = employeesMap.get(employeeId);
    const job = jobsMap.get(jobId);
    if (!emp || !job) return;

    const isMain = emp.mainJobId === jobId;

    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === employeeId) {
          return {
            ...e,
            mainJobId: e.mainJobId === jobId ? null : e.mainJobId,
            secondaryJobIds: e.secondaryJobIds.filter((id) => id !== jobId),
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );

    logAction({
      actionType: 'UNASSIGN',
      jobId: job.id,
      jobTitle: job.title,
      fromEmployeeId: emp.id,
      fromEmployeeName: emp.fullName,
      slotType: isMain ? 'main' : 'secondary',
      details: `Pelepasan tanggung jawab "${job.title}" dari ${emp.fullName}.`,
    });
  };

  // TRANSFER ROLE
  const transferRole = (
    jobId: string,
    fromEmployeeId: string,
    toEmployeeId: string,
    targetSlot: 'main' | 'secondary'
  ) => {
    if (fromEmployeeId === toEmployeeId) return;
    const fromEmp = employeesMap.get(fromEmployeeId);
    const toEmp = employeesMap.get(toEmployeeId);
    const job = jobsMap.get(jobId);
    if (!fromEmp || !toEmp || !job) return;

    setEmployees((prev) =>
      prev.map((emp) => {
        if (emp.id === fromEmployeeId) {
          return {
            ...emp,
            mainJobId: emp.mainJobId === jobId ? null : emp.mainJobId,
            secondaryJobIds: emp.secondaryJobIds.filter((id) => id !== jobId),
            updatedAt: new Date().toISOString(),
          };
        }
        if (emp.id === toEmployeeId) {
          if (targetSlot === 'main') {
            const newSec = emp.secondaryJobIds.filter((id) => id !== jobId);
            return {
              ...emp,
              mainJobId: jobId,
              secondaryJobIds: newSec,
              updatedAt: new Date().toISOString(),
            };
          } else {
            if (!emp.secondaryJobIds.includes(jobId) && emp.mainJobId !== jobId) {
              return {
                ...emp,
                secondaryJobIds: [...emp.secondaryJobIds, jobId],
                updatedAt: new Date().toISOString(),
              };
            }
          }
        }
        return emp;
      })
    );

    logAction({
      actionType: 'TRANSFER_ROLE',
      jobId: job.id,
      jobTitle: job.title,
      fromEmployeeId: fromEmp.id,
      fromEmployeeName: fromEmp.fullName,
      toEmployeeId: toEmp.id,
      toEmployeeName: toEmp.fullName,
      slotType: targetSlot,
      details: `Alih tugas (Handover) "${job.title}" dari ${fromEmp.fullName} ke ${toEmp.fullName} (${targetSlot}).`,
    });
  };

  // SWAP MAIN ROLES
  const swapMainRoles = (employeeId1: string, employeeId2: string) => {
    const emp1 = employeesMap.get(employeeId1);
    const emp2 = employeesMap.get(employeeId2);
    if (!emp1 || !emp2) return;

    const role1 = emp1.mainJobId;
    const role2 = emp2.mainJobId;

    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === employeeId1) {
          return { ...e, mainJobId: role2, updatedAt: new Date().toISOString() };
        }
        if (e.id === employeeId2) {
          return { ...e, mainJobId: role1, updatedAt: new Date().toISOString() };
        }
        return e;
      })
    );

    logAction({
      actionType: 'SWAP_ROLES',
      details: `Tukar peran tugas utama antara ${emp1.fullName} dan ${emp2.fullName}.`,
    });
  };

  // WORKLOAD OVERRIDE
  const updateWorkloadOverride = (employeeId: string, jobId: string, percent: number) => {
    setEmployees((prev) =>
      prev.map((e) => {
        if (e.id === employeeId) {
          const currentOverrides = e.customWorkloadOverrides || {};
          return {
            ...e,
            customWorkloadOverrides: {
              ...currentOverrides,
              [jobId]: Math.max(0, Math.min(100, percent)),
            },
            updatedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );

    logAction({
      actionType: 'OVERRIDE_WORKLOAD',
      details: `Penyesuaian bobot beban kerja karyawan ${employeeId} pada jabatan ${jobId} menjadi ${percent}%.`,
    });
  };

  // CREATE JOB
  const createJob = (jobData: Omit<JobDescription, 'id' | 'createdAt' | 'updatedAt'>): JobDescription => {
    const newJob: JobDescription = {
      ...jobData,
      id: generateId('job'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setJobs((prev) => [newJob, ...prev]);
    logAction({
      actionType: 'CREATE_JOB',
      jobId: newJob.id,
      jobTitle: newJob.title,
      details: `Membuat Uraian Jabatan baru: "${newJob.title}" (${newJob.code}).`,
    });
    return newJob;
  };

  // UPDATE JOB
  const updateJob = (updatedJob: JobDescription) => {
    setJobs((prev) => prev.map((j) => (j.id === updatedJob.id ? { ...updatedJob, updatedAt: new Date().toISOString() } : j)));
    logAction({
      actionType: 'UPDATE_JOB',
      jobId: updatedJob.id,
      jobTitle: updatedJob.title,
      details: `Memperbarui Uraian Jabatan: "${updatedJob.title}" (${updatedJob.code}).`,
    });
  };

  // DELETE JOB
  const deleteJob = (jobId: string) => {
    const job = jobsMap.get(jobId);
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setEmployees((prev) =>
      prev.map((e) => ({
        ...e,
        mainJobId: e.mainJobId === jobId ? null : e.mainJobId,
        secondaryJobIds: e.secondaryJobIds.filter((id) => id !== jobId),
      }))
    );
    if (job) {
      logAction({
        actionType: 'UPDATE_JOB',
        jobId,
        jobTitle: job.title,
        details: `Menghapus Uraian Jabatan: "${job.title}".`,
      });
    }
  };

  // CREATE EMPLOYEE
  const createEmployee = (empData: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee => {
    const newEmp: Employee = {
      ...empData,
      id: generateId('emp'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEmployees((prev) => [...prev, newEmp]);
    logAction({
      actionType: 'CREATE_EMPLOYEE',
      toEmployeeId: newEmp.id,
      toEmployeeName: newEmp.fullName,
      details: `Menambahkan Karyawan: ${newEmp.fullName} (${newEmp.employeeCode}).`,
    });
    return newEmp;
  };

  // UPDATE EMPLOYEE
  const updateEmployee = (emp: Employee) => {
    setEmployees((prev) => prev.map((e) => (e.id === emp.id ? { ...emp, updatedAt: new Date().toISOString() } : e)));
  };

  // DELETE EMPLOYEE
  const deleteEmployee = (employeeId: string) => {
    const emp = employeesMap.get(employeeId);
    setEmployees((prev) => prev.filter((e) => e.id !== employeeId));
    if (emp) {
      logAction({
        actionType: 'UNASSIGN',
        fromEmployeeId: emp.id,
        fromEmployeeName: emp.fullName,
        details: `Menghapus data karyawan ${emp.fullName}. Tanggung jawab dikembalikan ke pool jabatan.`,
      });
    }
  };

  // LOAD TEMPLATE
  const loadTemplate = (templateKey: string) => {
    const tpl = TEMPLATES.find((t) => t.key === templateKey);
    if (!tpl) return;
    setActiveTemplateKey(templateKey);
    setJobs(tpl.jobs);
    setEmployees(tpl.employees);
    setDepartments(DEFAULT_DEPARTMENTS);
    logAction({
      actionType: 'RESET_TEMPLATE',
      details: `Memuat struktur organisasi: "${tpl.name}".`,
    });
  };

  // IMPORT JSON DATA
  const importJsonData = (payload: ExportDataPayload) => {
    if (payload.departments && Array.isArray(payload.departments)) {
      setDepartments(payload.departments);
    }
    if (payload.jobs && Array.isArray(payload.jobs)) {
      setJobs(payload.jobs);
    }
    if (payload.employees && Array.isArray(payload.employees)) {
      setEmployees(payload.employees);
    }
    if (payload.auditLogs && Array.isArray(payload.auditLogs)) {
      setAuditLogs(payload.auditLogs);
    }
    logAction({
      actionType: 'RESET_TEMPLATE',
      details: `Mengimpor data organisasi dengan ${payload.jobs?.length || 0} jabatan dan ${payload.employees?.length || 0} karyawan.`,
    });
  };

  // RESET TO DEFAULT
  const resetToDefault = () => {
    setDepartments(DEFAULT_DEPARTMENTS);
    setJobs(TEMPLATES[0].jobs);
    setEmployees(TEMPLATES[0].employees);
    setActiveTemplateKey('pge-structure');
    setAuditLogs([
      {
        id: generateId('log'),
        timestamp: new Date().toISOString(),
        actionType: 'RESET_TEMPLATE',
        details: 'Mereset ke struktur standar CV Pusat Grosir Eceran (PGE) 2026.',
      },
    ]);
  };

  const clearAuditLogs = () => {
    setAuditLogs([]);
  };

  return (
    <AppContext.Provider
      value={{
        departments,
        jobs,
        employees,
        auditLogs,
        filters,
        viewMode,
        activeTemplateKey,
        stats,
        jobsMap,
        departmentsMap,
        employeesMap,

        syncStatus,
        lastSavedAt,
        saveToDatabaseNow,
        theme,
        toggleTheme,

        assignRole,
        unassignRole,
        transferRole,
        swapMainRoles,
        updateWorkloadOverride,

        createJob,
        updateJob,
        deleteJob,
        createEmployee,
        updateEmployee,
        deleteEmployee,

        loadTemplate,
        importJsonData,
        resetToDefault,
        clearAuditLogs,

        setFilters,
        setViewMode,

        selectedJobForModal,
        setSelectedJobForModal,
        selectedEmployeeForModal,
        setSelectedEmployeeForModal,
        isAuditModalOpen,
        setIsAuditModalOpen,
        isExportImportModalOpen,
        setIsExportImportModalOpen,
        isNewJobModalOpen,
        setIsNewJobModalOpen,
        isNewEmployeeModalOpen,
        setIsNewEmployeeModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
};
