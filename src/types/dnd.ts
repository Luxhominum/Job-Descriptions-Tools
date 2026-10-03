import type { JobDescription } from './job';

export type DragSourceType = 'SIDEBAR_POOL' | 'EMPLOYEE_MAIN' | 'EMPLOYEE_SECONDARY';

export interface DraggedJobPayload {
  job: JobDescription;
  sourceType: DragSourceType;
  sourceEmployeeId?: string;
  sourceSlot?: 'main' | 'secondary';
}

export type DropTargetType = 'EMPLOYEE_MAIN_SLOT' | 'EMPLOYEE_SECONDARY_SLOT' | 'SIDEBAR_UNASSIGN_ZONE';

export interface DropTargetPayload {
  targetType: DropTargetType;
  targetEmployeeId?: string;
}
