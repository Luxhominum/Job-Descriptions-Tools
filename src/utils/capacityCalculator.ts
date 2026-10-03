import { Employee, EmployeeCapacity } from '../types/employee';
import { JobDescription } from '../types/job';

export function calculateEmployeeCapacity(
  employee: Employee,
  jobsMap: Map<string, JobDescription>
): EmployeeCapacity {
  let totalPercent = 0;
  let mainJobInfo: EmployeeCapacity['breakdown']['mainJob'] | undefined = undefined;
  const secondaryJobsInfo: EmployeeCapacity['breakdown']['secondaryJobs'] = [];

  // Main Job Calculation
  if (employee.mainJobId && jobsMap.has(employee.mainJobId)) {
    const mainJob = jobsMap.get(employee.mainJobId)!;
    const percent = employee.customWorkloadOverrides?.[mainJob.id] ?? mainJob.defaultMainWorkloadPercent ?? 70;
    totalPercent += percent;
    mainJobInfo = {
      jobId: mainJob.id,
      title: mainJob.title,
      percent,
    };
  }

  // Secondary Jobs Calculation
  if (Array.isArray(employee.secondaryJobIds)) {
    for (const secJobId of employee.secondaryJobIds) {
      if (jobsMap.has(secJobId)) {
        const secJob = jobsMap.get(secJobId)!;
        const percent = employee.customWorkloadOverrides?.[secJob.id] ?? secJob.defaultSecondaryWorkloadPercent ?? 15;
        totalPercent += percent;
        secondaryJobsInfo.push({
          jobId: secJob.id,
          title: secJob.title,
          percent,
        });
      }
    }
  }

  const maxCap = employee.maxCapacityPercent || 100;

  return {
    employeeId: employee.id,
    totalWorkloadPercent: totalPercent,
    maxCapacityPercent: maxCap,
    isOverloaded: totalPercent > maxCap,
    isUnderutilized: totalPercent < 60,
    breakdown: {
      mainJob: mainJobInfo,
      secondaryJobs: secondaryJobsInfo,
    },
  };
}

export interface OrganizationStats {
  totalEmployees: number;
  totalJobs: number;
  assignedMainJobsCount: number;
  vacantJobs: JobDescription[];
  criticalVacantJobs: JobDescription[];
  overloadedEmployees: Employee[];
  underutilizedEmployees: Employee[];
  averageCapacityPercent: number;
}

export function calculateOrganizationStats(
  employees: Employee[],
  jobs: JobDescription[]
): OrganizationStats {
  const jobsMap = new Map<string, JobDescription>(jobs.map((j) => [j.id, j]));
  const assignedJobIds = new Set<string>();
  const overloadedList: Employee[] = [];
  const underutilizedList: Employee[] = [];
  let sumCapacity = 0;

  employees.forEach((emp) => {
    if (emp.mainJobId) {
      assignedJobIds.add(emp.mainJobId);
    }
    if (emp.secondaryJobIds) {
      emp.secondaryJobIds.forEach((id) => assignedJobIds.add(id));
    }

    const cap = calculateEmployeeCapacity(emp, jobsMap);
    sumCapacity += cap.totalWorkloadPercent;

    if (cap.isOverloaded) {
      overloadedList.push(emp);
    } else if (cap.isUnderutilized && emp.mainJobId) {
      underutilizedList.push(emp);
    }
  });

  const vacantJobs = jobs.filter((j) => !assignedJobIds.has(j.id));
  const criticalVacantJobs = vacantJobs.filter((j) => j.isCritical);

  return {
    totalEmployees: employees.length,
    totalJobs: jobs.length,
    assignedMainJobsCount: employees.filter((e) => Boolean(e.mainJobId)).length,
    vacantJobs,
    criticalVacantJobs,
    overloadedEmployees: overloadedList,
    underutilizedEmployees: underutilizedList,
    averageCapacityPercent: employees.length > 0 ? Math.round(sumCapacity / employees.length) : 0,
  };
}
