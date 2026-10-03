export type RoleSeniority = 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Principal' | 'Executive';

export interface Department {
  id: string;
  name: string;
  color: string; // Tailwind color or hex
  icon?: string;
  description?: string;
}

export interface JobDescription {
  id: string;
  code: string; // e.g. "ENG-01", "MKT-03"
  title: string;
  departmentId: string;
  level: RoleSeniority;
  summary: string;
  keyResponsibilities: string[];
  requiredSkills: string[];
  educationRequirement?: string;
  experienceRequirement?: string;
  technicalRequirements?: string[];
  softSkills?: string[];
  specialRequirements?: string;
  defaultMainWorkloadPercent: number; // typically 70%
  defaultSecondaryWorkloadPercent: number; // typically 15-25%
  isShared: boolean; // if true, multiple employees can hold this secondary job
  isCritical: boolean; // if true, triggers alert when vacant
  colorTag?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FilterState {
  searchQuery: string;
  selectedDepartmentId: string | 'all';
  assignmentStatus: 'all' | 'unassigned' | 'assigned' | 'critical';
  levelFilter: RoleSeniority | 'all';
}
