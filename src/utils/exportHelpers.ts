import { JobDescription } from '../types/job';
import { Employee } from '../types/employee';
import { AuditLogEntry } from '../types/audit';
import { Department } from '../types/job';

export interface ExportDataPayload {
  version: string;
  exportedAt: string;
  departments: Department[];
  jobs: JobDescription[];
  employees: Employee[];
  auditLogs: AuditLogEntry[];
}

export function exportToJson(
  departments: Department[],
  jobs: JobDescription[],
  employees: Employee[],
  auditLogs: AuditLogEntry[]
): string {
  const payload: ExportDataPayload = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    departments,
    jobs,
    employees,
    auditLogs,
  };
  return JSON.stringify(payload, null, 2);
}

export function exportToCsv(
  employees: Employee[],
  jobsMap: Map<string, JobDescription>,
  departmentsMap: Map<string, Department>
): string {
  const headers = [
    'Employee Code',
    'Employee Name',
    'Email',
    'Department',
    'Main Job Code',
    'Main Job Title',
    'Main Job Workload %',
    'Secondary Jobs Count',
    'Secondary Jobs (Titles)',
    'Total Workload %',
    'Status',
  ];

  const rows = employees.map((emp) => {
    const dept = departmentsMap.get(emp.departmentId)?.name || 'Unknown';
    const mainJob = emp.mainJobId ? jobsMap.get(emp.mainJobId) : null;
    const mainJobPercent = mainJob ? (emp.customWorkloadOverrides?.[mainJob.id] ?? mainJob.defaultMainWorkloadPercent) : 0;
    
    const secondaryTitles = (emp.secondaryJobIds || [])
      .map((id) => jobsMap.get(id)?.title || id)
      .join('; ');

    let totalPercent = mainJobPercent;
    (emp.secondaryJobIds || []).forEach((id) => {
      const j = jobsMap.get(id);
      if (j) {
        totalPercent += (emp.customWorkloadOverrides?.[id] ?? j.defaultSecondaryWorkloadPercent);
      }
    });

    const status = totalPercent > 100 ? 'Overloaded' : totalPercent < 60 ? 'Underutilized' : 'Optimal';

    return [
      `"${emp.employeeCode}"`,
      `"${emp.fullName}"`,
      `"${emp.email}"`,
      `"${dept}"`,
      `"${mainJob?.code || 'N/A'}"`,
      `"${mainJob?.title || 'Unassigned'}"`,
      `"${mainJobPercent}%"`,
      `"${emp.secondaryJobIds?.length || 0}"`,
      `"${secondaryTitles}"`,
      `"${totalPercent}%"`,
      `"${status}"`,
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadFile(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
