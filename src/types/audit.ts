export type AuditActionType =
  | 'ASSIGN_MAIN'
  | 'ASSIGN_SECONDARY'
  | 'UNASSIGN'
  | 'TRANSFER_ROLE'
  | 'SWAP_ROLES'
  | 'OVERRIDE_WORKLOAD'
  | 'CREATE_JOB'
  | 'UPDATE_JOB'
  | 'CREATE_EMPLOYEE'
  | 'RESET_TEMPLATE';

export interface AuditLogEntry {
  id: string;
  timestamp: string; // ISO 8601
  actionType: AuditActionType;
  jobId?: string;
  jobTitle?: string;
  fromEmployeeId?: string | null;
  fromEmployeeName?: string | null;
  toEmployeeId?: string | null;
  toEmployeeName?: string | null;
  slotType?: 'main' | 'secondary';
  details: string;
}
