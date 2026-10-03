export interface Employee {
  id: string;
  employeeCode: string; // e.g. "EMP-101"
  fullName: string;
  email: string;
  departmentId: string;
  jobTitleDisplay: string; // Current organizational title or generated from main role
  avatarUrl?: string;
  mainJobId: string | null; // Single main role ID
  secondaryJobIds: string[]; // List of secondary role IDs
  customWorkloadOverrides?: Record<string, number>; // Specific percentage override for a jobId
  maxCapacityPercent: number; // default 100
  location?: string;
  shift?: string; // e.g. "08:00 - 17:00 WIB"
  tenure?: string; // e.g. "2 thn 8 bln (Jan 2024)"
  reportsTo?: string; // e.g. "Direktur Operasional"
  phone?: string; // e.g. "+62 812-8890-1234"
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeCapacity {
  employeeId: string;
  totalWorkloadPercent: number;
  maxCapacityPercent: number;
  isOverloaded: boolean; // > maxCapacityPercent (e.g. > 100%)
  isUnderutilized: boolean; // < 70%
  breakdown: {
    mainJob?: {
      jobId: string;
      title: string;
      percent: number;
    };
    secondaryJobs: Array<{
      jobId: string;
      title: string;
      percent: number;
    }>;
  };
}
