import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  DragStartEvent,
  DragEndEvent,
  pointerWithin,
} from '@dnd-kit/core';
import { AppProvider, useAppStore } from './context/AppContext';
import { Header } from './components/layout/Header';
import { TopAlertBanner } from './components/layout/TopAlertBanner';
import { Sidebar } from './components/layout/Sidebar';
import { EmployeeGrid } from './components/board/EmployeeGrid';
import { DashboardBentoView } from './components/dashboard/DashboardBentoView';
import { MatrixView } from './components/matrix/MatrixView';
import { DragOverlayContent } from './components/dnd/DragOverlayContent';
import { JobDetailModal } from './components/modals/JobDetailModal';
import { JobFormModal } from './components/modals/JobFormModal';
import { EmployeeFormModal } from './components/modals/EmployeeFormModal';
import { AuditLogModal } from './components/modals/AuditLogModal';
import { ExportImportModal } from './components/modals/ExportImportModal';
import type { DraggedJobPayload, DropTargetPayload } from './types/dnd';

const MainLayout: React.FC = () => {
  const {
    viewMode,
    assignRole,
    unassignRole,
    transferRole,
    departmentsMap,
  } = useAppStore();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeDragData, setActiveDragData] = useState<DraggedJobPayload | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as DraggedJobPayload | undefined;
    if (data && data.job) {
      setActiveDragData(data);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragData(null);

    if (!over) return;

    const dragData = active.data.current as DraggedJobPayload | undefined;
    const dropData = over.data.current as DropTargetPayload | undefined;

    if (!dragData || !dropData) return;

    const { job, sourceType, sourceEmployeeId } = dragData;
    const { targetType, targetEmployeeId } = dropData;

    // 1. Drop onto Main Role slot
    if (targetType === 'EMPLOYEE_MAIN_SLOT' && targetEmployeeId) {
      if (sourceType === 'EMPLOYEE_MAIN' && sourceEmployeeId === targetEmployeeId) {
        return;
      }

      if (sourceEmployeeId && sourceEmployeeId !== targetEmployeeId) {
        transferRole(job.id, sourceEmployeeId, targetEmployeeId, 'main');
      } else {
        assignRole(targetEmployeeId, job.id, 'main');
      }
      return;
    }

    // 2. Drop onto Secondary Role slot
    if (targetType === 'EMPLOYEE_SECONDARY_SLOT' && targetEmployeeId) {
      if (sourceType === 'EMPLOYEE_SECONDARY' && sourceEmployeeId === targetEmployeeId) {
        return;
      }

      if (sourceEmployeeId && sourceEmployeeId !== targetEmployeeId) {
        transferRole(job.id, sourceEmployeeId, targetEmployeeId, 'secondary');
      } else {
        assignRole(targetEmployeeId, job.id, 'secondary');
      }
      return;
    }

    // 3. Drop onto Sidebar Unassign Zone
    if (targetType === 'SIDEBAR_UNASSIGN_ZONE' && sourceEmployeeId) {
      unassignRole(sourceEmployeeId, job.id);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen w-screen overflow-hidden bg-slate-50 dark:bg-obsidian-bg text-slate-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
        <Header />
        <TopAlertBanner />

        {viewMode === 'dashboard' ? (
          <main className="flex-1 flex overflow-hidden bg-slate-50/60 dark:bg-obsidian-bg">
            <DashboardBentoView />
          </main>
        ) : viewMode === 'board' ? (
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* Draggable Role Library Sidebar */}
            <Sidebar
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            />

            {/* Main Canvas with generous whitespace */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 flex flex-col gap-6 bg-slate-50/60 dark:bg-obsidian-bg">
              <div className="max-w-7xl w-full mx-auto flex flex-col gap-6">
                <EmployeeGrid />
              </div>
            </main>
          </div>
        ) : (
          <main className="flex-1 flex overflow-hidden bg-slate-50/60 dark:bg-obsidian-bg">
            <MatrixView />
          </main>
        )}

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease-out' }}>
          {activeDragData && (
            <DragOverlayContent
              job={activeDragData.job}
              department={departmentsMap.get(activeDragData.job.departmentId)}
              sourceSlot={activeDragData.sourceSlot}
            />
          )}
        </DragOverlay>

        {/* Modals */}
        <JobDetailModal />
        <JobFormModal />
        <EmployeeFormModal />
        <AuditLogModal />
        <ExportImportModal />
      </div>
    </DndContext>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
